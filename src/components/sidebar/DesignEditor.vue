<template>
  <div class="panel-fade">
    <div class="control-group">
      <div class="control-label">版式</div>
      <div class="template-grid">
        <div
          class="tpl-card"
          :class="{ active: store.theme.layoutMode === 'flow' }"
          @click="handleLayoutModeChange('flow')"
        >
          流式多页
        </div>
        <div
          class="tpl-card"
          :class="{ active: store.theme.layoutMode === 'compact' }"
          @click="handleLayoutModeChange('compact')"
        >
          紧凑一页
        </div>
      </div>
    </div>

    <div class="control-group">
      <div class="control-label">颜色</div>
      <div class="control-item">
        <span class="control-item-label">标题</span>
        <el-color-picker
          v-model="store.theme.primaryColor"
          :predefine="predefineColors"
          size="small"
        />
      </div>
      <div class="control-item">
        <span class="control-item-label">分割线</span>
        <el-color-picker
          v-model="store.theme.dividerColor"
          :predefine="predefineColors"
          size="small"
        />
      </div>
    </div>

    <div class="control-group">
      <div class="control-label">字体</div>
      <div class="control-item">
        <span class="control-item-label">标题大小</span>
        <el-radio-group
          v-model="store.theme.titleFontSize"
          size="small"
          class="font-size-radio-group"
          :class="{ 'compact-locked': isCompactMode }"
          :disabled="isCompactMode"
        >
          <el-radio-button :value="28">S</el-radio-button>
          <el-radio-button :value="29">M</el-radio-button>
          <el-radio-button :value="30">L</el-radio-button>
          <el-radio-button :value="31">XL</el-radio-button>
        </el-radio-group>
      </div>
      <div class="control-item">
        <span class="control-item-label">正文字号</span>
        <el-radio-group
          v-model="store.theme.bodyFontSize"
          size="small"
          class="body-font-size-radio-group"
          :class="{ 'compact-locked': isCompactMode }"
          :disabled="isCompactMode"
        >
          <el-radio-button value="sm">小</el-radio-button>
          <el-radio-button value="md">中</el-radio-button>
          <el-radio-button value="lg">大</el-radio-button>
        </el-radio-group>
      </div>
      <div class="control-item">
        <span class="control-item-label">标题粗细</span>
        <el-radio-group v-model="store.theme.titleFontWeight" size="small" class="font-weight-radio-group">
          <el-radio-button :value="600">细</el-radio-button>
          <el-radio-button :value="800">粗</el-radio-button>
        </el-radio-group>
      </div>
    </div>

    <div class="control-group">
      <div class="control-label">排版</div>
      <div class="control-item">
        <span class="control-item-label">行高</span>
        <el-radio-group
          v-model="store.theme.lineHeight"
          size="small"
          class="line-height-radio-group"
          :class="{ 'compact-locked': isCompactMode }"
          :disabled="isCompactMode"
        >
          <el-radio-button :value="1.6">1</el-radio-button>
          <el-radio-button :value="1.7">2</el-radio-button>
          <el-radio-button :value="1.8">3</el-radio-button>
        </el-radio-group>
      </div>
      <div v-if="isCompactMode" class="control-hint">
        紧凑一页模式已接管字号与行高，并自动优化页面空间。
      </div>
    </div>

    <div class="control-group">
      <div class="control-label">语言</div>
      <div class="template-grid">
        <div 
          class="tpl-card" 
          :class="{ active: store.theme.language === 'zh' }"
          @click="store.theme.language = 'zh'"
        >
          中文
        </div>
        <div 
          class="tpl-card" 
          :class="{ active: store.theme.language === 'en' }"
          @click="store.theme.language = 'en'"
        >
          English
        </div>
      </div>
    </div>

    <div class="control-group" v-if="store.theme.layoutMode === 'flow'">
      <div class="control-label">提示</div>
      <div class="flow-note">
        在“流式多页”的版式下，如果发现页面留白过大：<br>
        1. 可通过“标题大小”补齐视觉上的留白<br>
        2. 可通过“正文字号”、“行高”调整至合适的高度<br>
        3. 可以在多文本框内：跨页后的第一行字的末尾，按下回车键
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useResumeStore } from '@/stores/resume'
import type { LayoutMode } from '@/types/resume'
import { ElMessage } from 'element-plus'

const store = useResumeStore()
const isCompactMode = computed(() => store.theme.layoutMode === 'compact')
const COMPACT_TITLE_FONT_SIZE = 28

function applyCompactModeDefaults() {
  store.theme.titleFontSize = COMPACT_TITLE_FONT_SIZE
}

function handleLayoutModeChange(mode: LayoutMode) {
  if (store.theme.layoutMode === mode) {
    return
  }

  store.theme.layoutMode = mode
  if (mode === 'compact') {
    applyCompactModeDefaults()
    ElMessage.success('已切换至紧凑单页，将自动为你优化空间。')
  }
}

watch(
  () => store.theme.layoutMode,
  (mode) => {
    if (mode === 'compact') {
      applyCompactModeDefaults()
    }
  },
  { immediate: true }
)

// 预定义颜色
const predefineColors = ref([
  '#000000',  // 黑色
  '#465E69',  // 石板蓝
  '#2C3E50',  // 深蓝灰
  '#C0392B',  // 深红
  '#2980B9',  // 蓝色
  '#27AE60',  // 绿色
  '#8E44AD',  // 紫色
  '#D35400'   // 橙色
])
</script>

<style scoped>
/* Compact 组件本身就很紧凑，如果需要进一步调整大小可以在这里添加样式 */
.control-hint {
  margin-top: 8px;
  font-size: 12px;
  color: #8a8a84;
}

.flow-note {
  font-size: 12px;
  line-height: 1.8;
  color: var(--text-secondary);
}

:deep(.compact-locked .el-radio-button__inner) {
  color: #9f9f97 !important;
  background: #f5f5f1 !important;
  border-color: #e3e3db !important;
  box-shadow: none !important;
}

:deep(.compact-locked .el-radio-button.is-active .el-radio-button__inner),
:deep(.compact-locked .el-radio-button__original-radio:checked + .el-radio-button__inner),
:deep(.compact-locked .el-radio-button__original-radio:disabled:checked + .el-radio-button__inner) {
  color: #8e8e85 !important;
  background: #efefe9 !important;
  border-color: #ddddd3 !important;
  box-shadow: none !important;
}
</style>
