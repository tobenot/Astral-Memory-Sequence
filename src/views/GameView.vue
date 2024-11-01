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
    </template>
  </GameLayout>
</template>

<script setup lang="ts">
import { onMounted, computed } from 'vue'
import GameLayout from '@/components/layout/GameLayout.vue'
import GameBoard from '@/components/game/GameBoard.vue'
import { useBoardStore } from '@/stores/board'
import { tutorialMap } from '@/data/maps'

const boardStore = useBoardStore()
const currentMap = computed(() => boardStore.currentMap)

onMounted(() => {
  // 加载教程地图
  boardStore.loadMap(tutorialMap)
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
  h3 {
    color: var(--powder-blue);
    margin-bottom: 0.5rem;
  }
  
  p {
    font-size: 0.875rem;
    color: rgba(0, 0, 0, 0.7);
  }
}
</style> 