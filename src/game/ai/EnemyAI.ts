import type { Hero, Skill } from '@/types/character'
import type { Position } from '@/types/board'
import { useBoardStore } from '@/stores/board'
import { useHeroStore } from '@/stores/hero'

export class EnemyAI {
  private hero: Hero
  private boardStore = useBoardStore()
  private heroStore = useHeroStore()

  constructor(hero: Hero) {
    this.hero = hero
  }

  async executeTurn(): Promise<void> {
    console.log(`[EnemyAI] ${this.hero.name} 开始执行回合`)
    
    // 1. 寻找最近的敌人
    const target = this.findNearestTarget()
    if (!target) {
        console.log(`[EnemyAI] ${this.hero.name} 没有找到目标`)
        return
    }
    console.log(`[EnemyAI] ${this.hero.name} 找到目标: ${target.name}`)

    // 2. 计算与目标的距离
    const distance = this.calculateDistance(this.hero.position, target.position)
    console.log(`[EnemyAI] 与目标距离: ${distance}, 行动点数:`, this.hero.actionPoints)

    // 3. 执行行动
    // 如果有可用的技能，优先尝试使用技能
    if (this.hero.actionPoints.skill > 0 && this.hero.skills.length > 0) {
        const bestSkill = this.findBestSkill(target)
        if (bestSkill) {
            console.log(`[EnemyAI] ${this.hero.name} 选择技能: ${bestSkill.name}`)
            
            // 如果技能射程不够，先尝试移动接近目标
            if (distance > bestSkill.range && this.hero.actionPoints.move > 0) {
                console.log(`[EnemyAI] 技能射程不够，尝试移动接近目标`)
                await this.moveTowardsTarget(target.position)
            }
            
            // 重新计算距离
            const newDistance = this.calculateDistance(this.hero.position, target.position)
            console.log(`[EnemyAI] 移动后与目标距离: ${newDistance}, 技能射程: ${bestSkill.range}`)
            
            if (newDistance <= bestSkill.range) {
                console.log(`[EnemyAI] ${this.hero.name} 准备使用技能: ${bestSkill.name}`)
                await this.useSkill(bestSkill, target)
            } else {
                console.log(`[EnemyAI] 目标仍在射程外，无法使用技能`)
            }
        } else {
            console.log(`[EnemyAI] ${this.hero.name} 没有找到合适的技能`)
        }
    } else {
        console.log(`[EnemyAI] ${this.hero.name} 没有可用的技能点数或技能列表为空`)
    }
    
    // 如果没有可用技能但还能移动，则移动接近目标
    if (this.hero.actionPoints.move > 0) {
        console.log(`[EnemyAI] ${this.hero.name} 尝试移动接近目标`)
        await this.moveTowardsTarget(target.position)
    }

    // 确保所有行动点都被消耗完
    this.hero.actionPoints = {
        move: 0,
        skill: 0,
        item: 0
    }
    console.log(`[EnemyAI] ${this.hero.name} 回合结束`)
  }

  private findBestSkill(target: Hero) {
    const availableSkills = this.hero.skills.filter((skill: Skill) => 
        skill.currentCooldown === 0 && 
        this.hero.stats.mp >= skill.mpCost
    )
    
    console.log(`[EnemyAI] ${this.hero.name} 可用技能:`, 
        availableSkills.map((s: Skill) => ({
            name: s.name,
            cooldown: s.currentCooldown,
            mpCost: s.mpCost,
            currentMp: this.hero.stats.mp
        }))
    )
    
    return availableSkills[0]
  }

  private async useSkill(skill: any, target: Hero): Promise<void> {
    console.log(`[EnemyAI] ${this.hero.name} 开始使用技能 ${skill.name}`)
    console.log(`[EnemyAI] 技能详情:`, {
        mpCost: skill.mpCost,
        currentMp: this.hero.stats.mp,
        cooldown: skill.cooldown
    })
    
    return new Promise(resolve => {
        setTimeout(() => {
            try {
                // 使用技能
                skill.effect(this.hero, target)
                
                // 设置技能冷却
                skill.currentCooldown = skill.cooldown
                this.hero.stats.mp -= skill.mpCost
                this.hero.actionPoints.skill = 0
                
                console.log(`[EnemyAI] ${this.hero.name} 技能使用完成，剩余MP: ${this.hero.stats.mp}`)
            } catch (error) {
                console.error(`[EnemyAI] 技能使用出错:`, error)
            }
            resolve()
        }, 500)
    })
  }

  private findNearestTarget(): Hero | null {
    const allies = this.heroStore.allies
    if (allies.length === 0) return null

    let nearestTarget: Hero | null = null
    let minDistance = Infinity

    allies.forEach(ally => {
      const distance = this.calculateDistance(this.hero.position, ally.position)
      if (distance < minDistance) {
        minDistance = distance
        nearestTarget = ally
      }
    })

    return nearestTarget
  }

  private calculateDistance(pos1: Position, pos2: Position): number {
    return Math.abs(pos1.x - pos2.x) + Math.abs(pos1.y - pos2.y)
  }

  private async moveTowardsTarget(targetPos: Position): Promise<void> {
    if (this.hero.actionPoints.move <= 0) return

    // 计算可移动范围
    const movablePositions = this.boardStore.calculateMovableRange(
      this.hero.position,
      this.hero.actionPoints.move
    )

    // 找出最接近目标的可移动位置
    let bestPosition = this.hero.position
    let minDistance = this.calculateDistance(this.hero.position, targetPos)

    movablePositions.forEach(pos => {
      const distance = this.calculateDistance(pos, targetPos)
      if (distance < minDistance) {
        minDistance = distance
        bestPosition = pos
      }
    })

    // 移动到最佳位置
    if (bestPosition !== this.hero.position) {
      await this.move(bestPosition)
    }
  }

  private async move(position: Position): Promise<void> {
    return new Promise(resolve => {
      setTimeout(() => {
        this.heroStore.moveHero(this.hero.id, position)
        this.hero.actionPoints.move = 0
        resolve()
      }, 500)
    })
  }

  private async attack(target: Hero): Promise<void> {
    if (this.hero.actionPoints.skill <= 0) return

    return new Promise(resolve => {
      setTimeout(() => {
        // 简单的伤害计算
        const damage = Math.max(1, this.hero.stats.attack - target.stats.defense)
        target.stats.hp = Math.max(0, target.stats.hp - damage)
        
        // 消耗行动点
        this.hero.actionPoints.skill = 0
        resolve()
      }, 500)
    })
  }
} 