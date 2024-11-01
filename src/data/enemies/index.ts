import type { Hero } from '@/types/character'
import { HeroTag, DEFAULT_ACTION_POINTS } from '@/types/character'

// 敌人单位数据
export const enemies: Hero[] = [
  {
    id: 'shadow_assassin',
    name: '暗影刺客',
    title: '影之追猎者',
    description: '擅长潜行和突袭的敌方刺客。',
    avatar: '/enemies/shadow_assassin/avatar.png',
    portrait: '/enemies/shadow_assassin/portrait.png',
    tags: [HeroTag.ASSASSIN],
    level: 1,
    exp: 0,
    position: { x: 0, y: 0 },
    stats: {
      hp: 70,
      maxHp: 70,
      mp: 60,
      maxMp: 60,
      attack: 16,
      defense: 3,
      speed: 7
    },
    skills: [],
    status: [],
    isAlly: false,
    actionPoints: { ...DEFAULT_ACTION_POINTS },
    maxActionPoints: {
      move: 3,
      skill: 1,
      item: 1
    }
  },
  {
    id: 'dark_mage',
    name: '暗影法师',
    title: '暗之编织者',
    description: '操控黑暗魔法的敌方法师。',
    avatar: '/enemies/dark_mage/avatar.png',
    portrait: '/enemies/dark_mage/portrait.png',
    tags: [HeroTag.MAGE],
    level: 1,
    exp: 0,
    position: { x: 0, y: 0 },
    stats: {
      hp: 65,
      maxHp: 65,
      mp: 90,
      maxMp: 90,
      attack: 14,
      defense: 2,
      speed: 4
    },
    skills: [],
    status: [],
    isAlly: false,
    actionPoints: { ...DEFAULT_ACTION_POINTS },
    maxActionPoints: {
      move: 2,
      skill: 1,
      item: 1
    }
  },
  {
    id: 'corrupted_knight',
    name: '堕落骑士',
    title: '腐化守卫',
    description: '被黑暗力量腐化的重装骑士。',
    avatar: '/enemies/corrupted_knight/avatar.png',
    portrait: '/enemies/corrupted_knight/portrait.png',
    tags: [HeroTag.WARRIOR],
    level: 1,
    exp: 0,
    position: { x: 0, y: 0 },
    stats: {
      hp: 100,
      maxHp: 100,
      mp: 40,
      maxMp: 40,
      attack: 12,
      defense: 8,
      speed: 3
    },
    skills: [],
    status: [],
    isAlly: false,
    actionPoints: { ...DEFAULT_ACTION_POINTS },
    maxActionPoints: {
      move: 2,
      skill: 1,
      item: 1
    }
  }
] 