<template>
  <div class="preview-container">
    <!-- 缩放控制器 -->
    <div class="scale-control">
      <span>缩放: {{ Math.round(scale * 100) }}%</span>
      <el-slider
        v-model="scale"
        :min="0.5"
        :max="1.5"
        :step="0.1"
        style="width: 200px; margin: 0 12px;"
      />
    </div>

    <!-- 简历内容 - 使用分页容器 -->
    <div class="resume-pages-container" :style="{ transform: `scale(${scale})`, transformOrigin: 'top center' }">
      <!-- 隐藏的测量容器，用于计算内容高度 -->
      <div ref="measureRef" class="resume-paper measure-container" :style="resumeStyle">
        <ResumeContent />
      </div>
      
      <!-- 打印时显示的完整内容容器 -->
      <div id="resume-preview-content" class="resume-paper print-container" :style="resumeStyle">
        <ResumeContent />
      </div>
      
      <!-- 屏幕上显示的页面容器 -->
      <template v-for="pageIndex in pages" :key="pageIndex">
        <div
          class="resume-paper screen-page"
          :class="{ 'page-break': pageIndex < pages }"
          :style="resumeStyle"
        >
          <div class="page-content-wrapper" :style="getPageContentStyle(pageIndex)">
            <ResumeContent />
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { useResumeStore } from '@/stores/resume'
import ResumeContent from './ResumeContent.vue'

const store = useResumeStore()
const scale = ref(1)
const measureRef = ref<HTMLElement | null>(null)
const pages = ref<number>(1)

const resumeStyle = computed(() => {
  return {
    '--primary': store.theme.primaryColor,
    '--line-height': store.theme.lineHeight,
    '--paragraph-spacing': `${store.theme.paragraphSpacing}px`
  }
})

// 计算页面数量（A4高度为297mm，减去上下padding 20mm*2 = 40mm，实际内容高度为257mm）
function calculatePages() {
  nextTick(() => {
    if (!measureRef.value) return
    
    const contentHeight = measureRef.value.scrollHeight
    // A4页面内容区域高度：297mm - 40mm (上下padding) = 257mm
    // 转换为像素：257mm * 3.779527559 = 约971px (96 DPI)
    const pageContentHeight = 971 // 257mm in pixels at 96 DPI
    const calculatedPages = Math.max(1, Math.ceil(contentHeight / pageContentHeight))
    pages.value = calculatedPages
  })
}

// 获取每页内容的样式
function getPageContentStyle(pageIndex: number) {
  // 每页内容高度为971px (257mm)
  const pageContentHeight = 971
  const offset = (pageIndex - 1) * pageContentHeight
  return {
    transform: `translateY(-${offset}px)`
  }
}

// 监听内容变化，重新计算页面数
watch(
  [() => store.profile, () => store.experiences, () => store.projects, () => store.educations, () => store.theme],
  () => {
    calculatePages()
  },
  { deep: true }
)

onMounted(() => {
  calculatePages()
})
</script>

<style scoped>
.preview-container {
  position: relative;
  width: 100%;
  height: 100%;
}

.scale-control {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 100;
  display: flex;
  align-items: center;
  background: white;
  padding: 12px 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  font-size: 14px;
}

.resume-pages-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  padding: 20px 0;
  width: 100%;
}

.resume-paper {
  width: 210mm;
  height: 297mm;
  background: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 20mm;
  margin: 0;
  color: #333;
  font-family: var(--font-family, 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif');
  line-height: var(--line-height, 1.6);
  box-sizing: border-box;
  page-break-after: always;
  break-after: page;
  position: relative;
}

/* 隐藏的测量容器 */
.measure-container {
  position: absolute;
  visibility: hidden;
  height: auto;
  overflow: visible;
  box-shadow: none;
  z-index: -1;
}

/* 打印时显示的完整内容容器 - 屏幕上隐藏 */
.print-container {
  display: none;
  overflow: visible;
  height: auto;
  min-height: 297mm;
  padding: 20mm;
  box-sizing: border-box;
  position: relative;
}

/* 屏幕上显示的页面容器 */
.screen-page {
  display: block;
  overflow: hidden;
}

/* 确保打印容器在屏幕上完全隐藏 */
@media screen {
  .print-container {
    display: none !important;
    visibility: hidden !important;
  }
}

/* 页面内容包装器 */
.page-content-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  width: 100%;
  padding: 20mm;
  box-sizing: border-box;
}

.resume-header {
  border-bottom: 2px solid var(--primary, #2563eb);
  padding-bottom: 16px;
  margin-bottom: 24px;
}

.name {
  font-size: 32px;
  font-weight: 700;
  color: var(--primary, #2563eb);
  margin-bottom: 8px;
}

.title {
  font-size: 18px;
  color: #666;
  margin-bottom: 12px;
}

.contact-info {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  font-size: 14px;
  color: #666;
}

.contact-info span {
  display: flex;
  align-items: center;
  gap: 4px;
}

.resume-section {
  margin-bottom: 32px;
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--primary, #2563eb);
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e5e7eb;
}

.section-content {
  color: #555;
  white-space: pre-wrap;
  margin-bottom: var(--paragraph-spacing, 8px);
}

.experience-item,
.project-item,
.education-item {
  margin-bottom: 24px;
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}

.item-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.item-subtitle {
  font-size: 14px;
  color: #666;
}

.item-date {
  font-size: 14px;
  color: #999;
  white-space: nowrap;
}

.item-description {
  color: #555;
  white-space: pre-wrap;
  margin-top: 8px;
  line-height: var(--line-height, 1.6);
}

@media print {
  .scale-control {
    display: none;
  }

  .measure-container {
    display: none;
  }

  .resume-pages-container {
    gap: 0;
    padding: 0;
  }
}
</style>
