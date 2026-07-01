import DefaultTheme from 'vitepress/theme'
import { onMounted, watch, nextTick } from 'vue'
import type { EnhanceAppContext } from 'vitepress'
import './custom.css'
import PostsList from './PostsList.vue'

export default {
  extends: DefaultTheme,
  enhanceApp({ app, router }: EnhanceAppContext) {
    app.component('PostsList', PostsList)

    if (typeof document === 'undefined') return

    let btn: HTMLButtonElement | null = null

    function ensureBtn() {
      nextTick(() => {
        if (btn || !document.querySelector('.VPSidebar')) return
        btn = document.createElement('button')
        btn.className = 'sidebar-toggle-btn'
        btn.title = '折叠侧边栏'
        btn.innerHTML = '<span class="arrow">◀</span>'

        btn.addEventListener('click', () => {
          const html = document.documentElement
          const collapsed = html.classList.toggle('sidebar-collapsed')
          btn!.querySelector('.arrow')!.textContent = collapsed ? '▶' : '◀'
          btn!.title = collapsed ? '展开侧边栏' : '折叠侧边栏'
        })

        document.body.appendChild(btn)
      })
    }

    ensureBtn()
    watch(() => router.route.path, ensureBtn)
  }
}
