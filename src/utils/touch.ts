import { ref } from 'vue'

interface TouchInfo {
  startX: number
  startY: number
  moveX: number
  moveY: number
  deltaX: number
  deltaY: number
}

export const useTouchHandler = () => {
  const touchInfo = ref<TouchInfo>({
    startX: 0,
    startY: 0,
    moveX: 0,
    moveY: 0,
    deltaX: 0,
    deltaY: 0
  })

  const handleTouchStart = (e: TouchEvent) => {
    const touch = e.touches[0]
    touchInfo.value = {
      startX: touch.clientX,
      startY: touch.clientY,
      moveX: touch.clientX,
      moveY: touch.clientY,
      deltaX: 0,
      deltaY: 0
    }
  }

  const handleTouchMove = (e: TouchEvent) => {
    const touch = e.touches[0]
    touchInfo.value.moveX = touch.clientX
    touchInfo.value.moveY = touch.clientY
    touchInfo.value.deltaX = touch.clientX - touchInfo.value.startX
    touchInfo.value.deltaY = touch.clientY - touchInfo.value.startY
  }

  return {
    touchInfo,
    handleTouchStart,
    handleTouchMove
  }
} 