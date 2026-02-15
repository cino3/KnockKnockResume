<template>
  <div class="sidebar-toggle" @click="$emit('toggle')">
    <el-icon size="12">
      <ArrowRight v-if="isCollapsed" />
      <ArrowLeft v-else />
    </el-icon>
  </div>
</template>

<script setup lang="ts">
import { ArrowRight, ArrowLeft } from 'lucide-vue-next'

defineProps<{
  isCollapsed: boolean
}>()

defineEmits<{
  toggle: []
}>()
</script>
