import { defineStore } from 'pinia'
import type { BoardState, Position, Tile } from '@/types/board'
import type { MapData } from '@/types/map'
import { TileType } from '@/types/board'

export const useBoardStore = defineStore('board', {
  state: (): BoardState => ({
    width: 8,
    height: 8,
    tiles: [],
    highlightedTiles: [],
    selectableTiles: [],
    currentMap: null
  }),

  actions: {
    initializeBoard() {
      this.tiles = Array(this.height).fill(null).map((_, y) => 
        Array(this.width).fill(null).map((_, x) => ({
          position: { x, y },
          type: TileType.NORMAL
        }))
      )
    },

    loadMap(mapData: MapData) {
      this.width = mapData.width
      this.height = mapData.height
      this.currentMap = mapData
      
      // 根据地图数据初始化棋盘
      this.tiles = mapData.terrain.map((row, y) => 
        row.map((type, x) => ({
          position: { x, y },
          type: type
        }))
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
        this.tiles[position.y][position.x].type = type
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
    }
  }
}) 