<template>
  <Teleport to="body">
    <Transition name="dialog-fade">
      <div v-if="modelValue" class="dialog-overlay" @click="handleOverlayClick">
        <div class="dialog-content" @click.stop>
          <div class="dialog-header">
            <slot name="header">
              <h3>{{ title }}</h3>
            </slot>
            <button class="close-button" @click="$emit('update:modelValue', false)">
              ×
            </button>
          </div>
          <div class="dialog-body">
            <slot></slot>
          </div>
          <div v-if="$slots.footer" class="dialog-footer">
            <slot name="footer"></slot>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { Teleport, Transition } from 'vue'

const props = defineProps<{
  modelValue: boolean
  title?: string
  closeOnOverlay?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const handleOverlayClick = () => {
  if (props.closeOnOverlay) {
    emit('update:modelValue', false)
  }
}
</script>

<style lang="scss" scoped>
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.dialog-content {
  background: var(--columbia-blue);
  border-radius: 8px;
  min-width: 300px;
  max-width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
}

.dialog-header {
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--columbia-blue-3);
}

.dialog-body {
  padding: 1rem;
}

.dialog-footer {
  padding: 1rem;
  border-top: 1px solid var(--columbia-blue-3);
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

.close-button {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.25rem;
  line-height: 1;
  
  &:hover {
    color: var(--sky-blue);
  }
}

.dialog-fade-enter-active,
.dialog-fade-leave-active {
  transition: opacity 0.3s ease;
}

.dialog-fade-enter-from,
.dialog-fade-leave-to {
  opacity: 0;
}
</style> 