# Running Firecracker under WSL2

Firecracker needs KVM (`/dev/kvm`). Inside WSL2 that means **nested virtualization**: Windows runs WSL2 in a Hyper-V VM, and that VM must be allowed to expose hardware virtualization to Linux.

Modern WSL makes this much easier than older guides suggest. WSL2 kernels since the 6.x series ship KVM as loadable modules, so a custom kernel build is usually **not** required anymore. Follow the modern path first; fall back to the kernel build only if step V3 fails.

## Requirements

- **Intel CPU:** Windows 10 or later, with VT-x and EPT (any recent Core CPU has both).
- **AMD CPU:** Windows 11 or later, Ryzen or EPYC.
- Windows must run on bare metal. If Windows itself is a VM (cloud VDI, Proxmox, etc.), nested virtualization must be enabled one layer further up — and on some hosts it simply isn't available.
- A recent WSL2 (check with `wsl --version` in PowerShell; update with `wsl --update`).

## Modern path (no kernel build)

**S1. Enable nested virtualization.** In Windows, edit (or create) `%USERPROFILE%\.wslconfig`:

```ini
[wsl2]
nestedVirtualization=true
```

This key only works in the Windows-side `.wslconfig`. Putting it in the Linux-side `/etc/wsl.conf` fails with `Unknown key 'wsl2.nestedVirtualization'`.

**S2. Restart WSL.** From PowerShell:

```powershell
wsl --shutdown
```

Then open a new WSL terminal.

**S3. Verify the CPU exposes virtualization.** Inside WSL:

```sh
grep -cE 'vmx|svm' /proc/cpuinfo   # non-zero means nested virt is active
```

If this prints `0`, nested virtualization did not take effect — see Troubleshooting.

**S4. Load the KVM module.** The stock WSL2 kernel builds KVM as modules (`CONFIG_KVM=m`) but does not autoload them:

```sh
sudo modprobe kvm_intel    # Intel; use kvm_amd on AMD
ls /dev/kvm                # should now exist
```

**S5. Autoload on boot.** WSL distros run systemd by default now, so `modules-load.d` works:

```sh
echo kvm_intel | sudo tee /etc/modules-load.d/kvm.conf   # kvm_amd on AMD
```

**S6. Grant your user access.** `/dev/kvm` is `root:root 0600` by default. Either add a udev rule:

```sh
sudo groupadd -f kvm
sudo usermod -aG kvm "$USER"
echo 'KERNEL=="kvm", GROUP="kvm", MODE="0660"' | sudo tee /etc/udev/rules.d/99-kvm.rules
```

then restart WSL (`wsl --shutdown`) — or take the blunt single-user shortcut:

```sh
sudo chmod 666 /dev/kvm
```

The chmod does not persist across WSL restarts. To make it persist, use the udev rule, or add to `/etc/wsl.conf`:

```ini
[boot]
command = modprobe kvm_intel && chmod 666 /dev/kvm
```

## Verify

```sh
ls -l /dev/kvm                       # exists, and you have rw access
firecracker --version                # binary installed (see README setup)
```

The real test is the demo itself: run the setup scripts in the [README](README.md), then `bun run server.ts` and curl it.

## Legacy path: custom kernel build

Only needed if your WSL2 kernel predates module support (`find /lib/modules/$(uname -r) -name 'kvm*.ko*'` returns nothing and `zcat /proc/config.gz | grep CONFIG_KVM=` shows KVM disabled). Update WSL first (`wsl --update`) — that usually makes this section unnecessary.

**K1.** Install build dependencies (Ubuntu):

```sh
sudo apt update
sudo apt install -y build-essential flex bison libssl-dev libelf-dev libncurses-dev bc dwarves
```

**K2.** Clone Microsoft's WSL2 kernel and start from their config:

```sh
git clone --depth 1 https://github.com/microsoft/WSL2-Linux-Kernel.git
cd WSL2-Linux-Kernel
```

**K3.** Enable KVM in the config (`Microsoft/config-wsl`), either via `make menuconfig KCONFIG_CONFIG=Microsoft/config-wsl` (Virtualization section) or by setting directly:

```
CONFIG_KVM=y
CONFIG_KVM_INTEL=y        # or CONFIG_KVM_AMD=y
CONFIG_KVM_GUEST=y
```

**K4.** Build and copy the kernel image to Windows:

```sh
make -j"$(nproc)" KCONFIG_CONFIG=Microsoft/config-wsl
cp arch/x86/boot/bzImage /mnt/c/Users/<your-windows-user>/bzImage
```

**K5.** Point WSL at it in `%USERPROFILE%\.wslconfig` (note the double backslashes) and restart:

```ini
[wsl2]
nestedVirtualization=true
kernel=C:\\Users\\<your-windows-user>\\bzImage
```

```powershell
wsl --shutdown
```

With KVM built in (`=y`), `/dev/kvm` appears without any modprobe. Only the permission step (S6) still applies.

## Troubleshooting

- **`grep vmx /proc/cpuinfo` returns nothing after S1–S2.**
  - Confirm the `.wslconfig` edit landed in the right profile (`%USERPROFILE%`, i.e. `C:\Users\<you>\.wslconfig`) and that every WSL instance was shut down. WSL silently ignores unknown or misplaced keys.
  - AMD on Windows 10 is not supported — Windows 11 required.
  - If Windows reports *"Nested virtualization is not supported on this machine"*, Windows itself may be virtualized, or virtualization is disabled in UEFI/BIOS (Intel VT-x / AMD SVM).
- **`modprobe kvm_intel` fails with "Operation not supported".** Nested virt is not actually exposed — same causes as above; the module loads only when `vmx`/`svm` is present in `/proc/cpuinfo`.
- **`/dev/kvm` exists but Firecracker gets "Permission denied".** Step S6 wasn't applied, or you haven't re-logged in since being added to the `kvm` group (`newgrp kvm` as a quick fix).
- **It worked, then broke after a Windows or WSL update.** Kernel updates change `uname -r`; the stock module path keeps working, but a legacy custom kernel pinned in `.wslconfig` does not receive updates — rebuild it, or retry the modern path since the shipped kernel may now support KVM.

## Performance caveat

Nested KVM is measurably slower than bare-metal KVM. The demo works, but the cold-boot vs. snapshot-resume delta shown on stage should be recorded on a bare-metal Linux box for honest numbers.

## Sources

- [Firecracker getting-started: KVM requirements](https://github.com/firecracker-microvm/firecracker/blob/main/docs/getting-started.md)
- [Firecracker dev-machine-setup](https://github.com/firecracker-microvm/firecracker/blob/main/docs/dev-machine-setup.md)
- [Configuring WSL2 to support nested Firecracker VMs (Medium)](https://medium.com/@veltun/configuring-wsl2-to-support-firecracker-vms-i-e-for-containerlab-a3d36ca8ed8a)
- [Accelerated KVM guests on WSL 2 (Box of Cables)](https://www.boxofcables.dev/accelerated-kvm-guests-on-wsl-2/)
- [microsoft/WSL #13262 — /dev/kvm missing with nestedVirtualization=true](https://github.com/microsoft/WSL/issues/13262)
- [microsoft/WSL #40735 — nested virtualization unconditionally disabled](https://github.com/microsoft/WSL/issues/40735)
- [kind: Using WSL2 (nested virt requirements table)](https://kind.sigs.k8s.io/docs/user/using-wsl2/)
