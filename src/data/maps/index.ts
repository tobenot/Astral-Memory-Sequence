import type { MapData } from '@/types/map'
import { TileType } from '@/types/board'
import { SpawnPointType } from '@/types/map'

export const tutorialMap: MapData = {
  id: 'tutorial',
  name: '初始之地',
  width: 12,
  height: 12,
  difficulty: 1,
  description: '一片适合初学者的平原地形。',
  maxTeamSize: 4,
  terrain: [
    [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
    [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
    [2, 0, 0, 2, 0, 0, 0, 0, 2, 0, 0, 2],
    [2, 0, 2, 0, 0, 0, 0, 0, 0, 2, 0, 2],
    [2, 0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 2],
    [2, 0, 0, 0, 2, 2, 2, 2, 0, 0, 0, 2],
    [2, 0, 0, 0, 2, 2, 2, 2, 0, 0, 0, 2],
    [2, 0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 2],
    [2, 0, 2, 0, 0, 0, 0, 0, 0, 2, 0, 2],
    [2, 0, 0, 2, 0, 0, 0, 0, 2, 0, 0, 2],
    [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
    [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
  ].map(row => row.map(cell => {
    switch(cell) {
      case 0: return TileType.NORMAL
      case 1: return TileType.VOID
      case 2: return TileType.OBSTACLE
      default: return TileType.NORMAL
    }
  })),
  spawnPoints: [
    // 友方出生点
    { position: { x: 1, y: 1 }, type: SpawnPointType.ALLY, isOccupied: false },
    { position: { x: 2, y: 1 }, type: SpawnPointType.ALLY, isOccupied: false },
    { position: { x: 1, y: 2 }, type: SpawnPointType.ALLY, isOccupied: false },
    { position: { x: 2, y: 2 }, type: SpawnPointType.ALLY, isOccupied: false },
    // 敌方出生点
    { position: { x: 9, y: 9 }, type: SpawnPointType.ENEMY, isOccupied: false },
    { position: { x: 10, y: 9 }, type: SpawnPointType.ENEMY, isOccupied: false },
    { position: { x: 9, y: 10 }, type: SpawnPointType.ENEMY, isOccupied: false },
    { position: { x: 10, y: 10 }, type: SpawnPointType.ENEMY, isOccupied: false },
  ],
  rewards: {
    exp: 150
  },
  enemies: [
    {
      id: 'shadow_assassin',
      level: 1,
      position: { x: 9, y: 9 }
    },
    {
      id: 'dark_mage', 
      level: 1,
      position: { x: 10, y: 9 }
    },
    {
      id: 'corrupted_knight',
      level: 1,
      position: { x: 9, y: 10 }
    },
    {
      id: 'death_prophet',
      level: 1,
      position: { x: 10, y: 10 }
    }
  ],
  // 移除波次设置,所有敌人一开始就出现
  waves: []
}

export const maps: MapData[] = [
  tutorialMap,
  // 后续可以添加更多地图
] 