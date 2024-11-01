// 在文件顶部添加导入
import type { Position } from './board'

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
  stealth?: number
  damageReduction?: number
  damageReceived?: number
  deathPrevention?: boolean
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
  cooldown: number      // 总冷却回合数
  currentCooldown: number  // 当前剩余冷却回合数
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

// 修改 Character 为 Hero 接口并导出
export interface Hero {
  id: string
  name: string
  title: string
  description: string
  avatar: string
  portrait: string
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
  type: CharacterType
}

// 修改 StatusEffectStats 接口
export interface StatusEffectStats {
  hp?: number
  maxHp?: number
  mp?: number
  maxMp?: number
  attack?: number
  defense?: number
  speed?: number
  stealth?: number
  damageReduction?: number
  damageReceived?: number
  deathPrevention?: boolean
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
    stats: Partial<CharacterStats>
  }
}

// 默认行动点配置
export const DEFAULT_ACTION_POINTS: ActionPoints = {
  move: 2,
  skill: 1,
  item: 1
}

// 在文件末尾，导出 Position 类型
export type { Position }

// 添加一个新的类型来区分数值属性和布尔属性
export type NumericStats = Exclude<keyof CharacterStats, 'deathPrevention'>