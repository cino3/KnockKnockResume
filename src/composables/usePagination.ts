/**
 * 分页算法 Composable
 * 从 Preview.vue 提取（原第63-336行）
 * 负责计算简历内容的分页逻辑
 */

import { ref, nextTick } from 'vue'

// ================= 常量定义 =================
const A4_HEIGHT_PX = 1123 // A4 高度 (96 DPI)
const PAGE_PADDING_TOP = 36
const PAGE_PADDING_X = 47
const PAGE_PADDING_BOTTOM = 57
const FIRST_PAGE_PADDING_BOTTOM = 22 // 第1页下边距
const PAGE_PADDING_Y = PAGE_PADDING_TOP + PAGE_PADDING_BOTTOM
const FIRST_PAGE_PADDING_Y = PAGE_PADDING_TOP + FIRST_PAGE_PADDING_BOTTOM
export const MAX_CONTENT_HEIGHT = A4_HEIGHT_PX - PAGE_PADDING_Y
export const FIRST_PAGE_MAX_CONTENT_HEIGHT = A4_HEIGHT_PX - FIRST_PAGE_PADDING_Y
const DEFAULT_PAGE_PADDING = `${PAGE_PADDING_TOP}px ${PAGE_PADDING_X}px ${PAGE_PADDING_BOTTOM}px ${PAGE_PADDING_X}px`
const FIRST_PAGE_PADDING = `${PAGE_PADDING_TOP}px ${PAGE_PADDING_X}px ${FIRST_PAGE_PADDING_BOTTOM}px ${PAGE_PADDING_X}px`
const OVERFLOW_THRESHOLD = 2   // 容差阈值：允许内容溢出 2px（解决计算误差）
const TARGET_MARGIN = 6        // 目标留白：6px（让第一页更贴近底部）
const MARGIN_TOLERANCE = 4     // 留白容差：±4px，即 2-10px 范围
const FIRST_PAGE_MARGIN_TIGHTEN_THRESHOLD = 18 // 第1页留白超过该阈值时，强制进一步收紧
export const ENABLE_LINE_HEIGHT_COMPRESSION = false // 禁用自动行高压缩/拉伸
export const MAX_FIRST_PAGE_STRETCH_LIMIT = 60 // 最多只允许抹平 60px 的留白
export const FIRST_PAGE_DETAIL_STRETCH_RATIO = 0.25 // 小部分预算（25%）用于细粒度间距
export const FIRST_PAGE_DETAIL_ITEM_GAP_SHARE = 0.7 // 细粒度预算里，70% 优先给条目间距
export const SAFETY_BUFFER_SEARCH_MIN = 0
export const SAFETY_BUFFER_SEARCH_MAX = 0
export const ENABLE_AGGRESSIVE_FIRST_PAGE_SQUEEZE = false

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

const getPageMaxContentHeight = (pageIndex: number): number =>
  pageIndex === 0 ? FIRST_PAGE_MAX_CONTENT_HEIGHT : MAX_CONTENT_HEIGHT

const getPageMargin = (pageIndex: number, pageHeight: number): number =>
  getPageMaxContentHeight(pageIndex) - pageHeight

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
const measurePageHeight = (pageNodes: HTMLElement[], isFirstPage: boolean = false): number => {
  // 创建临时容器进行实际测量
  const tempContainer = document.createElement('div')
  tempContainer.style.width = '794px'
  tempContainer.style.padding = isFirstPage ? FIRST_PAGE_PADDING : DEFAULT_PAGE_PADDING
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
  currentLineHeight: number = 1.6,
  isFirstPage: boolean = false
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
  beforeContainer.style.padding = isFirstPage ? FIRST_PAGE_PADDING : DEFAULT_PAGE_PADDING
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
  afterContainer.style.padding = isFirstPage ? FIRST_PAGE_PADDING : DEFAULT_PAGE_PADDING
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
    // console.log(`   📏 压缩行高: ${currentLineHeight} → ${newLineHeight}, 实际节省 ${actualSavings.toFixed(1)}px (不足目标${targetReduction.toFixed(1)}px的50%，跳过)`)
    return 0
  }

  // 4. 应用新的行高到实际页面节点
  pageNodes.forEach(node => {
    const textElements = node.querySelectorAll('p, span, div, li, h1, h2, h3, h4, h5, h6')
    textElements.forEach(el => {
      (el as HTMLElement).style.lineHeight = String(newLineHeight)
    })
  })

  // console.log(`   📏 压缩行高: ${currentLineHeight} → ${newLineHeight}, 实际节省 ${actualSavings.toFixed(1)}px (高度: ${heightBefore.toFixed(1)} → ${heightAfter.toFixed(1)}px)`)

  return actualSavings
}

// 判断是否应该放入当前页（应用容差策略）
const shouldFitInPage = (currentHeight: number, itemHeight: number, pageIndex: number): boolean => {
  const totalHeight = currentHeight + itemHeight
  const effectiveMax = getPageMaxContentHeight(pageIndex) + OVERFLOW_THRESHOLD
  return totalHeight <= effectiveMax
}

const normalizeMarginForDisplay = (margin: number): number => {
  if (!Number.isFinite(margin) || margin < 0) {
    return 0
  }
  return margin
}

export const formatMarginForLog = (margin: number): string =>
  `${normalizeMarginForDisplay(margin).toFixed(1)}px`

export const shouldMoveTitleBlockToNextPage = (
  canFitTitleDivider: boolean,
  canFitTitleDividerAndNextAtom: boolean
): boolean => !canFitTitleDivider || !canFitTitleDividerAndNextAtom

export const applyFirstPageWhitespaceStretch = (
  currentPage: HTMLElement,
  firstPageMargin: number
): boolean => {
  if (!Number.isFinite(firstPageMargin)) {
    return false
  }

  const emptySpace = firstPageMargin - FIRST_PAGE_PADDING_BOTTOM
  if (emptySpace < 0 || emptySpace > MAX_FIRST_PAGE_STRETCH_LIMIT) {
    return false
  }

  const sections = Array.from(currentPage.querySelectorAll('.resume-section')) as HTMLElement[]
  if (sections.length === 0) {
    return false
  }

  const applyBudget = (elements: HTMLElement[], budget: number): boolean => {
    if (budget <= 0 || elements.length === 0) {
      return false
    }
    const extraMargin = budget / elements.length
    elements.forEach(el => {
      const currentMargin = parseFloat(window.getComputedStyle(el).marginBottom || '0')
      el.style.marginBottom = `${currentMargin + extraMargin}px`
    })
    return true
  }

  const sectionGapTargets = sections.slice(0, -1)
  const itemGapTargets: HTMLElement[] = []
  const dividerGapTargets: HTMLElement[] = []

  sections.forEach(section => {
    const itemGroups = ['.experience-item', '.project-item', '.education-item']
    itemGroups.forEach(selector => {
      const items = Array.from(section.querySelectorAll(selector)) as HTMLElement[]
      if (items.length > 1) {
        itemGapTargets.push(...items.slice(0, -1))
      }
    })

    const divider = section.querySelector('.section-divider') as HTMLElement | null
    if (divider) {
      dividerGapTargets.push(divider)
    }
  })

  let detailBudget = emptySpace * FIRST_PAGE_DETAIL_STRETCH_RATIO
  let itemGapBudget = detailBudget * FIRST_PAGE_DETAIL_ITEM_GAP_SHARE
  let dividerGapBudget = detailBudget - itemGapBudget
  let sectionGapBudget = emptySpace - detailBudget

  if (itemGapTargets.length === 0) {
    dividerGapBudget += itemGapBudget
    itemGapBudget = 0
  }

  if (dividerGapTargets.length === 0) {
    if (sectionGapTargets.length > 0) {
      sectionGapBudget += dividerGapBudget
      dividerGapBudget = 0
    } else if (itemGapTargets.length > 0) {
      itemGapBudget += dividerGapBudget
      dividerGapBudget = 0
    }
  }

  if (sectionGapTargets.length === 0) {
    if (itemGapTargets.length > 0) {
      itemGapBudget += sectionGapBudget
      sectionGapBudget = 0
    } else if (dividerGapTargets.length > 0) {
      dividerGapBudget += sectionGapBudget
      sectionGapBudget = 0
    }
  }

  const appliedSectionGap = applyBudget(sectionGapTargets, sectionGapBudget)
  const appliedItemGap = applyBudget(itemGapTargets, itemGapBudget)
  const appliedDividerGap = applyBudget(dividerGapTargets, dividerGapBudget)

  return appliedSectionGap || appliedItemGap || appliedDividerGap
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
  const getCurrentPageIndex = () => pagesData.length
  const getCurrentPageMaxHeight = () => getPageMaxContentHeight(getCurrentPageIndex())

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
      if (!shouldFitInPage(currentHeight, h, getCurrentPageIndex()) && currentHeight > 0) {
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
          if (!shouldFitInPage(currentHeight, atomHeight, getCurrentPageIndex())) {
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
        const nextPrevMarginBottom = dividerActualResult.marginBottom

        // 标题（含分割线）与其后第一行内容强绑定：若下一行首原子放不下，标题整体换页
        let nextBlockFirstAtomHeight = 0
        if (i + 2 < sectionChildren.length) {
          const nextNode = sectionChildren[i + 2]
          const nextIsItem = itemClassNames.some(cls => nextNode.classList.contains(cls))
          const nextIsContent = nextNode.classList.contains('section-content')

          if (nextIsItem || nextIsContent) {
            const nextAtoms = collectAtoms(nextNode)
            if (nextAtoms.length > 0) {
              nextBlockFirstAtomHeight = getOuterHeightWithCollapse(nextAtoms[0], nextPrevMarginBottom, safetyBuffer).height
            }
          } else {
            nextBlockFirstAtomHeight = getOuterHeightWithCollapse(nextNode, nextPrevMarginBottom, safetyBuffer).height
          }
        }

        const pageIndex = getCurrentPageIndex()
        const canFitTitleDivider = shouldFitInPage(currentHeight, combinedHeight, pageIndex)
        const canFitTitleDividerAndNextAtom = nextBlockFirstAtomHeight <= 0
          ? canFitTitleDivider
          : shouldFitInPage(currentHeight + combinedHeight, nextBlockFirstAtomHeight, pageIndex)
        const shouldMoveTitleToNextPage = shouldMoveTitleBlockToNextPage(
          canFitTitleDivider,
          canFitTitleDividerAndNextAtom
        )
        let appliedCombinedHeight = combinedHeight
        let appliedCombinedActualHeight = combinedActualHeight
        let appliedPrevMarginBottom = nextPrevMarginBottom

        if (shouldMoveTitleToNextPage) {
          startNewPage()
          prevMarginBottom = 0 // 新页重置
          currentSectionWrapper = sectionNode.cloneNode(false) as HTMLElement
          currentPageNodes.push(currentSectionWrapper)

          // 移到新页后，基于新页的 margin 上下文重新计算高度，避免累计误差
          const titleResultNewPage = getOuterHeightWithCollapse(childNode, 0, safetyBuffer)
          const titleActualResultNewPage = getOuterHeightWithCollapse(childNode, 0, 0)
          const dividerResultNewPage = getOuterHeightWithCollapse(dividerNode, titleActualResultNewPage.marginBottom, safetyBuffer)
          const dividerActualResultNewPage = getOuterHeightWithCollapse(dividerNode, titleActualResultNewPage.marginBottom, 0)

          appliedCombinedHeight = titleResultNewPage.height + dividerResultNewPage.height
          appliedCombinedActualHeight = titleActualResultNewPage.height + dividerActualResultNewPage.height
          appliedPrevMarginBottom = dividerActualResultNewPage.marginBottom
        }

        prevMarginBottom = appliedPrevMarginBottom

        // 添加标题和分割线
        currentSectionWrapper.appendChild(childNode.cloneNode(true))
        currentSectionWrapper.appendChild(dividerNode.cloneNode(true))
        currentHeight += appliedCombinedHeight
        currentActualHeight += appliedCombinedActualHeight

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
        if (!shouldFitInPage(currentHeight, h, getCurrentPageIndex())) {
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
    const margin1 = result1.heights.length > 0 ? getPageMargin(0, result1.heights[0]) : Infinity
    const isOverflow1 = margin1 < 0 || score1 === Infinity

    const result2 = calculateWithBuffer(sourceRoot, mid2)
    const score2 = calculateScore(result2.heights, dynamicTarget, dynamicTolerance)
    const margin2 = result2.heights.length > 0 ? getPageMargin(0, result2.heights[0]) : Infinity
    const isOverflow2 = margin2 < 0 || score2 === Infinity

    // 🔧 新增：详细日志（只输出前3次和最后一次）
    if (i < 3 || i === iterations - 1) {
      console.log(`  🔍 迭代${i+1}/${iterations}:`)
      const margin1Str = formatMarginForLog(margin1)
      const margin2Str = formatMarginForLog(margin2)
      console.log(`    mid1=${mid1.toFixed(2)}px → 第1页留白=${margin1Str}, 得分=${score1 === Infinity ? '∞' : score1.toFixed(1)}`)
      console.log(`    mid2=${mid2.toFixed(2)}px → 第1页留白=${margin2Str}, 得分=${score2 === Infinity ? '∞' : score2.toFixed(1)}`)
    }

    // 选择更优的分割点（跳过溢出的方案）
    if (score1 < score2) {
      right = mid2
      if (score1 < bestScore && !isOverflow1) {
        bestScore = score1
        bestBuffer = mid1
        bestPages = result1.pages
        bestHeights = result1.heights
        bestMargin = margin1
        if (i < 3 || i === iterations - 1) {
          console.log(`    ✅ 更新最优解: safetyBuffer=${mid1.toFixed(2)}px, 第1页留白=${margin1.toFixed(1)}px`)
        }
      }
    } else {
      left = mid1
      if (score2 < bestScore && !isOverflow2) {
        bestScore = score2
        bestBuffer = mid2
        bestPages = result2.pages
        bestHeights = result2.heights
        bestMargin = margin2
        if (i < 3 || i === iterations - 1) {
          console.log(`    ✅ 更新最优解: safetyBuffer=${mid2.toFixed(2)}px, 第1页留白=${margin2.toFixed(1)}px`)
        }
      }
    }
  }
  
  // 🔧 修复：处理所有方案都溢出的情况
  if (bestMargin === Infinity || bestMargin < 0) {
    // console.log(`  ⚠️  警告: 所有候选方案都导致页面溢出，使用safetyBuffer=0的初测结果`)
    const fallbackResult = calculateWithBuffer(sourceRoot, 0)
    if (fallbackResult.heights.length > 0) {
      bestBuffer = 0
      bestPages = fallbackResult.pages
      bestHeights = fallbackResult.heights
      bestMargin = getPageMargin(0, fallbackResult.heights[0])
      bestScore = calculateScore(fallbackResult.heights, dynamicTarget, dynamicTolerance)
      // console.log(`  🔄 回退方案: safetyBuffer=0px, 第1页留白=${bestMargin.toFixed(1)}px`)
    }
  }
  
  const bestMarginStr = formatMarginForLog(bestMargin)
  const bestScoreStr = bestScore === Infinity ? '∞' : bestScore.toFixed(1)
  console.log(`  🏆 最终最优解: safetyBuffer=${bestBuffer.toFixed(2)}px, 第1页留白=${bestMarginStr}, 得分=${bestScoreStr}`)
  
  // 🔧 新增：分析结果（只处理非溢出的情况）
  if (bestMargin !== Infinity && bestMargin >= 0 && bestMargin > dynamicTarget + dynamicTolerance) {
    const excess = bestMargin - (dynamicTarget + dynamicTolerance)
    // console.log(`  ⚠️  第1页留白超出目标范围 ${excess.toFixed(1)}px`)
    // console.log(`     可能原因: 某个元素太大，即使safetyBuffer=${bestBuffer.toFixed(2)}px也无法放入第一页`)
  } else if (bestMargin === Infinity || bestMargin < 0) {
    // console.log(`  ❌ 第1页溢出，无法放入所有内容`)
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
    const margin = getPageMargin(i, pageHeights[i])

    if (margin < 0) {
      return Infinity // 溢出，严重惩罚
    }

    if (i === 0) {
      // 🔧 优化：第1页留白过大时给予更重惩罚
      const deviation = Math.abs(margin - dynamicTarget)
      if (margin >= dynamicTarget - dynamicTolerance && margin <= dynamicTarget + dynamicTolerance) {
        totalScore -= 10 // 奖励
      } else if (margin > dynamicTarget + dynamicTolerance) {
        // 🔧 加强：第1页留白超过目标上限时，给予更重惩罚（权重从2+3改为3+5）
        const excess = margin - (dynamicTarget + dynamicTolerance)
        totalScore += deviation * 3 + excess * 5 // 基础偏差惩罚 + 超出部分的额外惩罚
      } else {
        // 留白小于目标下限，给予较轻惩罚（允许稍微紧凑）
        totalScore += deviation * 1.5
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

  const getComputedLineHeight = (sourceRoot: HTMLElement): number => {
    const style = window.getComputedStyle(sourceRoot)
    const raw = style.getPropertyValue('--line-height-body') || style.getPropertyValue('--line-height')
    const parsed = parseFloat(raw)
    if (Number.isFinite(parsed) && parsed > 0) {
      return parsed
    }
    return 1.6
  }

  /**
   * 计算分页
   * @param measureRef - 测量容器元素
   */
  async function calculatePages(measureRef: HTMLElement | null) {
    await nextTick()
    if (!measureRef) return

    const sourceRoot = measureRef
    const currentLineHeight = getComputedLineHeight(sourceRoot)

    // ================= 方案B：动态容差范围 =================
    // 第1步：先用 safetyBuffer=0 粗测一次，了解各页留白情况
    const initialTest = calculateWithBuffer(sourceRoot, 0)
    if (initialTest.heights.length === 0) return

    const initialMargins = initialTest.heights.map((h, index) => getPageMargin(index, h))
    console.log('📊 初测结果 (safetyBuffer=0):', initialMargins.map((m, i) => `第${i+1}页=${m.toFixed(1)}px`).join(', '))
    
    // 🔧 新增：详细分析初测结果
    console.log('📊 初测详细分析:')
    console.log(`  第1页高度: ${initialTest.heights[0].toFixed(1)}px / ${FIRST_PAGE_MAX_CONTENT_HEIGHT}px`)
    console.log(`  第1页留白: ${initialMargins[0].toFixed(1)}px`)
    if (initialMargins.length > 1) {
      console.log(`  第2页留白: ${initialMargins[1].toFixed(1)}px`)
      console.log(`  第2页留白较大，将调整第1页策略`)
    }

    // 第2步：根据第2页留白情况，动态调整第1页的目标和容差（多级策略）
    let dynamicTarget = TARGET_MARGIN
    let dynamicTolerance = MARGIN_TOLERANCE
    let strategy = '标准'

    if (initialMargins.length > 1) {
      const secondPageMargin = initialMargins[1]

      // 根据第2页留白做动态策略，但控制第1页不要过松
      if (secondPageMargin > 300) {
        // 第2页非常空时，第1页控制在 10-18px
        dynamicTarget = 14
        dynamicTolerance = 4
        strategy = '强收紧（优先填充第一页）'
      } else if (secondPageMargin > 150) {
        // 第2页偏空时，第1页控制在 6-14px
        dynamicTarget = 10
        dynamicTolerance = 4
        strategy = '收紧（兼顾第一页紧凑）'
      } else if (secondPageMargin > 100) {
        // 第2页略空时，第1页控制在 4-12px
        dynamicTarget = 8
        dynamicTolerance = 4
        strategy = '适中偏紧（减少第一页留白）'
      } else {
        // 标准：第2页留白≤100px，第1页保持2-10px
        dynamicTarget = TARGET_MARGIN
        dynamicTolerance = MARGIN_TOLERANCE
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
    console.log(`  🎯 搜索目标: 第1页留白=${dynamicTarget}px ± ${dynamicTolerance}px (范围: ${dynamicTarget - dynamicTolerance}-${dynamicTarget + dynamicTolerance}px)`)

    // 使用非负 safetyBuffer，避免强行压缩第一页导致负值
    const optimalResult = findOptimalBufferGoldenSection(
      sourceRoot,
      dynamicTarget,
      dynamicTolerance,
      SAFETY_BUFFER_SEARCH_MIN,
      SAFETY_BUFFER_SEARCH_MAX,
      1
    )

    let bestPagesData = optimalResult.bestPages
    let bestPageHeights = optimalResult.bestHeights
    let bestMargin = optimalResult.bestMargin
    let bestSafetyBuffer = optimalResult.bestBuffer

    // 🔧 修复：处理 Infinity 情况
    const bestMarginStr = formatMarginForLog(bestMargin)
    console.log(`✅ 选择方案: safetyBuffer=${bestSafetyBuffer.toFixed(2)}px, 第1页留白=${bestMarginStr}`)
    
    // 🔧 新增：分析为什么留白这么大（只处理非溢出的情况）
    if (bestMargin !== Infinity && bestMargin >= 0) {
      if (bestMargin > dynamicTarget + dynamicTolerance) {
        const excess = bestMargin - (dynamicTarget + dynamicTolerance)
        // console.log(`⚠️  第1页留白超出目标范围 ${excess.toFixed(1)}px`)
        // console.log(`   可能原因:`)
        // console.log(`   1. 某个元素太大，即使safetyBuffer=${bestSafetyBuffer.toFixed(2)}px也无法放入`)
        // console.log(`   2. 评分函数可能没有足够惩罚留白过大`)
        // console.log(`   3. 动态容差策略选择了较大的目标值`)
      }
    } else {
      // console.log(`❌ 第1页溢出，无法放入所有内容`)
    }
    
    // 可选的激进挤压策略，默认关闭
    if (
      ENABLE_AGGRESSIVE_FIRST_PAGE_SQUEEZE &&
      bestMargin !== Infinity &&
      bestMargin >= 0 &&
      bestMargin >= FIRST_PAGE_MARGIN_TIGHTEN_THRESHOLD
    ) {
      const aggressiveResult = findOptimalBufferGoldenSection(
        sourceRoot,
        Math.min(dynamicTarget, 10),
        Math.min(dynamicTolerance, 4),
        SAFETY_BUFFER_SEARCH_MIN,
        SAFETY_BUFFER_SEARCH_MAX,
        12
      )

      if (aggressiveResult.bestMargin < bestMargin) {
        bestPagesData = aggressiveResult.bestPages
        bestPageHeights = aggressiveResult.bestHeights
        bestMargin = aggressiveResult.bestMargin
        bestSafetyBuffer = aggressiveResult.bestBuffer
      }
    }

    if (ENABLE_LINE_HEIGHT_COMPRESSION) {
      // ================= 方案2：压缩行高优化 =================
      // 🔧 优化：对留白过大的页面应用行高压缩（包括第1页）
      // console.log(`🔧 应用行高压缩优化...`)
      const compressionThreshold = 300 // 留白超过300px时触发压缩
      const firstPageCompressionThreshold = FIRST_PAGE_MARGIN_TIGHTEN_THRESHOLD // 第1页留白超过阈值时也压缩

      // 🔧 新增：如果第1页留白仍然很大，也尝试压缩
      if (bestMargin > firstPageCompressionThreshold) {
        console.log(`   🔧 第1页留白${bestMargin.toFixed(1)}px过大，尝试压缩...`)
        const targetReduction = bestMargin - 12 // 目标：压缩到留白12px左右
        const saved = compressLineHeight(bestPagesData[0], targetReduction, currentLineHeight, true)

        if (saved > 0) {
          // console.log(`   ✨ 第1页压缩完成，节省约${saved.toFixed(1)}px`)

          // 压缩后重新测量实际高度
          const newHeight = measurePageHeight(bestPagesData[0], true)
          const newMargin = getPageMargin(0, newHeight)
          bestPageHeights[0] = newHeight
          console.log(`   📐 第1页实际高度: ${bestPageHeights[0].toFixed(1)}px, 留白: ${newMargin.toFixed(1)}px`)
        }
      }

      // 对留白过大的其他页面应用行高压缩（从第2页开始）
      for (let i = 1; i < bestPageHeights.length; i++) {
        const margin = getPageMargin(i, bestPageHeights[i])

        if (margin > compressionThreshold) {
          const targetReduction = margin - 200 // 目标：压缩到留白200px左右
          const saved = compressLineHeight(bestPagesData[i], targetReduction, currentLineHeight, false)

          if (saved > 0) {
            // console.log(`   ✨ 第${i+1}页压缩完成，节省约${saved.toFixed(1)}px`)

            // 🔧 修复：压缩后重新测量实际高度
            const newHeight = measurePageHeight(bestPagesData[i], false)
            const newMargin = getPageMargin(i, newHeight)
            bestPageHeights[i] = newHeight
            // console.log(`   📐 第${i+1}页实际高度: ${bestPageHeights[i].toFixed(1)}px, 留白: ${newMargin.toFixed(1)}px`)
          }
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

    const firstPageContainer = document.getElementById('page-content-0')
    if (firstPageContainer) {
      applyFirstPageWhitespaceStretch(firstPageContainer, bestMargin)
    }

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
