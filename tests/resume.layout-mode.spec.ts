import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useResumeStore } from '@/stores/resume'

describe('resume store layout mode', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  it('defaults to flow layout mode', () => {
    const store = useResumeStore()
    expect(store.theme.layoutMode).toBe('flow')
  })

  it('imports compact layout mode from theme data', () => {
    const store = useResumeStore()

    store.importData({
      theme: {
        layoutMode: 'compact'
      }
    })

    expect(store.theme.layoutMode).toBe('compact')
  })

  it('falls back to flow when imported theme has no layout mode', () => {
    const store = useResumeStore()

    store.importData({
      theme: {}
    })

    expect(store.theme.layoutMode).toBe('flow')
  })
})
