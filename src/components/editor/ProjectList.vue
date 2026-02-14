<template>
  <draggable
    v-model="store.projects"
    item-key="id"
    handle=".drag-handle"
    class="draggable-list"
  >
    <template #item="{ element: proj }">
      <div class="list-item">
        <div class="item-header">
          <GripVertical class="drag-handle" :size="16" />
          <el-checkbox v-model="proj.isVisible" />
          <el-button
            type="danger"
            size="small"
            text
            @click="store.removeProject(proj.id)"
          >
            <template #icon>
              <Trash2 :size="14" />
            </template>
          </el-button>
        </div>
        <el-form :model="proj" label-width="80px" size="small" class="ghost-form horizontal-form">
          <el-form-item label="项目名称">
            <el-input v-model="proj.name" placeholder="项目名称" />
          </el-form-item>
          <el-form-item label="角色">
            <el-input v-model="proj.role" placeholder="担任角色" />
          </el-form-item>
          <el-form-item label="开始时间">
            <el-input
              v-model="proj.startDate"
              placeholder="2021-01"
              size="small"
            />
          </el-form-item>
          <el-form-item label="结束时间">
            <el-input
              v-model="proj.endDate"
              placeholder="2024-12 或留空表示至今"
              size="small"
            />
          </el-form-item>
          <el-form-item label="描述">
            <BoldTextarea
              v-model="proj.description"
              placeholder="项目描述，支持换行和加粗"
              :rows="4"
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

.date-range {
  display: flex;
  align-items: center;
  width: 100%;
}
</style>

