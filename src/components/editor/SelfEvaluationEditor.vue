<template>
  <div class="self-evaluation-editor">
    <BoldTextarea
      v-model="store.selfEvaluation.content"
      placeholder="请输入个人评价，支持换行"
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
.self-evaluation-editor {
  /* 样式已经由 BoldTextarea 组件处理 */
}
</style>
