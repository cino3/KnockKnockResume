<template>
  <div class="self-evaluation-editor">
    <el-form label-width="80px" size="small">
      <el-form-item label="个人评价">
        <el-input
          v-model="store.selfEvaluation.content"
          type="textarea"
          :rows="8"
          placeholder="请输入个人评价，支持换行"
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
.self-evaluation-editor {
  padding: 12px;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  background: #fafafa;
}
</style>
