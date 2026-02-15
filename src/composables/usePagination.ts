/**
 * 分页算法 Composable
 * 从 Preview.vue 提取（原第63-336行）
 * 负责计算简历内容的分页逻辑
 */

import { ref, nextTick } from 'vue'

// ================= 常量定义 =================
const A4_HEIGHT_PX = 1123 // A4 高度 (96 DPI)
const PAGE_PADDING_Y = 93  // 上下边距之和: 36px + 57px = 93px
export const MAX_CONTENT_HEIGHT = A4_HEIGHT_PX - PAGE_PADDING_Y
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

export const getOuterHeight = (el: HTMLElement, safetyBuffer: number = 0): number => {
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

/**
 * 核心分页函数：使用指定的 safetyBuffer 进行分页
 * 返回：[页面节点数组, 每页的实际高度数组]
 */
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


/**
 * 主分页函数：迭代优化（使用动态容差策略）
 */
export function usePagination() {
  const renderPages = ref<number[]>([1])

  /**
   * 计算分页
   * @param measureRef - 测量容器元素
   */
  async function calculatePages(measureRef: HTMLElement | null) {
    await nextTick()
    if (!measureRef) return

    const sourceRoot = measureRef

    // ================= 方案B：动态容差范围 =================
    // 第1步：先用 safetyBuffer=0 粗测一次，了解各页留白情况
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
    renderPages.value = bestPagesData.length > 0 ? new Array(bestPagesData.length).fill(0) : [0]

    await nextTick()
    bestPagesData.forEach((nodes, index) => {
      const container = document.getElementById(`page-content-${index}`)
      if (container) {
        container.innerHTML = ''
        nodes.forEach(node => container.appendChild(node))
      }
    })

    return {
      pages: bestPagesData,
      totalPages: bestPagesData.length
    }
  }

  return {
    renderPages,
    calculatePages
  }
}
