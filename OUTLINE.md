# Micro VMs and Unikernels: The Cloud's Next Infrastructure Evolution

30-minute session, intermediate audience (familiar with deploying to traditional cloud environments).

## Timing budget (30 min total)

| Section | Time |
|---|---|
| Hook | 1–2 min |
| Intro | 1 min |
| Roadmap | 1 min |
| History of deployment | 6–7 min |
| MicroVMs & unikernels | 8–9 min |
| Firecracker demo | 4–5 min |
| Close / takeaway | 3–4 min |
| Buffer | ~2 min |

## Section 1 — Hook (1–2 min)

Pick one, not both — a stat needs a source you can defend live, a claim needs conviction. Recommendation: the claim. Stats invite audience fact-checking mid-talk; a strong claim sets the thesis and you spend the rest of the talk earning it.

Candidate: *"Every serverless platform you've used is still booting a Linux kernel to run your one function."* Then reveal the cost — cold start latency, container escape surface, memory overhead — as the reason the audience should care for the next 25 minutes.

Avoid opening with "unikernel" or "microVM" by name here. Those terms land better once you've built the problem first.

## Section 2 — Intro (1 min)

One slide, minimal bio. Role, why you're credible on this topic, done.

## Section 3 — Roadmap (1 min)

One slide: History → MicroVMs & Unikernels → Live Demo → Takeaways. Set expectation that the demo may run as a recording if live fails — say this once here so it's not a surprise later.

## Section 4 — History of deployment (6–7 min)

This is scene-setting, not the payload — keep each era to one slide, one "solved" and one "introduced."

**FR1.** *Manual deploys* (scp/rsync to a box). Solved: simplicity. Introduced: no repeatability, no isolation, one bad deploy takes down everything.

**FR2.** *VMs* (Xen/KVM, EC2 era). Solved: isolation, multi-tenancy. Introduced: heavy resource overhead, slow boot, still manually orchestrated.

**FR3.** *Containers + Kubernetes.* Solved: density, portability, declarative orchestration. Introduced: operational complexity — YAML sprawl, cluster ops now a full-time job, weak isolation boundary (shared kernel).

**FR4.** *FaaS (Lambda).* Solved: no server management, scale-to-zero. Introduced: cold starts, statelessness forces external state stores, vendor lock-in on runtime semantics.

**FR5.** *Platform abstractions (Vercel, etc.).* Solved: DX — git push to prod. Introduced: another abstraction layer hiding the actual infra tradeoffs from the developer making the hosting decision.

Close this section with the throughline: **every layer traded isolation/security for speed, or speed for isolation — never both.** That tension is the setup for microVMs.

## Section 5 — MicroVMs & unikernels (8–9 min)

This is the core content — spend the most time and the most rigor here.

**RF1. What a microVM is.** VM-grade isolation (own kernel, hardware-enforced boundary via KVM) at container-grade speed. Contrast directly against the container's shared-kernel model from Section 4 — this is the payoff of the history section.

**RF2. Why it's fast.** Minimal device model, no BIOS/bootloader overhead, boot times in milliseconds not seconds. Firecracker as the reference implementation (built for Lambda under the hood — nice callback to FR4).

**RF3. Unikernels, briefly.** A unikernel compiles your application and only the OS primitives it needs into a single bootable image — no general-purpose kernel, no unused syscalls, no shell. Smaller attack surface, smaller boot footprint. Position this as complementary to microVMs, not competing: the microVM is the isolation boundary, the unikernel is what you can choose to run inside it. Don't go deep on unikernel internals (exokernel lineage, LibOS design) — intermediate audience, mention it exists and why it matters, move on.

**RF4. The cold-start fix.** Memory snapshotting — pause a booted microVM, snapshot its memory state, restore from snapshot instead of cold-booting. This is what makes stateful serverless workloads viable — a database or long-lived connection can persist across invocations instead of re-initializing every time.

**RF5. What's now serverless because of this.** Reference examples, in order of most color to least:

- **Prisma Cloud** — deploys full-stack TypeScript applications by running Postgres and Bun inside microVMs on bare-metal clusters, rather than containers. This is the reference case for the "stateful workloads without cold starts" thesis of the talk: the database itself lives inside the same isolation model as the application runtime, not bolted on as an external managed service. Frame this as an example of the architecture in production, not a pitch — one sentence on what it does, then move on.
- **Fly.io Machines** — general-purpose microVM compute, closest analog to "VMs that scale to zero."
- **AWS Lambda** — Firecracker under the hood, already introduced in FR4/RF2, worth a callback here to close the loop.
- **Cloudflare Workers** — V8 isolates, worth naming as a *different* isolation model for contrast (process-level, not hardware-level).

This is where "networking and databases are going serverless" from the abstract cashes out concretely.

## Section 6 — Firecracker demo (4–5 min, time permitting)

Live demo centers on the cold-boot vs. snapshot-resume timing gap. Record it as backup regardless — most likely part to fail on stage.

**RF6. Demo app.** TypeScript/Bun HTTP proxy in front of a Firecracker microVM running the Remix v3 demo app unmodified (listens on plain TCP inside the guest — no app-side changes for the VM boundary).

**RF7. Networking.** TAP device, simplest viable setup — static TAP name, one-time host-level iptables NAT rule created by a setup script, not per-request provisioning. Networking is not the focus of the talk; don't over-engineer this.

**RF8. Cold-boot path.** First request to the proxy triggers a cold boot of the microVM (kernel boot + full Remix app startup lifecycle) before the request is proxied through. Deliberately time the *whole* lifecycle, not just kernel boot — the point is showing what snapshot-resume skips, not isolating kernel boot time alone.

**RF9. Snapshot-and-terminate.** After the response drains, the proxy pauses the VM, writes a memory snapshot (mem file + snapshot file) via the Firecracker API, then terminates the Firecracker process. Demo beat: show the process in `top`, then show it gone.

**RF10. Resume path.** Next request boots a new Firecracker process from the snapshot instead of cold-booting (reusing the same TAP device now that the prior process has released it). Time this path the same way as RF8.

**RF11. Timing output.** Proxy prints both timings (cold boot vs. snapshot resume) to its own terminal so the delta is visible without extra tooling.

**RF12. Repeatability.** Proxy purges any existing snapshot/mem file on its own startup, so the cold-boot path can be re-triggered on demand for re-runs.

Repo consideration — since the setup will live in this repo for the audience to try: put it under a `setup/` or `demo/` directory with a self-contained README, pinned Firecracker version, and a kernel/rootfs download script. Don't assume attendees have KVM available (WSL2 without nested virt, corporate laptops) — say that constraint explicitly in the README so people aren't confused when it fails locally.

## Section 7 — Close (3–4 min)

Bring it back to the audience-as-consumer framing from the abstract — they don't operate this infra, their hosting provider does, but the choice of provider is now an architectural decision, not just a pricing one.

**Primary takeaway:** when evaluating serverless providers, ask what's actually running under the hood — shared-kernel container, V8 isolate, or microVM — because that answer determines your cold-start profile, your isolation guarantees, and what workloads (stateful, long-lived, security-sensitive) you can actually put there.

**Actionable close:** two or three concrete things they can do this week — check whether their current provider publishes its isolation model, test cold-start latency for their actual workload shape, and know that "serverless database" now exists as a category enabled by exactly this technology.

End with a single forward-looking line, not a summary recap — the audience just heard the recap in the roadmap.
