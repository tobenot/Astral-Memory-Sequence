<template>
  <i class="game-icon" :class="[`icon-${name}`, size]" :style="style"></i>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  name: string
  size?: 'small' | 'medium' | 'large'
  color?: string
}>()

const style = computed(() => ({
  color: props.color
}))
</script>

<style lang="scss" scoped>
.game-icon {
  display: inline-block;
  width: 1em;
  height: 1em;
  
  &.small {
    font-size: 1rem;
  }
  
  &.medium {
    font-size: 1.5rem;
  }
  
  &.large {
    font-size: 2rem;
  }
}
</style> 