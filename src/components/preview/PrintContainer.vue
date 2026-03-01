<template>
  <div
    class="print-only-container"
    :style="resumeStyle"
  >
    <ResumeContent />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useResumeStore } from '@/stores/resume'
import ResumeContent from '../ResumeContent.vue'

const store = useResumeStore()

const bodyFontSizeMap = {
  sm: '13px',
  md: '14px',
  lg: '15px'
} as const

const spacingMap = {
  sm: {
    header: '7px',
    section: '15px',
    divider: '9px',
    item: '9px',
    itemLg: '12px',
    titleTop: '4px',
    titleBottom: '3px',
    sectionPrint: '17px'
  },
  md: {
    header: '8px',
    section: '18px',
    divider: '11px',
    item: '11px',
    itemLg: '14px',
    titleTop: '5px',
    titleBottom: '4px',
    sectionPrint: '20px'
  },
  lg: {
    header: '8px',
    section: '18px',
    divider: '11px',
    item: '11px',
    itemLg: '14px',
    titleTop: '5px',
    titleBottom: '4px',
    sectionPrint: '20px'
  }
} as const

const getSpacingVars = () => spacingMap[store.theme.bodyFontSize] || spacingMap.md

const resumeStyle = computed(() => ({
  '--primary': store.theme.primaryColor,
  '--line-height': store.theme.lineHeight,
  '--paragraph-spacing': `${store.theme.paragraphSpacing}px`,
  '--font-size-body': bodyFontSizeMap[store.theme.bodyFontSize] || '14px',
  // Spacing tokens for resume layout (rounded values per size)
  '--space-header': getSpacingVars().header,
  '--space-section': getSpacingVars().section,
  '--space-divider': getSpacingVars().divider,
  '--space-item': getSpacingVars().item,
  '--space-item-lg': getSpacingVars().itemLg,
  '--space-title-top': getSpacingVars().titleTop,
  '--space-title-bottom': getSpacingVars().titleBottom,
  '--space-section-print': getSpacingVars().sectionPrint
}))
</script>
