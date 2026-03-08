<template>
  <div v-if="isMobileDevice" class="mobile-guide">
    <div class="mobile-brand">
      <img class="mobile-brand-logo" :src="logoUrl" alt="KnockKnock logo" />
      <span class="mobile-brand-text">KnockKnock</span>
    </div>
    <p class="mobile-guide-text">移动端暂时不支持使用噢，请使用 PC 端打开。</p>
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

const detectMobileDevice = () => {
  const ua = navigator.userAgent || ''
  const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Windows Phone|Mobile/i.test(ua)
  const isIPadOS = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1
  isMobileDevice.value = isMobileUA || isIPadOS
}

onMounted(() => {
  detectMobileDevice()
})
</script>

<style scoped>
.mobile-guide {
  min-height: 100vh;
  background: var(--app-bg);
  padding: 20px;
}

.mobile-brand {
  display: flex;
  align-items: center;
  gap: 8px;
}

.mobile-brand-logo {
  width: 37px;
  height: 37px;
  object-fit: contain;
}

.mobile-brand-text {
  font-family: var(--font-serif);
  font-weight: 700;
  color: var(--primary-color);
  font-size: 22px;
  letter-spacing: -0.5px;
}

.mobile-guide-text {
  margin-top: 14px;
  color: var(--text-secondary);
  font-size: 14px;
  line-height: 1.6;
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
