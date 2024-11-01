import type { Hero, Skill, SkillTarget } from '@/types/character'
import { HeroTag, DEFAULT_ACTION_POINTS } from '@/types/character'

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
    if (!('stats' in target)) return // 确保目标是英雄
    const damage = Math.max(1, caster.stats.attack - target.stats.defense)
    target.stats.hp = Math.max(0, target.stats.hp - damage)
  }
}

// 极光（冰霜法师）的技能
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
  effect: async (caster: Hero, target: SkillTarget) => {
    if (!Array.isArray(target)) return // 确保目标是英雄数组
    
    // 添加施法动画延迟
    await new Promise(resolve => setTimeout(resolve, 300))
    
    target.forEach(hero => {
      const damage = Math.max(1, caster.stats.attack * 1.2 - hero.stats.defense)
      hero.stats.hp = Math.max(0, hero.stats.hp - damage)
      
      // 添加减速效果
      hero.status.push({
        id: `frost_${Date.now()}`,
        name: '霜冻',
        description: '移动速度降低30%',
        icon: '/status/frost.png',
        duration: 2,
        effect: {
          type: 'debuff',
          stats: {
            speed: 0.3
          }
        }
      })
    })
  }
}

const iceShield: Skill = {
  id: 'ice_shield',
  name: '寒冰护盾',
  description: '为自己或队友提供一个吸收伤害的护盾',
  icon: '/skills/ice_shield.png',
  mpCost: 25,
  cooldown: 2,
  currentCooldown: 0,
  range: 3,
  type: 'active',
  targetType: 'single',
  effect: (caster: Hero, target: SkillTarget) => {
    if (!('stats' in target)) return // 确保目标是英雄
    target.status.push({
      id: `shield_${Date.now()}`,
      name: '寒冰护盾',
      description: '防御力提升50%',
      icon: '/status/ice_shield.png',
      duration: 2,
      effect: {
        type: 'buff',
        stats: {
          defense: 0.5
        }
      }
    })
  }
}

// 剑魂（剑客）的技能
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
  effect: (caster: Hero, target: SkillTarget) => {
    if (!('stats' in target)) return // 确保目标是英雄
    const damage = Math.max(1, caster.stats.attack * 1.5 - target.stats.defense)
    target.stats.hp = Math.max(0, target.stats.hp - damage)
  }
}

const swordDance: Skill = {
  id: 'sword_dance',
  name: '剑舞',
  description: '提升自身攻击力和移动速度',
  icon: '/skills/sword_dance.png',
  mpCost: 30,
  cooldown: 4,
  currentCooldown: 0,
  range: 0,
  type: 'active',
  targetType: 'self',
  effect: (caster: Hero, target: SkillTarget) => {
    if (target !== caster) return // 确保目标是施法者自己
    caster.status.push({
      id: `dance_${Date.now()}`,
      name: '剑舞',
      description: '攻击力提升30%，移动速度提升20%',
      icon: '/status/sword_dance.png',
      duration: 3,
      effect: {
        type: 'buff',
        stats: {
          attack: 0.3,
          speed: 0.2
        }
      }
    })
  }
}

// 月影（弓箭手）的技能
const preciseShot: Skill = {
  id: 'precise_shot',
  name: '精准射击',
  description: '对单一目标造成高额伤害',
  icon: '/skills/precise_shot.png',
  mpCost: 20,
  cooldown: 2,
  currentCooldown: 0,
  range: 4,
  type: 'active',
  targetType: 'single',
  effect: (caster: Hero, target: SkillTarget) => {
    if (!('stats' in target)) return // 确保目标是英雄
    const damage = Math.max(1, caster.stats.attack * 1.8 - target.stats.defense)
    target.stats.hp = Math.max(0, target.stats.hp - damage)
  }
}

const shadowStep: Skill = {
  id: 'shadow_step',
  name: '影步',
  description: '快速移动到指定位置并获得隐身效果',
  icon: '/skills/shadow_step.png',
  mpCost: 35,
  cooldown: 3,
  currentCooldown: 0,
  range: 3,
  type: 'active',
  targetType: 'position',
  effect: (caster: Hero, target: SkillTarget) => {
    if (!('x' in target)) return // 确保目标是位置
    // 移动到目标位置
    caster.position = target
    // 添加隐身效果
    caster.status.push({
      id: `stealth_${Date.now()}`,
      name: '隐身',
      description: '防御力提升30%',
      icon: '/status/stealth.png',
      duration: 1,
      effect: {
        type: 'buff',
        stats: {
          defense: 0.3
        }
      }
    })
  }
}

// 盖亚（辅助）的技能
const natureBlessing: Skill = {
  id: 'nature_blessing',
  name: '自然祝福',
  description: '治疗目标并提供防御增益',
  icon: '/skills/nature_blessing.png',
  mpCost: 30,
  cooldown: 2,
  currentCooldown: 0,
  range: 3,
  type: 'active',
  targetType: 'single',
  effect: (caster: Hero, target: SkillTarget) => {
    if (!('stats' in target)) return // 确保目标是英雄
    const healing = caster.stats.attack * 1.2
    target.stats.hp = Math.min(target.stats.maxHp, target.stats.hp + healing)
    target.status.push({
      id: `blessing_${Date.now()}`,
      name: '自然祝福',
      description: '防御力提升20%',
      icon: '/status/blessing.png',
      duration: 2,
      effect: {
        type: 'buff',
        stats: {
          defense: 0.2
        }
      }
    })
  }
}

const natureFury: Skill = {
  id: 'nature_fury',
  name: '自然之怒',
  description: '召唤自然之力攻击敌人并降低其攻击力',
  icon: '/skills/nature_fury.png',
  mpCost: 40,
  cooldown: 3,
  currentCooldown: 0,
  range: 3,
  type: 'active',
  targetType: 'area',
  effect: (caster: Hero, target: SkillTarget) => {
    if (!Array.isArray(target)) return // 确保目标是英雄数组
    target.forEach(hero => {
      const damage = Math.max(1, caster.stats.attack - hero.stats.defense)
      hero.stats.hp = Math.max(0, hero.stats.hp - damage)
      hero.status.push({
        id: `weakness_${Date.now()}`,
        name: '虚弱',
        description: '攻击力降低25%',
        icon: '/status/weakness.png',
        duration: 2,
        effect: {
          type: 'debuff',
          stats: {
            attack: 0.25
          }
        }
      })
    })
  }
}

// 更新英雄数据，添加技能
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
      speed: 4
    },
    skills: [basicAttack, frostNova, iceShield],
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
      speed: 6
    },
    skills: [windSlash, swordDance],
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
      speed: 5
    },
    skills: [preciseShot, shadowStep],
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
      speed: 4
    },
    skills: [natureBlessing, natureFury],
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