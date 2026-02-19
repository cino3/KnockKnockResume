<template>
  <div class="app-container">
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
import Sidebar from './components/Sidebar.vue'
import Preview from './components/Preview.vue'
import SponsorButton from './components/SponsorButton.vue'
</script>

<style scoped>
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

