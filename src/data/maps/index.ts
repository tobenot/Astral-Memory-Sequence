import type { MapData } from '@/types/map'
import { TileType } from '@/types/board'

export const tutorialMap: MapData = {
  id: 'tutorial',
  name: '初始之地',
  width: 8,
  height: 8,
  difficulty: 1,
  description: '一片适合初学者的平原地形。',
  terrain: [
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 2, 0, 0, 2, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 2, 0, 0, 2, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
  ].map(row => row.map(cell => {
    switch(cell) {
      case 0: return TileType.NORMAL
      case 1: return TileType.VOID
      case 2: return TileType.OBSTACLE
      default: return TileType.NORMAL
    }
  })),
  startPositions: {
    allies: [
      { x: 1, y: 1 },
      { x: 2, y: 1 },
      { x: 1, y: 2 },
      { x: 2, y: 2 }
    ],
    enemies: [
      { x: 5, y: 5 },
      { x: 6, y: 5 },
      { x: 5, y: 6 },
      { x: 6, y: 6 }
    ]
  },
  rewards: {
    exp: 100
  }
}

export const maps: MapData[] = [
  tutorialMap,
  // 后续可以添加更多地图
] 