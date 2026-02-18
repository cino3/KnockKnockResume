import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

// 样式导入顺序非常重要！
// 1. 基础变量（CSS 变量定义）
import './styles/variables.scss'

// 2. Element Plus 完整样式
import 'element-plus/dist/index.css'

// 3. Element Plus 样式覆盖（在 element-plus 之后，确保覆盖）
import './styles/element-plus-overrides.scss'

// 4. 项目全局样式
import './style.css'

// 5. 其他全局覆盖
import './styles/global-overrides.scss'
import './styles/sidebar.scss'

import App from './App.vue'

const app = createApp(App)
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

app.use(pinia)
app.mount('#app')

