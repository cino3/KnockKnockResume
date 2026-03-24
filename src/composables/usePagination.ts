export { useResumeRender as usePagination } from './resume-engine/useResumeRender'

export {
  applyFirstPageWhitespaceStretch,
  ENABLE_AGGRESSIVE_FIRST_PAGE_SQUEEZE,
  ENABLE_LINE_HEIGHT_COMPRESSION,
  FIRST_PAGE_DETAIL_ITEM_GAP_SHARE,
  FIRST_PAGE_DETAIL_STRETCH_RATIO,
  FIRST_PAGE_MAX_CONTENT_HEIGHT,
  formatMarginForLog,
  getOuterHeight,
  getOuterHeightWithCollapse,
  MAX_CONTENT_HEIGHT,
  MAX_FIRST_PAGE_STRETCH_LIMIT,
  SAFETY_BUFFER_SEARCH_MAX,
  SAFETY_BUFFER_SEARCH_MIN,
  shouldMoveTitleBlockToNextPage
} from './resume-engine/useFlowPagination'
