<template>
  <div class="skill-bar">
    <div class="skill-list">
      <div 
        v-for="skill in currentHeroSkills" 
        :key="skill.id"
        class="skill-item"
        :class="{
          'disabled': !canUseSkill(skill),
          'selected': selectedSkill?.id === skill.id
        }"
        @click="handleSkillClick(skill)"
      >
        <div class="skill-icon">
          <img :src="skill.icon" :alt="skill.name">
          <div 
            v-if="skill.currentCooldown > 0" 
            class="cooldown-overlay"
          >
            {{ skill.currentCooldown }}
          </div>
        </div>
        <div class="skill-info">
          <div class="skill-name">{{ skill.name }}</div>
          <div class="skill-cost">MP: {{ skill.mpCost }}</div>
        </div>
        <Tooltip :content="skill.description" position="top">
          <div class="info-icon">?</div>
        </Tooltip>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Skill } from '@/types/character'
import { useGameStore } from '@/stores/game'
import { useBoardStore } from '@/stores/board'
import Tooltip from '@/components/ui/Tooltip.vue'
import type { Position } from '@/types/board'

const gameStore = useGameStore()
const boardStore = useBoardStore()

const currentHeroSkills = computed(() => 
  gameStore.currentHero?.skills || []
)

const selectedSkill = computed(() => 
  gameStore.selectedSkill
)

const canUseSkill = (skill: Skill) => {
  const hero = gameStore.currentHero
  if (!hero) return false

  return skill.currentCooldown === 0 && 
         hero.stats.mp >= skill.mpCost &&
         hero.actionPoints.skill > 0
}

const handleSkillClick = (skill: Skill) => {
  if (!canUseSkill(skill)) return

  // 如果已经选中了这个技能，取消选择
  if (selectedSkill.value?.id === skill.id) {
    gameStore.selectSkill(null)
    boardStore.clearSelection()
    return
  }

  // 选中技能并显示技能范围
  gameStore.selectSkill(skill)
  
  const hero = gameStore.currentHero!
  const skillRange = calculateSkillRange(hero.position, skill)
  boardStore.setSelectableTiles(skillRange)
}

const calculateSkillRange = (position: Position, skill: Skill) => {
  const positions: Position[] = []
  const range = skill.range

  // 根据技能类型计算不同的范围
  switch (skill.targetType) {
    case 'single':
      // 计算单体技能范围
      for (let x = -range; x <= range; x++) {
        for (let y = -range; y <= range; y++) {
          if (Math.abs(x) + Math.abs(y) <= range) {
            const pos = {
              x: position.x + x,
              y: position.y + y
            }
            if (boardStore.isValidPosition(pos)) {
              positions.push(pos)
            }
          }
        }
      }
      break
      
    case 'area':
      // 计算范围技能的影响区域
      for (let x = -range; x <= range; x++) {
        for (let y = -range; y <= range; y++) {
          if (Math.abs(x) + Math.abs(y) <= range) {
            const pos = {
              x: position.x + x,
              y: position.y + y
            }
            if (boardStore.isValidPosition(pos)) {
              positions.push(pos)
            }
          }
        }
      }
      break
      
    case 'self':
      // 自身技能只需要当前位置
      positions.push(position)
      break
  }

  return positions
}
</script>

<style lang="scss" scoped>
.skill-bar {
  padding: 1rem;
  background: var(--columbia-blue-2);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  .skill-list {
    display: flex;
    gap: 1rem;
  }

  .skill-item {
    position: relative;
    display: flex;
    align-items: center;
    padding: 0.5rem;
    background: var(--columbia-blue-3);
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover:not(.disabled) {
      background: var(--powder-blue);
    }

    &.disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    &.selected {
      background: var(--sky-blue);
      box-shadow: 0 0 10px rgba(133, 199, 222, 0.8);
    }

    .skill-icon {
      position: relative;
      width: 40px;
      height: 40px;
      border-radius: 4px;
      overflow: hidden;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .cooldown-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.6);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 1.2rem;
        font-weight: bold;
      }
    }

    .skill-info {
      margin-left: 0.5rem;
      
      .skill-name {
        font-weight: bold;
      }

      .skill-cost {
        font-size: 0.8rem;
        color: #2e86de;
      }
    }

    .info-icon {
      margin-left: 0.5rem;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: var(--columbia-blue);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.8rem;
      cursor: help;
    }
  }
}
</style> 