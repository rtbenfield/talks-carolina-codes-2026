#!/bin/sh
# Builds the guest root filesystem: Alpine Linux + Bun + the guest HTTP server.
# Needs sudo (loop mount + chroot). Produces .build/rootfs.ext4.
set -eu

cd "$(dirname "$0")/.."
mkdir -p .build

ARCH="$(uname -m)"
case "$ARCH" in
  x86_64)  BUN_ARCH="x64" ;;
  aarch64) BUN_ARCH="aarch64" ;;
  *) echo "unsupported architecture: $ARCH" >&2; exit 1 ;;
esac

ALPINE_BRANCH="v3.22"
ALPINE_VERSION="3.22.1"
ROOTFS=".build/rootfs.ext4"
MNT=".build/mnt"

# Download Alpine minirootfs and the musl build of Bun.
if [ ! -f .build/alpine.tar.gz ]; then
  curl -fL -o .build/alpine.tar.gz \
    "https://dl-cdn.alpinelinux.org/alpine/${ALPINE_BRANCH}/releases/${ARCH}/alpine-minirootfs-${ALPINE_VERSION}-${ARCH}.tar.gz"
fi
if [ ! -f .build/bun ]; then
  curl -fL -o .build/bun.zip \
    "https://github.com/oven-sh/bun/releases/latest/download/bun-linux-${BUN_ARCH}-musl.zip"
  unzip -o -j .build/bun.zip "bun-linux-${BUN_ARCH}-musl/bun" -d .build
  rm .build/bun.zip
fi

# Assemble the ext4 image.
rm -f "$ROOTFS"
dd if=/dev/zero of="$ROOTFS" bs=1M count=512 status=none
mkfs.ext4 -q -F "$ROOTFS"
mkdir -p "$MNT"
sudo mount -o loop "$ROOTFS" "$MNT"
cleanup() { sudo umount "$MNT" 2>/dev/null || true; }
trap cleanup EXIT

sudo tar -xzf .build/alpine.tar.gz -C "$MNT"
sudo install -D -m755 .build/bun "$MNT/usr/local/bin/bun"
sudo install -D -m644 guest/server.ts "$MNT/app/server.ts"
sudo install -m755 guest/init "$MNT/init"

# Bun needs libstdc++/libgcc; install them via apk inside the new root.
sudo cp /etc/resolv.conf "$MNT/etc/resolv.conf"
sudo chroot "$MNT" /sbin/apk add --no-cache libstdc++ libgcc

sudo umount "$MNT"
trap - EXIT
rmdir "$MNT"
echo "rootfs saved to $ROOTFS"
