<template>
  <div class="game-layout">
    <header class="game-header">
      <div class="turn-info">
        <TurnIndicator />
      </div>
      <div class="action-bar">
        <!-- 行动条将在这里实现 -->
      </div>
    </header>
    
    <main class="game-main">
      <div class="board-viewport">
        <slot name="board"></slot>
      </div>
      <aside class="info-panel" :class="{ 'show': showInfoPanel }">
        <slot name="character-info"></slot>
        <slot name="skill-panel"></slot>
      </aside>
    </main>

    <footer class="game-footer">
      <slot name="controls"></slot>
    </footer>
  </div>
</template>

<style lang="scss" scoped>
@import '@/assets/styles/_breakpoints.scss';

.game-layout {
  display: grid;
  grid-template-rows: auto 1fr auto;
  height: 100vh;
  background: var(--columbia-blue);
  overflow: hidden;

  .game-header {
    padding: 1rem;
    background: var(--columbia-blue-2);
    display: flex;
    justify-content: space-between;
    align-items: center;
    z-index: 10;
  }

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

  .game-footer {
    padding: 1rem;
    background: var(--columbia-blue-2);
    z-index: 10;
  }
}
</style> 