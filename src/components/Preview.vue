<template>
  <div class="preview-container">
    <!-- 简历页面容器 -->
    <div
      class="resume-pages-container"
      :style="pagesContainerStyle"
    >

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
        v-for="(_page, index) in renderPages"
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
const supportsZoom = ref(false)

const resumeStyle = computed(() => ({
  '--primary': store.theme.primaryColor,
  '--line-height': store.theme.lineHeight,
  '--paragraph-spacing': `${store.theme.paragraphSpacing}px`
}))

// `transform: scale()` 不会影响布局尺寸，滚动高度仍按未缩放计算，会导致“还能往下滚一大截空白”
// 优先使用 `zoom`（Chromium 支持）让布局尺寸随缩放同步变化；不支持时再 fallback 到 transform。
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

// ================= 常量定义 =================
const A4_HEIGHT_PX = 1123 // A4 高度 (96 DPI)
const PAGE_PADDING_Y = 93  // 上下边距之和: 36px + 57px = 93px
const MAX_CONTENT_HEIGHT = A4_HEIGHT_PX - PAGE_PADDING_Y
const OVERFLOW_THRESHOLD = 2   // 容差阈值：允许内容溢出 2px（解决计算误差）
const TARGET_MARGIN = 12       // 目标留白：12px
const MARGIN_TOLERANCE = 8     // 留白容差：±8px，即 4-20px 范围

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

const getOuterHeight = (el: HTMLElement, safetyBuffer: number = 0): number => {
  const style = window.getComputedStyle(el)
  const marginTop = parseFloat(style.marginTop || '0')
  const marginBottom = parseFloat(style.marginBottom || '0')
  return el.offsetHeight + marginTop + marginBottom + safetyBuffer
}

// 判断是否应该放入当前页（应用容差策略）
const shouldFitInPage = (currentHeight: number, itemHeight: number): boolean => {
  const totalHeight = currentHeight + itemHeight
  const effectiveMax = MAX_CONTENT_HEIGHT + OVERFLOW_THRESHOLD
  return totalHeight <= effectiveMax
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

// 核心分页函数：使用指定的 safetyBuffer 进行分页
// 返回：[页面节点数组, 每页的实际高度数组]
function calculateWithBuffer(sourceRoot: HTMLElement, safetyBuffer: number): { pages: HTMLElement[][]; heights: number[] } {
  const pagesData: HTMLElement[][] = []
  const pageHeights: number[] = []
  let currentPageNodes: HTMLElement[] = []
  let currentHeight = 0
  let currentActualHeight = 0  // 不包含 safetyBuffer 的实际高度

  const startNewPage = () => {
    if (currentPageNodes.length > 0) {
      pagesData.push(currentPageNodes)
      pageHeights.push(currentActualHeight)
    }
    currentPageNodes = []
    currentHeight = 0
    currentActualHeight = 0
  }

  const topLevelNodes = Array.from(sourceRoot.children) as HTMLElement[]
  const itemClassNames = getItemClassNames()

  for (const sectionNode of topLevelNodes) {
    const isSection = sectionNode.classList.contains('resume-section')

    if (!isSection) {
      const h = getOuterHeight(sectionNode, safetyBuffer)
      const actualH = getOuterHeight(sectionNode, 0)

      // 应用容差策略判断
      if (!shouldFitInPage(currentHeight, h) && currentHeight > 0) {
        startNewPage()
      }
      currentPageNodes.push(sectionNode.cloneNode(true) as HTMLElement)
      currentHeight += h
      currentActualHeight += actualH
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
          const atomHeight = getOuterHeight(atom, safetyBuffer)
          const actualAtomHeight = getOuterHeight(atom, 0)

          // 应用容差策略判断
          if (!shouldFitInPage(currentHeight, atomHeight)) {
            startNewPage()
            currentSectionWrapper = sectionNode.cloneNode(false) as HTMLElement
            currentPageNodes.push(currentSectionWrapper)
            currentItemWrapper = childNode.cloneNode(false) as HTMLElement
            currentSectionWrapper.appendChild(currentItemWrapper)
          }

          currentItemWrapper.appendChild(atom.cloneNode(true))
          currentHeight += atomHeight
          currentActualHeight += actualAtomHeight
        }
      } else {
        const h = getOuterHeight(childNode, safetyBuffer)
        const actualH = getOuterHeight(childNode, 0)

        // 应用容差策略判断
        if (!shouldFitInPage(currentHeight, h)) {
          startNewPage()
          currentSectionWrapper = sectionNode.cloneNode(false) as HTMLElement
          currentPageNodes.push(currentSectionWrapper)
        }
        currentSectionWrapper.appendChild(childNode.cloneNode(true))
        currentHeight += h
        currentActualHeight += actualH
      }
    }
  }

  if (currentPageNodes.length > 0) {
    pagesData.push(currentPageNodes)
    pageHeights.push(currentActualHeight)
  }

  return { pages: pagesData, heights: pageHeights }
}


// 主分页函数：迭代优化（使用动态容差策略）
async function calculatePages() {
  await nextTick()
  if (!measureRef.value) return

  const sourceRoot = measureRef.value

  // ================= 方案B：动态容差范围 =================
  // 第1步：先用safetyBuffer=0粗测一次，了解各页留白情况
  const initialTest = calculateWithBuffer(sourceRoot, 0)
  if (initialTest.heights.length === 0) return

  const initialMargins = initialTest.heights.map(h => MAX_CONTENT_HEIGHT - h)
  console.log('📊 初测结果 (safetyBuffer=0):', initialMargins.map((m, i) => `第${i+1}页=${m.toFixed(1)}px`).join(', '))

  // 第2步：根据第2页留白情况，动态调整第1页的目标和容差
  let dynamicTarget = TARGET_MARGIN  // 默认12px
  let dynamicTolerance = MARGIN_TOLERANCE  // 默认±8px
  let strategy = '标准'

  // 如果第2页留白>150px，说明第1页太保守，需要放宽要求
  if (initialMargins.length > 1 && initialMargins[1] > 150) {
    // 放宽第1页要求：允许留白到30-60px
    dynamicTarget = 45
    dynamicTolerance = 15
    strategy = '宽松（为第2页腾空间）'
    console.log(`🎯 检测到第2页留白过大(${initialMargins[1].toFixed(1)}px)，调整为${strategy}策略`)
    console.log(`   第1页目标: ${dynamicTarget}px ± ${dynamicTolerance}px（范围: ${dynamicTarget - dynamicTolerance}-${dynamicTarget + dynamicTolerance}px）`)
  } else {
    console.log(`🎯 使用${strategy}策略`)
    console.log(`   第1页目标: ${dynamicTarget}px ± ${dynamicTolerance}px（范围: ${dynamicTarget - dynamicTolerance}-${dynamicTarget + dynamicTolerance}px）`)
  }

  // 第3步：使用动态容差重新评估所有方案
  let bestPagesData: HTMLElement[][] = []
  let bestScore = Infinity
  let bestMargin = Infinity
  let bestSafetyBuffer = 0

  const testBuffers = [
    0, -0.5, -1, -1.5, -2, -2.5, -3,
    0.5, 1, 1.5, 2, 3, 5,
    -5, -10, -15, 10, 15
  ]

  console.log('🔍 开始测试不同 safetyBuffer 值...')

  for (let iteration = 0; iteration < testBuffers.length; iteration++) {
    const safetyBuffer = testBuffers[iteration]
    const { pages: pagesData, heights: pageHeights } = calculateWithBuffer(sourceRoot, safetyBuffer)

    if (pageHeights.length === 0) continue

    // ================= 使用动态容差的评分函数 =================
    let totalScore = 0
    const margins: number[] = []

    for (let i = 0; i < pageHeights.length; i++) {
      const margin = MAX_CONTENT_HEIGHT - pageHeights[i]
      margins.push(margin)

      if (margin < 0) {
        // ❌ 内容溢出，严重惩罚
        totalScore = Infinity
        break
      }

      if (i === 0) {
        // 第一页策略：使用动态容差
        const deviation = Math.abs(margin - dynamicTarget)

        if (margin >= dynamicTarget - dynamicTolerance &&
            margin <= dynamicTarget + dynamicTolerance) {
          // ✅ 在动态容差范围内，完美！奖励
          totalScore -= 10
        } else {
          // ⚠️ 超出容差，线性惩罚（权重2倍）
          totalScore += deviation * 2
        }
      } else {
        // 其他页策略：留白越大，惩罚越大
        totalScore += margin
      }
    }

    const score = totalScore

    // 标记第一页是否达标（使用动态容差）
    const firstPageMargin = margins[0]
    const firstPageOk = firstPageMargin >= dynamicTarget - dynamicTolerance &&
                       firstPageMargin <= dynamicTarget + dynamicTolerance
    const firstPageStatus = firstPageOk ? '✅' : '⚠️'

    console.log(`  [${safetyBuffer}px] 第1页=${firstPageMargin.toFixed(1)}px ${firstPageStatus}, 其他页=[${margins.slice(1).map(m => m.toFixed(1)).join(', ')}]px, 得分=${score === Infinity ? '∞' : score.toFixed(1)}`)

    // 更新最优结果
    if (score < bestScore) {
      bestScore = score
      bestPagesData = pagesData
      bestMargin = firstPageMargin
      bestSafetyBuffer = safetyBuffer
    }
  }

  console.log(`✅ 选择方案: safetyBuffer=${bestSafetyBuffer}px, 第1页留白=${bestMargin.toFixed(1)}px`)

  // 渲染最优结果
  renderPages.value = bestPagesData.length > 0 ? new Array(bestPagesData.length).fill(1) : [1]

  await nextTick()
  bestPagesData.forEach((nodes, index) => {
    const container = document.getElementById(`page-content-${index}`)
    if (container) {
      container.innerHTML = ''
      nodes.forEach(node => container.appendChild(node))
    }
  })
}

// ================= 监听与生命周期 =================
watch(
  [() => store.profile, () => store.experiences, () => store.projects, () => store.educations, () => store.awards, () => store.selfEvaluation, () => store.theme],
  () => calculatePages(),
  { deep: true }
)

onMounted(() => {
  supportsZoom.value = typeof CSS !== 'undefined' && typeof CSS.supports === 'function' && CSS.supports('zoom', '1')
  setTimeout(calculatePages, 500)
})
</script>

<style scoped>
/* ================= 预览样式 ================= */
.preview-container {
  position: relative; width: 100%; height: 100%;
  background: #F2F0EB; overflow: auto;
}
.resume-pages-container {
  display: flex; flex-direction: column; align-items: center;
  gap: 20px; padding: 40px 0; width: 100%;
}
.resume-paper {
  width: 794px; height: 1123px; background: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15); margin: 0;
  box-sizing: border-box; text-align: left;
}

/* 测量容器：永远隐藏 */
.measure-container {
  position: absolute; top: 0; left: 0; visibility: hidden; z-index: -100;
  height: auto !important; min-height: 1123px; padding: 36px 47px 57px 47px;
}

/* 打印专用容器：屏幕隐藏 */
.print-only-container {
  display: none;
  height: auto;
  min-height: 1123px;
  padding: 36px 47px 57px 47px;
  box-sizing: border-box;
  background: white;
}

/* 屏幕预览页面 */
.screen-page {
  position: relative;
  overflow: hidden;
}
.page-content-wrapper {
  width: 100%; height: 100%; padding: 36px 47px 57px 47px; box-sizing: border-box;
}
.page-number {
  position: absolute; bottom: 10px; right: 20px;
  font-size: 12px; color: #999; pointer-events: none;
}

/* Copy styles from ResumeContent */
.page-content-wrapper :deep(.resume-header) {
  padding-bottom: 8px; margin-bottom: 8px;
}
.page-content-wrapper :deep(.header-top) {
  display: flex; align-items: center; margin-bottom: 8px; position: relative;
}
.page-content-wrapper :deep(.header-left) {
  display: flex; align-items: baseline; gap: 12px;
}
.page-content-wrapper :deep(.name) {
  font-size: 30px; font-weight: 550; color: var(--primary, #000000); margin-bottom: 0;
}
.page-content-wrapper :deep(.title) {
  font-size: 18px; color: #2D2D29; margin-bottom: 0;
}
.page-content-wrapper :deep(.avatar-wrapper) {
  position: absolute; right: 0; top: 0;
}
.page-content-wrapper :deep(.avatar) {
  width: 80px; height: 100px; object-fit: cover; display: block;
}
.page-content-wrapper :deep(.contact-info) {
  display: flex; flex-direction: column; gap: 4px; font-size: 14px; color: #2D2D29; min-height: 50px;
}
.page-content-wrapper :deep(.contact-info.has-avatar) {
  margin-right: 96px;
}
.page-content-wrapper :deep(.contact-row) {
  display: flex; flex-wrap: wrap; gap: 16px;
}
.page-content-wrapper :deep(.contact-item) {
  display: flex; align-items: center; gap: 6px;
}
.page-content-wrapper :deep(.contact-item svg) {
  flex-shrink: 0;
}
.page-content-wrapper :deep(.resume-section) {
  margin-bottom: 16px;
}
.page-content-wrapper :deep(.section-title) {
  font-size: 16px; font-weight: 600; color: #2D2D29; margin-bottom: 1px; margin-top: 5px;
}
.page-content-wrapper :deep(.section-content) {
  margin-bottom: 11px;
}
.page-content-wrapper :deep(.section-divider) {
  border-bottom: 2px solid #000000;
  margin-top: 0px;
  margin-bottom: 11px;
}
.page-content-wrapper :deep(.experience-item),
.page-content-wrapper :deep(.project-item),
.page-content-wrapper :deep(.education-item) {
  margin-bottom: 11px;
}
/* 工作经历和项目经历：多条记录之间固定间距 */
.page-content-wrapper :deep(.experience-item),
.page-content-wrapper :deep(.project-item) {
  margin-bottom: 16px;
}
/* 教育经历：多条记录之间固定间距 */
.page-content-wrapper :deep(.education-item) {
  margin-bottom: 8px;
}
/* 教育经历条目通常无描述，去掉标题下方额外空隙以收紧条目间距 */
.page-content-wrapper :deep(.education-item .item-title) {
  margin-bottom: 0;
}
/* 每个 section 中的最后一个 item 移除下边距 */
.page-content-wrapper :deep(.resume-section .experience-item:last-child),
.page-content-wrapper :deep(.resume-section .project-item:last-child),
.page-content-wrapper :deep(.resume-section .education-item:last-child) {
  margin-bottom: 0px;
}
.page-content-wrapper :deep(.item-header) {
  display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0px;
}
.page-content-wrapper :deep(.item-title) {
  font-size: var(--font-size-item-title); font-weight: var(--font-weight-item-title); color: #2D2D29; margin: 0 0 4px 0;
}
.page-content-wrapper :deep(.item-subtitle-inline) {
  font-size: 13px; font-weight: 400; color: #2D2D29; margin-left: 8px;
}
.page-content-wrapper :deep(.item-subtitle) {
  font-size: 14px; color: #2D2D29;
}
.page-content-wrapper :deep(.item-date) {
  font-size: 14px; color: #2D2D29; white-space: nowrap;
}
.page-content-wrapper :deep(.education-major) {
  font-size: 13px; color: #2D2D29;
}
.page-content-wrapper :deep(.education-major-inline) {
  font-size: 13px; font-weight: 400; color: #2D2D29; margin-left: 8px;
}
.page-content-wrapper :deep(.education-degree) {
  font-size: 14px; font-weight: 600; color: #2D2D29;
}
.page-content-wrapper :deep(.item-description-wrapper) {
  margin-top: 0px;
  margin-bottom: 0px;
}
.page-content-wrapper :deep(.text-line) {
  font-size: 13px;
  color: #2D2D29; line-height: var(--line-height, 1.6); white-space: pre-wrap;
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
    /* 打印时必须取消缩放，否则会继续按 0.74 等比例去排版 */
    transform: none !important;
    zoom: 1 !important;
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

  /* 最后一页不分页，避免空白页 */
  .screen-page:last-child {
    page-break-after: auto;
    break-after: auto;
  }

  /* 确保背景色打印 */
  * {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
}
</style>
