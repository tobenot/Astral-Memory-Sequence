import { defineStore } from 'pinia'

interface GameState {
  currentTurn: number
  isGameStarted: boolean
  isPaused: boolean
}

export const useGameStore = defineStore('game', {
  state: (): GameState => ({
    currentTurn: 1,
    isGameStarted: false,
    isPaused: false
  }),

  actions: {
    startGame() {
      this.isGameStarted = true
      this.currentTurn = 1
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
    }
  }
}) 