import type { Hero } from './character'

export enum TurnPhase {
  PREPARE = 'prepare',  // 回合准备阶段
  ACTION = 'action',    // 行动阶段
  END = 'end'          // 结束阶段
}

export interface TurnOrder {
  heroId: string
  initiative: number  // 基于速度计算的行动顺序值
}

export interface TurnState {
  currentHeroId: string | null
  remainingActions: number  // 当前角色剩余行动点
  turnOrder: TurnOrder[]    // 回合顺序
  phase: TurnPhase         // 回合阶段
  isProcessing: boolean    // 是否正在处理回合切换
}

export interface ActionPoint {
  move: number    // 移动点数
  skill: number   // 技能点数
  item: number    // 道具点数
}

export const DEFAULT_ACTION_POINTS: ActionPoint = {
  move: 1,
  skill: 1,
  item: 1
} 