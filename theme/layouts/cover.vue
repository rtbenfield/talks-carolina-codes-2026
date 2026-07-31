<script setup lang="ts">
import { computed } from 'vue'
import { handleBackground } from '../layoutHelper'

const props = defineProps({
  background: {
    default: '',
  },
})

const style = computed(() => handleBackground(props.background, true))
</script>

<template>
  <div class="slidev-layout cover relative" :style="style">
    <div class="bg-brand-stripes absolute right-0 top-0 h-full w-16" />
    <div class="my-auto w-full">
      <slot />
    </div>
  </div>
</template>
