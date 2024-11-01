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

export enum CharacterType {
  WARRIOR = 'warrior',
  MAGE = 'mage',
  ARCHER = 'archer',
  SUPPORT = 'support'
}

export interface CharacterStats {
  hp: number
  maxHp: number
  mp: number
  maxMp: number
  attack: number
  defense: number
  speed: number
}

// 添加技能目标类型
export type SkillTarget = Character | Character[] | Position

// 修改技能接口
export interface Skill {
  id: string
  name: string
  description: string
  icon: string
  mpCost: number
  cooldown: number      // 总冷却回合数
  currentCooldown: number  // 当前剩余冷却回合数
  range: number
  type: 'active' | 'passive'
  targetType: 'single' | 'area' | 'self' | 'position'
  effect: (caster: Character, target: SkillTarget) => void | Promise<void>
  aoeRange?: number
}

export interface ActionPoints {
  move: number
  skill: number
  item: number
}

// 修改 Character 为 Hero 接口并导出
export interface Hero {
  id: string
  name: string
  title?: string
  description?: string
  avatar: string
  portrait?: string
  tags: HeroTag[]
  level: number
  exp: number
  position: Position
  stats: CharacterStats
  skills: Skill[]
  status: StatusEffect[]
  isAlly: boolean
  actionPoints: ActionPoints
  maxActionPoints: ActionPoints
}

// 添加状态效果的具体类型
export interface StatusEffectStats {
  hp?: number
  maxHp?: number
  mp?: number
  maxMp?: number
  attack?: number
  defense?: number
  speed?: number
}

// 完善StatusEffect接口
export interface StatusEffect {
  id: string
  name: string
  description: string
  icon: string
  duration: number
  effect: {
    type: 'buff' | 'debuff'
    stats: Partial<Record<keyof CharacterStats, number>>
  }
}

// 默认行动点配置
export const DEFAULT_ACTION_POINTS: ActionPoints = {
  move: 2,
  skill: 1,
  item: 1
}

// 添加并导出 Position 类型
export interface Position {
  x: number
  y: number
}