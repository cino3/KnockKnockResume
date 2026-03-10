<template>
  <div class="published-articles-editor">
    <BoldTextarea
      v-model="store.publishedArticles.content"
      placeholder="请输入发表文章，支持换行"
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
.published-articles-editor {
  /* 样式已经由 BoldTextarea 组件处理 */
}
</style>
