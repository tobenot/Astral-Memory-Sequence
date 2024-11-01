<template>
  <div class="game-layout">
    <div class="floating-turn-controls">
      <div class="turn-info">
        <TurnIndicator />
      </div>
    </div>
    
    <main class="game-main">
      <div class="board-viewport">
        <slot name="board"></slot>
      </div>
      <aside class="info-panel" :class="{ 'show': showInfoPanel }">
        <slot name="character-info"></slot>
        <slot name="skill-panel"></slot>
      </aside>
    </main>

    <div class="action-panel" :class="{ 'show': gameStore.currentHero?.isAlly }">
      <div class="action-content">
        <div class="skill-bar-container">
          <SkillBar v-if="gameStore.currentHero?.isAlly" />
          <div class="turn-buttons">
            <button 
              class="turn-btn skip-turn-btn"
              @click="handleSkipTurn"
              :disabled="!isCurrentHeroAlly"
            >
              <span>结束回合</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 添加胜利对话框 -->
    <Dialog
      v-model="gameStore.victoryDialogVisible"
      title="胜利！"
      :closeOnOverlay="false"
    >
      <div class="victory-dialog">
        <h2>恭喜你取得胜利！</h2>
        <p>你成功击败了所有敌人。</p>
        <div class="dialog-buttons">
          <Button @click="handleRestart">重新开始</Button>
          <Button @click="handleBackToMenu" variant="secondary">返回主菜单</Button>
        </div>
      </div>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useGameStore } from '@/stores/game'
import { useRouter } from 'vue-router'
import TurnIndicator from '@/components/game/TurnIndicator.vue'
import SkillBar from '@/components/game/SkillBar.vue'
import Dialog from '@/components/ui/Dialog.vue'
import Button from '@/components/ui/Button.vue'

const gameStore = useGameStore()
const router = useRouter()
const showInfoPanel = ref(true)

const isCurrentHeroAlly = computed(() => {
  const currentHero = gameStore.currentHero
  return currentHero?.isAlly ?? false
})

const handleEndTurn = () => {
  gameStore.endHeroTurn()
}

const handleSkipTurn = () => {
  gameStore.endHeroTurn()
}

const handleRestart = () => {
  gameStore.restartGame()
}

const handleBackToMenu = () => {
  gameStore.restartGame()
  router.push('/')
}
</script>

<style lang="scss" scoped>
@import '@/assets/styles/_breakpoints.scss';

.game-layout {
  display: grid;
  grid-template-rows: 1fr;
  height: 100vh;
  background: var(--columbia-blue);
  overflow: hidden;
  position: relative;

  .game-main {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 1rem;
    padding: 1rem;
    overflow: hidden;
    position: relative;
  }

  .board-viewport {
    overflow: hidden;
    position: relative;
    border-radius: 8px;
    background: var(--columbia-blue-2);
    box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.1);
  }

  .info-panel {
    width: 300px;
    background: var(--columbia-blue-3);
    border-radius: 8px;
    padding: 1rem;
    overflow-y: auto;
  }

  .floating-turn-controls {
    position: fixed;
    top: 1rem;
    left: 50%;
    transform: translateX(-50%);
    z-index: 100;
    padding: 0.75rem 1rem;
    background: var(--columbia-blue-2);
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .action-panel {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    transform: translateY(100%);
    transition: transform 0.3s ease;
    z-index: 100;
    
    &.show {
      transform: translateY(0);
    }

    .action-content {
      background: var(--columbia-blue-2);
      padding: 1rem;
      border-top-left-radius: 12px;
      border-top-right-radius: 12px;
      box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);

      .skill-bar-container {
        display: flex;
        align-items: center;
        gap: 1rem;

        .turn-buttons {
          display: flex;
          gap: 1rem;
          margin-left: auto;
          
          .turn-btn {
            padding: 0.75rem 1.5rem;
            border: none;
            border-radius: 6px;
            font-size: 1rem;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s ease;
            display: flex;
            flex-direction: column;
            align-items: center;
            line-height: 1.2;

            &:disabled {
              opacity: 0.5;
              cursor: not-allowed;
            }

            .action-points {
              font-size: 0.75rem;
              opacity: 0.8;
            }
          }

          .skip-turn-btn {
            background: var(--columbia-blue-3);
            color: #2c3e50;
            
            &:hover:not(:disabled) {
              background: var(--powder-blue);
              transform: translateY(-2px);
            }
          }

          .end-turn-btn {
            background: var(--powder-blue);
            color: white;
            
            &:hover:not(:disabled) {
              background: var(--sky-blue);
              transform: translateY(-2px);
            }

            &:disabled {
              background: var(--columbia-blue-3);
            }
          }
        }
      }
    }
  }
}

.victory-dialog {
  text-align: center;
  padding: 1rem;

  h2 {
    color: var(--sky-blue);
    margin-bottom: 1rem;
  }

  .dialog-buttons {
    display: flex;
    gap: 1rem;
    justify-content: center;
    margin-top: 2rem;
  }
}
</style> 