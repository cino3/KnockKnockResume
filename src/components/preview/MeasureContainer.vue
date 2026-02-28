<template>
  <div
    ref="measureRef"
    class="resume-paper measure-container"
    :style="resumeStyle"
  >
    <ResumeContent />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useResumeStore } from '@/stores/resume'
import ResumeContent from '../ResumeContent.vue'

const store = useResumeStore()
const measureRef = ref<HTMLElement | null>(null)

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

defineExpose({
  measureRef
})
</script>
