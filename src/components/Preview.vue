<template>
  <div class="preview-container">
    <!-- 简历页面容器 -->
    <div
      class="resume-pages-container"
      :style="pagesContainerStyle"
    >
      <!-- 1. 测量容器 (永远隐藏，仅用于计算) -->
      <MeasureContainer ref="measureContainerRef" />

      <!-- 2. 打印专用容器 (打印时使用，包含完整内容) -->
      <PrintContainer />

      <!-- 3. 真实渲染的分页 (JS 计算结果，仅屏幕预览) -->
      <PageRenderer :render-pages="renderPages" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useResumeStore } from '@/stores/resume'
import { usePagination } from '@/composables/usePagination'
import MeasureContainer from './preview/MeasureContainer.vue'
import PrintContainer from './preview/PrintContainer.vue'
import PageRenderer from './preview/PageRenderer.vue'

const store = useResumeStore()
const measureContainerRef = ref<InstanceType<typeof MeasureContainer>>()
const { renderPages, calculatePages } = usePagination()

// `transform: scale()` 不会影响布局尺寸，滚动高度仍按未缩放计算，会导致"还能往下滚一大截空白"
// 优先使用 `zoom`（Chromium 支持）让布局尺寸随缩放同步变化；不支持时再 fallback 到 transform。
const supportsZoom = ref(false)

const pagesContainerStyle = computed(() => {
  if (supportsZoom.value) {
    return {
      zoom: String(store.previewScale)
    } as Record<string, string>
  }
  return {
    transform: `scale(${store.previewScale})`,
    transformOrigin: 'top center'
  } as Record<string, string>
})

// ================= 监听与生命周期 =================
watch(
  [() => store.profile, () => store.experiences, () => store.projects, () => store.educations, () => store.awards, () => store.selfEvaluation, () => store.theme],
  () => {
    calculatePages(measureContainerRef.value?.measureRef || null)
  },
  { deep: true }
)

onMounted(() => {
  supportsZoom.value = typeof CSS !== 'undefined' && typeof CSS.supports === 'function' && CSS.supports('zoom', '1')
  setTimeout(() => calculatePages(measureContainerRef.value?.measureRef || null), 500)
})
</script>

<style>
@import '@/styles/preview.scss';
</style>
