<template>
  <div class="settings">
    <h2>设置</h2>
    <div class="settings-container">
      <!-- 设置选项将在这里实现 -->
    </div>
    <button @click="router.back()">返回</button>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<style lang="scss" scoped>
.settings {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  background: var(--columbia-blue);

  button {
    margin-top: 1rem;
    padding: 0.5rem 1rem;
    background: var(--columbia-blue-2);
    border: none;
    border-radius: 4px;
    cursor: pointer;

    &:hover {
      background: var(--powder-blue);
    }
  }
}
</style> 