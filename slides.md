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

<v-click>

The *big win* with serverless is paying only for what you use;  

</v-click>

<v-click>

the *tradeoff* is accepting **cold starts**, **limited control**, and potential **vendor lock-in**.

</v-click>

---
layout: two-cols-header
---

# A worthy exchange

It's generally been worth it

::left::

- Better DX
- Autoscaling
- Reduced operations
- Usage pricing
- Scale-to-zero

::right::

- Point

---
layout: about-me
---

<!---->

---
layout: image-right
<!--image: -->
---

# Agenda

- Nostalgia
- microVMs & unikerneles
- Demo time
- Takeaways

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

Manually copy files to a server with scp and rsync

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
- Mostly script files - PHP, ASP, etc.
- Conflicting changes and ovewriting work
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

---
layout: two-cols-header
---

# History ⸱ 2009 ⸱  Heroku

The first pass at PaaS

Bespoke deployment procedures with buildpacks

::left::

<v-click>

#### Solved

- ✅ simple `git push` deployment
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
- high density is an important takeaway
- no shared kernel is a security feature
- boots from fs images, so no image format is expected
- several projects have used OCI images to package firecracker VMs
- Docker doesn't need virtualization in Linux because it shares the kernel
-->

---

# Firecracker added benefits

But wait! There's more!

Firecracker actually has many properties of a scheduler

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

---

# Unikernels

Cleaning out the junk drawer

A typical Linux kernel is general purpose.

<v-clicks>

What if it was built for your app?

- 🗑️ scheduler
- 🗑️ user/kernel boundary
- 🗑️ multi-process machinery
- 🗑️ device drivers
- 🗑️ network stack

</v-clicks>

---

# Serverless platforms

The next generation of serverless platforms runs more than a function. It feels like a container but scales like a function.

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
