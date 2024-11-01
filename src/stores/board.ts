import { defineStore } from 'pinia'
import type { BoardState, Position, Tile } from '@/types/board'
import type { MapData } from '@/types/map'
import { TileType, createTile, TILE_TYPE_CONFIG } from '@/types/board'
import { useHeroStore } from './hero'
import type { Hero } from '@/types/character'

export const useBoardStore = defineStore('board', {
  state: (): BoardState => ({
    width: 8,
    height: 8,
    tiles: [],
    highlightedTiles: [],
    selectableTiles: [],
    selectedTile: undefined,
    currentMap: null
  }),

  actions: {
    initializeBoard() {
      this.tiles = Array(this.height).fill(null).map((_, y) => 
        Array(this.width).fill(null).map((_, x) => 
          createTile(TileType.GROUND, { x, y })
        )
      )
    },

    loadMap(mapData: MapData) {
      this.width = mapData.width
      this.height = mapData.height
      this.currentMap = mapData
      
      // 根据地图数据初始化棋盘
      this.tiles = mapData.terrain.map((row, y) => 
        row.map((type, x) => 
          createTile(type, { x, y })
        )
      )

      // 清除之前的状态
      this.clearSelection()
    },

    selectTile(position: Position) {
      this.selectedTile = position
    },

    clearSelection() {
      this.selectedTile = undefined
      this.highlightedTiles = []
      this.selectableTiles = []
    },

    setTileType(position: Position, type: TileType) {
      if (this.isValidPosition(position)) {
        const tile = this.tiles[position.y][position.x]
        this.tiles[position.y][position.x] = createTile(type, position)
      }
    },

    highlightTiles(positions: Position[]) {
      this.highlightedTiles = positions
    },

    setSelectableTiles(positions: Position[]) {
      this.selectableTiles = positions
    },

    isValidPosition(position: Position): boolean {
      return position.x >= 0 && 
             position.x < this.width && 
             position.y >= 0 && 
             position.y < this.height
    },

    calculateMovableRange(position: Position, moveRange: number): Position[] {
      console.log('Calculating movable range:', { position, moveRange })
      const range: Position[] = []
      const visited = new Set<string>()
      const queue: {pos: Position, steps: number}[] = [{pos: position, steps: 0}]
      
      const posToString = (pos: Position) => `${pos.x},${pos.y}`
      
      while (queue.length > 0) {
        const current = queue.shift()!
        const posKey = posToString(current.pos)
        
        if (visited.has(posKey)) continue
        visited.add(posKey)
        
        if (current.steps <= moveRange) {
          if (current.steps > 0) {
            range.push(current.pos)
          }
          
          const directions = [
            {x: 0, y: 1},
            {x: 0, y: -1},
            {x: 1, y: 0},
            {x: -1, y: 0}
          ]
          
          for (const dir of directions) {
            const nextPos = {
              x: current.pos.x + dir.x,
              y: current.pos.y + dir.y
            }
            
            if (this.isValidMovePosition(nextPos)) {
              queue.push({
                pos: nextPos,
                steps: current.steps + 1
              })
            }
          }
        }
      }
      
      console.log('Calculated movable positions:', range)
      return range
    },

    isValidMovePosition(position: Position): boolean {
      if (!this.isValidPosition(position)) return false
      
      const tile = this.tiles[position.y][position.x]
      if (!TILE_TYPE_CONFIG[tile.type].isWalkable) return false
      
      // 检查是否有其他角色占据
      const heroStore = useHeroStore()
      return !Array.from(heroStore.heroes.values()).some(hero => 
        hero.position.x === position.x && hero.position.y === position.y
      )
    },

    $reset() {
      this.width = 8
      this.height = 8
      this.tiles = []
      this.highlightedTiles = []
      this.selectableTiles = []
      this.selectedTile = undefined
      this.currentMap = null
    }
  }
}) 