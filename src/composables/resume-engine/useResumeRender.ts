import { useFlowPagination } from './useFlowPagination'
import { useCompactPagination } from './useCompactPagination'
import { useResumeStore } from '@/stores/resume'
import { ElMessage } from 'element-plus'

export function useResumeRender() {
  const store = useResumeStore()
  const flowPagination = useFlowPagination()
  const compactPagination = useCompactPagination(flowPagination.renderPages)

  async function calculatePages(measureRef: HTMLElement | null) {
    if (store.theme.layoutMode === 'compact') {
      const compactResult = await compactPagination.calculateCompactPages(measureRef)

      if (compactResult.fallbackToFlow) {
        store.theme.layoutMode = 'flow'
        ElMessage.warning('内容超出单页承载上限，已自动切回流式多页。')
        return flowPagination.calculatePages(measureRef)
      }

      return compactResult
    }

    return flowPagination.calculatePages(measureRef)
  }

  return {
    renderPages: flowPagination.renderPages,
    calculatePages
  }
}
