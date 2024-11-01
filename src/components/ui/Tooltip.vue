<template>
  <div class="tooltip-container" @mouseenter="show" @mouseleave="hide">
    <slot></slot>
    <Transition name="tooltip">
      <div v-if="isVisible" class="tooltip" :class="position">
        {{ content }}
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  content: string
  position?: 'top' | 'bottom' | 'left' | 'right'
  delay?: number
}>()

const isVisible = ref(false)
let timeoutId: number | null = null

const show = () => {
  if (timeoutId) clearTimeout(timeoutId)
  timeoutId = setTimeout(() => {
    isVisible.value = true
  }, props.delay || 200) as unknown as number
}

const hide = () => {
  if (timeoutId) clearTimeout(timeoutId)
  isVisible.value = false
}
</script>

<style lang="scss" scoped>
.tooltip-container {
  position: relative;
  display: inline-block;
}

.tooltip {
  position: absolute;
  padding: 0.5rem;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  border-radius: 4px;
  font-size: 0.875rem;
  white-space: nowrap;
  z-index: 1000;
  pointer-events: none;

  &.top {
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%) translateY(-8px);
  }

  &.bottom {
    top: 100%;
    left: 50%;
    transform: translateX(-50%) translateY(8px);
  }

  &.left {
    right: 100%;
    top: 50%;
    transform: translateY(-50%) translateX(-8px);
  }

  &.right {
    left: 100%;
    top: 50%;
    transform: translateY(-50%) translateX(8px);
  }
}

.tooltip-enter-active,
.tooltip-leave-active {
  transition: opacity 0.2s, transform 0.2s;
}

.tooltip-enter-from,
.tooltip-leave-to {
  opacity: 0;
  transform: scale(0.9);
}
</style> 