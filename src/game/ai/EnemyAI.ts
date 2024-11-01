import type { Hero } from '@/types/character'
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
    // 1. 寻找最近的敌人
    const target = this.findNearestTarget()
    if (!target) return

    // 2. 计算与目标的距离
    const distance = this.calculateDistance(this.hero.position, target.position)

    // 3. 执行行动
    // 先尝试移动
    if (this.hero.actionPoints.move > 0) {
      await this.moveTowardsTarget(target.position)
    }

    // 重新计算与目标的距离（因为可能已经移动过了）
    const newDistance = this.calculateDistance(this.hero.position, target.position)
    
    // 如果在攻击范围内且还有技能点数，则进行攻击
    if (newDistance <= 1 && this.hero.actionPoints.skill > 0) {
      await this.attack(target)
    }

    // 确保所有行动点都被消耗完
    this.hero.actionPoints = {
      move: 0,
      skill: 0,
      item: 0
    }
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