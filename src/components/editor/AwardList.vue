<template>
  <div class="awards-editor">
    <BoldTextarea
      v-model="store.awards.content"
      placeholder="请输入获奖经历，每行一个奖项"
      :rows="8"
    />
  </div>
</template>

<script setup lang="ts">
import { useResumeStore } from '@/stores/resume'
import BoldTextarea from './BoldTextarea.vue'

const store = useResumeStore()
</script>

<style scoped>
.awards-editor {
  /* 样式已经由 BoldTextarea 组件处理 */
}
</style>
