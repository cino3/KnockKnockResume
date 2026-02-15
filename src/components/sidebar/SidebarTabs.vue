<template>
  <div class="tab-nav">
    <div
      class="tab-item"
      :class="{ active: modelValue === 'content' }"
      @click="$emit('update:modelValue', 'content')"
    >
      <el-icon :size="18"><Pencil /></el-icon>
      <span class="tab-text">编辑</span>
    </div>

    <div
      class="tab-item"
      :class="{ active: modelValue === 'design' }"
      @click="$emit('update:modelValue', 'design')"
    >
      <el-icon :size="18"><Palette /></el-icon>
      <span class="tab-text">样式</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Pencil, Palette } from 'lucide-vue-next'

defineProps<{
  modelValue: 'content' | 'design'
}>()

defineEmits<{
  'update:modelValue': [value: 'content' | 'design']
}>()
</script>
