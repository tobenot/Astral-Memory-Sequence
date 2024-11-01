import type { Hero, Skill } from '@/types/character'
import { HeroTag, DEFAULT_ACTION_POINTS } from '@/types/character'

// 技能示例
const frostNova: Skill = {
  id: 'frost_nova',
  name: '霜华绽放',
  description: '释放寒冰能量，对周围敌人造成伤害并减速',
  icon: '/skills/frost_nova.png',
  mpCost: 35,
  cooldown: 3,
  currentCooldown: 0,
  range: 2,
  type: 'active',
  targetType: 'area',
  effect: (caster, target) => {
    // 技能效果将在战斗系统中实现
  }
}

const windSlash: Skill = {
  id: 'wind_slash',
  name: '风之斩击',
  description: '快速突进并对目标造成伤害',
  icon: '/skills/wind_slash.png',
  mpCost: 25,
  cooldown: 2,
  currentCooldown: 0,
  range: 3,
  type: 'active',
  targetType: 'single',
  effect: (caster, target) => {
    // 技能效果将在战斗系统中实现
  }
}

// 英雄数据
export const heroes: Hero[] = [
  {
    id: 'aurora',
    name: '极光',
    title: '冰霜编织者',
    description: '来自永冻之地的神秘法师，掌握着强大的冰霜魔法。',
    avatar: '/heroes/aurora/avatar.png',
    portrait: '/heroes/aurora/portrait.png',
    tags: [HeroTag.MAGE, HeroTag.SUPPORT],
    level: 1,
    exp: 0,
    position: { x: 0, y: 0 },
    stats: {
      hp: 85,
      maxHp: 85,
      mp: 100,
      maxMp: 100,
      attack: 12,
      defense: 4,
      speed: 4,
      moveRange: 2
    },
    skills: [frostNova],
    status: [],
    isAlly: true,
    actionPoints: { ...DEFAULT_ACTION_POINTS },
    maxActionPoints: {
      move: 2,
      skill: 1,
      item: 1
    }
  },
  {
    id: 'blade_master',
    name: '剑魂',
    title: '追风剑豪',
    description: '流浪的剑客，一生追求剑道的极致。',
    avatar: '/heroes/blade_master/avatar.png',
    portrait: '/heroes/blade_master/portrait.png',
    tags: [HeroTag.WARRIOR, HeroTag.ASSASSIN],
    level: 1,
    exp: 0,
    position: { x: 0, y: 0 },
    stats: {
      hp: 95,
      maxHp: 95,
      mp: 60,
      maxMp: 60,
      attack: 15,
      defense: 6,
      speed: 6,
      moveRange: 3
    },
    skills: [windSlash],
    status: [],
    isAlly: true,
    actionPoints: { ...DEFAULT_ACTION_POINTS },
    maxActionPoints: {
      move: 3,
      skill: 1,
      item: 1
    }
  },
  {
    id: 'luna',
    name: '月影',
    title: '暗夜守护者',
    description: '神秘的暗夜精灵，擅长远程攻击和潜行。',
    avatar: '/heroes/luna/avatar.png',
    portrait: '/heroes/luna/portrait.png',
    tags: [HeroTag.ARCHER, HeroTag.ASSASSIN],
    level: 1,
    exp: 0,
    position: { x: 0, y: 0 },
    stats: {
      hp: 75,
      maxHp: 75,
      mp: 80,
      maxMp: 80,
      attack: 14,
      defense: 3,
      speed: 5,
      moveRange: 3
    },
    skills: [],
    status: [],
    isAlly: true,
    actionPoints: { ...DEFAULT_ACTION_POINTS },
    maxActionPoints: {
      move: 3,
      skill: 1,
      item: 1
    }
  },
  {
    id: 'gaia',
    name: '盖亚',
    title: '大地守护者',
    description: '自然之力的化身，守护着森林与生命。',
    avatar: '/heroes/gaia/avatar.png',
    portrait: '/heroes/gaia/portrait.png',
    tags: [HeroTag.SUPPORT, HeroTag.HEALER],
    level: 1,
    exp: 0,
    position: { x: 0, y: 0 },
    stats: {
      hp: 90,
      maxHp: 90,
      mp: 120,
      maxMp: 120,
      attack: 8,
      defense: 5,
      speed: 4,
      moveRange: 2
    },
    skills: [],
    status: [],
    isAlly: true,
    actionPoints: { ...DEFAULT_ACTION_POINTS },
    maxActionPoints: {
      move: 3,
      skill: 1,
      item: 1
    }
  }
] 