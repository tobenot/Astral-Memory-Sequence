import { TileType } from './board'
import type { Position } from './board'

export enum SpawnPointType {
  ALLY = 'ally',      // 友方出生点
  ENEMY = 'enemy',    // 敌方出生点
  NEUTRAL = 'neutral' // 中立出生点(可选用)
}

export interface SpawnPoint {
  position: Position
  type: SpawnPointType
  isOccupied: boolean
}

export interface MapConfig {
  id: string
  name: string
  width: number
  height: number
  terrain: TileType[][]
  spawnPoints: SpawnPoint[]  // 改用更灵活的出生点系统
  description?: string
  maxTeamSize: number       // 每队最大人数
}

export interface MapData extends MapConfig {
  difficulty: number
  unlockCondition?: string
  rewards?: {
    exp: number
    items?: string[]
  }
  enemies: EnemyConfig[] // 添加敌人配置
  waves?: WaveConfig[] // 添加波次配置
}

export interface EnemyConfig {
  id: string
  level: number
  position: Position
}

export interface WaveConfig {
  turn: number
  enemies: EnemyConfig[]
} 