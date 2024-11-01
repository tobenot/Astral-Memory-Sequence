import { defineStore } from 'pinia'
import type { Hero, CharacterStats, StatusEffect } from '@/types/character'
import type { Position } from '@/types/board'
import { heroes } from '@/data/heroes'
import { storeToRefs } from 'pinia'
import { useGameStore } from './game'

interface HeroState {
  heroes: Map<string, Hero>
  selectedHeroId: string | null
  activeHeroId: string | null
  deadHeroes: Set<string>
}

export const useHeroStore = defineStore('hero', {
  state: (): HeroState => ({
    heroes: new Map(),
    selectedHeroId: null,
    activeHeroId: null,
    deadHeroes: new Set()
  }),

  getters: {
    selectedHero: (state): Hero | null => {
      return state.selectedHeroId 
        ? state.heroes.get(state.selectedHeroId) ?? null 
        : null
    },

    activeHero: (state): Hero | null => {
      return state.activeHeroId 
        ? state.heroes.get(state.activeHeroId) ?? null 
        : null
    },

    allies: (state): Hero[] => {
      return Array.from(state.heroes.values()).filter(hero => hero.isAlly)
    },

    enemies: (state): Hero[] => {
      return Array.from(state.heroes.values()).filter(hero => !hero.isAlly)
    },

    aliveEnemiesCount: (state): number => {
      return Array.from(state.heroes.values()).filter(
        hero => !hero.isAlly && !state.deadHeroes.has(hero.id)
      ).length
    }
  },

  actions: {
    initializeHeroes() {
      // 加载预设英雄数据
      heroes.forEach(hero => {
        this.heroes.set(hero.id, { ...hero })
      })
    },

    moveHero(heroId: string, newPosition: Position) {
      const hero = this.heroes.get(heroId)
      if (hero) {
        hero.position = newPosition
      }
    },

    addStatus(heroId: string, status: StatusEffect) {
      const hero = this.heroes.get(heroId)
      if (hero) {
        hero.status.push(status)
        this.applyStatusEffects(hero)
      }
    },

    removeStatus(heroId: string, statusId: string) {
      const hero = this.heroes.get(heroId)
      if (hero) {
        hero.status = hero.status.filter(s => s.id !== statusId)
        this.applyStatusEffects(hero)
      }
    },

    applyStatusEffects(hero: Hero) {
      // 重置状态
      const baseStats = { ...hero.stats }
      
      // 应用所有状态效果
      hero.status.forEach(status => {
        Object.entries(status.effect.stats).forEach(([key, value]) => {
          if (typeof value === 'number') {
            const statKey = key as keyof CharacterStats
            hero.stats[statKey] = baseStats[statKey] * 
              (status.effect.type === 'buff' ? (1 + value) : (1 - value))
          }
        })
      })

      // 检查死亡状态
      if (hero.stats.hp <= 0 && !this.deadHeroes.has(hero.id)) {
        console.log(`[Death Check] ${hero.name} HP is ${hero.stats.hp}, triggering death`)
        this.handleHeroDeath(hero.id)
      }
    },

    handleHeroDeath(heroId: string) {
      const hero = this.heroes.get(heroId)
      if (!hero) {
        console.log(`[Death Handler] Hero ${heroId} not found`)
        return
      }

      console.log(`[Death Handler] Processing death of ${hero.name} (${hero.id})`)
      this.deadHeroes.add(heroId)
      
      // 如果是当前选中的英雄，取消选中
      if (this.selectedHeroId === heroId) {
        console.log(`[Death Handler] Deselecting dead hero ${hero.name}`)
        this.selectHero(null)
      }

      const gameStore = useGameStore()

      // 如果是当前行动的英雄，结束其回合
      if (this.activeHeroId === heroId) {
        console.log(`[Death Handler] Ending turn of dead hero ${hero.name}`)
        gameStore.endHeroTurn()
      }

      // 从回合顺序中移除死亡单位
      gameStore.removeFromTurnOrder(heroId)

      // 检查胜利条件
      if (!hero.isAlly) {
        const remainingEnemies = this.aliveEnemiesCount
        console.log(`[Victory Check] Enemy died. Remaining enemies: ${remainingEnemies}`)
        if (remainingEnemies === 0) {
          console.log(`[Victory Check] All enemies defeated! Triggering victory`)
          // 添加延迟，确保其他状态更新完成
          setTimeout(() => {
            gameStore.handleVictory()
          }, 100)
        }
      }
    },

    selectHero(heroId: string | null) {
      this.selectedHeroId = heroId
    },

    setActiveHero(heroId: string | null) {
      this.activeHeroId = heroId
    },

    updateHeroHealth(heroId: string, newHp: number) {
      const hero = this.heroes.get(heroId)
      if (!hero) return

      console.log(`[Health] ${hero.name} HP changing from ${hero.stats.hp} to ${newHp}`)
      hero.stats.hp = newHp

      // 检查死亡状态
      if (hero.stats.hp <= 0 && !this.deadHeroes.has(hero.id)) {
        console.log(`[Death Check] ${hero.name} HP is ${hero.stats.hp}, triggering death`)
        this.handleHeroDeath(hero.id)
      }
    },

    applyDamage(targetId: string, damage: number) {
      const target = this.heroes.get(targetId)
      if (!target) return

      console.log(`[Damage] ${target.name} 受到 ${damage} 点伤害`)
      const newHp = Math.max(0, target.stats.hp - damage)
      this.updateHeroHealth(targetId, newHp)
    },

    addHero(hero: Hero) {
      this.heroes.set(hero.id, hero)
    },

    $reset() {
      this.heroes.clear()
      this.selectedHeroId = null
      this.deadHeroes.clear()
    }
  }
}) 