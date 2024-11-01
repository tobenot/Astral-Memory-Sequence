<template>
  <div class="home">
    <h1>星界记忆序列</h1>
    <div class="menu">
      <button @click="startGame">开始游戏</button>
      <button @click="goToSettings">设置</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const startGame = () => {
  router.push('/game')
}

const goToSettings = () => {
  router.push('/settings')
}
</script>

<style lang="scss" scoped>
.home {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  background: linear-gradient(135deg, var(--columbia-blue), var(--sky-blue));

  h1 {
    font-size: 2.5rem;
    margin-bottom: 2rem;
    color: #2c3e50;
  }

  .menu {
    display: flex;
    flex-direction: column;
    gap: 1rem;

    button {
      padding: 1rem 2rem;
      font-size: 1.2rem;
      border: none;
      border-radius: 4px;
      background: var(--columbia-blue-2);
      cursor: pointer;
      transition: all 0.3s ease;

      &:hover {
        background: var(--powder-blue);
        transform: translateY(-2px);
      }
    }
  }
}
</style> 