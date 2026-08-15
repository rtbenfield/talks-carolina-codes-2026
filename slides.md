---
title: "Micro VMs and Unikernels: The Cloud’s Next Infrastructure Evolution"
info: |
  The cloud is always evolving. While some technologies dominate today, new innovations are shaping the next generation of cloud infrastructure. One breakthrough we’ll explore is unikernel-backed micro VMs, enabling stateful serverless workloads without cold starts.

  In this session, we’ll take a step back to examine how cloud infrastructure has transformed application development and where it’s headed next. With unikernels driving secure, serverless environments that scale to zero, even traditionally complex workloads like databases and networking are going serverless. Join us to prepare for this next wave of computing and unlock its potential when it arrives.

  This session is designed for an audience familiar with deploying to traditional cloud environments. While focused on infrastructure, there is valuable knowledge for application developers who desire to be on the forefront of new technology. You’ll see examples of this new model deployed in the real-world and learn about the shortcomings it addresses with current norms.

duration: 30min
comark: true
drawings:
  persist: false

theme: ./theme
class: text-center
transition: slide-left
layout: cover
---

# microVMs and Unikernels

## The Cloud’s Next Infrastructure Evolution

<!--
The last comment block of each slide will be treated as slide notes. It will be visible and editable in Presenter Mode along with the slide. [Read more in the docs](https://sli.dev/guide/syntax.html#notes)
-->

---
layout: quote
clickAnimation: fade-in right
---

# The serverless dilemma

<div class="text-3xl">

<v-click>

The *big win* with serverless is paying only for what you use;

</v-click>

<v-click>

the *tradeoff* is accepting **cold starts**, **limited control**, and **vendor lock-in**.

</v-click>

</div>

<!--
- [click] The big win: you only pay for what you use.
- [click] The tradeoff: cold starts, limited control, and vendor lock-in.
-->

---
layout: two-cols-header
---

# A fair trade

Serverless has generally been worth it

::left::

#### Benefits

- Better DX
- Reduced infra management
- Handles traffic spikes
- Usage pricing
- Scale-to-zero

::right::

#### Drawbacks

- Vendor lock-in
- Restrictive runtimes
- Limited control
- Cold start penalties

<!--
It depends on the application  
Some apps see more benefits, others aren't suitable
-->

---
layout: about-me
---

<!--
Prisma hosts applications and databases using microVMs  
We operate the bare metal machines and orchestration services to do so  
This gives us better performance, more ownership of our uptime, and cost savings
-->

---
layout: two-cols
---

# The plan

- Nostalgia
- microVMs & unikerneles
- Demo time
- Takeaways

::right::

<div class="h-full flex items-center justify-center">
  <img src="/qrcode_github.png" class="h-86 rounded-lg" />
</div>

---
layout: image
image: https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExNGEzczNsc3k0YzJuOHc1a3NtZmd5dXZvanRmaWhwbWZ1cGVnaGRndSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/wR4bJk4jF5Tl6/giphy.gif
---

# History

---
layout: two-cols-header
---

# History ⸱ Manual deployments

Pepperidge Farm remembers

Manually copy files to a server with scp, rsync, and ftp

::left::

<v-click>

#### Solved

- ✅ simple... on the surface

</v-click>

::right::

<v-click>

#### Plagued by

- ❌ no repeatability
- ❌ no isolation
- ❌ no rollback
- ❌ sequencing challenges

</v-click>

<v-click>

WAIT! Why doesn't this file match?!

</v-click>

<!--
- [click] Solved: simple, on the surface — mostly script files like PHP and ASP.
- [click] Plagued by: no repeatability, no isolation, no rollback, sequencing challenges — conflicting changes and overwriting work.
- [click] WAIT! Why doesn't this file match?!
-->

---
layout: two-cols-header
---

# History ⸱ 2005 ⸱ VMs

You gotta keep'em separated

Isolate workloads with VMs and template deployments

::left::

<v-click>

#### Solved

- ✅ isolation
- ✅ multi-tenancy
- 〰️ some repeatability

</v-click>

::right::

<v-click>

#### Plagued by

- ❌ resource overhead
- ❌ slow boot times
- ❌ manual orchestration

</v-click>

<!--
- [click] Solved: isolation, multi-tenancy, some repeatability.
- [click] Plagued by: resource overhead, slow boot times, manual orchestration.
-->

---
layout: two-cols-header
---

# History ⸱ 2009 ⸱  Heroku

The first pass at PaaS

Bespoke deployment procedures with buildpacks

::left::

<v-click>

#### Solved

- ✅ `git push heroku main` and it's live
- ✅ add-ons for database, monitoring, etc.

</v-click>

::right::

<v-click>

#### Plagued by

- ❌ no portability
- ❌ limited runtime
- ❌ pricing

</v-click>

<!--
- [click] Solved: simple git push deployment, add-ons for database, monitoring, etc.
- [click] Plagued by: no portability, limited runtime, pricing.
- Heroku was ahead of its time
- Docker introduced portable competition
- Lack of investment led to demise
- Looks like modern PaaS providers
-->

---
layout: two-cols-header
---

# History ⸱ 2013 ⸱  Containers + k8s

The era of whales

Repeatable deployment units that run anywhere

::left::

<v-click>

#### Solved

- ✅ density
- ✅ portability
- ✅ declarative deployment
- 〰️ some isolation

</v-click>

::right::

<v-click>

#### Plagued by

- ❌ YAML sprawl
- ❌ full-time cluster ops
- ❌ weakened isolation

</v-click>

<!--
- [click] Solved: density, portability, declarative deployment, some isolation.
- [click] Plagued by: YAML sprawl, full-time cluster ops, weakened isolation.
- First major step to improve deployments outside bespoke platforms
- Locally runnable
- Vendor portable
- Still a dominant deployment model
-->

---
layout: two-cols-header
---

# History ⸱ 2015 ⸱ FaaS (function-as-a-service)

Two steps backward, one step forward

Deploy code, not infra

::left::

<v-click>

#### Solved

- ✅ simple operation
- ✅ scale-to-zero

</v-click>

::right::

<v-click>

#### Plagued by

- ❌ cold starts
- ❌ stateless
- ❌ vendor lock-in
- ❌ runtime constraints

</v-click>

<!--
- [click] Solved: simple operation, scale-to-zero.
- [click] Plagued by: cold starts, stateless, vendor lock-in, runtime constraints.
- Traded too much for too little, but gained attention
- Sparked a new category of serverless
-->

---
layout: two-cols-header
---

# History ⸱ 2018 ⸱ PaaS (platform-as-a-service)

No shortage of opinions

Intelligent deployments at a premium

::left::

<v-click>

#### Solved

- ✅ modernized deployments
- ✅ build + deploy optimizations
- ✅ focus on app developers

</v-click>

::right::

<v-click>

#### Plagued by

- ❌ cold starts
- ❌ vendor lock-in
- ❌ abstraction layers
- ❌ premium price

</v-click>

<!--
- [click] Solved: modernized deployments, build + deploy optimizations, focus on app developers.
- [click] Plagued by: cold starts, vendor lock-in, abstraction layers, premium price.
- Heroku resurgence without Heroku
- Typically reselling a hyperscaler, running on k8s or lambda
- Iteration and variations plenty
- Bespoke solutions like V8 isolates
- Remained in this category since
-->

---

# Reflections

Do you know where your applications are?

Your infrastructure probably sits in one of these categories.

You inherit the trade-offs of that category.

<!--
- Trade-offs are fine
- Workloads lean toward different solutions
- Opinionated is good, lock-in is bad.
-->

---
layout: cover
---

# microVMs & unikernels

---
layout: two-cols-header
---

# microVMs

The better half of Lambda

A microVM is a highly optimized VM that boots in milliseconds.

::left::

<v-click>

#### Pros

- ✅ minimal device model
- ✅ no bootloader overhead
- ✅ low memory footprint <5MiB
- ✅ optimized for **high density**

</v-click>

::right::

<v-click>

#### Cons

- ❌ no shared kernel
- ❌ no standard image format
- ❌ not as user-friendly as Docker
- ❌ requires host virtualization support

</v-click>

<!--
[click] Pros: minimal device model, no bootloader overhead, low memory footprint <5MiB, optimized for high density.
- high density is an important takeaway

[click] Cons: no shared kernel, no standard image format, not as user-friendly as Docker, requires host virtualization support.

- no shared kernel is a security feature
- boots from fs images, so no image format is expected
- several projects have used OCI images to package firecracker VMs
- Docker doesn't need virtualization in Linux because it shares the kernel
-->

---

# Anatomy of a Firecracker VM

A handful of devices, wired together over one API socket

```mermaid {theme: 'base', scale: 0.7}
flowchart LR
    subgraph Host["Host process"]
        API["API socket\n(unix, HTTP)"]
        VMM["Firecracker VMM"]
        API --> VMM
    end

    subgraph Guest["Guest VM"]
        vCPU["vCPU(s)"]
        MEM["Guest memory"]
        BLK["Block device\n(rootfs image)"]
        NET["virtio-net\n(tap device)"]
        SER["Serial console"]
    end

    VMM --> vCPU
    VMM --> MEM
    VMM --> BLK
    VMM --> NET
    VMM --> SER
```

<!--
Firecracker's device model is deliberately tiny: vCPUs, memory, a block device for the rootfs, a virtio-net device, and a serial console — all configured over one API socket before boot.
No BIOS, no PCI bus, no legacy device emulation like QEMU carries.
-->

---

# microVM Networking · TAP & vsock


```mermaid {theme: 'base', scale: 0.7}
flowchart LR
  subgraph Guest["Guest VM"]
    APP["App"]
    NET["virtio-net"]
  end
  subgraph Host
    TAP["TAP device"]
    BR["bridge / NAT"]
    AGENT["host agent process"]
  end
  NET <--> TAP
  TAP <--> BR
  BR <--> WAN["Internet / LAN"]
  APP <-.->|vsock, CID-addressed| AGENT
```

<v-clicks>

- TAP device - a normal Linux network interface per VM
  - routable, filterable, rate-limitable like any NIC
  - bridge/NAT gets the guest to the LAN and internet
- vsock - a host-guest byte stream, not IP networking
  - addressed by CID, no routing table
  - terminates at one host process that sends/receives data

</v-clicks>

<!--
Guest only sees virtio-net. Host side is TAP (same device as fairness/rate-limiting slide next).

[click] TAP = full network citizen: routable, filterable, bridged/NATed out.

[click] vsock = not IP. CID-addressed, host process only, no other-VM reach. Used by Firecracker's own in-guest agents.
-->

---

# Firecracker added benefits

But wait! There's more!

Firecracker actually has many properties needed by an orhcestrator

<v-clicks>

- memory snapshot and restore
  - resume a VM with memory intact
- resource oversubscription
  - selectively grant memory to overcommit a host
- fairness and rate limiting
  - control VM network capacity and bandwidth
- API driven lifecycle
  - orchestrate Firecracker over HTTP

</v-clicks>

<!--
- [click] Memory snapshot and restore — resume a VM with memory intact.
- [click] Resource oversubscription — selectively grant memory to overcommit a host.
- [click] Fairness and rate limiting — control VM network capacity and bandwidth.
- [click] API driven lifecycle — orchestrate Firecracker over HTTP.
-->

---

# Unikernels

Cleaning out the syscall junk drawer

A typical Linux kernel is general purpose.

<v-click>

What if it was built for your app?

- 🗑️ scheduler
- 🗑️ user/kernel boundary
- 🗑️ multi-process machinery
- 🗑️ device drivers
- 🗑️ network stack

</v-click>

<!--
[click] What if it was built for your app?
- Trim the scheduler.
- Trim the user/kernel boundary.
- Trim multi-process machinery.
- Trim device drivers.
- Trim the network stack.
-->

---

# Unikernels ⸱ collapsing the stack

Same hardware, one less boundary to cross

```mermaid {theme: 'base'}
block-beta
columns 2

block:trad
  columns 1
  ttitle["Traditional VM"]
  tapp["App"]
  tuser["Userspace: shell, package manager"]
  tsys["Syscall boundary"]
  tkern["Kernel: scheduler, drivers, network stack, multi-process"]
  thw["Hardware / vCPU"]
end

block:uni
  columns 1
  utitle["Unikernel VM"]
  uapp["App + only the libraries it links"]
  uhw["Hardware / vCPU"]
end

classDef blockTitle fill:transparent,stroke:none,color:#0b1120,font-weight:700;
class ttitle,utitle blockTitle
```

<!--
Left: a traditional VM has an app running in userspace, crossing a syscall boundary into a general-purpose kernel to reach the hardware.

Right: a unikernel links the app directly against just the libraries it needs into a single image, in a single address space, with no syscall boundary to cross.
Fewer layers isn't just tidier — every removed boundary is a removed context switch.
-->

---

# Serverless platforms

No longer limited to functions

The next generation of serverless platforms runs more than a function.

#### Applications with

- unrestricted runtimes
- long-running memory
- scale-to-zero and instantly resume

#### Databases with

- no cold starts
- usable cache
- standby without dropping connections

---
layout: cover
---

# Demo

<img src="/qrcode_github.png" class="mx-auto h-48 rounded-lg" />

<div class="text-center mt-4">

[github.com/rtbenfield/talks-carolina-codes-2026](https://github.com/rtbenfield/talks-carolina-codes-2026)

</div>

---
zoom: 1
---

# The app inside the VM

An ordinary server with in-memory state

<<< @/demo/guest/server.ts ts {all|4-5|15|16}

<!--
Here's the entire workload the demo ran inside the microVM.
Notice there's no special behavior.

- [click] The two things to keep an eye on: a counter and a boot timestamp, both living in plain process memory — no database, no disk.
- [click] Each request increments the counter.
- [click] And each response reports both. Remember what these did across the kill/resume cycle — we'll come back to them.
-->

---

# A working orchestrator

<SlidevVideo autoplay autoreset="slide" muted playsinline aria-label="Terminal recording: cold boot, idle snapshot kills the firecracker process, resume restores memory in a fraction of the time with the request counter intact" class="dark:hidden h-90 mx-auto mt-4 rounded-lg shadow-lg">
  <source src="/firecracker-demo-light.webm" type="video/webm" />
</SlidevVideo>
<SlidevVideo autoplay autoreset="slide" muted playsinline aria-label="Terminal recording: cold boot, idle snapshot kills the firecracker process, resume restores memory in a fraction of the time with the request counter intact" class="hidden dark:block h-90 mx-auto mt-4 rounded-lg shadow-lg">
  <source src="/firecracker-demo-dark.webm" type="video/webm" />
</SlidevVideo>

<!--
Recorded run of the demo. Re-record from demo/ with `vhs demo-light.tape` and `vhs demo-dark.tape` (shared steps live in demo-steps.tape).
The arc: cold boot → warm request → idle snapshot kills the VM process → pgrep proves it's gone → resume from the memory snapshot 15× faster, counter and bootedAt intact.
-->

---
zoom: 0.9
---

# A VM is just a process

No daemon, just a process per VM

<<< @/demo/src/firecracker.ts#spawn ts {all|6-9|10-11|13-22}

<!--
This is how every VM in the demo came to exist.

- [click] Bun.spawn on a plain binary. One firecracker process per VM.
- [click] The guest's serial console is just the process's stdout.
- [click] Then poll until the API socket answers. At this point firecracker is running but empty but without a VM definition.
-->

---

# The control plane is just HTTP

Firecracker is orchestrated over a unix socket

<<< @/demo/src/firecracker.ts#fc-api ts {all|5}

<!--
Everything the demo did — boot, pause, snapshot, resume — goes through this one function.
No SDK, no client library. A REST API over a unix socket.

- [click] The only unusual part: fetch pointed at a unix socket instead of a TCP port.
-->

---
zoom: 0.9
---

# Cold boot: a VM from five API calls

<<< @/demo/src/vm.ts#cold-boot ts {all|3|4-5|6-16|17|18|20-22}

<!--
This is the entire cold-boot path from the demo.

- [click] Spawn the firecracker process. It starts empty, no VM yet.
- [click] Tell it the shape: 1 vCPU, 256 MiB, and which kernel to boot.
- [click] Attach a root disk and a network interface.
- [click] InstanceStart boots the guest kernel.
- [click] Poll the guest's HTTP server until it answers.
- [click] That whole span is the cold-boot number you saw: kernel boot plus app startup.
-->

---
zoom: 0.9
---

# Scale to zero: pause, snapshot, kill

<<< @/demo/src/vm.ts#snapshot-and-stop ts {all|12|13-17|19-21}

<!--
After the idle timeout, the proxy retires the VM.

- [click] Pause the guest so memory stops changing.
- [click] One API call writes the full VM state and memory to two files on disk.
- [click] Then kill -9 the firecracker process. Nothing is left running. Complete resource cleanup apart from files on disk.
-->

---

# Resume: memory comes back from disk

The guest never knew it was gone

<<< @/demo/src/vm.ts#resume ts {all|3-11|9-10|12}

<!--
The next request takes this path instead of the cold boot.

- [click] Spawn a fresh firecracker process and load the snapshot. No kernel boot, no app startup.
- [click] resume_vm: true means the guest continues from the exact instruction it was paused at.
- [click] Same readiness poll as cold start but observed much faster.

And this is why the counter kept counting and bootedAt never changed: the process didn't restart. Its memory came back from a file.
-->

---
layout: two-cols-header
---

# Takeaways

What if I just want to ship?

::left::

<v-click>

I'm an infra provider

- Unmatched server density
- Strong isolation
- Scale to zero without cold starts

but...

- Works best on bare metal
- Needs more orchestration

</v-click>

::right::

<v-click>

I'm an app developer

- Is your workload intermittent?
- Are you suffering from cold starts?
- Are you paying for idle resources?
- Do you need dynamic resources?

either...

- Match your infra to your workload
- Match your workload to your infra

</v-click>

<!--
- [click] Infra provider's pitch: unmatched density, strong isolation, scale-to-zero without cold starts — but works best on bare metal and needs more orchestration.
- [click] App developer's checklist: intermittent workloads, cold starts, idle spend, dynamic resource needs — match your infra to your workload, or your workload to your infra.
- Most people choose the infra provider that looks easiest
- Consider what your workload needs
- Intermittent workloads want serverless but suffer cold starts
- Cold starts vary by provider implementation

The best is something that feels serverful but is actually serverless
-->

---
layout: cover
---

# That's a wrap

<img src="/qrcode_github.png" class="mx-auto h-48 rounded-lg" />

<div class="text-center mt-4">

[github.com/rtbenfield/talks-carolina-codes-2026](https://github.com/rtbenfield/talks-carolina-codes-2026)

</div>
