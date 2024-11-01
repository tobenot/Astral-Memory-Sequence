import { defineStore } from 'pinia'
import type { Hero, CharacterStats, StatusEffect } from '@/types/character'
import type { Position } from '@/types/board'
import { heroes } from '@/data/heroes'

interface HeroState {
  heroes: Map<string, Hero>
  selectedHeroId: string | null
  activeHeroId: string | null
}

export const useHeroStore = defineStore('hero', {
  state: (): HeroState => ({
    heroes: new Map(),
    selectedHeroId: null,
    activeHeroId: null
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
    },

    selectHero(heroId: string | null) {
      this.selectedHeroId = heroId
    },

    setActiveHero(heroId: string | null) {
      this.activeHeroId = heroId
    }
  }
}) 