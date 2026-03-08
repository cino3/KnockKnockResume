<template>
  <div v-if="isMobileDevice" class="mobile-guide">
    <div class="mobile-brand">
      <img class="mobile-brand-logo" :src="logoUrl" alt="KnockKnock logo" />
      <span class="mobile-brand-text">KnockKnock</span>
    </div>
    <p class="mobile-guide-text">看来这扇门只能在 PC 端上打开呢</p>
    <button type="button" class="mobile-copy-btn" @click="copyCurrentLink">
      {{ copied ? '已复制链接' : '复制链接，去PC上打开' }}
    </button>
  </div>

  <div v-else class="app-container">
    <!-- 左侧：新侧边栏 -->
    <Sidebar />

    <!-- 右侧预览区 -->
    <div class="preview-panel">
      <Preview />
    </div>

    <!-- 打赏按钮 -->
    <SponsorButton />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import Sidebar from './components/Sidebar.vue'
import Preview from './components/Preview.vue'
import SponsorButton from './components/SponsorButton.vue'
import logoUrl from '@/assets/logo0220.png'

const isMobileDevice = ref(false)
const copied = ref(false)
const detectMobileDevice = () => {
  const ua = navigator.userAgent || ''
  const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Windows Phone|Mobile/i.test(ua)
  const isIPadOS = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1
  isMobileDevice.value = isMobileUA || isIPadOS
}

const copyCurrentLink = async () => {
  const url = 'https://www.knockknockresume.top/'

  try {
    await navigator.clipboard.writeText(url)
  } catch {
    const textArea = document.createElement('textarea')
    textArea.value = url
    textArea.setAttribute('readonly', 'true')
    textArea.style.position = 'fixed'
    textArea.style.opacity = '0'
    document.body.appendChild(textArea)
    textArea.select()
    document.execCommand('copy')
    document.body.removeChild(textArea)
  }

  copied.value = true
  window.setTimeout(() => {
    copied.value = false
  }, 1800)
}

onMounted(() => {
  detectMobileDevice()
})
</script>

<style scoped>
.mobile-guide {
  min-height: 100vh;
  background: #fff;
  padding: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.mobile-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 18px;
}

.mobile-brand-logo {
  width: 64px;
  height: 64px;
  object-fit: contain;
}

.mobile-brand-text {
  font-family: var(--font-serif);
  font-weight: 700;
  color: var(--primary-color);
  font-size: 40px;
  line-height: 1;
  letter-spacing: -0.8px;
}

.mobile-guide-text {
  max-width: 360px;
  color: var(--primary-color);
  font-family: var(--font-serif);
  font-size: 20px;
  font-weight: 700;
  line-height: 1.5;
}

.mobile-copy-btn {
  margin-top: 18px;
  border: none;
  border-radius: 8px;
  background: var(--primary-color);
  color: #fff;
  font-family: var(--font-serif);
  font-size: 16px;
  font-weight: 700;
  padding: 12px 18px;
  cursor: pointer;
}

.app-container {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

.preview-panel {
  flex: 1;
  background: var(--app-bg);
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 0;
}
</style>
