import { describe, expect, it } from 'vitest'
import {
  findCompactVariablePlan,
  getCompactSpacingMultiplier,
  rebalanceCompactVariables,
  type CompactVariableBounds,
  type CompactVariables
} from '@/composables/resume-engine/useCompactPagination'

const DEFAULT_BOUNDS: CompactVariableBounds = {
  minFontSizePx: 12,
  minLineHeight: 1.35,
  minSpacingScale: 0.8
}

describe('useCompactPagination variable plan', () => {
  it('reduces line-height first when content only slightly overflows', () => {
    const initial: CompactVariables = {
      fontSizePx: 14,
      lineHeight: 1.6,
      spacingScale: 1
    }

    const result = findCompactVariablePlan({
      initial,
      bounds: DEFAULT_BOUNDS,
      maxHeight: 1000,
      measure: (vars) => 995 + (vars.lineHeight - 1.35) * 60
    })

    expect(result.fitted).toBe(true)
    expect(result.variables.lineHeight).toBeLessThan(initial.lineHeight)
    expect(result.variables.fontSizePx).toBe(initial.fontSizePx)
    expect(result.variables.spacingScale).toBe(initial.spacingScale)
  })

  it('reports non-fittable when all variables reach minimum bounds', () => {
    const initial: CompactVariables = {
      fontSizePx: 14,
      lineHeight: 1.6,
      spacingScale: 1
    }

    const result = findCompactVariablePlan({
      initial,
      bounds: DEFAULT_BOUNDS,
      maxHeight: 200,
      measure: () => 1200
    })

    expect(result.fitted).toBe(false)
    expect(result.variables.fontSizePx).toBe(DEFAULT_BOUNDS.minFontSizePx)
    expect(result.variables.lineHeight).toBe(DEFAULT_BOUNDS.minLineHeight)
    expect(result.variables.spacingScale).toBe(DEFAULT_BOUNDS.minSpacingScale)
  })

  it('uses tighter spacing multipliers for section and divider in compact mode', () => {
    expect(getCompactSpacingMultiplier('--space-header')).toBe(0.42)
    expect(getCompactSpacingMultiplier('--space-section')).toBe(0.42)
    expect(getCompactSpacingMultiplier('--space-section-print')).toBe(0.42)
    expect(getCompactSpacingMultiplier('--space-divider')).toBe(0.5)
    expect(getCompactSpacingMultiplier('--space-title-top')).toBe(0.55)
    expect(getCompactSpacingMultiplier('--space-item')).toBe(1)
  })

  it('feeds remaining whitespace back to larger line-height and restores some font size', () => {
    const initial: CompactVariables = {
      fontSizePx: 14,
      lineHeight: 1.6,
      spacingScale: 1
    }
    const compressed: CompactVariables = {
      fontSizePx: 12.5,
      lineHeight: 1.4,
      spacingScale: 0.85
    }

    const result = rebalanceCompactVariables({
      current: compressed,
      initial,
      maxHeight: 1123,
      measure: (vars) => 1060 + (vars.lineHeight - 1.4) * 180 + (vars.fontSizePx - 12.5) * 70
    })

    expect(result.lineHeight).toBeGreaterThan(compressed.lineHeight)
    expect(result.fontSizePx).toBeGreaterThan(11.5)
    expect(result.fontSizePx).toBeLessThanOrEqual(compressed.fontSizePx)
    expect(result.lineHeight).toBeLessThanOrEqual(initial.lineHeight + 0.38)
    expect(result.fontSizePx).toBeLessThan(initial.fontSizePx)
    expect(1060 + (result.lineHeight - 1.4) * 180 + (result.fontSizePx - 12.5) * 70).toBeLessThanOrEqual(1123)
  })
})
