import { afterEach, describe, expect, it } from 'vitest'
import {
  applyFirstPageWhitespaceStretch,
  FIRST_PAGE_DETAIL_ITEM_GAP_SHARE,
  FIRST_PAGE_DETAIL_STRETCH_RATIO,
  MAX_FIRST_PAGE_STRETCH_LIMIT
} from '@/composables/usePagination'

describe('usePagination first-page whitespace stretch', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('distributes (margin - first-page-bottom-padding) across first-page sections', () => {
    const page = document.createElement('div')

    const section1 = document.createElement('section')
    section1.className = 'resume-section'
    section1.style.marginBottom = '10px'

    const section2 = document.createElement('section')
    section2.className = 'resume-section'
    section2.style.marginBottom = '10px'

    const section3 = document.createElement('section')
    section3.className = 'resume-section'
    section3.style.marginBottom = '10px'

    page.append(section1, section2, section3)
    document.body.appendChild(page)

    const applied = applyFirstPageWhitespaceStretch(page, 72)

    expect(applied).toBe(true)
    expect(parseFloat(section1.style.marginBottom)).toBeCloseTo(35, 4)
    expect(parseFloat(section2.style.marginBottom)).toBeCloseTo(35, 4)
    expect(parseFloat(section3.style.marginBottom)).toBeCloseTo(10, 4)
  })

  it('skips stretch when distributable whitespace exceeds limit', () => {
    const page = document.createElement('div')
    const section1 = document.createElement('section')
    section1.className = 'resume-section'
    section1.style.marginBottom = '10px'
    const section2 = document.createElement('section')
    section2.className = 'resume-section'
    section2.style.marginBottom = '10px'

    page.append(section1, section2)
    document.body.appendChild(page)

    // 当前第一页下边距为 22px，margin=22+limit+1 时，emptySpace 会超限
    const tooLargeMargin = 23 + MAX_FIRST_PAGE_STRETCH_LIMIT
    const applied = applyFirstPageWhitespaceStretch(page, tooLargeMargin)

    expect(applied).toBe(false)
    expect(parseFloat(section1.style.marginBottom)).toBeCloseTo(10, 4)
    expect(parseFloat(section2.style.marginBottom)).toBeCloseTo(10, 4)
  })

  it('prioritizes a small portion to item gaps and divider gaps', () => {
    const page = document.createElement('div')

    const section1 = document.createElement('section')
    section1.className = 'resume-section'
    section1.style.marginBottom = '10px'

    const divider1 = document.createElement('div')
    divider1.className = 'section-divider'
    divider1.style.marginBottom = '6px'
    section1.appendChild(divider1)

    const exp1 = document.createElement('div')
    exp1.className = 'experience-item'
    exp1.style.marginBottom = '8px'
    const exp2 = document.createElement('div')
    exp2.className = 'experience-item'
    exp2.style.marginBottom = '8px'
    const exp3 = document.createElement('div')
    exp3.className = 'experience-item'
    exp3.style.marginBottom = '8px'
    section1.append(exp1, exp2, exp3)

    const section2 = document.createElement('section')
    section2.className = 'resume-section'
    section2.style.marginBottom = '10px'

    const divider2 = document.createElement('div')
    divider2.className = 'section-divider'
    divider2.style.marginBottom = '6px'
    section2.appendChild(divider2)

    const proj1 = document.createElement('div')
    proj1.className = 'project-item'
    proj1.style.marginBottom = '8px'
    const proj2 = document.createElement('div')
    proj2.className = 'project-item'
    proj2.style.marginBottom = '8px'
    section2.append(proj1, proj2)

    page.append(section1, section2)
    document.body.appendChild(page)

    const applied = applyFirstPageWhitespaceStretch(page, 72)
    expect(applied).toBe(true)

    const emptySpace = 72 - 22
    const detailBudget = emptySpace * FIRST_PAGE_DETAIL_STRETCH_RATIO
    const sectionGapBudget = emptySpace - detailBudget
    const itemGapBudget = detailBudget * FIRST_PAGE_DETAIL_ITEM_GAP_SHARE
    const dividerGapBudget = detailBudget - itemGapBudget

    expect(parseFloat(section1.style.marginBottom)).toBeCloseTo(10 + sectionGapBudget, 4)
    expect(parseFloat(section2.style.marginBottom)).toBeCloseTo(10, 4)

    const itemGapExtra = itemGapBudget / 3
    expect(parseFloat(exp1.style.marginBottom)).toBeCloseTo(8 + itemGapExtra, 4)
    expect(parseFloat(exp2.style.marginBottom)).toBeCloseTo(8 + itemGapExtra, 4)
    expect(parseFloat(exp3.style.marginBottom)).toBeCloseTo(8, 4)
    expect(parseFloat(proj1.style.marginBottom)).toBeCloseTo(8 + itemGapExtra, 4)
    expect(parseFloat(proj2.style.marginBottom)).toBeCloseTo(8, 4)

    const dividerExtra = dividerGapBudget / 2
    expect(parseFloat(divider1.style.marginBottom)).toBeCloseTo(6 + dividerExtra, 4)
    expect(parseFloat(divider2.style.marginBottom)).toBeCloseTo(6 + dividerExtra, 4)
  })
})
