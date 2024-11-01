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
              tile.type,
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
              <div v-if="tile.unit" class="unit-indicator"></div>
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
        />
      </div>
    </div>
    
    <!-- 修改回合控制按钮区域 -->
    <div class="turn-controls">
      <div class="turn-info">
        <TurnIndicator />
      </div>
      <div class="turn-buttons">
        <button 
          class="turn-btn skip-turn-btn"
          @click="handleSkipTurn"
          :disabled="!isCurrentHeroAlly"
        >
          <span>跳过行动</span>
        </button>
        <button 
          class="turn-btn end-turn-btn"
          @click="handleEndTurn"
          :disabled="!isCurrentHeroAlly || !gameStore.hasRemainingActions"
        >
          <span>结束回合</span>
          <span class="action-points" v-if="gameStore.hasRemainingActions">
            (剩余行动点)
          </span>
        </button>
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
import { TileType } from '@/types/board'
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
const handleTileClick = (tile: Tile) => {
  const selectedHero = heroStore.selectedHero
  
  if (selectedHero && isSelectable(tile.position)) {
    // 检查是否有移动点数
    if (selectedHero.actionPoints.move > 0) {
      // 移动英雄
      heroStore.moveHero(selectedHero.id, tile.position)
      // 消耗移动点数
      selectedHero.actionPoints.move--
      // 清除选择状态
      board.clearSelection()
      heroStore.selectHero(null)
      
      // 如果没有任何行动点了，自动结束回合
      const hasRemainingActions = Object.values(selectedHero.actionPoints).some(points => points > 0)
      if (!hasRemainingActions) {
        setTimeout(() => {
          gameStore.endHeroTurn()
        }, 500)
      }
    }
  } else if (isSelected(tile.position)) {
    board.clearSelection()
    heroStore.selectHero(null)
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
  // 只能选择当前行动的角色，并且必须是友方角色
  if (hero.id === gameStore.turnState.currentHeroId && hero.isAlly) {
    heroStore.selectHero(hero.id)
    // 只有在有移动点数的情况下才显示移动范围
    if (hero.actionPoints.move > 0) {
      calculateMovableRange(hero.position, hero.stats.moveRange)
    }
  }
}

// 更新移动范围计算函数
const calculateMovableRange = (position: Position, moveRange: number) => {
  const range: Position[] = []
  
  for (let dx = -moveRange; dx <= moveRange; dx++) {
    for (let dy = -moveRange; dy <= moveRange; dy++) {
      if (Math.abs(dx) + Math.abs(dy) <= moveRange) {
        const newPos = {
          x: position.x + dx,
          y: position.y + dy
        }
        if (isValidMovePosition(newPos)) {
          range.push(newPos)
        }
      }
    }
  }

  board.setSelectableTiles(range)
}

// 检查位置是否可移动
const isValidMovePosition = (position: Position): boolean => {
  if (!board.isValidPosition(position)) return false
  
  const tile = board.tiles[position.y][position.x]
  if (tile.type !== TileType.NORMAL) return false
  
  // 检查是否有其他角色占据
  return !heroes.value.some(hero => 
    hero.position.x === position.x && hero.position.y === position.y
  )
}

// 添加回合结束按钮的处理函数
const handleEndTurn = () => {
  // 清理当前角色的状态
  board.clearSelection()
  heroStore.selectHero(null)
  
  // 结束当前回合，切换到下一个角色
  gameStore.endHeroTurn()
  
  // 如果下一个角色是AI控制的敌人，这里后续可以触发AI行动
  const nextHero = gameStore.currentHero
  if (nextHero && !nextHero.isAlly) {
    // TODO: 处理AI回合
    console.log('AI回合:', nextHero.name)
    // 暂时自动结束AI回合
    setTimeout(() => {
      gameStore.endHeroTurn()
    }, 1000)
  }
}

// 添加计算属性判断当前行动角色是否为友方
const isCurrentHeroAlly = computed(() => {
  const currentHero = gameStore.currentHero
  return currentHero?.isAlly ?? false
})

// 添加跳过回合的处理函数
const handleSkipTurn = () => {
  // 清理当前状态
  board.clearSelection()
  heroStore.selectHero(null)
  // 直接结束当前回合
  gameStore.endHeroTurn()
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

.turn-controls {
  position: fixed;
  bottom: 1rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 100;
  margin-top: 1rem;
  padding: 1rem;
  background: var(--columbia-blue-2);
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  .turn-buttons {
    display: flex;
    gap: 1rem;

    .turn-btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 6px;
      font-size: 1rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      flex-direction: column;
      align-items: center;
      line-height: 1.2;

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .action-points {
        font-size: 0.75rem;
        opacity: 0.8;
      }
    }

    .skip-turn-btn {
      background: var(--columbia-blue-3);
      color: #2c3e50;
      
      &:hover:not(:disabled) {
        background: var(--powder-blue);
        transform: translateY(-2px);
      }
    }

    .end-turn-btn {
      background: var(--powder-blue);
      color: white;
      
      &:hover:not(:disabled) {
        background: var(--sky-blue);
        transform: translateY(-2px);
      }

      &:disabled {
        background: var(--columbia-blue-3);
      }
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

    &.void {
      background: var(--powder-blue);
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