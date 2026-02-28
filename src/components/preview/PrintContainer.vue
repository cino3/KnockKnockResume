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

const resumeStyle = computed(() => ({
  '--primary': store.theme.primaryColor,
  '--line-height': store.theme.lineHeight,
  '--paragraph-spacing': `${store.theme.paragraphSpacing}px`,
  '--font-size-body': bodyFontSizeMap[store.theme.bodyFontSize] || '14px'
}))
</script>
