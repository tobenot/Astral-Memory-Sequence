<template>
  <div 
    class="game-board-container"
    @mousedown="startDrag"
    @mousemove="onDrag"
    @mouseup="stopDrag"
    @mouseleave="stopDrag"
    @wheel="handleWheel"
    @touchstart="startTouch"
    @touchmove="onTouch"
    @touchend="stopTouch"
  >
    <div 
      class="game-board" 
      :style="{
        ...boardStyle,
        transform: `translate(${viewPosition.x}px, ${viewPosition.y}px)`
      }"
    >
      <!-- 棋盘格子 -->
      <div class="board-grid">
        <div 
          v-for="row in board.tiles" 
          :key="row[0].position.y" 
          class="board-row"
        >
          <div
            v-for="tile in row"
            :key="`${tile.position.x}-${tile.position.y}`"
            class="board-tile"
            :class="[
              TILE_TYPE_CONFIG[tile.type].className,
              {
                'highlighted': isHighlighted(tile.position),
                'selectable': isSelectable(tile.position),
                'selected': isSelected(tile.position),
                'hover': isHovered(tile.position)
              }
            ]"
            @click="handleTileClick(tile)"
            @mouseenter="handleTileHover(tile)"
            @mousedown="handleTileMouseDown(tile)"
            @mouseup="handleTileMouseUp(tile)"
          >
            <div class="tile-content">
              <div v-if="tile.isOccupied" class="unit-indicator"></div>
              <div v-if="isSelected(tile.position)" class="selection-indicator"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- 出生点指示器 -->
      <div class="spawn-points">
        <div
          v-for="point in currentMap?.spawnPoints"
          :key="`${point.position.x}-${point.position.y}`"
          class="spawn-indicator"
          :class="[point.type, { occupied: point.isOccupied }]"
          :style="{
            left: `${point.position.x * 80}px`,
            top: `${point.position.y * 80}px`
          }"
        ></div>
      </div>

      <!-- 角色单位 -->
      <div class="units-layer">
        <HeroUnit
          v-for="hero in heroes"
          :key="hero.id"
          :hero="hero"
          @click="handleHeroClick(hero)"
          @tile-click="handleTileClick"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useBoardStore } from '@/stores/board'
import { useHeroStore } from '@/stores/hero'
import { useGameStore } from '@/stores/game'
import type { Position, Tile } from '@/types/board'
import { TILE_TYPE_CONFIG } from '@/types/board'
import type { Hero } from '@/types/character'
import { useMouseHandler } from '@/utils/mouse'
import HeroUnit from './HeroUnit.vue'
import TurnIndicator from './TurnIndicator.vue'

const board = useBoardStore()
const heroStore = useHeroStore()
const gameStore = useGameStore()
const currentMap = computed(() => board.currentMap)
const heroes = computed(() => Array.from(heroStore.heroes.values()))
const { mouseState, handleMouseDown, handleMouseMove, handleMouseUp } = useMouseHandler()

// 当前悬停的格子
const hoveredTile = ref<Position | null>(null)

// 初始化棋盘
board.initializeBoard()

const boardStyle = computed(() => ({
  '--board-width': `${board.width * 80}px`,
  '--board-height': `${board.height * 80}px`
}))

// 判断格子状态
const isHighlighted = (position: Position) => {
  return board.highlightedTiles.some(p => p.x === position.x && p.y === position.y)
}

const isSelectable = (position: Position) => {
  return board.selectableTiles.some(p => p.x === position.x && p.y === position.y)
}

const isSelected = (position: Position) => {
  return board.selectedTile?.x === position.x && board.selectedTile?.y === position.y
}

const isHovered = (position: Position) => {
  return hoveredTile.value?.x === position.x && hoveredTile.value?.y === position.y
}

// 事件处理
const handleTileClick = async (tile: Tile) => {
  const gameStore = useGameStore()
  const heroStore = useHeroStore()
  
  // 如果有选中的技能
  if (gameStore.selectedSkill) {
    console.log('当前选中技能:', gameStore.selectedSkill.name)
    
    // 检查目标位置是否在可选范围内
    if (isSelectable(tile.position)) {
      console.log('目标位置在可选范围内:', tile.position)
      
      // 获取目标
      const target = getSkillTarget(tile)
      console.log('获取到的技能目标:', target)
      
      if (target) {
        // 使用技能
        const result = await gameStore.useSkill(target)
        console.log('技能使用结果:', result)
        
        // 清除选择状态
        board.clearSelection()
        return
      }
    } else {
      console.log('目标位置不在可选范围内:', tile.position)
    }
    return
  } else {
    // 移动逻辑
    const selectedHero = heroStore.selectedHero
    if (selectedHero && isSelectable(tile.position)) {
      // 计算曼哈顿距离
      const distance = Math.abs(selectedHero.position.x - tile.position.x) + 
                      Math.abs(selectedHero.position.y - tile.position.y)
      
      // 检查是��有足够的移动点数
      if (selectedHero.actionPoints.move >= distance) {
        // 移动英雄
        await heroStore.moveHero(selectedHero.id, tile.position)
        // 消耗移动点数
        gameStore.useActionPoints('move', distance)
        
        // 如果还有移动点数，重新计算并显示移动范围
        if (selectedHero.actionPoints.move > 0) {
          const movablePositions = board.calculateMovableRange(
            tile.position, // 使用新位置
            selectedHero.actionPoints.move
          )
          board.setSelectableTiles(movablePositions)
        } else {
          // 只有当没有移动点数时才清除选择状态
          board.clearSelection()
          heroStore.selectHero(null)
        }
      }
    } else if (isSelected(tile.position)) {
      // 点击已选中的格子时取消选择
      board.clearSelection()
      heroStore.selectHero(null)
    }
  }
}

const handleTileHover = (tile: Tile) => {
  hoveredTile.value = tile.position
  handleMouseMove(tile.position)
}

const handleTileMouseDown = (tile: Tile) => {
  handleMouseDown(tile.position)
}

const handleTileMouseUp = (tile: Tile) => {
  handleMouseUp()
}

const handleMouseLeave = () => {
  hoveredTile.value = null
  handleMouseUp()
}

// 处理角色点击
const handleHeroClick = (hero: Hero) => {
  console.log('Hero clicked:', hero)
  if (hero.id === gameStore.turnState.currentHeroId && hero.isAlly) {
    console.log('Valid hero selected')
    heroStore.selectHero(hero.id)
    
    if (hero.actionPoints.move > 0) {
      console.log('Calculating movable range')
      const movablePositions = board.calculateMovableRange(
        hero.position, 
        hero.actionPoints.move
      )
      console.log('Movable positions:', movablePositions)
      board.setSelectableTiles(movablePositions)
    }
  }
}

// 修改计算距离的方法（曼哈顿距离）
const calculateDistance = (from: Position, to: Position): number => {
  return Math.abs(from.x - to.x) + Math.abs(from.y - to.y)
}

// 添加视图位置状态
const viewPosition = ref({ x: 0, y: 0 })
const isDragging = ref(false)
const lastPosition = ref({ x: 0, y: 0 })

// 拖动处理
const startDrag = (e: MouseEvent) => {
  if (e.button === 1 || e.button === 0) { // 中键或左键
    isDragging.value = true
    lastPosition.value = { x: e.clientX, y: e.clientY }
  }
}

const onDrag = (e: MouseEvent) => {
  if (isDragging.value) {
    const deltaX = e.clientX - lastPosition.value.x
    const deltaY = e.clientY - lastPosition.value.y
    viewPosition.value.x += deltaX
    viewPosition.value.y += deltaY
    lastPosition.value = { x: e.clientX, y: e.clientY }
  }
}

const stopDrag = () => {
  isDragging.value = false
}

// 滚轮缩放（可选）
const handleWheel = (e: WheelEvent) => {
  e.preventDefault()
  viewPosition.value.x -= e.deltaX
  viewPosition.value.y -= e.deltaY
}

// 触摸支持
const startTouch = (e: TouchEvent) => {
  if (e.touches.length === 1) {
    isDragging.value = true
    lastPosition.value = { 
      x: e.touches[0].clientX, 
      y: e.touches[0].clientY 
    }
  }
}

const onTouch = (e: TouchEvent) => {
  if (isDragging.value && e.touches.length === 1) {
    const deltaX = e.touches[0].clientX - lastPosition.value.x
    const deltaY = e.touches[0].clientY - lastPosition.value.y
    viewPosition.value.x += deltaX
    viewPosition.value.y += deltaY
    lastPosition.value = { 
      x: e.touches[0].clientX, 
      y: e.touches[0].clientY 
    }
  }
}

const stopTouch = () => {
  isDragging.value = false
}

// 修改获取技能目标的辅助方法
const getSkillTarget = (tile: Tile) => {
  const gameStore = useGameStore()
  const heroStore = useHeroStore()
  const skill = gameStore.selectedSkill
  
  if (!skill) return null

  console.log('技能类型:', skill.targetType)

  switch (skill.targetType) {
    case 'single':
      // 对于单体技能，返回目标位置的英雄
      const target = Array.from(heroStore.heroes.values()).find(
        hero => hero.position.x === tile.position.x && 
               hero.position.y === tile.position.y
      )
      console.log('找到的单体目标:', target)
      return target
    
    case 'area':
      // 对于范围技能，返回范围内的所有英雄
      return Array.from(heroStore.heroes.values()).filter(hero => {
        const distance = calculateDistance(tile.position, hero.position)
        return distance <= (skill.aoeRange || 1)
      })
    
    case 'position':
      // 对于位置类技能，直接返回位置
      return tile.position
      
    case 'self':
      // 对于自身技能，返回施法者
      return gameStore.currentHero
      
    default:
      return null
  }
}
</script>

<style lang="scss" scoped>
.game-board-container {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
  cursor: grab;
  
  &:active {
    cursor: grabbing;
  }
}

.game-board {
  position: absolute;
  transition: transform 0.1s ease;
  will-change: transform;
}

.game-board {
  width: var(--board-width);
  height: var(--board-height);
  display: grid;
  grid-template-rows: repeat(v-bind('board.height'), 1fr);
  background: var(--columbia-blue-2);
  border: 1px solid var(--columbia-blue-3);
  user-select: none;
  
  .board-grid {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: grid;
    grid-template-rows: repeat(v-bind('board.height'), 1fr);
  }

  .spawn-points {
    position: absolute;
    top: 0;
    left: 0;
    pointer-events: none;

    .spawn-indicator {
      position: absolute;
      width: 80px;
      height: 80px;
      
      &::before {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 24px;
        height: 24px;
        border-radius: 50%;
        opacity: 0.5;
      }

      &.ally::before {
        background: #70a1ff;
      }

      &.enemy::before {
        background: #ff4757;
      }

      &.neutral::before {
        background: #ffa502;
      }

      &.occupied::before {
        opacity: 0.2;
      }
    }
  }

  .units-layer {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;

    .hero-unit {
      pointer-events: auto;
      cursor: pointer;
    }
  }
}

.game-board {
  width: var(--board-width);
  height: var(--board-height);
  display: grid;
  grid-template-rows: repeat(v-bind('board.height'), 1fr);
  background: var(--columbia-blue-2);
  border: 1px solid var(--columbia-blue-3);
  user-select: none;
  
  .board-row {
    display: grid;
    grid-template-columns: repeat(v-bind('board.width'), 1fr);
  }

  .board-tile {
    width: 80px;
    height: 80px;
    border: 1px solid rgba(174, 209, 230, 0.3);
    position: relative;
    cursor: pointer;
    transition: all 0.2s ease;

    &.normal {
      background: var(--columbia-blue);
    }

    &.obstacle {
      background: var(--columbia-blue-3);
    }

    &.water {
      background: var(--powder-blue);
    }

    &.void {
      background: var(--sky-blue);
      pointer-events: none;
    }

    &.highlighted {
      background: rgba(160, 196, 226, 0.5);
    }

    &.selectable {
      background: rgba(133, 199, 222, 0.3);
      &:hover {
        background: rgba(133, 199, 222, 0.5);
      }
    }

    &.selected {
      background: var(--sky-blue);
    }

    &.hover:not(.selected):not(.selectable) {
      background: rgba(174, 209, 230, 0.2);
    }

    .tile-content {
      position: absolute;
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;

      .selection-indicator {
        width: 16px;
        height: 16px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.6);
        box-shadow: 0 0 8px rgba(133, 199, 222, 0.8);
      }

      .unit-indicator {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background: var(--powder-blue);
        border: 2px solid white;
      }
    }
  }
}

// 添加移动动画
.hero-unit {
  transition: all 0.3s ease;
}
</style> 