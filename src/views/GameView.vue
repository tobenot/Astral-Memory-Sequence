<template>
  <GameLayout>
    <template #board>
      <div class="board-container">
        <GameBoard />
      </div>
    </template>
    <template #character-info>
      <div class="map-info">
        <h3>{{ currentMap?.name }}</h3>
        <p>{{ currentMap?.description }}</p>
      </div>
      <div v-if="currentHero" class="hero-info">
        <h3>{{ currentHero.name }}</h3>
        <p>{{ currentHero.title }}</p>
        <div class="stats">
          <div>HP: {{ currentHero.stats.hp }}/{{ currentHero.stats.maxHp }}</div>
          <div>MP: {{ currentHero.stats.mp }}/{{ currentHero.stats.maxMp }}</div>
        </div>
      </div>
    </template>
  </GameLayout>
</template>

<script setup lang="ts">
import { onMounted, computed } from 'vue'
import GameLayout from '@/components/layout/GameLayout.vue'
import GameBoard from '@/components/game/GameBoard.vue'
import { useBoardStore } from '@/stores/board'
import { useGameStore } from '@/stores/game'
import { tutorialMap } from '@/data/maps'

const boardStore = useBoardStore()
const gameStore = useGameStore()
const currentMap = computed(() => boardStore.currentMap)
const currentHero = computed(() => gameStore.currentHero)

onMounted(() => {
  // 加载教程地图
  boardStore.loadMap(tutorialMap)
  // 开始游戏，触发角色入场
  gameStore.startGame()
})
</script>

<style lang="scss" scoped>
.board-container {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
}

.map-info {
  margin-bottom: 2rem;
  
  h3 {
    color: var(--powder-blue);
    margin-bottom: 0.5rem;
  }
  
  p {
    font-size: 0.875rem;
    color: rgba(0, 0, 0, 0.7);
  }
}

.hero-info {
  padding: 1rem;
  background: var(--columbia-blue-2);
  border-radius: 8px;
  
  h3 {
    color: var(--powder-blue);
    margin-bottom: 0.25rem;
  }
  
  p {
    font-size: 0.875rem;
    color: rgba(0, 0, 0, 0.7);
    margin-bottom: 1rem;
  }
  
  .stats {
    display: grid;
    gap: 0.5rem;
    
    div {
      padding: 0.5rem;
      background: var(--columbia-blue);
      border-radius: 4px;
      font-size: 0.875rem;
    }
  }
}
</style> 