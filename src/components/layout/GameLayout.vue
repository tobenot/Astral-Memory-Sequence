<template>
  <div class="game-layout">
    <header class="game-header">
      <div class="turn-info">回合: {{ currentTurn }}</div>
      <div class="action-bar">
        <!-- 行动条将在这里实现 -->
      </div>
    </header>
    
    <main class="game-main">
      <div class="board-area">
        <slot name="board"></slot>
      </div>
      <aside class="info-panel">
        <slot name="character-info"></slot>
        <slot name="skill-panel"></slot>
      </aside>
    </main>

    <footer class="game-footer">
      <slot name="controls"></slot>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { useGameStore } from '@/stores/game'

const gameStore = useGameStore()
const currentTurn = computed(() => gameStore.currentTurn)
</script>

<style lang="scss" scoped>
.game-layout {
  display: grid;
  grid-template-rows: auto 1fr auto;
  height: 100vh;
  background: var(--columbia-blue);

  .game-header {
    padding: 1rem;
    background: var(--columbia-blue-2);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .game-main {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 1rem;
    padding: 1rem;

    @media (max-width: $tablet) {
      grid-template-columns: 1fr;
    }
  }

  .info-panel {
    width: 300px;
    background: var(--columbia-blue-3);
    border-radius: 8px;
    padding: 1rem;

    @media (max-width: $tablet) {
      width: 100%;
    }
  }

  .game-footer {
    padding: 1rem;
    background: var(--columbia-blue-2);
  }
}
</style> 