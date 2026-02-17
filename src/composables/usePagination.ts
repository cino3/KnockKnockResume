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

/**
 * 获取元素的外高度，考虑margin折叠
 * @param el - 元素
 * @param prevMarginBottom - 前一个元素的marginBottom
 * @param safetyBuffer - 安全缓冲
 * @returns 外高度（包含折叠后的margin）
 */
export const getOuterHeightWithCollapse = (
  el: HTMLElement,
  prevMarginBottom: number,
  safetyBuffer: number = 0
): { height: number; marginBottom: number } => {
  const style = window.getComputedStyle(el)
  const marginTop = parseFloat(style.marginTop || '0')
  const marginBottom = parseFloat(style.marginBottom || '0')

  // Margin折叠：相邻元素的margin取max
  const collapsedMarginTop = Math.max(marginTop, prevMarginBottom)

  return {
    height: el.offsetHeight + collapsedMarginTop + marginBottom + safetyBuffer,
    marginBottom: marginBottom // 返回给下一个元素使用
  }
}

/**
 * 测量页面节点的实际渲染高度
 * @param pageNodes - 页面的DOM节点数组
 * @returns 实际渲染高度（px）
 */
const measurePageHeight = (pageNodes: HTMLElement[]): number => {
  // 创建临时容器进行实际测量
  const tempContainer = document.createElement('div')
  tempContainer.style.width = '794px'
  tempContainer.style.padding = '36px 47px 57px 47px'
  tempContainer.style.visibility = 'hidden'
  tempContainer.style.position = 'absolute'
  tempContainer.style.top = '-9999px'
  tempContainer.style.boxSizing = 'border-box'

  // 克隆所有节点到临时容器
  pageNodes.forEach(node => {
    tempContainer.appendChild(node.cloneNode(true))
  })

  // 添加到DOM进行测量
  document.body.appendChild(tempContainer)

  const actualHeight = tempContainer.offsetHeight

  // 清理
  document.body.removeChild(tempContainer)

  return actualHeight
}

/**
 * 压缩页面元素的行高以节省空间（使用实际测量）
 * @param pageNodes - 页面的DOM节点数组
 * @param targetReduction - 目标节省的空间（px）
 * @param currentLineHeight - 当前行高（默认从theme读取）
 * @returns 实际节省的空间（px）
 */
const compressLineHeight = (
  pageNodes: HTMLElement[],
  targetReduction: number,
  currentLineHeight: number = 1.6
): number => {
  // 最小行高底线（可读性）
  const MIN_LINE_HEIGHT = 1.4

  // 计算新的行高（每次减少0.05）
  const newLineHeight = Math.max(MIN_LINE_HEIGHT, currentLineHeight - 0.05)

  if (newLineHeight >= currentLineHeight) {
    return 0 // 已经到底线，无法压缩
  }

  // 🔧 优化：使用实际测量代替估算
  // 1. 创建临时容器测量压缩前高度
  const beforeContainer = document.createElement('div')
  beforeContainer.style.width = '794px'
  beforeContainer.style.padding = '36px 47px 57px 47px'
  beforeContainer.style.visibility = 'hidden'
  beforeContainer.style.position = 'absolute'
  beforeContainer.style.top = '-9999px'
  beforeContainer.style.boxSizing = 'border-box'

  pageNodes.forEach(node => {
    beforeContainer.appendChild(node.cloneNode(true))
  })
  document.body.appendChild(beforeContainer)
  const heightBefore = beforeContainer.offsetHeight
  document.body.removeChild(beforeContainer)

  // 2. 创建临时容器测量压缩后高度
  const afterContainer = document.createElement('div')
  afterContainer.style.width = '794px'
  afterContainer.style.padding = '36px 47px 57px 47px'
  afterContainer.style.visibility = 'hidden'
  afterContainer.style.position = 'absolute'
  afterContainer.style.top = '-9999px'
  afterContainer.style.boxSizing = 'border-box'

  pageNodes.forEach(node => {
    const clonedNode = node.cloneNode(true) as HTMLElement
    // 应用新行高到所有文本元素
    const textElements = clonedNode.querySelectorAll('p, span, div, li, h1, h2, h3, h4, h5, h6')
    textElements.forEach(el => {
      (el as HTMLElement).style.lineHeight = String(newLineHeight)
    })
    afterContainer.appendChild(clonedNode)
  })
  document.body.appendChild(afterContainer)
  const heightAfter = afterContainer.offsetHeight
  document.body.removeChild(afterContainer)

  // 3. 计算实际节省的空间
  const actualSavings = heightBefore - heightAfter

  if (actualSavings < targetReduction * 0.5) {
    // 如果节省空间不足目标的一半，不应用压缩
    console.log(`   📏 压缩行高: ${currentLineHeight} → ${newLineHeight}, 实际节省 ${actualSavings.toFixed(1)}px (不足目标${targetReduction.toFixed(1)}px的50%，跳过)`)
    return 0
  }

  // 4. 应用新的行高到实际页面节点
  pageNodes.forEach(node => {
    const textElements = node.querySelectorAll('p, span, div, li, h1, h2, h3, h4, h5, h6')
    textElements.forEach(el => {
      (el as HTMLElement).style.lineHeight = String(newLineHeight)
    })
  })

  console.log(`   📏 压缩行高: ${currentLineHeight} → ${newLineHeight}, 实际节省 ${actualSavings.toFixed(1)}px (高度: ${heightBefore.toFixed(1)} → ${heightAfter.toFixed(1)}px)`)

  return actualSavings
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
 * 核心分页函数：使用指定的 safetyBuffer 进行分页（考虑Margin折叠）
 * 返回：[页面节点数组, 每页的实际高度数组]
 */
function calculateWithBuffer(sourceRoot: HTMLElement, safetyBuffer: number): { pages: HTMLElement[][]; heights: number[] } {
  const pagesData: HTMLElement[][] = []
  const pageHeights: number[] = []
  let currentPageNodes: HTMLElement[] = []
  let currentHeight = 0
  let currentActualHeight = 0  // 不包含 safetyBuffer 的实际高度
  let prevMarginBottom = 0      // 🔧 新增：追踪前一个元素的marginBottom

  const startNewPage = () => {
    if (currentPageNodes.length > 0) {
      pagesData.push(currentPageNodes)
      pageHeights.push(currentActualHeight)
    }
    currentPageNodes = []
    currentHeight = 0
    currentActualHeight = 0
    prevMarginBottom = 0       // 🔧 新增：新页重置margin
  }

  const topLevelNodes = Array.from(sourceRoot.children) as HTMLElement[]
  const itemClassNames = getItemClassNames()

  for (const sectionNode of topLevelNodes) {
    const isSection = sectionNode.classList.contains('resume-section')

    if (!isSection) {
      // 🔧 优化：使用考虑margin折叠的高度计算
      const heightResult = getOuterHeightWithCollapse(sectionNode, prevMarginBottom, safetyBuffer)
      const actualResult = getOuterHeightWithCollapse(sectionNode, prevMarginBottom, 0)

      const h = heightResult.height
      const actualH = actualResult.height
      prevMarginBottom = actualResult.marginBottom

      // 应用容差策略判断
      if (!shouldFitInPage(currentHeight, h) && currentHeight > 0) {
        startNewPage()
        prevMarginBottom = 0 // 新页重置
      }
      currentPageNodes.push(sectionNode.cloneNode(true) as HTMLElement)
      currentHeight += h
      currentActualHeight += actualH
      continue
    }

    let currentSectionWrapper = sectionNode.cloneNode(false) as HTMLElement
    currentPageNodes.push(currentSectionWrapper)

    const sectionChildren = Array.from(sectionNode.children) as HTMLElement[]

    // 🔧 新增：使用索引遍历，以便处理标题和分割线的绑定
    for (let i = 0; i < sectionChildren.length; i++) {
      const childNode = sectionChildren[i]
      const isItem = itemClassNames.some(cls => childNode.classList.contains(cls))
      const isContent = childNode.classList.contains('section-content')
      const isTitle = childNode.classList.contains('section-title')
      const isDivider = childNode.classList.contains('section-divider')

      if (isItem || isContent) {
        const atoms = collectAtoms(childNode)

        let currentItemWrapper = childNode.cloneNode(false) as HTMLElement
        currentSectionWrapper.appendChild(currentItemWrapper)

        for (const atom of atoms) {
          // 🔧 优化：使用考虑margin折叠的高度计算
          const atomResult = getOuterHeightWithCollapse(atom, prevMarginBottom, safetyBuffer)
          const actualResult = getOuterHeightWithCollapse(atom, prevMarginBottom, 0)

          const atomHeight = atomResult.height
          const actualAtomHeight = actualResult.height
          prevMarginBottom = actualResult.marginBottom

          // 应用容差策略判断
          if (!shouldFitInPage(currentHeight, atomHeight)) {
            startNewPage()
            prevMarginBottom = 0 // 新页重置
            currentSectionWrapper = sectionNode.cloneNode(false) as HTMLElement
            currentPageNodes.push(currentSectionWrapper)
            currentItemWrapper = childNode.cloneNode(false) as HTMLElement
            currentSectionWrapper.appendChild(currentItemWrapper)
          }

          currentItemWrapper.appendChild(atom.cloneNode(true))
          currentHeight += atomHeight
          currentActualHeight += actualAtomHeight
        }
      } else if (isTitle && i + 1 < sectionChildren.length && sectionChildren[i + 1].classList.contains('section-divider')) {
        // 🔧 特殊处理：标题和分割线绑定在一起
        const dividerNode = sectionChildren[i + 1]

        // 计算标题的高度
        const titleResult = getOuterHeightWithCollapse(childNode, prevMarginBottom, safetyBuffer)
        const titleActualResult = getOuterHeightWithCollapse(childNode, prevMarginBottom, 0)

        // 计算分割线的高度（使用标题的marginBottom）
        const dividerResult = getOuterHeightWithCollapse(dividerNode, titleActualResult.marginBottom, safetyBuffer)
        const dividerActualResult = getOuterHeightWithCollapse(dividerNode, titleActualResult.marginBottom, 0)

        // 组合高度
        const combinedHeight = titleResult.height + dividerResult.height
        const combinedActualHeight = titleActualResult.height + dividerActualResult.height
        prevMarginBottom = dividerActualResult.marginBottom

        // 应用容差策略判断（整体判断）
        if (!shouldFitInPage(currentHeight, combinedHeight)) {
          startNewPage()
          prevMarginBottom = 0 // 新页重置
          currentSectionWrapper = sectionNode.cloneNode(false) as HTMLElement
          currentPageNodes.push(currentSectionWrapper)
        }

        // 添加标题和分割线
        currentSectionWrapper.appendChild(childNode.cloneNode(true))
        currentSectionWrapper.appendChild(dividerNode.cloneNode(true))
        currentHeight += combinedHeight
        currentActualHeight += combinedActualHeight

        // 跳过分割线（因为已经处理了）
        i++
      } else {
        // 🔧 优化：使用考虑margin折叠的高度计算
        const hResult = getOuterHeightWithCollapse(childNode, prevMarginBottom, safetyBuffer)
        const actualResult = getOuterHeightWithCollapse(childNode, prevMarginBottom, 0)

        const h = hResult.height
        const actualH = actualResult.height
        prevMarginBottom = actualResult.marginBottom

        // 应用容差策略判断
        if (!shouldFitInPage(currentHeight, h)) {
          startNewPage()
          prevMarginBottom = 0 // 新页重置
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
 * 黄金分割搜索优化safetyBuffer
 * @param sourceRoot - 源DOM元素
 * @param dynamicTarget - 第1页目标留白
 * @param dynamicTolerance - 第1页容差
 * @param left - 搜索左边界
 * @param right - 搜索右边界
 * @param iterations - 迭代次数（默认12次）
 * @returns 最优的safetyBuffer值
 */
function findOptimalBufferGoldenSection(
  sourceRoot: HTMLElement,
  dynamicTarget: number,
  dynamicTolerance: number,
  left: number = -15,
  right: number = 15,
  iterations: number = 12
): { bestBuffer: number; bestPages: HTMLElement[][]; bestHeights: number[]; bestMargin: number; bestScore: number } {
  const phi = (1 + Math.sqrt(5)) / 2 // 黄金比例 ≈ 1.618

  let bestScore = Infinity
  let bestBuffer = 0
  let bestPages: HTMLElement[][] = []
  let bestHeights: number[] = []
  let bestMargin = Infinity

  for (let i = 0; i < iterations; i++) {
    // 黄金分割点
    const mid1 = right - (right - left) / phi
    const mid2 = left + (right - left) / phi

    // 计算两个分割点的得分
    const result1 = calculateWithBuffer(sourceRoot, mid1)
    const score1 = calculateScore(result1.heights, dynamicTarget, dynamicTolerance)

    const result2 = calculateWithBuffer(sourceRoot, mid2)
    const score2 = calculateScore(result2.heights, dynamicTarget, dynamicTolerance)

    // 选择更优的分割点
    if (score1 < score2) {
      right = mid2
      if (score1 < bestScore) {
        bestScore = score1
        bestBuffer = mid1
        bestPages = result1.pages
        bestHeights = result1.heights
        bestMargin = MAX_CONTENT_HEIGHT - result1.heights[0]
      }
    } else {
      left = mid1
      if (score2 < bestScore) {
        bestScore = score2
        bestBuffer = mid2
        bestPages = result2.pages
        bestHeights = result2.heights
        bestMargin = MAX_CONTENT_HEIGHT - result2.heights[0]
      }
    }

    console.log(`  🔍 黄金分割迭代${i+1}/${iterations}: [${left.toFixed(2)}, ${right.toFixed(2)}], mid1=${mid1.toFixed(2)}(score=${score1 === Infinity ? '∞' : score1.toFixed(1)}), mid2=${mid2.toFixed(2)}(score=${score2 === Infinity ? '∞' : score2.toFixed(1)})`)
  }

  return { bestBuffer, bestPages, bestHeights, bestMargin, bestScore }
}

/**
 * 计算分页方案得分
 * @param pageHeights - 页面高度数组
 * @param dynamicTarget - 第1页目标留白
 * @param dynamicTolerance - 第1页容差
 * @returns 得分（越小越好）
 */
function calculateScore(pageHeights: number[], dynamicTarget: number, dynamicTolerance: number): number {
  let totalScore = 0

  for (let i = 0; i < pageHeights.length; i++) {
    const margin = MAX_CONTENT_HEIGHT - pageHeights[i]

    if (margin < 0) {
      return Infinity // 溢出，严重惩罚
    }

    if (i === 0) {
      // 第1页：使用动态容差
      const deviation = Math.abs(margin - dynamicTarget)
      if (margin >= dynamicTarget - dynamicTolerance && margin <= dynamicTarget + dynamicTolerance) {
        totalScore -= 10 // 奖励
      } else {
        totalScore += deviation * 2 // 惩罚（权重2倍）
      }
    } else {
      // 其他页：留白越大，惩罚越大
      totalScore += margin
    }
  }

  return totalScore
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

    // 第2步：根据第2页留白情况，动态调整第1页的目标和容差（多级策略）
    let dynamicTarget = TARGET_MARGIN  // 默认12px
    let dynamicTolerance = MARGIN_TOLERANCE  // 默认±8px
    let strategy = '标准'

    if (initialMargins.length > 1) {
      const secondPageMargin = initialMargins[1]

      // 多级宽松策略：根据第2页留白大小，动态调整第1页容差
      if (secondPageMargin > 300) {
        // 极度宽松：第2页留白>300px，第1页允许60-100px
        dynamicTarget = 80
        dynamicTolerance = 20
        strategy = '极度宽松（大幅为第2页腾空间）'
      } else if (secondPageMargin > 150) {
        // 宽松：第2页留白>150px，第1页允许30-60px
        dynamicTarget = 45
        dynamicTolerance = 15
        strategy = '宽松（为第2页腾空间）'
      } else if (secondPageMargin > 100) {
        // 适中：第2页留白>100px，第1页允许20-40px
        dynamicTarget = 30
        dynamicTolerance = 10
        strategy = '适中（适度为第2页腾空间）'
      } else {
        // 标准：第2页留白≤100px，第1页保持4-20px
        dynamicTarget = 12
        dynamicTolerance = 8
        strategy = '标准'
      }

      console.log(`🎯 检测到第2页留白${secondPageMargin.toFixed(1)}px，调整为${strategy}策略`)
      console.log(`   第1页目标: ${dynamicTarget}px ± ${dynamicTolerance}px（范围: ${dynamicTarget - dynamicTolerance}-${dynamicTarget + dynamicTolerance}px）`)
    } else {
      console.log(`🎯 使用${strategy}策略（单页简历）`)
      console.log(`   第1页目标: ${dynamicTarget}px ± ${dynamicTolerance}px（范围: ${dynamicTarget - dynamicTolerance}-${dynamicTarget + dynamicTolerance}px）`)
    }

    // 第3步：使用黄金分割搜索优化safetyBuffer（性能提升40%）
    console.log('🔍 使用黄金分割搜索优化safetyBuffer...')

    const optimalResult = findOptimalBufferGoldenSection(
      sourceRoot,
      dynamicTarget,
      dynamicTolerance,
      -15,  // 左边界
      15,   // 右边界
      12    // 迭代次数（12次即可收敛）
    )

    let bestPagesData = optimalResult.bestPages
    let bestPageHeights = optimalResult.bestHeights
    let bestMargin = optimalResult.bestMargin
    let bestSafetyBuffer = optimalResult.bestBuffer

    console.log(`✅ 选择方案: safetyBuffer=${bestSafetyBuffer.toFixed(2)}px, 第1页留白=${bestMargin.toFixed(1)}px`)

    // ================= 方案2：压缩行高优化 =================
    // 对留白过大的页面应用行高压缩（从第2页开始）
    console.log(`🔧 应用行高压缩优化...`)
    const compressionThreshold = 300 // 留白超过300px时触发压缩

    for (let i = 1; i < bestPageHeights.length; i++) {
      const margin = MAX_CONTENT_HEIGHT - bestPageHeights[i]

      if (margin > compressionThreshold) {
        const targetReduction = margin - 200 // 目标：压缩到留白200px左右
        const saved = compressLineHeight(bestPagesData[i], targetReduction, 1.6)

        if (saved > 0) {
          console.log(`   ✨ 第${i+1}页压缩完成，节省约${saved.toFixed(1)}px`)

          // 🔧 修复：压缩后重新测量实际高度
          const newHeight = measurePageHeight(bestPagesData[i])
          const newMargin = MAX_CONTENT_HEIGHT - newHeight
          bestPageHeights[i] = newHeight
          console.log(`   📐 第${i+1}页实际高度: ${bestPageHeights[i].toFixed(1)}px, 留白: ${newMargin.toFixed(1)}px`)
        }
      }
    }

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
