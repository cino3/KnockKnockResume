<template>
  <draggable
    v-model="store.educations"
    item-key="id"
    handle=".drag-handle"
  >
    <template #item="{ element: edu }">
      <ListItemBase>
        <template #header>
          <div class="item-header">
            <el-icon class="drag-handle" :size="16"><GripVertical /></el-icon>
            <span>{{ edu.school }} {{ edu.degree }}</span>
            <el-checkbox v-model="edu.isVisible" size="small" />
          </div>
        </template>
      </ListItemBase>
    </template>
  </draggable>
</template>

<script setup lang="ts">
import { useResumeStore } from '@/stores/resume'
import draggable from 'vuedraggable'
import { GripVertical, Trash2 } from 'lucide-vue-next'
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
