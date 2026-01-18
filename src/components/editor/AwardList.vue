<template>
  <div class="awards-editor">
    <el-form label-width="80px" size="small">
      <el-form-item label="获奖经历">
        <el-input
          v-model="store.awards.content"
          type="textarea"
          :rows="8"
          placeholder="请输入获奖经历，每行一个奖项"
        />
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { useResumeStore } from '@/stores/resume'

const store = useResumeStore()
</script>

<style scoped>
.awards-editor {
  padding: 12px;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  background: #fafafa;
}
</style>
