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
export type SkillTarget = Hero | Hero[] | Position

// 修改技能接口
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
  targetType: 'single' | 'area' | 'self' | 'position'
  effect: (caster: Hero, target: SkillTarget) => void | Promise<void>
  aoeRange?: number
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
  stats: CharacterStats
  skills: Skill[]       // 英雄特有技能
  status: StatusEffect[]
  isAlly: boolean
  actionPoints: ActionPoints  // 添加行动点属性
  maxActionPoints: ActionPoints  // 添加最大行动点属性
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
    stats: StatusEffectStats
  }
}

// 默认行动点配置
export const DEFAULT_ACTION_POINTS: ActionPoints = {
  move: 1,
  skill: 1,
  item: 1
} 