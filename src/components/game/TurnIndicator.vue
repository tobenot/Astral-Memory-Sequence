<template>
  <div class="turn-indicator">
    <div class="current-turn">
      回合 {{ currentTurn }}
    </div>
    <div class="turn-order">
      <div 
        v-for="order in turnState.turnOrder" 
        :key="order.heroId"
        class="hero-order"
        :class="{
          'active': order.heroId === turnState.currentHeroId,
          'ally': isAlly(order.heroId)
        }"
      >
        <img 
          :src="getHeroAvatar(order.heroId)" 
          :alt="getHeroName(order.heroId)"
          :title="getHeroName(order.heroId)"
        >
      </div>
    </div>
    <div class="action-points">
      <div class="point move" :class="{ 'used': !canMove }">
        <span>移动</span>
      </div>
      <div class="point skill" :class="{ 'used': !canUseSkill }">
        <span>技能</span>
      </div>
      <div class="point item" :class="{ 'used': !canUseItem }">
        <span>道具</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useGameStore } from '@/stores/game'
import { useHeroStore } from '@/stores/hero'

const gameStore = useGameStore()
const heroStore = useHeroStore()

const currentTurn = computed(() => gameStore.currentTurn)
const turnState = computed(() => gameStore.turnState)
const canMove = computed(() => gameStore.canMove)
const canUseSkill = computed(() => gameStore.canUseSkill)
const canUseItem = computed(() => gameStore.canUseItem)

const getHeroAvatar = (heroId: string) => {
  return heroStore.heroes.get(heroId)?.avatar || ''
}

const getHeroName = (heroId: string) => {
  return heroStore.heroes.get(heroId)?.name || ''
}

const isAlly = (heroId: string) => {
  return heroStore.heroes.get(heroId)?.isAlly || false
}
</script>

<style lang="scss" scoped>
.turn-indicator {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.5rem;
  background: var(--columbia-blue-2);
  border-radius: 8px;

  .current-turn {
    font-size: 1.2rem;
    font-weight: bold;
    text-align: center;
  }

  .turn-order {
    display: flex;
    gap: 0.5rem;
    padding: 0.5rem;
    overflow-x: auto;

    .hero-order {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      overflow: hidden;
      opacity: 0.6;
      transition: all 0.3s ease;

      &.active {
        opacity: 1;
        transform: scale(1.1);
        box-shadow: 0 0 10px rgba(133, 199, 222, 0.8);
      }

      &.ally {
        border: 2px solid #70a1ff;
      }

      &:not(.ally) {
        border: 2px solid #ff4757;
      }

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }
  }

  .action-points {
    display: flex;
    justify-content: center;
    gap: 1rem;

    .point {
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      background: var(--columbia-blue-3);
      transition: all 0.3s ease;

      &.used {
        opacity: 0.5;
        background: var(--columbia-blue);
      }
    }
  }
}
</style> 