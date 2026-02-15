<template>
  <div class="sidebar-footer">
    <!-- 左侧：次要操作 -->
    <div class="secondary-actions">
      <el-tooltip content="保存草稿" placement="top">
        <button class="icon-btn" @click="$emit('save')">
          <el-icon><Save :size="18" /></el-icon>
        </button>
      </el-tooltip>

      <el-dropdown trigger="click" placement="top-start">
        <button class="icon-btn">
          <el-icon><MoreHorizontal /></el-icon>
        </button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item @click="$emit('export-json')">
              <el-icon><FileDown :size="16" /></el-icon>
              <span>导出 JSON</span>
            </el-dropdown-item>
            <el-dropdown-item disabled>
              <el-icon><Upload /></el-icon>
              <span>导入简历</span>
            </el-dropdown-item>
            <el-dropdown-item divided @click="$emit('reset')">
              <el-icon><Delete /></el-icon>
              <span style="color:#f56c6c">重置</span>
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>

    <!-- 右侧：主要操作 -->
    <button class="primary-btn" @click="$emit('export-pdf')">
      <el-icon><Download /></el-icon>
      <span class="btn-text">导出 PDF</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { Save, FileDown, Upload, Delete, Download, MoreHorizontal } from 'lucide-vue-next'

defineEmits<{
  save: []
  'export-json': []
  'export-pdf': []
  reset: []
}>()
</script>
