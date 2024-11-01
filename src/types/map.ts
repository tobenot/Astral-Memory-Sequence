import { TileType } from './board'
import type { Position } from './board'

export interface MapConfig {
  id: string
  name: string
  width: number
  height: number
  terrain: TileType[][]
  startPositions: {
    allies: Position[]
    enemies: Position[]
  }
  description?: string
}

export interface MapData extends MapConfig {
  difficulty: number
  unlockCondition?: string
  rewards?: {
    exp: number
    items?: string[]
  }
} 