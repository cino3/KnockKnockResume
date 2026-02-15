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

const resumeStyle = computed(() => ({
  '--primary': store.theme.primaryColor,
  '--line-height': store.theme.lineHeight,
  '--paragraph-spacing': `${store.theme.paragraphSpacing}px`
}))

defineExpose({
  measureRef
})
</script>
