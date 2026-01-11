<template>
  <div class="preview-container">
    <!-- 缩放控制器 -->
    <div class="scale-control">
      <span>缩放: {{ Math.round(scale * 100) }}%</span>
      <el-slider v-model="scale" :min="0.5" :max="1.5" :step="0.1" style="width: 200px; margin: 0 12px;" />
    </div>

    <!-- 简历页面容器 -->
    <div class="resume-pages-container" :style="{ transform: `scale(${scale})`, transformOrigin: 'top center' }">

      <!-- 1. 测量容器 (永远隐藏，仅用于计算) -->
      <div ref="measureRef" class="resume-paper measure-container" :style="resumeStyle">
        <ResumeContent />
      </div>

      <!-- 2. 打印专用容器 (打印时使用，包含完整内容) -->
      <div class="print-only-container" :style="resumeStyle">
        <ResumeContent />
      </div>

      <!-- 调试信息 -->
      <div style="position: fixed; top: 80px; left: 20px; background: white; padding: 10px; border-radius: 4px; font-size: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); z-index: 100;">
        <strong>📏 分页参数</strong><br>
        MAX_CONTENT_HEIGHT: {{ MAX_CONTENT_HEIGHT }}px<br>
        A4_HEIGHT_PX: {{ A4_HEIGHT_PX }}px<br>
        PAGE_PADDING_Y: {{ PAGE_PADDING_Y }}px<br>
        SAFETY_MARGIN: {{ SAFETY_MARGIN }}px<br>
        <strong>⚠️ 已增加安全边距至 80px</strong>
      </div>

      <!-- 3. 真实渲染的分页 (JS 计算结果，仅屏幕预览) -->
      <div
        v-for="(page, index) in renderPages"
        :key="index"
        class="resume-paper screen-page"
        :style="resumeStyle"
      >
        <div :id="`page-content-${index}`" class="page-content-wrapper"></div>
        <div class="page-number">{{ index + 1 }} / {{ renderPages.length }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, watch, onMounted } from 'vue'
import { useResumeStore } from '@/stores/resume'
import ResumeContent from './ResumeContent.vue'

const store = useResumeStore()
const scale = ref(1)
const measureRef = ref<HTMLElement | null>(null)
const renderPages = ref<number[]>([1])

const resumeStyle = computed(() => ({
  '--primary': store.theme.primaryColor,
  '--line-height': store.theme.lineHeight,
  '--paragraph-spacing': `${store.theme.paragraphSpacing}px`
}))

// A4 规格 (96 DPI)
const A4_HEIGHT_PX = 1123
const PAGE_PADDING_Y = 150 // 约 20mm * 2
// 关键修复：大幅增加安全边距，确保底部留白
const SAFETY_MARGIN = 80 // 额外的安全边距（像素）
const MAX_CONTENT_HEIGHT = A4_HEIGHT_PX - PAGE_PADDING_Y - SAFETY_MARGIN // 893px

/**
 * 深度优先分页算法 (按行拆分)
 */
async function calculatePages() {
  await nextTick()
  if (!measureRef.value) return

  const sourceRoot = measureRef.value
  const pagesData: HTMLElement[][] = []

  let currentPageNodes: HTMLElement[] = []
  let currentHeight = 0

  const startNewPage = () => {
    if (currentPageNodes.length > 0) pagesData.push(currentPageNodes)
    currentPageNodes = []
    currentHeight = 0
  }

  const getOuterHeight = (el: HTMLElement) => {
    const style = window.getComputedStyle(el)
    const marginTop = parseFloat(style.marginTop || '0')
    const marginBottom = parseFloat(style.marginBottom || '0')
    const paddingTop = parseFloat(style.paddingTop || '0')
    const paddingBottom = parseFloat(style.paddingBottom || '0')
    // 计算完整的外部高度：offsetHeight + margin
    // offsetHeight 已经包含了 padding 和 border
    // 增加更大的安全缓冲（从 +2 增加到 +5）来确保不会溢出
    return el.offsetHeight + marginTop + marginBottom + 5 // +5 作为额外的安全边距
  }

  const topLevelNodes = Array.from(sourceRoot.children) as HTMLElement[]

  for (const sectionNode of topLevelNodes) {
    const isSection = sectionNode.classList.contains('resume-section')

    // 非 Section 节点 (如 Header)
    if (!isSection) {
      const h = getOuterHeight(sectionNode)
      if (currentHeight + h > MAX_CONTENT_HEIGHT && currentHeight > 0) startNewPage()
      currentPageNodes.push(sectionNode.cloneNode(true) as HTMLElement)
      currentHeight += h
      continue
    }

    // Section 节点：深入内部拆分
    let currentSectionWrapper = sectionNode.cloneNode(false) as HTMLElement
    currentPageNodes.push(currentSectionWrapper)

    const sectionChildren = Array.from(sectionNode.children) as HTMLElement[]

    for (const childNode of sectionChildren) {
      const isItem = childNode.classList.contains('experience-item') ||
                     childNode.classList.contains('project-item') ||
                     childNode.classList.contains('education-item')
      const isContent = childNode.classList.contains('section-content')

      if (isItem || isContent) {
        // 创建 Item Wrapper
        let currentItemWrapper = childNode.cloneNode(false) as HTMLElement
        currentSectionWrapper.appendChild(currentItemWrapper)

        // 递归收集所有原子元素 (Header, Text Lines)
        const atoms: HTMLElement[] = []
        const traverseAtoms = (node: HTMLElement) => {
           if (node.classList.contains('item-header') || node.classList.contains('text-line')) {
             atoms.push(node)
           } else if (node.children.length > 0) {
             Array.from(node.children).forEach(c => traverseAtoms(c as HTMLElement))
           } else {
             atoms.push(node)
           }
        }
        traverseAtoms(childNode)

        // 逐个放入原子元素
        for (const atom of atoms) {
          const atomHeight = getOuterHeight(atom)

          if (currentHeight + atomHeight > MAX_CONTENT_HEIGHT) {
            startNewPage()
            // 换页后重建层级：Section -> Item
            currentSectionWrapper = sectionNode.cloneNode(false) as HTMLElement
            currentPageNodes.push(currentSectionWrapper)
            currentItemWrapper = childNode.cloneNode(false) as HTMLElement
            currentSectionWrapper.appendChild(currentItemWrapper)
          }

          currentItemWrapper.appendChild(atom.cloneNode(true))
          currentHeight += atomHeight
        }
      } else {
        // 普通子元素 (如 Section Title)
        const h = getOuterHeight(childNode)
        if (currentHeight + h > MAX_CONTENT_HEIGHT) {
          startNewPage()
          currentSectionWrapper = sectionNode.cloneNode(false) as HTMLElement
          currentPageNodes.push(currentSectionWrapper)
        }
        currentSectionWrapper.appendChild(childNode.cloneNode(true))
        currentHeight += h
      }
    }
  }

  if (currentPageNodes.length > 0) pagesData.push(currentPageNodes)
  renderPages.value = pagesData.length > 0 ? Array(pagesData.length).fill(1) : [1]

  await nextTick()
  pagesData.forEach((nodes, index) => {
    const container = document.getElementById(`page-content-${index}`)
    if (container) {
      container.innerHTML = ''
      nodes.forEach(node => container.appendChild(node))
    }
  })
}

watch([() => store.profile, () => store.experiences, () => store.projects, () => store.educations, () => store.theme], () => { calculatePages() }, { deep: true })
onMounted(() => { setTimeout(calculatePages, 500) })
</script>

<style scoped>
/* ================= 预览样式 ================= */
.preview-container {
  position: relative; width: 100%; height: 100%;
  background: #525659; overflow: auto;
}
.scale-control {
  position: fixed; top: 20px; right: 20px; z-index: 100;
  display: flex; align-items: center; background: white;
  padding: 12px 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
.resume-pages-container {
  display: flex; flex-direction: column; align-items: center;
  gap: 20px; padding: 40px 0; width: 100%;
}
.resume-paper {
  width: 210mm; height: 297mm; background: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15); margin: 0;
  box-sizing: border-box; text-align: left;
}

/* 测量容器：永远隐藏 */
.measure-container {
  position: absolute; top: 0; left: 0; visibility: hidden; z-index: -100;
  height: auto !important; min-height: 297mm; padding: 20mm;
}

/* 打印专用容器：屏幕隐藏 */
.print-only-container {
  display: none;
  height: auto;
  min-height: 297mm;
  padding: 20mm;
  box-sizing: border-box;
  background: white;
}

/* 屏幕预览页面 */
.screen-page {
  position: relative;
  overflow: hidden;
}
.page-content-wrapper {
  width: 100%; height: 100%; padding: 20mm; box-sizing: border-box;
}
.page-number {
  position: absolute; bottom: 10px; right: 20px;
  font-size: 12px; color: #999; pointer-events: none;
}

/* Copy styles from ResumeContent */
.page-content-wrapper :deep(.resume-header) {
  border-bottom: 2px solid var(--primary, #2563eb); padding-bottom: 16px; margin-bottom: 24px;
}
.page-content-wrapper :deep(.name) {
  font-size: 32px; font-weight: 700; color: var(--primary, #2563eb); margin-bottom: 8px;
}
.page-content-wrapper :deep(.title) {
  font-size: 18px; color: #666; margin-bottom: 12px;
}
.page-content-wrapper :deep(.contact-info) {
  display: flex; flex-wrap: wrap; gap: 16px; font-size: 14px; color: #666;
}
.page-content-wrapper :deep(.contact-info span) {
  display: flex; align-items: center; gap: 4px;
}
.page-content-wrapper :deep(.resume-section) {
  margin-bottom: 32px;
}
.page-content-wrapper :deep(.section-title) {
  font-size: 20px; font-weight: 600; color: var(--primary, #2563eb); margin-bottom: 16px; padding-bottom: 8px; border-bottom: 1px solid #e5e7eb;
}
.page-content-wrapper :deep(.section-content) {
  margin-bottom: var(--paragraph-spacing, 8px);
}
.page-content-wrapper :deep(.experience-item),
.page-content-wrapper :deep(.project-item),
.page-content-wrapper :deep(.education-item) {
  margin-bottom: 24px;
}
.page-content-wrapper :deep(.item-header) {
  display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;
}
.page-content-wrapper :deep(.item-title) {
  font-size: 16px; font-weight: 600; color: #333; margin-bottom: 4px;
}
.page-content-wrapper :deep(.item-subtitle) {
  font-size: 14px; color: #666;
}
.page-content-wrapper :deep(.item-date) {
  font-size: 14px; color: #999; white-space: nowrap;
}
.page-content-wrapper :deep(.item-description-wrapper) {
  margin-top: 8px;
}
.page-content-wrapper :deep(.text-line) {
  color: #555; line-height: var(--line-height, 1.6); min-height: 1.6em; white-space: pre-wrap;
}

/* ================= 打印样式 (使用打印专用容器) ================= */
@media print {
  /* 设置打印页边距：20mm 基础边距 + 21mm 安全边距（80px at 96dpi）= 41mm 总边距 */
  @page {
    margin: 20mm 20mm 41mm 20mm; /* 上 右 下 左 - 下边距增加 21mm 安全边距 */
    size: A4;
  }

  /* 隐藏不需要的元素 */
  .scale-control,
  .measure-container,
  .page-number,
  .screen-page {
    display: none !important;
  }

  /* 显示打印专用容器 */
  .print-only-container {
    display: block !important;
  }

  /* 重置容器样式 */
  .preview-container {
    background: white !important;
    position: static !important;
    width: 100% !important;
    height: auto !important;
    margin: 0 !important;
    padding: 0 !important;
    overflow: visible !important;
  }

  /* 核心修复：取消缩放和间距 */
  .resume-pages-container {
    transform: none !important;
    width: 100% !important;
    margin: 0 !important;
    padding: 0 !important;
    display: block !important;
    gap: 0 !important;
  }

  /* 打印容器样式：移除 padding，由 @page margin 提供边距 */
  .print-only-container {
    width: 100%;
    box-shadow: none !important;
    margin: 0 !important;
    padding: 0 !important; /* 重要：移除内部 padding，使用 @page margin */
    box-sizing: border-box;
  }

  /* 确保背景色打印 */
  * {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  /* 打印分页：使用浏览器原生分页 */
  .print-only-container .resume-section {
    break-inside: avoid;
    page-break-inside: avoid;
  }

  .print-only-container .experience-item,
  .print-only-container .project-item,
  .print-only-container .education-item {
    break-inside: avoid;
    page-break-inside: avoid;
  }

  .print-only-container .text-line {
    break-inside: avoid;
    page-break-inside: avoid;
  }
}
</style>
