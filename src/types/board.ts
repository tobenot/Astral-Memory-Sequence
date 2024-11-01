import type { MapData } from '@/types/map'

// 定义位置类型
export interface Position {
  x: number
  y: number
}

export enum TileType {
  GROUND = 'ground',    // 普通地面
  WALL = 'wall',        // 墙壁
  WATER = 'water',      // 水域
  FOREST = 'forest',    // 森林
  MOUNTAIN = 'mountain' // 山地
}

export interface Tile {
  type: TileType
  position: Position
  isWalkable: boolean
  isOccupied: boolean
}

// 添加默认瓦片配置
export const DEFAULT_TILE_CONFIG: Omit<Tile, 'position'> = {
  type: TileType.GROUND,
  isWalkable: true,
  isOccupied: false
}

// 添加瓦片类型的行走属性配置
export const TILE_TYPE_CONFIG: Record<TileType, { isWalkable: boolean }> = {
  [TileType.GROUND]: { isWalkable: true },
  [TileType.WALL]: { isWalkable: false },
  [TileType.WATER]: { isWalkable: false },
  [TileType.FOREST]: { isWalkable: true },
  [TileType.MOUNTAIN]: { isWalkable: false }
}

export interface Board {
  width: number
  height: number
  tiles: Tile[][]
}

export interface BoardState {
  width: number
  height: number
  tiles: Tile[][]
  selectedTile?: Position
  highlightedTiles: Position[]
  selectableTiles: Position[]
  currentMap: MapData | null
}

// 添加创建瓦片的辅助函数
export function createTile(type: TileType, position: Position): Tile {
  return {
    type,
    position,
    isWalkable: TILE_TYPE_CONFIG[type].isWalkable,
    isOccupied: false
  }
} 