<template>
  <div 
    class="hero-unit"
    :class="[
      hero.isAlly ? 'ally' : 'enemy',
      { 'active': isCurrentTurn }
    ]"
    :style="unitStyle"
    @click="$emit('click')"
  >
    <div class="hero-portrait">
      <img :src="hero.avatar" :alt="hero.name">
    </div>
    <div class="hero-info">
      <div class="hero-hp-bar">
        <div 
          class="hp-fill"
          :style="{ width: `${(hero.stats.hp / hero.stats.maxHp) * 100}%` }"
        ></div>
      </div>
      <div class="hero-mp-bar">
        <div 
          class="mp-fill"
          :style="{ width: `${(hero.stats.mp / hero.stats.maxMp) * 100}%` }"
        ></div>
      </div>
    </div>
    <div class="status-effects">
      <div 
        v-for="status in hero.status" 
        :key="status.id"
        class="status-icon"
        :title="status.name"
      >
        <img :src="status.icon" :alt="status.name">
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Hero } from '@/types/character'
import { useGameStore } from '@/stores/game'

const props = defineProps<{
  hero: Hero
}>()

const gameStore = useGameStore()

const isCurrentTurn = computed(() => 
  props.hero.id === gameStore.turnState.currentHeroId
)

const unitStyle = computed(() => ({
  '--unit-x': `${props.hero.position.x * 80}px`,
  '--unit-y': `${props.hero.position.y * 80}px`,
  '--unit-z': isCurrentTurn.value ? '1' : '0'
}))
</script>

<style lang="scss" scoped>
.hero-unit {
  position: absolute;
  left: var(--unit-x);
  top: var(--unit-y);
  width: 80px;
  height: 80px;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: all 0.3s ease;
  z-index: var(--unit-z);

  .hero-portrait {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    overflow: hidden;
    border: 2px solid white;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
    
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  .hero-info {
    width: 50px;
    margin-top: 4px;

    .hero-hp-bar,
    .hero-mp-bar {
      height: 4px;
      background: rgba(0, 0, 0, 0.3);
      border-radius: 2px;
      overflow: hidden;
      margin-bottom: 2px;
    }

    .hp-fill {
      height: 100%;
      background: #ff4757;
      transition: width 0.3s ease;
    }

    .mp-fill {
      height: 100%;
      background: #2e86de;
      transition: width 0.3s ease;
    }
  }

  .status-effects {
    position: absolute;
    top: -8px;
    right: -8px;
    display: flex;
    gap: 2px;

    .status-icon {
      width: 16px;
      height: 16px;
      border-radius: 50%;
      overflow: hidden;
      
      img {
        width: 100%;
        height: 100%;
      }
    }
  }

  &.ally {
    .hero-portrait {
      border-color: #70a1ff;
    }
  }

  &.enemy {
    .hero-portrait {
      border-color: #ff4757;
    }
  }

  &.active {
    transform: scale(1.1);
    
    .hero-portrait {
      box-shadow: 0 0 15px rgba(133, 199, 222, 0.8);
    }
  }
}
</style> 