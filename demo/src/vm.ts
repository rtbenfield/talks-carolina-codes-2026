// VM lifecycle policy: cold boot, snapshot-resume, and snapshot-and-stop.
// This is the heart of the demo — the two timed startup paths live here.
import { existsSync, mkdirSync, rmSync } from "node:fs";
import {
  BOOT_ARGS,
  GUEST_MAC,
  GUEST_ORIGIN,
  KERNEL_PATH,
  MEM_FILE,
  ROOTFS_PATH,
  SNAPSHOT_DIR,
  SNAPSHOT_FILE,
  TAP_DEVICE,
} from "./config";
import { fcApi, firecrackerPid, killFirecracker, spawnFirecracker } from "./firecracker";

export type StartupPath = "cold-boot" | "resume" | "warm";
export type Startup = { path: StartupPath; ms: number };

let vmUp = false;
let starting: Promise<Startup> | null = null;
let lastColdBootMs: number | null = null;

// All lifecycle transitions run through this chain so a snapshot in progress
// and an incoming boot request never interleave.
let lifecycle: Promise<unknown> = Promise.resolve();
function withLifecycle<T>(fn: () => Promise<T>): Promise<T> {
  const next = lifecycle.then(fn, fn);
  lifecycle = next.catch(() => {});
  return next;
}

/** Delete snapshot state so the next request cold boots (fresh demo run). */
export function purgeSnapshot(): void {
  rmSync(SNAPSHOT_DIR, { recursive: true, force: true });
}

/** Make sure the VM is serving, whichever startup path that takes. */
export function ensureVm(): Promise<Startup> {
  if (vmUp) return Promise.resolve({ path: "warm", ms: 0 });
  if (!starting) {
    starting = withLifecycle(() =>
      existsSync(SNAPSHOT_FILE) && existsSync(MEM_FILE) ? resumeFromSnapshot() : coldBoot(),
    ).finally(() => {
      starting = null;
    });
  }
  return starting;
}

/** Pause the VM, write its memory to disk, and terminate the process. */
export function requestSnapshotAndStop(): Promise<void> {
  return withLifecycle(snapshotAndStop);
}

export async function shutdownVm(): Promise<void> {
  vmUp = false;
  await killFirecracker();
}

// #region cold-boot
async function coldBoot(): Promise<Startup> {
  const t0 = performance.now();
  await spawnFirecracker();
  await fcApi("PUT", "/machine-config", { vcpu_count: 1, mem_size_mib: 256 });
  await fcApi("PUT", "/boot-source", { kernel_image_path: KERNEL_PATH, boot_args: BOOT_ARGS });
  await fcApi("PUT", "/drives/rootfs", {
    drive_id: "rootfs",
    path_on_host: ROOTFS_PATH,
    is_root_device: true,
    is_read_only: false,
  });
  await fcApi("PUT", "/network-interfaces/eth0", {
    iface_id: "eth0",
    guest_mac: GUEST_MAC,
    host_dev_name: TAP_DEVICE,
  });
  await fcApi("PUT", "/actions", { action_type: "InstanceStart" });
  await waitForGuest();
  vmUp = true;
  const ms = performance.now() - t0;
  logColdBoot(ms);
  return { path: "cold-boot", ms };
}
// #endregion cold-boot

// #region resume
async function resumeFromSnapshot(): Promise<Startup> {
  const t0 = performance.now();
  await spawnFirecracker();
  await fcApi("PUT", "/snapshot/load", {
    // VM state: vCPU registers, device config
    snapshot_path: SNAPSHOT_FILE,
    // full guest memory, mapped back in
    mem_backend: { backend_type: "File", backend_path: MEM_FILE },
    // start executing immediately instead of staying paused
    resume_vm: true,
  });
  await waitForGuest();
  vmUp = true;
  const ms = performance.now() - t0;
  logResume(ms);
  return { path: "resume", ms };
}
// #endregion resume

// #region snapshot-and-stop
async function snapshotAndStop(): Promise<void> {
  if (!vmUp) return;
  // Flip early so a request racing this snapshot queues a resume behind it
  // (via the lifecycle chain) instead of proxying to a paused VM.
  vmUp = false;
  const pid = firecrackerPid();
  const t0 = performance.now();
  try {
    mkdirSync(SNAPSHOT_DIR, { recursive: true });
    rmSync(SNAPSHOT_FILE, { force: true });
    rmSync(MEM_FILE, { force: true });
    await fcApi("PATCH", "/vm", { state: "Paused" });
    await fcApi("PUT", "/snapshot/create", {
      snapshot_type: "Full",
      snapshot_path: SNAPSHOT_FILE,
      mem_file_path: MEM_FILE,
    });
  } finally {
    // Always release the process (and with it the TAP device), even if the
    // snapshot failed — the next request falls back to a cold boot.
    await killFirecracker();
  }
  logSnapshotStop(pid, performance.now() - t0);
}
// #endregion snapshot-and-stop

/** Print the cold-boot time and record it so the resume log can show the speedup. */
function logColdBoot(ms: number): void {
  lastColdBootMs = ms;
  console.log(`\n🥶 COLD BOOT  ${ms.toFixed(0)} ms   (spawn firecracker → boot kernel → start bun → HTTP ready)\n`);
}

/** Print the resume time next to the last cold-boot time for comparison. */
function logResume(ms: number): void {
  const vs = lastColdBootMs ? `   (cold boot was ${lastColdBootMs.toFixed(0)} ms → ${(lastColdBootMs / ms).toFixed(1)}× faster)` : "";
  console.log(`\n🔥 RESUME     ${ms.toFixed(0)} ms   (spawn firecracker → restore memory → HTTP ready)${vs}\n`);
}

function logSnapshotStop(pid: number | undefined, ms: number): void {
  console.log(
    `\n💤 idle — VM paused, memory snapshot written, firecracker (pid ${pid}) terminated ` +
      `[${ms.toFixed(0)} ms]\n   check for yourself: pgrep firecracker → nothing\n`,
  );
}

async function waitForGuest(timeoutMs = 15000): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  while (true) {
    try {
      const res = await fetch(`${GUEST_ORIGIN}/health`, { signal: AbortSignal.timeout(250) });
      if (res.ok) return;
    } catch {}
    if (Date.now() > deadline) throw new Error("guest HTTP server never became ready");
    await Bun.sleep(1);
  }
}
