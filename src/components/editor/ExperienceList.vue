<template>
  <draggable
    v-model="store.experiences"
    item-key="id"
    handle=".drag-handle"
    class="draggable-list"
  >
    <template #item="{ element: exp }">
      <div class="list-item">
        <div class="item-header">
          <GripVertical class="drag-handle" :size="16" />
          <el-checkbox v-model="exp.isVisible" />
          <el-button
            type="danger"
            size="small"
            text
            @click="store.removeExperience(exp.id)"
          >
            <template #icon>
              <Trash2 :size="14" />
            </template>
          </el-button>
        </div>
        <el-form :model="exp" label-width="80px" size="small" class="ghost-form horizontal-form">
          <el-form-item label="公司">
            <el-input v-model="exp.company" placeholder="公司名称" />
          </el-form-item>
          <el-form-item label="职位">
            <el-input v-model="exp.position" placeholder="职位名称" />
          </el-form-item>
          <el-form-item label="开始时间">
            <el-input
              v-model="exp.startDate"
              placeholder="2021-01"
              size="small"
            />
          </el-form-item>
          <el-form-item label="结束时间">
            <el-input
              v-model="exp.endDate"
              placeholder="2024-12 或留空表示至今"
              size="small"
            />
          </el-form-item>
          <el-form-item label="描述">
            <BoldTextarea
              v-model="exp.description"
              placeholder="工作内容描述，支持换行和加粗"
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
</style>

