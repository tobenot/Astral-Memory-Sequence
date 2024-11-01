<template>
  <div class="game-card" :class="{ hoverable }">
    <div v-if="$slots.header" class="card-header">
      <slot name="header"></slot>
    </div>
    <div class="card-content">
      <slot></slot>
    </div>
    <div v-if="$slots.footer" class="card-footer">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  hoverable?: boolean
}>()
</script>

<style lang="scss" scoped>
.game-card {
  background: var(--columbia-blue-2);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: transform 0.3s ease;

  &.hoverable:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  .card-header {
    padding: 1rem;
    background: var(--columbia-blue-3);
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  }

  .card-content {
    padding: 1rem;
  }

  .card-footer {
    padding: 1rem;
    background: var(--columbia-blue-3);
    border-top: 1px solid rgba(0, 0, 0, 0.1);
  }
}
</style> 