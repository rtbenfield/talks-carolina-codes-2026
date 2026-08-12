#!/bin/sh
# Installs the Firecracker binary to /usr/local/bin (pinned version).
set -eu

VERSION="v1.14.1"
ARCH="$(uname -m)"

if command -v firecracker >/dev/null 2>&1; then
  echo "firecracker already installed: $(firecracker --version | head -1)"
  echo "delete /usr/local/bin/firecracker to reinstall"
  exit 0
fi

tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT
cd "$tmp"

release_url="https://github.com/firecracker-microvm/firecracker/releases/download/${VERSION}/firecracker-${VERSION}-${ARCH}.tgz"
curl -fL "$release_url" | tar -xz
chmod +x "release-${VERSION}-${ARCH}/firecracker-${VERSION}-${ARCH}"
sudo mv "release-${VERSION}-${ARCH}/firecracker-${VERSION}-${ARCH}" /usr/local/bin/firecracker

firecracker --version | head -1
