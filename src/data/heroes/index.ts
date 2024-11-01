import type { Hero, Skill, SkillTarget } from '@/types/character'
import { HeroTag, DEFAULT_ACTION_POINTS } from '@/types/character'
import { useHeroStore } from '@/stores/hero'

// 基础技能
const basicAttack: Skill = {
  id: 'basic_attack',
  name: '基础攻击',
  description: '近距离攻击，造成100%攻击力的伤害',
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

// 极光（冰霜法师）的技能
const frostNova: Skill = {
  id: 'frost_nova',
  name: '霜华绽放',
  description: '释放寒冰能量，对范围内敌人造成120%魔法伤害并减速40%',
  icon: '/skills/frost_nova.png',
  mpCost: 25,
  cooldown: 2,
  currentCooldown: 0,
  range: 2,
  type: 'active',
  targetType: 'area',
  aoeRange: 1,
  effect: async (caster: Hero, target: SkillTarget) => {
    if (!Array.isArray(target)) return
    
    await new Promise(resolve => setTimeout(resolve, 300))
    
    const heroStore = useHeroStore()
    target.forEach(hero => {
      const damage = Math.max(1, caster.stats.attack * 1.2 - hero.stats.defense)
      heroStore.applyDamage(hero.id, damage)
      
      hero.status.push({
        id: `frost_${Date.now()}`,
        name: '霜冻',
        description: '移动速度降低40%',
        icon: '/status/frost.png',
        duration: 2,
        effect: {
          type: 'debuff',
          stats: {
            speed: 0.4
          }
        }
      })
    })
  }
}

const iceShield: Skill = {
  id: 'ice_shield',
  name: '寒冰护盾',
  description: '为目标提供一个吸收70%伤害的护盾，并提升30%防御力',
  icon: '/skills/ice_shield.png',
  mpCost: 20,
  cooldown: 2,
  currentCooldown: 0,
  range: 3,
  type: 'active',
  targetType: 'single',
  effect: (caster: Hero, target: SkillTarget) => {
    if (!('stats' in target)) return
    target.status.push({
      id: `shield_${Date.now()}`,
      name: '寒冰护盾',
      description: '防御力提升30%，减免70%伤害',
      icon: '/status/ice_shield.png',
      duration: 2,
      effect: {
        type: 'buff',
        stats: {
          defense: 0.3,
          damageReduction: 0.7
        }
      }
    })
  }
}

// 剑魂（剑客）的技能
const windSlash: Skill = {
  id: 'wind_slash',
  name: '风之斩击',
  description: '快速突进并造成180%攻击力的伤害，击中后获得1回合加速',
  icon: '/skills/wind_slash.png',
  mpCost: 20,
  cooldown: 2,
  currentCooldown: 0,
  range: 3,
  type: 'active',
  targetType: 'single',
  effect: (caster: Hero, target: SkillTarget) => {
    if (!('stats' in target)) return
    const damage = Math.max(1, caster.stats.attack * 1.8 - target.stats.defense)
    const heroStore = useHeroStore()
    heroStore.applyDamage(target.id, damage)
    
    caster.status.push({
      id: `swift_${Date.now()}`,
      name: '疾风',
      description: '移动速度提升30%',
      icon: '/status/swift.png',
      duration: 1,
      effect: {
        type: 'buff',
        stats: {
          speed: 0.3
        }
      }
    })
  }
}

const swordDance: Skill = {
  id: 'sword_dance',
  name: '剑舞',
  description: '进入剑舞状态，提升50%攻击力和30%移动速度，持续2回合',
  icon: '/skills/sword_dance.png',
  mpCost: 25,
  cooldown: 3,
  currentCooldown: 0,
  range: 0,
  type: 'active',
  targetType: 'self',
  effect: (caster: Hero) => {
    caster.status.push({
      id: `dance_${Date.now()}`,
      name: '剑舞',
      description: '攻击力提升50%，移动速度提升30%',
      icon: '/status/sword_dance.png',
      duration: 2,
      effect: {
        type: 'buff',
        stats: {
          attack: 0.5,
          speed: 0.3
        }
      }
    })
  }
}

// 月影（弓箭手）的技能
const preciseShot: Skill = {
  id: 'precise_shot',
  name: '精准射击',
  description: '对单一目标造成200%攻击力的伤害，如果目标生命值低于30%则必定暴击',
  icon: '/skills/precise_shot.png',
  mpCost: 20,
  cooldown: 2,
  currentCooldown: 0,
  range: 4,
  type: 'active',
  targetType: 'single',
  effect: (caster: Hero, target: SkillTarget) => {
    if (!('stats' in target)) return
    let damage = caster.stats.attack * 2 - target.stats.defense
    
    if (target.stats.hp < target.stats.maxHp * 0.3) {
      damage *= 1.5
    }
    
    const heroStore = useHeroStore()
    heroStore.applyDamage(target.id, Math.max(1, damage))
  }
}

const shadowStep: Skill = {
  id: 'shadow_step',
  name: '影袭',
  description: '瞬移到目标位置并获得隐身效果，下次攻击造成150%伤害',
  icon: '/skills/shadow_step.png',
  mpCost: 30,
  cooldown: 2,
  currentCooldown: 0,
  range: 3,
  type: 'active',
  targetType: 'position',
  effect: (caster: Hero, target: SkillTarget) => {
    if (!('x' in target)) return
    caster.position = target
    caster.status.push({
      id: `stealth_${Date.now()}`,
      name: '隐袭',
      description: '隐身状态，下次攻击伤害提升50%',
      icon: '/status/stealth.png',
      duration: 1,
      effect: {
        type: 'buff',
        stats: {
          attack: 0.5,
          stealth: 1
        }
      }
    })
  }
}

// 盖亚（辅助）的技能
const natureBlessing: Skill = {
  id: 'nature_blessing',
  name: '自然祝福',
  description: '治疗目标30%最大生命值，并提供一个可以抵挡一次致命伤害的护盾',
  icon: '/skills/nature_blessing.png',
  mpCost: 25,
  cooldown: 2,
  currentCooldown: 0,
  range: 3,
  type: 'active',
  targetType: 'single',
  effect: (caster: Hero, target: SkillTarget) => {
    if (!('stats' in target)) return
    const healing = target.stats.maxHp * 0.3
    target.stats.hp = Math.min(target.stats.maxHp, target.stats.hp + healing)
    
    target.status.push({
      id: `blessing_${Date.now()}`,
      name: '生命护盾',
      description: '可以抵挡一次致命伤害',
      icon: '/status/blessing.png',
      duration: 2,
      effect: {
        type: 'buff',
        stats: {
          deathPrevention: true
        }
      }
    })
  }
}

const natureFury: Skill = {
  id: 'nature_fury',
  name: '自然之怒',
  description: '对范围内敌人造成伤害并施加易伤效果，使其受到的伤害提升40%',
  icon: '/skills/nature_fury.png',
  mpCost: 35,
  cooldown: 3,
  currentCooldown: 0,
  range: 3,
  type: 'active',
  targetType: 'area',
  aoeRange: 2,
  effect: (caster: Hero, target: SkillTarget) => {
    if (!Array.isArray(target)) return
    const heroStore = useHeroStore()
    
    target.forEach(hero => {
      const damage = Math.max(1, caster.stats.attack * 1.2 - hero.stats.defense)
      heroStore.applyDamage(hero.id, damage)
      
      hero.status.push({
        id: `vulnerable_${Date.now()}`,
        name: '易伤',
        description: '受到的伤害提升40%',
        icon: '/status/vulnerable.png',
        duration: 2,
        effect: {
          type: 'debuff',
          stats: {
            damageReceived: 0.4
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
    type: CharacterType.MAGE,
    level: 1,
    exp: 0,
    position: { x: 0, y: 0 },
    stats: {
      hp: 40,
      maxHp: 40,
      mp: 40,
      maxMp: 40,
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
    type: CharacterType.WARRIOR,
    level: 1,
    exp: 0,
    position: { x: 0, y: 0 },
    stats: {
      hp: 40,
      maxHp: 40,
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
    type: CharacterType.ARCHER,
    level: 1,
    exp: 0,
    position: { x: 0, y: 0 },
    stats: {
      hp: 40,
      maxHp: 40,
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
    type: CharacterType.SUPPORT,
    level: 1,
    exp: 0,
    position: { x: 0, y: 0 },
    stats: {
      hp: 40,
      maxHp: 40,
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