<template>
  <div
    v-for="(_page, index) in renderPages"
    :key="index"
    class="resume-paper screen-page"
    :style="resumeStyle"
  >
    <div :id="`page-content-${index}`" class="page-content-wrapper"></div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useResumeStore } from '@/stores/resume'

defineProps<{
  renderPages: number[]
}>()

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
