import { defineStore } from 'pinia'
import type { Character, CharacterStats, StatusEffect, Hero } from '@/types/character'
import type { Position } from '@/types/board'
import { CharacterType } from '@/types/character'

interface CharacterState {
  characters: Map<string, Character>
  selectedCharacterId: string | null
  activeCharacterId: string | null
}

export const useCharacterStore = defineStore('character', {
  state: (): CharacterState => ({
    characters: new Map(),
    selectedCharacterId: null,
    activeCharacterId: null
  }),

  getters: {
    selectedCharacter: (state): Character | null => {
      return state.selectedCharacterId 
        ? state.characters.get(state.selectedCharacterId) ?? null 
        : null
    },

    activeCharacter: (state): Character | null => {
      return state.activeCharacterId 
        ? state.characters.get(state.activeCharacterId) ?? null 
        : null
    },

    allies: (state): Character[] => {
      return Array.from(state.characters.values()).filter(char => char.isAlly)
    },

    enemies: (state): Character[] => {
      return Array.from(state.characters.values()).filter(char => !char.isAlly)
    }
  },

  actions: {
    createCharacter(params: {
      name: string
      type: CharacterType
      position: Position
      isAlly: boolean
    }): Character {
      const id = `char_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      const baseStats: CharacterStats = {
        hp: 100,
        maxHp: 100,
        mp: 50,
        maxMp: 50,
        attack: 10,
        defense: 5,
        speed: 5,
        moveRange: 2
      }

      const character = {
        id,
        name: params.name,
        type: params.type,
        level: 1,
        exp: 0,
        position: params.position,
        stats: this.adjustStatsByType(baseStats, params.type),
        skills: [],
        status: [],
        isAlly: params.isAlly,
        actionPoints: { ...DEFAULT_ACTION_POINTS },
        maxActionPoints: { ...DEFAULT_ACTION_POINTS }
      } as Hero

      this.characters.set(id, character)
      return character
    },

    adjustStatsByType(baseStats: CharacterStats, type: CharacterType): CharacterStats {
      const stats = { ...baseStats }
      switch (type) {
        case CharacterType.WARRIOR:
          stats.hp *= 1.2
          stats.maxHp *= 1.2
          stats.attack *= 1.1
          stats.defense *= 1.2
          break
        case CharacterType.MAGE:
          stats.mp *= 1.5
          stats.maxMp *= 1.5
          stats.attack *= 1.3
          stats.defense *= 0.8
          break
        case CharacterType.ARCHER:
          stats.speed *= 1.2
          stats.attack *= 1.2
          break
        case CharacterType.SUPPORT:
          stats.mp *= 1.2
          stats.maxMp *= 1.2
          stats.defense *= 1.1
          stats.speed *= 1.1
          break
      }
      return stats
    },

    moveCharacter(characterId: string, newPosition: Position) {
      const character = this.characters.get(characterId)
      if (character) {
        character.position = newPosition
      }
    },

    addStatus(characterId: string, status: StatusEffect) {
      const character = this.characters.get(characterId)
      if (character) {
        character.status.push(status)
        this.applyStatusEffects(character)
      }
    },

    removeStatus(characterId: string, statusId: string) {
      const character = this.characters.get(characterId)
      if (character) {
        character.status = character.status.filter(s => s.id !== statusId)
        this.applyStatusEffects(character)
      }
    },

    applyStatusEffects(character: Character) {
      // 重置状态
      character.stats = this.adjustStatsByType({
        hp: 100,
        maxHp: 100,
        mp: 50,
        maxMp: 50,
        attack: 10,
        defense: 5,
        speed: 5,
        moveRange: 2
      }, character.type)

      // 应用所有状态效果
      character.status.forEach(status => {
        Object.entries(status.effect.stats).forEach(([key, value]) => {
          if (typeof value === 'number') {
            const statKey = key as keyof CharacterStats
            character.stats[statKey] *= status.effect.type === 'buff' ? (1 + value) : (1 - value)
          }
        })
      })
    },

    selectCharacter(characterId: string | null) {
      this.selectedCharacterId = characterId
    },

    setActiveCharacter(characterId: string | null) {
      this.activeCharacterId = characterId
    }
  }
}) 