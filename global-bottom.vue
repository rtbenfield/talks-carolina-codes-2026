<script setup lang="ts">
import { computed } from 'vue'
import { useNav } from '@slidev/client'

const { currentLayout } = useNav()

// Give the big moments (cover, section, statement, fact) a brighter, larger
// wash so they read as intentional set pieces instead of noise behind dense
// slides like code or two-column comparisons.
const isHero = computed(() =>
  ['cover', 'section', 'statement', 'fact', 'intro', 'end'].includes(currentLayout.value ?? ''),
)
</script>

<template>
  <div class="ambient-bg" :class="{ 'ambient-bg-hero': isHero }" aria-hidden="true">
    <div class="ambient-blob ambient-blob-blue" />
    <div class="ambient-blob ambient-blob-red" />
    <div class="ambient-blob ambient-blob-yellow" />
    <div class="ambient-grid" />
  </div>
</template>

<style>
.ambient-bg {
  position: fixed;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  z-index: 0;
}

.ambient-blob {
  position: absolute;
  border-radius: 9999px;
  filter: blur(min(10vw, 120px));
  opacity: 0.16;
  will-change: transform;
}

html.dark .ambient-blob {
  opacity: 0.22;
}

.ambient-bg-hero .ambient-blob {
  opacity: 0.28;
}

html.dark .ambient-bg-hero .ambient-blob {
  opacity: 0.34;
}

.ambient-blob-blue {
  left: -12%;
  top: -14%;
  width: 46vw;
  height: 46vw;
  background: var(--brand-blue);
  animation: drift-a 26s ease-in-out infinite;
}

.ambient-blob-red {
  right: -14%;
  bottom: -18%;
  width: 40vw;
  height: 40vw;
  background: var(--brand-red);
  animation: drift-b 32s ease-in-out infinite;
}

.ambient-blob-yellow {
  right: 8%;
  top: -20%;
  width: 30vw;
  height: 30vw;
  background: var(--brand-yellow);
  animation: drift-c 22s ease-in-out infinite;
}

.ambient-grid {
  position: absolute;
  inset: 0;
  opacity: 0.05;
  background-image:
    linear-gradient(to right, currentColor 1px, transparent 1px),
    linear-gradient(to bottom, currentColor 1px, transparent 1px);
  background-size: 64px 64px;
  mask-image: radial-gradient(ellipse 80% 60% at 50% 40%, black, transparent);
}

html.dark .ambient-grid {
  opacity: 0.07;
}

@keyframes drift-a {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(4vw, 5vh) scale(1.08); }
}

@keyframes drift-b {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(-5vw, -4vh) scale(1.1); }
}

@keyframes drift-c {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(-3vw, 4vh) scale(0.95); }
}

@media (prefers-reduced-motion: reduce) {
  .ambient-blob {
    animation: none;
  }
}
</style>
