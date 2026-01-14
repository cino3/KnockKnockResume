<template>
  <div class="app-container">
    <!-- 左侧编辑器 -->
    <div class="editor-panel">
      <Editor />
    </div>
    
    <!-- 右侧预览区 -->
    <div class="preview-panel">
      <Preview />
    </div>
  </div>
</template>

<script setup lang="ts">
import Editor from './components/Editor.vue'
import Preview from './components/Preview.vue'
</script>

<style scoped>
.app-container {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

.editor-panel {
  width: 400px;
  flex-shrink: 0;
  background: #fff;
  border-right: 1px solid #e5e7eb;
  overflow-y: auto;
}

.preview-panel {
  flex: 1;
  background: #525659;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 0;
}
</style>

