import { describe, expect, it } from 'vitest'
import { shouldMoveTitleBlockToNextPage } from '@/composables/usePagination'

describe('usePagination title placement strategy', () => {
  it('keeps title block on current page when title+divider and next first line both fit', () => {
    expect(shouldMoveTitleBlockToNextPage(true, true)).toBe(false)
  })

  it('moves title block when next first line cannot fit', () => {
    expect(shouldMoveTitleBlockToNextPage(true, false)).toBe(true)
  })

  it('moves title block when title+divider cannot fit', () => {
    expect(shouldMoveTitleBlockToNextPage(false, true)).toBe(true)
  })
})
