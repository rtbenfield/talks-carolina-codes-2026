// Entry point: an HTTP proxy that boots/resumes the microVM on demand,
// forwards every request to it, and snapshots it away after idle.
//
// Request flow:
//   - No VM running, no snapshot      → cold boot, then proxy.
//   - No VM running, snapshot on disk → resume from memory snapshot, then proxy.
//   - VM running                      → proxy directly.
import { existsSync } from "node:fs";
import { GUEST_ORIGIN, IDLE_MS, KERNEL_PATH, PORT, ROOTFS_PATH } from "./config";
import { ensureVm, purgeSnapshot, requestSnapshotAndStop, shutdownVm } from "./vm";

let inflight = 0;
let idleTimer: ReturnType<typeof setTimeout> | null = null;
let requestCount = 0;

function resetIdleTimer(): void {
  if (idleTimer) clearTimeout(idleTimer);
  idleTimer = setTimeout(() => {
    if (inflight > 0) {
      resetIdleTimer();
      return;
    }
    requestSnapshotAndStop().catch((err) => console.error("snapshot failed:", err));
  }, IDLE_MS);
}

async function proxyToGuest(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const target = `${GUEST_ORIGIN}${url.pathname}${url.search}`;
  const doFetch = () =>
    fetch(target, {
      method: req.method,
      headers: req.headers,
      body: req.body,
      signal: AbortSignal.timeout(10000),
    });
  try {
    return await doFetch();
  } catch {
    // The VM may have been snapshotted away between the startup check and
    // this fetch (or a pooled connection died with the previous VM instance).
    // Re-ensure the VM, then retry once.
    await ensureVm();
    return await doFetch();
  }
}

for (const [name, path] of [["kernel", KERNEL_PATH], ["rootfs", ROOTFS_PATH]] as const) {
  if (!existsSync(path)) {
    console.error(`missing ${name} at ${path} — run the setup scripts first (see README.md)`);
    process.exit(1);
  }
}

// Fresh snapshot state on every proxy start so the cold-boot path is always
// demonstrable (RF12 in the talk outline is the "repeatability" requirement).
purgeSnapshot();

Bun.serve({
  port: PORT,
  async fetch(req) {
    const startup = await ensureVm();
    inflight++;
    try {
      const res = await proxyToGuest(req);
      requestCount++;
      console.log(
        `── request #${requestCount} ${req.method} ${new URL(req.url).pathname}` +
          `  →  ${startup.path}${startup.ms ? ` (${startup.ms.toFixed(0)} ms)` : ""}`,
      );
      const headers = new Headers(res.headers);
      headers.set("x-vm-startup-path", startup.path);
      headers.set("x-vm-startup-ms", startup.ms.toFixed(0));
      return new Response(res.body, { status: res.status, headers });
    } finally {
      inflight--;
      resetIdleTimer();
    }
  },
});

console.log(`proxy listening on http://localhost:${PORT} → microVM at ${GUEST_ORIGIN}`);
console.log(`idle timeout: ${IDLE_MS} ms (override with IDLE_MS=...)`);
console.log(`snapshot state purged — first request will cold boot\n`);

process.on("SIGINT", async () => {
  await shutdownVm();
  process.exit(0);
});
