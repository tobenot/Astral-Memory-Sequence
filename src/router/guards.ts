import type { Router } from 'vue-router'

export function setupRouterGuards(router: Router) {
  router.beforeEach((to, from, next) => {
    // 这里可以添加加载动画
    // 处理页面标题
    document.title = `星界记忆序列 - ${to.name?.toString() || '首页'}`
    next()
  })

  router.afterEach(() => {
    // 这里可以关闭加载动画
  })
} 