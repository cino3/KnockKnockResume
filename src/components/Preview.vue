<template>
  <div class="preview-container">
    <!-- 简历页面容器 -->
    <div class="resume-pages-container" :style="{ transform: `scale(${store.previewScale})`, transformOrigin: 'top center' }">

      <!-- 1. 测量容器 (永远隐藏，仅用于计算) -->
      <div ref="measureRef" class="resume-paper measure-container" :style="resumeStyle">
        <ResumeContent />
      </div>

      <!-- 2. 打印专用容器 (打印时使用，包含完整内容) -->
      <div class="print-only-container" :style="resumeStyle">
        <ResumeContent />
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
const measureRef = ref<HTMLElement | null>(null)
const renderPages = ref<number[]>([1])

const resumeStyle = computed(() => ({
  '--primary': store.theme.primaryColor,
  '--line-height': store.theme.lineHeight,
  '--paragraph-spacing': `${store.theme.paragraphSpacing}px`
}))

// ================= 常量定义 =================
const A4_HEIGHT_PX = 1123 // A4 高度 (96 DPI)
const PAGE_PADDING_Y = 91  // 上下边距之和: 9mm + 15mm ≈ 91px
const MAX_CONTENT_HEIGHT = A4_HEIGHT_PX - PAGE_PADDING_Y
const SAFETY_BUFFER = 5    // 额外安全边距，防止溢出

// ================= 类型定义 =================
type ClassList = string[]

// ================= 工具函数 =================
const getItemClassNames = (): ClassList => [
  'experience-item',
  'project-item',
  'education-item'
]

const getAtomClassNames = (): ClassList => [
  'item-header',
  'text-line'
]

const getOuterHeight = (el: HTMLElement): number => {
  const style = window.getComputedStyle(el)
  const marginTop = parseFloat(style.marginTop || '0')
  const marginBottom = parseFloat(style.marginBottom || '0')
  return el.offsetHeight + marginTop + marginBottom + SAFETY_BUFFER
}

const collectAtoms = (node: HTMLElement): HTMLElement[] => {
  const atoms: HTMLElement[] = []
  const atomClassNames = getAtomClassNames()

  const traverse = (el: HTMLElement) => {
    const isAtom = atomClassNames.some(cls => el.classList.contains(cls))
    if (isAtom) {
      atoms.push(el)
    } else if (el.children.length > 0) {
      Array.from(el.children).forEach(c => traverse(c as HTMLElement))
    } else {
      atoms.push(el)
    }
  }

  traverse(node)
  return atoms
}

// ================= 分页算法 =================
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

  const topLevelNodes = Array.from(sourceRoot.children) as HTMLElement[]
  const itemClassNames = getItemClassNames()

  for (const sectionNode of topLevelNodes) {
    const isSection = sectionNode.classList.contains('resume-section')

    if (!isSection) {
      const h = getOuterHeight(sectionNode)
      if (currentHeight + h > MAX_CONTENT_HEIGHT && currentHeight > 0) startNewPage()
      currentPageNodes.push(sectionNode.cloneNode(true) as HTMLElement)
      currentHeight += h
      continue
    }

    let currentSectionWrapper = sectionNode.cloneNode(false) as HTMLElement
    currentPageNodes.push(currentSectionWrapper)

    const sectionChildren = Array.from(sectionNode.children) as HTMLElement[]

    for (const childNode of sectionChildren) {
      const isItem = itemClassNames.some(cls => childNode.classList.contains(cls))
      const isContent = childNode.classList.contains('section-content')

      if (isItem || isContent) {
        const atoms = collectAtoms(childNode)
        let currentItemWrapper = childNode.cloneNode(false) as HTMLElement
        currentSectionWrapper.appendChild(currentItemWrapper)

        for (const atom of atoms) {
          const atomHeight = getOuterHeight(atom)

          if (currentHeight + atomHeight > MAX_CONTENT_HEIGHT) {
            startNewPage()
            currentSectionWrapper = sectionNode.cloneNode(false) as HTMLElement
            currentPageNodes.push(currentSectionWrapper)
            currentItemWrapper = childNode.cloneNode(false) as HTMLElement
            currentSectionWrapper.appendChild(currentItemWrapper)
          }

          currentItemWrapper.appendChild(atom.cloneNode(true))
          currentHeight += atomHeight
        }
      } else {
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

// ================= 监听与生命周期 =================
watch(
  [() => store.profile, () => store.experiences, () => store.projects, () => store.educations, () => store.theme],
  () => calculatePages(),
  { deep: true }
)

onMounted(() => {
  setTimeout(calculatePages, 500)
})
</script>

<style scoped>
/* ================= 预览样式 ================= */
.preview-container {
  position: relative; width: 100%; height: 100%;
  background: #525659; overflow: auto;
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
  height: auto !important; min-height: 297mm; padding: 9mm 12mm 15mm 12mm;
}

/* 打印专用容器：屏幕隐藏 */
.print-only-container {
  display: none;
  height: auto;
  min-height: 297mm;
  padding: 9mm 12mm 15mm 12mm;
  box-sizing: border-box;
  background: white;
}

/* 屏幕预览页面 */
.screen-page {
  position: relative;
  overflow: hidden;
}
.page-content-wrapper {
  width: 100%; height: 100%; padding: 9mm 12mm 15mm 12mm; box-sizing: border-box;
}
.page-number {
  position: absolute; bottom: 10px; right: 20px;
  font-size: 12px; color: #999; pointer-events: none;
}

/* Copy styles from ResumeContent */
.page-content-wrapper :deep(.resume-header) {
  border-bottom: 2px dashed #d1d5db; padding-bottom: 16px; margin-bottom: 24px;
}
.page-content-wrapper :deep(.name) {
  font-size: 32px; font-weight: 700; color: var(--primary, #000000); margin-bottom: 8px;
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
  margin-bottom: 16px;
}
.page-content-wrapper :deep(.section-title) {
  font-size: 20px; font-weight: 600; color: var(--primary, #000000); margin-bottom: 16px;
}
.page-content-wrapper :deep(.section-content) {
  margin-bottom: var(--paragraph-spacing, 8px);
}
.page-content-wrapper :deep(.section-divider) {
  border-bottom: 2px dashed #d1d5db;
  margin-top: 16px;
}
.page-content-wrapper :deep(.resume-section:last-child .section-divider) {
  display: none;
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
  /* 设置打印页边距：0，由容器 padding 提供 */
  @page {
    margin: 0;
    size: A4;
  }

  /* 隐藏不需要的元素 */
  .scale-control,
  .measure-container,
  .page-number,
  .print-only-container {
    display: none !important;
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

  /* 核心修复：取消缩放，保留分页间距 */
  .resume-pages-container {
    transform: none !important;
    width: 100% !important;
    margin: 0 !important;
    padding: 0 !important;
    display: block !important;
    gap: 0 !important;
  }

  /* 屏幕预览页面：打印时显示，并确保每页单独成页 */
  .screen-page {
    display: block !important;
    page-break-after: always;
    break-after: page;
    box-shadow: none !important;
    margin: 0 !important;
  }

  /* 确保背景色打印 */
  * {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
}
</style>
