<template>
  <div 
    class="game-board" 
    :style="boardStyle"
    @mouseleave="handleMouseLeave"
  >
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
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useBoardStore } from '@/stores/board'
import type { Position, Tile } from '@/types/board'
import { useMouseHandler } from '@/utils/mouse'

const board = useBoardStore()
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
  if (isSelectable(tile.position)) {
    board.selectTile(tile.position)
    // 计算可移动范围
    calculateMovableRange(tile.position)
  } else if (isSelected(tile.position)) {
    board.clearSelection()
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

// 计算可移动范围（示例实现，后续可扩展）
const calculateMovableRange = (position: Position) => {
  const range: Position[] = []
  const moveRange = 2 // 临时设置移动范围为2格

  for (let dx = -moveRange; dx <= moveRange; dx++) {
    for (let dy = -moveRange; dy <= moveRange; dy++) {
      if (Math.abs(dx) + Math.abs(dy) <= moveRange) {
        const newPos = {
          x: position.x + dx,
          y: position.y + dy
        }
        if (board.isValidPosition(newPos)) {
          range.push(newPos)
        }
      }
    }
  }

  board.setSelectableTiles(range)
}
</script>

<style lang="scss" scoped>
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
</style> 