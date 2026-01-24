import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import './style.css'
import './styles/variables.scss'
import './styles/element-plus-overrides.scss'
import './styles/global-overrides.scss'
import App from './App.vue'

// 全局注册 Element Plus 图标
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

const app = createApp(App)
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

// 注册所有图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(pinia)
app.use(ElementPlus)
app.mount('#app')

