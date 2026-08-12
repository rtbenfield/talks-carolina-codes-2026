// Every knob and path in the demo, in one place.
import { resolve } from "node:path";

const DEMO_DIR = resolve(import.meta.dir, "..");
export const BUILD_DIR = resolve(DEMO_DIR, ".build");
export const KERNEL_PATH = `${BUILD_DIR}/vmlinux`;
export const ROOTFS_PATH = `${BUILD_DIR}/rootfs.ext4`;
export const SNAPSHOT_DIR = `${BUILD_DIR}/snapshot`;
export const SNAPSHOT_FILE = `${SNAPSHOT_DIR}/snapshot.file`;
export const MEM_FILE = `${SNAPSHOT_DIR}/mem.file`;

// Unix socket paths are capped at ~108 chars (SUN_LEN); keep it out of the
// repo tree, which may live at an arbitrarily deep path.
export const API_SOCK = "/tmp/fc-demo-firecracker.sock";

// Host side of the TAP device is 172.16.0.1 (created by scripts/setup-network.sh).
// The guest address is assigned by the kernel via the ip= boot parameter below.
export const TAP_DEVICE = "fc-demo-tap";
export const GUEST_MAC = "06:00:AC:10:00:02";
export const GUEST_ORIGIN = "http://172.16.0.2:8000";

export const BOOT_ARGS = [
  "console=ttyS0",
  "reboot=k panic=1 pci=off",
  "quiet loglevel=1",
  "i8042.noaux i8042.nomux i8042.nopnp i8042.dumbkbd",
  "ip=172.16.0.2::172.16.0.1:255.255.255.0::eth0:off",
  "init=/init",
].join(" ");

export const PORT = Number(process.env.PORT ?? 8080);
export const IDLE_MS = Number(process.env.IDLE_MS ?? 5000);
