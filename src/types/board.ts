export interface Position {
  x: number
  y: number
}

export interface Tile {
  position: Position
  type: TileType
  unit?: string // 单位ID
  highlight?: boolean
  selectable?: boolean
}

export enum TileType {
  NORMAL = 'normal',
  OBSTACLE = 'obstacle',
  VOID = 'void'
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