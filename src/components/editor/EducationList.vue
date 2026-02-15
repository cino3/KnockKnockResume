<template>
  <draggable
    v-model="store.educations"
    item-key="id"
    handle=".drag-handle"
    class="draggable-list"
  >
    <template #item="{ element: edu }">
      <div class="list-item">
        <div class="item-header">
          <GripVertical class="drag-handle" :size="16" />
          <el-checkbox v-model="edu.isVisible" />
          <el-button
            type="danger"
            size="small"
            text
            @click="store.removeEducation(edu.id)"
          >
            <template #icon>
              <Trash2 :size="14" />
            </template>
          </el-button>
        </div>
        <el-form :model="edu" label-width="80px" size="small" class="ghost-form horizontal-form">
          <el-form-item label="学校">
            <el-input v-model="edu.school" placeholder="学校名称" />
          </el-form-item>
          <el-form-item label="专业">
            <el-input v-model="edu.major" placeholder="专业名称" />
          </el-form-item>
          <el-form-item label="学位">
            <el-input v-model="edu.degree" placeholder="学位/学历" />
          </el-form-item>
          <el-form-item label="开始时间">
            <el-input
              v-model="edu.startDate"
              placeholder="2021-09"
              size="small"
            />
          </el-form-item>
          <el-form-item label="结束时间">
            <el-input
              v-model="edu.endDate"
              placeholder="2024-06 或留空表示至今"
              size="small"
            />
          </el-form-item>
        </el-form>
      </div>
    </template>
  </draggable>
</template>

<script setup lang="ts">
import { useResumeStore } from '@/stores/resume'
import draggable from 'vuedraggable'
import { GripVertical, Trash2 } from 'lucide-vue-next'
import BoldTextarea from './BoldTextarea.vue'
import ListItemBase from '@/components/shared/ListItemBase.vue'

const store = useResumeStore()
</script>

<style scoped>
.draggable-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.list-item {
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  padding: 12px;
  background: #fafafa;
}

.item-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e5e7eb;
}

.drag-handle {
  cursor: move;
  color: #9ca3af;
}

.drag-handle:hover {
  color: #6b7280;
}
</style>
