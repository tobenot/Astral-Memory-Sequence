import type { Hero, Skill, SkillTarget } from '@/types/character'
import { HeroTag, DEFAULT_ACTION_POINTS } from '@/types/character'
import { useHeroStore } from '@/stores/hero'

// 基础技能
const basicAttack: Skill = {
  id: 'basic_attack',
  name: '基础攻击',
  description: '近距离攻击',
  icon: '/skills/basic_attack.png',
  mpCost: 0,
  cooldown: 0,
  currentCooldown: 0,
  range: 1,
  type: 'active',
  targetType: 'single',
  effect: (caster: Hero, target: SkillTarget) => {
    if (!('stats' in target)) return
    const damage = Math.max(1, caster.stats.attack - target.stats.defense)
    const heroStore = useHeroStore()
    heroStore.applyDamage(target.id, damage)
  }
}

// 暗影刺客技能
const shadowStrike: Skill = {
  id: 'shadow_strike',
  name: '暗影突袭',
  description: '快速突进并造成高额伤害',
  icon: '/skills/shadow_strike.png',
  mpCost: 30,
  cooldown: 2,
  currentCooldown: 0,
  range: 3,
  type: 'active',
  targetType: 'single',
  effect: (caster: Hero, target: SkillTarget) => {
    if (!('stats' in target)) return
    const damage = Math.max(1, caster.stats.attack * 1.5 - target.stats.defense)
    const heroStore = useHeroStore()
    heroStore.applyDamage(target.id, damage)
  }
}

// 暗影法师技能
const darkBolt: Skill = {
  id: 'dark_bolt',
  name: '暗影法球',
  description: '发射暗影能量球造成范围伤害',
  icon: '/skills/dark_bolt.png',
  mpCost: 35,
  cooldown: 2,
  currentCooldown: 0,
  range: 3,
  type: 'active',
  targetType: 'area',
  aoeRange: 1,
  effect: (caster: Hero, targets: SkillTarget) => {
    if (!Array.isArray(targets)) return
    const heroStore = useHeroStore()
    targets.forEach(target => {
      const damage = Math.max(1, caster.stats.attack * 0.8 - target.stats.defense)
      heroStore.applyDamage(target.id, damage)
    })
  }
}

// 堕落骑士技能
const darkCharge: Skill = {
  id: 'dark_charge',
  name: '暗影冲锋',
  description: '向目标冲锋并造成伤害',
  icon: '/skills/dark_charge.png',
  mpCost: 25,
  cooldown: 3,
  currentCooldown: 0,
  range: 2,
  type: 'active',
  targetType: 'single',
  effect: (caster: Hero, target: SkillTarget) => {
    if (!('stats' in target)) return
    const damage = Math.max(1, caster.stats.attack * 1.2 - target.stats.defense)
    const heroStore = useHeroStore()
    heroStore.applyDamage(target.id, damage)
  }
}

// 死亡先知技能
const deathCurse: Skill = {
  id: 'death_curse',
  name: '死亡诅咒',
  description: '诅咒目标，降低其攻击和防御',
  icon: '/skills/death_curse.png',
  mpCost: 40,
  cooldown: 3,
  currentCooldown: 0,
  range: 3,
  type: 'active',
  targetType: 'single',
  effect: (caster: Hero, target: SkillTarget) => {
    if (!('stats' in target)) return
    target.status.push({
      id: `curse_${Date.now()}`,
      name: '死亡诅咒',
      description: '攻击和防御降低25%',
      icon: '/status/curse.png',
      duration: 2,
      effect: {
        type: 'debuff',
        stats: {
          attack: 0.25,
          defense: 0.25
        }
      }
    })
  }
}

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
      hp: 80,
      maxHp: 80,
      mp: 40,
      maxMp: 40,
      attack: 16,
      defense: 3,
      speed: 7
    },
    skills: [basicAttack, shadowStrike],
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
      mp: 120,
      maxMp: 120,
      attack: 14,
      defense: 2,
      speed: 4
    },
    skills: [basicAttack, darkBolt],
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
      hp: 40,
      maxHp: 40,
      mp: 80,
      maxMp: 80,
      attack: 12,
      defense: 8,
      speed: 3
    },
    skills: [basicAttack, darkCharge],
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
    id: 'death_prophet',
    name: '死亡先知',
    title: '死亡编织者',
    description: '掌握死亡魔法的神秘法师。',
    avatar: '/enemies/death_prophet/avatar.png',
    portrait: '/enemies/death_prophet/portrait.png',
    tags: [HeroTag.MAGE, HeroTag.SUPPORT],
    level: 1,
    exp: 0,
    position: { x: 0, y: 0 },
    stats: {
      hp: 70,
      maxHp: 70,
      mp: 110,
      maxMp: 110,
      attack: 10,
      defense: 4,
      speed: 4
    },
    skills: [basicAttack, deathCurse],
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