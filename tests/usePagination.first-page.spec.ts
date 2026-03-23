import { describe, expect, it } from 'vitest'
import {
  ENABLE_AGGRESSIVE_FIRST_PAGE_SQUEEZE,
  ENABLE_LINE_HEIGHT_COMPRESSION,
  FIRST_PAGE_MAX_CONTENT_HEIGHT,
  formatMarginForLog,
  MAX_CONTENT_HEIGHT,
  SAFETY_BUFFER_SEARCH_MAX,
  SAFETY_BUFFER_SEARCH_MIN
} from '@/composables/usePagination'

describe('usePagination first-page capacity', () => {
  it('keeps the normal page max content height unchanged', () => {
    expect(MAX_CONTENT_HEIGHT).toBe(1030)
  })

  it('allocates more usable content height to the first page', () => {
    expect(FIRST_PAGE_MAX_CONTENT_HEIGHT).toBe(1065)
    expect(FIRST_PAGE_MAX_CONTENT_HEIGHT).toBeGreaterThan(MAX_CONTENT_HEIGHT)
  })

  it('disables line-height compression during pagination', () => {
    expect(ENABLE_LINE_HEIGHT_COMPRESSION).toBe(false)
  })

  it('does not allow negative safetyBuffer squeezing', () => {
    expect(SAFETY_BUFFER_SEARCH_MIN).toBe(0)
    expect(SAFETY_BUFFER_SEARCH_MAX).toBe(0)
    expect(ENABLE_AGGRESSIVE_FIRST_PAGE_SQUEEZE).toBe(false)
  })

  it('formats overflow margins as 0px in logs', () => {
    expect(formatMarginForLog(-1)).toBe('0.0px')
    expect(formatMarginForLog(Infinity)).toBe('0.0px')
  })
})
