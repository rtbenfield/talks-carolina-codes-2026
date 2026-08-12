#!/bin/sh
# One-time host networking: a static TAP device the microVM attaches to.
# The device is owned by the current user so firecracker can run unprivileged.
# Host side: 172.16.0.1/24. Guest side (set via kernel boot args): 172.16.0.2.
set -eu

TAP="fc-demo-tap"

sudo ip link del "$TAP" 2>/dev/null || true
sudo ip tuntap add dev "$TAP" mode tap user "$(id -un)"
sudo ip addr add 172.16.0.1/24 dev "$TAP"
sudo ip link set "$TAP" up

echo "TAP device $TAP up (host 172.16.0.1, guest will be 172.16.0.2)"
