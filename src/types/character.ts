import type { Position } from '@/types/board'

// 英雄标签，一个英雄可以有多个标签
export enum HeroTag {
  WARRIOR = 'warrior',     // 战士
  MAGE = 'mage',          // 法师
  ARCHER = 'archer',      // 射手
  SUPPORT = 'support',    // 辅助
  TANK = 'tank',          // 坦克
  ASSASSIN = 'assassin',  // 刺客
  HEALER = 'healer'       // 治疗
}

export interface HeroStats {
  hp: number
  maxHp: number
  mp: number
  maxMp: number
  attack: number
  defense: number
  speed: number
  moveRange: number
}

export interface Skill {
  id: string
  name: string
  description: string
  icon: string
  mpCost: number
  cooldown: number
  currentCooldown: number
  range: number
  type: 'active' | 'passive'
  targetType: 'single' | 'area' | 'self'
  effect: (caster: Hero, target: Position) => void
}

export interface ActionPoints {
  move: number
  skill: number
  item: number
}

export interface Hero {
  id: string
  name: string
  title: string          // 称号
  description: string    // 背景故事
  avatar: string        // 头像
  portrait: string      // 立绘
  tags: HeroTag[]       // 英雄标签
  level: number
  exp: number
  position: Position
  stats: HeroStats
  skills: Skill[]       // 英雄特有技能
  status: StatusEffect[]
  isAlly: boolean
  actionPoints: ActionPoints  // 添加行动点属性
  maxActionPoints: ActionPoints  // 添加最大行动点属性
}

export interface StatusEffect {
  id: string
  name: string
  icon: string
  description: string
  duration: number
  effect: {
    type: 'buff' | 'debuff'
    stats: Partial<HeroStats>
  }
}

// 默认行动点配置
export const DEFAULT_ACTION_POINTS: ActionPoints = {
  move: 1,
  skill: 1,
  item: 1
} 