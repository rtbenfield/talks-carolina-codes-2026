#!/bin/sh
# Downloads a Firecracker-compatible Linux kernel from the Firecracker CI
# artifact bucket (same source the official getting-started guide uses).
set -eu

cd "$(dirname "$0")/.."
mkdir -p .build

ARCH="$(uname -m)"
CI_VERSION="v1.14"

if [ -f .build/vmlinux ]; then
  echo "kernel already present at .build/vmlinux — delete it to re-download"
  exit 0
fi

key="$(curl -fsSL "http://spec.ccfc.min.s3.amazonaws.com/?prefix=firecracker-ci/${CI_VERSION}/${ARCH}/vmlinux-&list-type=2" \
  | grep -oE "firecracker-ci/${CI_VERSION}/${ARCH}/vmlinux-[0-9]+\.[0-9]+\.[0-9]+" \
  | sort -V | tail -1)"

if [ -z "$key" ]; then
  echo "could not find a CI kernel for ${ARCH} under ${CI_VERSION}" >&2
  exit 1
fi

echo "downloading ${key}"
curl -fL -o .build/vmlinux "https://s3.amazonaws.com/spec.ccfc.min/${key}"
echo "kernel saved to .build/vmlinux"
