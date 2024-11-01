import type { MapData } from '@/types/map'

// 定义位置类型
export interface Position {
  x: number
  y: number
}

export enum TileType {
  GROUND = 'ground',
  WALL = 'wall',
  WATER = 'water',
  VOID = 'void'
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
export const TILE_TYPE_CONFIG = {
  [TileType.GROUND]: {
    isWalkable: true,
    className: 'normal'
  },
  [TileType.WALL]: {
    isWalkable: false,
    className: 'obstacle'
  },
  [TileType.WATER]: {
    isWalkable: false,
    className: 'water'
  },
  [TileType.VOID]: {
    isWalkable: false,
    className: 'void'
  }
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