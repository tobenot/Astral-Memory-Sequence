<template>
  <button 
    class="game-button"
    :class="[variant, { disabled }]"
    :disabled="disabled"
    @click="$emit('click')"
  >
    <slot></slot>
  </button>
</template>

<script setup lang="ts">
defineProps<{
  variant?: 'primary' | 'secondary' | 'danger'
  disabled?: boolean
}>()

defineEmits<{
  (e: 'click'): void
}>()
</script>

<style lang="scss" scoped>
.game-button {
  padding: 0.5rem 1rem;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  background: var(--columbia-blue-3);
  color: #333;

  &:hover:not(.disabled) {
    background: var(--powder-blue);
  }

  &.primary {
    background: var(--sky-blue);
    color: white;
  }

  &.disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}
</style> 