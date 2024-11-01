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
      const hero = heroStore.heroes.get(heroId)
      
      if (!hero) return
      
      this.turnState.isProcessing = true
      this.turnState.currentHeroId = heroId
      this.turnState.phase = TurnPhase.ACTION
      
      // 重置角色的行动点
      hero.actionPoints = { ...hero.maxActionPoints }
      
      heroStore.setActiveHero(heroId)
      
      if (!hero.isAlly) {
        try {
          const ai = new EnemyAI(hero)
          await ai.executeTurn()
          
          // 重要：在AI执行完后重置处理标志
          this.turnState.isProcessing = false
          
          // 确保所有动作都完成后再结束回合
          await new Promise(resolve => setTimeout(resolve, 500))
          this.endHeroTurn()
        } catch (error) {
          console.error('AI执行出错:', error)
          this.turnState.isProcessing = false
          this.endHeroTurn()
        }
      } else {
        this.turnState.isProcessing = false
      }
    },

    endHeroTurn() {
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

    async useSkill(target: Hero | Hero[] | Position) {
      const currentHero = this.currentHero
      const selectedSkill = this.selectedSkill
      
      console.log('开始使用技能:', {
        currentHero: currentHero?.name,
        selectedSkill: selectedSkill?.name,
        target
      })
      
      if (!currentHero || !selectedSkill || currentHero.actionPoints.skill <= 0) {
        console.log('技能使用失败: 英雄/技能无效或没有行动点')
        return false
      }

      // 检查MP是否足够
      if (currentHero.stats.mp < selectedSkill.mpCost) {
        console.log('技能使用失败: MP不足')
        return false
      }

      try {
        // 执行技能效果
        console.log('执行技能效果前:', {
          casterHP: currentHero.stats.hp,
          casterMP: currentHero.stats.mp,
          targetHP: ('stats' in target) ? target.stats.hp : null
        })
        
        await selectedSkill.effect(currentHero, target)
        
        console.log('技能效果执行后:', {
          casterHP: currentHero.stats.hp,
          casterMP: currentHero.stats.mp,
          targetHP: ('stats' in target) ? target.stats.hp : null
        })
        
        // 消耗MP
        currentHero.stats.mp -= selectedSkill.mpCost
        
        // 设置技能冷却
        selectedSkill.currentCooldown = selectedSkill.cooldown
        
        // 消耗行动点
        currentHero.actionPoints.skill--
        
        // 清除选中的技能
        this.selectedSkill = null
        
        console.log('技能使用成功')
        return true
      } catch (error) {
        console.error('技能使用失败:', error)
        return false
      }
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