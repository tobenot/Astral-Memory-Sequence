<template>
  <div 
    class="game-layout"
    @touchstart="handleTouchStart"
    @touchmove="handleTouchMove"
    @touchend="handleTouchEnd"
  >
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
      <aside class="info-panel" :class="{ 'show': showInfoPanel }">
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
import { computed, ref } from 'vue'
import { useGameStore } from '@/stores/game'
import { useTouchHandler } from '@/utils/touch'

const gameStore = useGameStore()
const currentTurn = computed(() => gameStore.currentTurn)

// 侧边栏控制
const showInfoPanel = ref(true)
const { touchInfo, handleTouchStart, handleTouchMove } = useTouchHandler()

// 处理移动端侧边栏滑动
const handleTouchEnd = () => {
  const SWIPE_THRESHOLD = 50
  if (Math.abs(touchInfo.value.deltaX) > SWIPE_THRESHOLD) {
    if (touchInfo.value.deltaX > 0) {
      showInfoPanel.value = true
    } else {
      showInfoPanel.value = false
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/styles/_breakpoints.scss';

.game-layout {
  display: grid;
  grid-template-rows: auto 1fr auto;
  height: 100vh;
  background: var(--columbia-blue);
  overflow: hidden;

  .game-header {
    padding: 1rem;
    background: var(--columbia-blue-2);
    display: flex;
    justify-content: space-between;
    align-items: center;

    @include respond-to('mobile') {
      padding: 0.5rem;
      font-size: 0.875rem;
    }
  }

  .game-main {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 1rem;
    padding: 1rem;
    overflow: hidden;

    @include respond-to('tablet') {
      grid-template-columns: 1fr;
      padding: 0.5rem;
    }
  }

  .info-panel {
    width: 300px;
    background: var(--columbia-blue-3);
    border-radius: 8px;
    padding: 1rem;
    transition: transform 0.3s ease;

    @include respond-to('tablet') {
      position: fixed;
      right: 0;
      top: 0;
      bottom: 0;
      width: 280px;
      border-radius: 0;
      transform: translateX(100%);
      z-index: 100;

      &.show {
        transform: translateX(0);
      }
    }

    @include respond-to('mobile') {
      width: 240px;
    }
  }

  .game-footer {
    padding: 1rem;
    background: var(--columbia-blue-2);

    @include respond-to('mobile') {
      padding: 0.5rem;
    }
  }
}

// 触摸设备特定样式
@include touch-device {
  .game-layout {
    user-select: none;
    -webkit-user-select: none;
    
    .game-header,
    .game-footer {
      -webkit-tap-highlight-color: transparent;
    }
  }
}
</style> 