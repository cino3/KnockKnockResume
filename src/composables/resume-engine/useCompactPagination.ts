import { nextTick, type Ref } from 'vue'

const A4_HEIGHT_PX = 1123
const PAGE_PADDING_TOP = 36
const COMPACT_PAGE_PADDING_X = 28
const FIRST_PAGE_PADDING_BOTTOM = 16
const MAX_COMPACT_ATTEMPTS = 120
const EPSILON = 0.0001
const COMPACT_TITLE_FONT_SIZE = 28
const COMPACT_SECTION_TITLE_FONT_SIZE = 17
const COMPACT_BODY_FONT_SIZE_SMALL = 13

const SPACING_VARS = [
  '--space-header',
  '--space-education-item',
  '--space-section',
  '--space-divider',
  '--space-item',
  '--space-item-lg',
  '--space-title-top',
  '--space-title-bottom',
  '--space-section-print'
] as const

const COMPACT_SPACING_MULTIPLIER: Partial<Record<(typeof SPACING_VARS)[number], number>> = {
  '--space-header': 0.42,
  '--space-section': 0.42,
  '--space-section-print': 0.42,
  '--space-divider': 0.5,
  '--space-title-top': 0.55
}

export interface CompactVariables {
  fontSizePx: number
  lineHeight: number
  spacingScale: number
}

export interface CompactVariableBounds {
  minFontSizePx: number
  minLineHeight: number
  minSpacingScale: number
}

export interface CompactVariablePlanResult {
  fitted: boolean
  attempts: number
  variables: CompactVariables
  measuredHeight: number
}

export const getCompactSpacingMultiplier = (
  key: (typeof SPACING_VARS)[number]
): number => COMPACT_SPACING_MULTIPLIER[key] ?? 1

interface FindCompactVariablePlanOptions {
  initial: CompactVariables
  bounds: CompactVariableBounds
  maxHeight: number
  maxAttempts?: number
  measure: (variables: CompactVariables) => number
}

interface RebalanceCompactVariablesOptions {
  current: CompactVariables
  initial: CompactVariables
  maxHeight: number
  maxAttempts?: number
  measure: (variables: CompactVariables) => number
}

interface CompactRenderResult {
  fallbackToFlow: boolean
  totalPages: number
}

const readCSSNumber = (styles: CSSStyleDeclaration, key: string, fallback: number): number => {
  const value = parseFloat(styles.getPropertyValue(key) || '')
  return Number.isFinite(value) ? value : fallback
}

const roundToTwo = (value: number): number => Math.round(value * 100) / 100

const clampMin = (value: number, min: number): number => (value < min ? min : value)

export function findCompactVariablePlan({
  initial,
  bounds,
  maxHeight,
  maxAttempts = MAX_COMPACT_ATTEMPTS,
  measure
}: FindCompactVariablePlanOptions): CompactVariablePlanResult {
  const vars: CompactVariables = {
    fontSizePx: initial.fontSizePx,
    lineHeight: initial.lineHeight,
    spacingScale: initial.spacingScale
  }

  const minFont = bounds.minFontSizePx
  const minLineHeight = bounds.minLineHeight
  const minSpacingScale = bounds.minSpacingScale

  let attempts = 0
  let measuredHeight = measure(vars)

  while (measuredHeight > maxHeight && attempts < maxAttempts) {
    attempts += 1

    if (vars.lineHeight > minLineHeight + EPSILON) {
      vars.lineHeight = roundToTwo(clampMin(vars.lineHeight - 0.03, minLineHeight))
      measuredHeight = measure(vars)
      continue
    }

    if (vars.fontSizePx > minFont + EPSILON) {
      vars.fontSizePx = roundToTwo(clampMin(vars.fontSizePx - 0.5, minFont))
      measuredHeight = measure(vars)
      continue
    }

    if (vars.spacingScale > minSpacingScale + EPSILON) {
      vars.spacingScale = roundToTwo(clampMin(vars.spacingScale - 0.04, minSpacingScale))
      measuredHeight = measure(vars)
      continue
    }

    break
  }

  return {
    fitted: measuredHeight <= maxHeight,
    attempts,
    variables: vars,
    measuredHeight
  }
}

export function rebalanceCompactVariables({
  current,
  initial,
  maxHeight,
  maxAttempts = 80,
  measure
}: RebalanceCompactVariablesOptions): CompactVariables {
  const vars: CompactVariables = {
    fontSizePx: current.fontSizePx,
    lineHeight: current.lineHeight,
    spacingScale: current.spacingScale
  }

  // 偏好：紧凑模式下让字体再小一点，再把空间回补给行高
  const preferredFontSize = roundToTwo(Math.max(11.2, vars.fontSizePx - 1.2))
  if (preferredFontSize < vars.fontSizePx) {
    const fontDownCandidate: CompactVariables = {
      ...vars,
      fontSizePx: preferredFontSize
    }
    const fontDownHeight = measure(fontDownCandidate)
    if (fontDownHeight <= maxHeight) {
      vars.fontSizePx = fontDownCandidate.fontSizePx
    }
  }

  let measuredHeight = measure(vars)
  if (measuredHeight > maxHeight) {
    return vars
  }

  const sectionReclaimBoost = roundToTwo((1 - getCompactSpacingMultiplier('--space-section')) * 0.1)
  const maxReadableLineHeight = roundToTwo(initial.lineHeight + 0.32 + sectionReclaimBoost)
  const dividerReclaimBoost = roundToTwo((1 - getCompactSpacingMultiplier('--space-divider')) * 0.8)
  const maxReadableFontSize = roundToTwo(
    Math.min(initial.fontSizePx - 0.25, preferredFontSize + dividerReclaimBoost)
  )

  let attempts = 0
  while (attempts < maxAttempts) {
    attempts += 1
    let changed = false

    if (vars.lineHeight < maxReadableLineHeight - EPSILON) {
      const candidate: CompactVariables = {
        ...vars,
        lineHeight: roundToTwo(Math.min(maxReadableLineHeight, vars.lineHeight + 0.05))
      }
      const candidateHeight = measure(candidate)
      if (candidateHeight <= maxHeight) {
        vars.lineHeight = candidate.lineHeight
        measuredHeight = candidateHeight
        changed = true
      }
    }

    if (vars.fontSizePx < maxReadableFontSize - EPSILON) {
      const candidate: CompactVariables = {
        ...vars,
        fontSizePx: roundToTwo(Math.min(maxReadableFontSize, vars.fontSizePx + 0.06))
      }
      const candidateHeight = measure(candidate)
      if (candidateHeight <= maxHeight) {
        vars.fontSizePx = candidate.fontSizePx
        measuredHeight = candidateHeight
        changed = true
      }
    }

    if (!changed || maxHeight - measuredHeight <= 1) {
      break
    }
  }

  return vars
}

function applyCompactVariables(
  target: HTMLElement,
  variables: CompactVariables,
  baseSpacingValues: Record<(typeof SPACING_VARS)[number], number>
): void {
  target.style.padding = `${PAGE_PADDING_TOP}px ${COMPACT_PAGE_PADDING_X}px ${FIRST_PAGE_PADDING_BOTTOM}px ${COMPACT_PAGE_PADDING_X}px`
  target.style.setProperty('--font-size-body', `${variables.fontSizePx}px`)
  target.style.setProperty('--line-height', String(variables.lineHeight))

  SPACING_VARS.forEach((key) => {
    const baseValue = baseSpacingValues[key]
    const multiplier = getCompactSpacingMultiplier(key)
    target.style.setProperty(key, `${roundToTwo(baseValue * variables.spacingScale * multiplier)}px`)
  })

  // Compact mode always uses S title sizing so results are stable regardless of prior flow settings.
  target.querySelectorAll('.name').forEach((el) => {
    (el as HTMLElement).style.fontSize = `${COMPACT_TITLE_FONT_SIZE}px`
  })
  target.querySelectorAll('.section-title').forEach((el) => {
    (el as HTMLElement).style.fontSize = `${COMPACT_SECTION_TITLE_FONT_SIZE}px`
  })
}

function measureWithVariables(
  sourceRoot: HTMLElement,
  variables: CompactVariables,
  baseSpacingValues: Record<(typeof SPACING_VARS)[number], number>
): number {
  const tempContainer = document.createElement('div')
  tempContainer.style.width = '794px'
  tempContainer.style.padding = `${PAGE_PADDING_TOP}px ${COMPACT_PAGE_PADDING_X}px ${FIRST_PAGE_PADDING_BOTTOM}px ${COMPACT_PAGE_PADDING_X}px`
  tempContainer.style.visibility = 'hidden'
  tempContainer.style.position = 'absolute'
  tempContainer.style.top = '-9999px'
  tempContainer.style.boxSizing = 'border-box'

  applyCompactVariables(tempContainer, variables, baseSpacingValues)

  Array.from(sourceRoot.children).forEach((node) => {
    tempContainer.appendChild(node.cloneNode(true))
  })

  document.body.appendChild(tempContainer)
  const height = tempContainer.offsetHeight
  document.body.removeChild(tempContainer)

  return height
}

export function useCompactPagination(renderPages: Ref<number[]>) {
  async function calculateCompactPages(measureRef: HTMLElement | null): Promise<CompactRenderResult> {
    await nextTick()
    if (!measureRef) {
      return { fallbackToFlow: false, totalPages: 1 }
    }

    const sourceRoot = measureRef
    const sourceStyles = window.getComputedStyle(sourceRoot)

    const initialVariables: CompactVariables = {
      // Compact mode always starts from "small" body size for stable output.
      fontSizePx: COMPACT_BODY_FONT_SIZE_SMALL,
      lineHeight: readCSSNumber(sourceStyles, '--line-height', 1.6),
      spacingScale: 1
    }

    const baseSpacingValues = SPACING_VARS.reduce((acc, key) => {
      acc[key] = readCSSNumber(sourceStyles, key, 10)
      return acc
    }, {} as Record<(typeof SPACING_VARS)[number], number>)

    const plan = findCompactVariablePlan({
      initial: initialVariables,
      bounds: {
        minFontSizePx: 12,
        minLineHeight: 1.35,
        minSpacingScale: 0.8
      },
      maxHeight: A4_HEIGHT_PX,
      measure: (variables) => measureWithVariables(sourceRoot, variables, baseSpacingValues)
    })

    if (!plan.fitted) {
      return { fallbackToFlow: true, totalPages: 1 }
    }

    const balancedVariables = rebalanceCompactVariables({
      current: plan.variables,
      initial: initialVariables,
      maxHeight: A4_HEIGHT_PX,
      measure: (variables) => measureWithVariables(sourceRoot, variables, baseSpacingValues)
    })

    renderPages.value = [0]
    await nextTick()

    const container = document.getElementById('page-content-0')
    if (!container) {
      return { fallbackToFlow: false, totalPages: 1 }
    }

    container.innerHTML = ''
    Array.from(sourceRoot.children).forEach((node) => {
      container.appendChild(node.cloneNode(true))
    })

    applyCompactVariables(container, balancedVariables, baseSpacingValues)

    return {
      fallbackToFlow: false,
      totalPages: 1
    }
  }

  return {
    calculateCompactPages
  }
}
