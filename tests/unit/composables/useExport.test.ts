import { describe, it, expect, vi } from 'vitest'
import { useExport } from '@/composables/useExport'

describe('useExport', () => {
  beforeEach(() => {
    // Mock DOM APIs
    global.URL.createObjectURL = vi.fn(() => 'blob:mock-url')
    global.URL.revokeObjectURL = vi.fn()
    global.confirm = vi.fn(() => true)
  })

  it('应该导出、保存、重置功能存在', () => {
    const { exportJSON, save, reset } = useExport('test-filename')

    expect(exportJSON).toBeDefined()
    expect(save).toBeDefined()
    expect(reset).toBeDefined()
  })

  it('save函数应该调用回调', () => {
    const { save } = useExport('test-filename')
    const onSave = vi.fn()

    save(onSave)

    expect(onSave).toHaveBeenCalled()
  })

  it('reset函数应该在确认时调用回调', () => {
    const { reset } = useExport('test-filename')
    const onReset = vi.fn()

    reset(onReset)

    expect(global.confirm).toHaveBeenCalledWith('确定要重置到初始模板吗？当前内容将被覆盖。')
    expect(onReset).toHaveBeenCalled()
  })
})
