import { ref } from 'vue'
import type { Position } from '@/types/board'

interface MouseState {
  isPressed: boolean
  startPosition: Position | null
  currentPosition: Position | null
}

export const useMouseHandler = () => {
  const mouseState = ref<MouseState>({
    isPressed: false,
    startPosition: null,
    currentPosition: null
  })

  const handleMouseDown = (position: Position) => {
    mouseState.value.isPressed = true
    mouseState.value.startPosition = position
    mouseState.value.currentPosition = position
  }

  const handleMouseMove = (position: Position) => {
    if (mouseState.value.isPressed) {
      mouseState.value.currentPosition = position
    }
  }

  const handleMouseUp = () => {
    mouseState.value.isPressed = false
    mouseState.value.startPosition = null
    mouseState.value.currentPosition = null
  }

  return {
    mouseState,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp
  }
} 