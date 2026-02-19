<template>
  <div class="panel-fade">
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
        <el-radio-group v-model="store.theme.titleFontSize" size="small" class="font-size-radio-group">
          <el-radio-button :value="28">S</el-radio-button>
          <el-radio-button :value="29">M</el-radio-button>
          <el-radio-button :value="30">L</el-radio-button>
          <el-radio-button :value="31">XL</el-radio-button>
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
        <el-radio-group v-model="store.theme.lineHeight" size="small" class="line-height-radio-group">
          <el-radio-button :value="1.6">1</el-radio-button>
          <el-radio-button :value="1.7">2</el-radio-button>
          <el-radio-button :value="1.8">3</el-radio-button>
        </el-radio-group>
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
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useResumeStore } from '@/stores/resume'

const store = useResumeStore()

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
</style>
