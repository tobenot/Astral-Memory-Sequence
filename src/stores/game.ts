import { defineStore } from 'pinia'
import { useBoardStore } from './board'
import { useHeroStore } from './hero'
import type { SpawnPoint } from '@/types/map'
import type { TurnState, ActionPoint } from '@/types/turn'
import { SpawnPointType } from '@/types/map'
import { DEFAULT_ACTION_POINTS } from '@/types/turn'
import { heroes } from '@/data/heroes'
import { TurnPhase } from '@/types/turn'
import type { ActionPoints } from '@/types/character'
import { enemies } from '@/data/enemies'
import { EnemyAI } from '@/game/ai/EnemyAI'
import type { Skill, SkillTarget } from '@/types/character'

interface GameState {
  currentTurn: number
  isGameStarted: boolean
  isPaused: boolean
  playerTeam: string[]
  turnState: TurnState
  actionPoints: ActionPoint
  selectedSkill: Skill | null
}

export const useGameStore = defineStore('game', {
  state: (): GameState => ({
    currentTurn: 1,
    isGameStarted: false,
    isPaused: false,
    playerTeam: [],
    turnState: {
      currentHeroId: null,
      remainingActions: 0,
      turnOrder: [],
      phase: 'prepare',
      isProcessing: false
    },
    actionPoints: { ...DEFAULT_ACTION_POINTS },
    selectedSkill: null
  }),

  getters: {
    currentHero: (state) => {
      const heroStore = useHeroStore()
      return state.turnState.currentHeroId 
        ? heroStore.heroes.get(state.turnState.currentHeroId) 
        : null
    },

    canMove: (state) => {
      const hero = state.turnState.currentHeroId 
        ? useHeroStore().heroes.get(state.turnState.currentHeroId)
        : null
      return hero?.actionPoints.move && hero.actionPoints.move > 0
    },
    canUseSkill: (state) => state.actionPoints.skill > 0,
    canUseItem: (state) => state.actionPoints.item > 0,

    // 添加一个getter来检查是否还有可用的行动点
    hasRemainingActions: (state) => {
      return state.actionPoints.move > 0 || 
             state.actionPoints.skill > 0 || 
             state.actionPoints.item > 0
    }
  },

  actions: {
    startGame() {
      this.isGameStarted = true
      this.currentTurn = 1
      this.spawnHeroes()
      this.spawnEnemies()
      this.initializeTurnOrder()
    },

    initializeTurnOrder() {
      const heroStore = useHeroStore()
      const allHeroes = Array.from(heroStore.heroes.values())
      
      // 计算行动顺序
      this.turnState.turnOrder = allHeroes.map(hero => ({
        heroId: hero.id,
        initiative: hero.stats.speed + Math.random() * 20 // 添加随机性
      })).sort((a, b) => b.initiative - a.initiative)

      // 设置第一个行动的角色
      this.startNewHeroTurn(this.turnState.turnOrder[0].heroId)
    },

    async startNewHeroTurn(heroId: string) {
      const heroStore = useHeroStore()
      const boardStore = useBoardStore()
      const hero = heroStore.heroes.get(heroId)
      
      if (!hero) return
      
      this.turnState.isProcessing = true
      this.turnState.currentHeroId = heroId
      this.turnState.phase = TurnPhase.ACTION
      
      // 清除之前的技能选择状态
      this.selectSkill(null)
      boardStore.clearSelection()
      
      // 重置角色的行动点
      hero.actionPoints = { ...hero.maxActionPoints }
      
      heroStore.setActiveHero(heroId)
      
      if (!hero.isAlly) {
        try {
          const ai = new EnemyAI(hero)
          await ai.executeTurn()
          
          this.turnState.isProcessing = false
          
          await new Promise(resolve => setTimeout(resolve, 500))
          this.endHeroTurn()
        } catch (error) {
          console.error('AI执行出错:', error)
          this.turnState.isProcessing = false
          this.endHeroTurn()
        }
      } else {
        // 如果是玩家角色，自动显示移动范围
        if (hero.actionPoints.move > 0) {
          const movablePositions = boardStore.calculateMovableRange(
            hero.position,
            hero.actionPoints.move
          )
          boardStore.setSelectableTiles(movablePositions)
          heroStore.selectHero(heroId)
        }
        this.turnState.isProcessing = false
      }
    },

    endHeroTurn() {
      if (!this.currentHero) return

      // 更新当前英雄的所有技能冷却
      this.currentHero.skills.forEach(skill => {
        if (skill.currentCooldown > 0) {
          skill.currentCooldown--
        }
      })

      // 防止回合结束时重复触发
      if (this.turnState.isProcessing) return
      
      this.turnState.isProcessing = true
      this.turnState.phase = TurnPhase.END
      
      const currentIndex = this.turnState.turnOrder.findIndex(
        t => t.heroId === this.turnState.currentHeroId
      )
      
      // 移动到下一个角色
      const nextIndex = (currentIndex + 1) % this.turnState.turnOrder.length
      
      // 如果回到第一个角色，说明是新的回合
      if (nextIndex === 0) {
        this.currentTurn++
      }
      
      // 清理当前角色的状态
      const heroStore = useHeroStore()
      heroStore.selectHero(null)
      heroStore.setActiveHero(null)
      
      // 延迟一下再开始下一个角色的回合，让动画和状态变化更清晰
      setTimeout(() => {
        this.startNewHeroTurn(this.turnState.turnOrder[nextIndex].heroId)
      }, 300)
    },

    useActionPoint(type: keyof ActionPoints) {
      const hero = this.currentHero
      if (!hero || !hero.actionPoints[type]) return false

      hero.actionPoints[type]--
      
      // 检查是否还有任何可用的行动点
      const hasRemainingActions = Object.values(hero.actionPoints).some(points => points > 0)
      
      if (!hasRemainingActions && !this.turnState.isProcessing) {
        setTimeout(() => {
          this.endHeroTurn()
        }, 500)
      }
      
      return true
    },

    spawnHeroes() {
      const boardStore = useBoardStore()
      const heroStore = useHeroStore()
      
      // 获取所有友方出生点
      const allySpawnPoints = boardStore.currentMap?.spawnPoints.filter(
        point => point.type === SpawnPointType.ALLY && !point.isOccupied
      ) || []

      // 初始化玩家队伍（使用前4个英雄）
      const teamHeroes = heroes.slice(0, 4)
      
      // 为每个英雄分配出生点并创建实例
      teamHeroes.forEach((hero, index) => {
        const spawnPoint = allySpawnPoints[index]
        if (spawnPoint) {
          this.spawnHero(hero, spawnPoint, heroStore)
          this.playerTeam.push(hero.id)
        }
      })
    },

    spawnHero(heroData: typeof heroes[0], spawnPoint: SpawnPoint, heroStore: ReturnType<typeof useHeroStore>) {
      // 创建英雄实例并设置位置
      const hero = { 
        ...heroData,
        position: spawnPoint.position,
        isAlly: true
      }
      
      // 将英雄添加到状态管理
      heroStore.heroes.set(hero.id, hero)
      
      // 标记出生点为已占用
      spawnPoint.isOccupied = true
    },

    spawnEnemies() {
      const boardStore = useBoardStore()
      const heroStore = useHeroStore()
      
      // 获取当前地图的敌人配置
      const mapEnemies = boardStore.currentMap?.enemies || []
      
      // 生成初始敌人
      mapEnemies.forEach(enemyConfig => {
        const enemyTemplate = enemies.find(e => e.id === enemyConfig.id)
        if (enemyTemplate) {
          const enemy = {
            ...enemyTemplate,
            level: enemyConfig.level,
            position: enemyConfig.position,
            isAlly: false
          }
          heroStore.heroes.set(enemy.id, enemy)
        }
      })
    },

    checkWaveSpawn() {
      const boardStore = useBoardStore()
      const heroStore = useHeroStore()
      
      // 检查是否有新的敌人波次需要生成
      const currentWave = boardStore.currentMap?.waves?.find(
        wave => wave.turn === this.currentTurn
      )
      
      if (currentWave) {
        currentWave.enemies.forEach(enemyConfig => {
          const enemyTemplate = enemies.find(e => e.id === enemyConfig.id)
          if (enemyTemplate) {
            const enemy = {
              ...enemyTemplate,
              level: enemyConfig.level,
              position: enemyConfig.position,
              isAlly: false
            }
            heroStore.heroes.set(enemy.id, enemy)
          }
        })
      }
    },

    endTurn() {
      this.currentTurn++
      this.checkWaveSpawn()
    },

    pauseGame() {
      this.isPaused = true
    },

    resumeGame() {
      this.isPaused = false
    },

    resetGame() {
      this.currentTurn = 1
      this.isGameStarted = false
      this.isPaused = false
      this.playerTeam = []
    },

    selectSkill(skill: Skill | null) {
      this.selectedSkill = skill
    },

    async useSkill(target: SkillTarget): Promise<boolean> {
      const hero = this.currentHero
      const skill = this.selectedSkill
      if (!hero || !skill) return false

      // 检查技能是否可用
      if (skill.currentCooldown > 0) return false
      
      // 使用技能
      await skill.effect(hero, target)
      
      // 设置技能冷却
      skill.currentCooldown = skill.cooldown
      hero.stats.mp -= skill.mpCost
      hero.actionPoints.skill--
      
      return true
    },

    findTargetAtPosition(position: Position): Hero | null {
      const heroStore = useHeroStore()
      return Array.from(heroStore.heroes.values()).find(
        hero => hero.position.x === position.x && hero.position.y === position.y
      ) || null
    },

    findTargetsInRange(center: Position, range: number): Hero[] {
      const heroStore = useHeroStore()
      return Array.from(heroStore.heroes.values()).filter(hero => {
        const distance = Math.abs(hero.position.x - center.x) + 
                        Math.abs(hero.position.y - center.y)
        return distance <= range
      })
    }
  }
}) 