<template>
  <div class="toolbar">
    <el-button
      size="small"
      type="primary"
      text
      :class="{ 'is-active': isBold }"
      @click="$emit('toggle-bold')"
    >
      <template #icon>
        <Bold :size="14" />
      </template>
    </el-button>
    <el-button
      size="small"
      type="primary"
      text
      @click="$emit('insert-bullet')"
    >
      <template #icon>
        <List :size="14" />
      </template>
    </el-button>
  </div>
</template>

<script setup lang="ts">
import { Bold, List } from 'lucide-vue-next'

defineProps<{
  isBold: boolean
}>()

defineEmits<{
  'toggle-bold': []
  'insert-bullet': []
}>()
</script>
