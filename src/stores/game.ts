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

interface GameState {
  currentTurn: number
  isGameStarted: boolean
  isPaused: boolean
  playerTeam: string[]
  turnState: TurnState
  actionPoints: ActionPoint
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
    actionPoints: { ...DEFAULT_ACTION_POINTS }
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

    startNewHeroTurn(heroId: string) {
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
        console.log('AI回合:', hero.name)
        setTimeout(() => {
          this.endHeroTurn()
        }, 1000)
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

    endTurn() {
      this.currentTurn++
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
    }
  }
}) 