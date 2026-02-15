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

const resumeStyle = computed(() => ({
  '--primary': store.theme.primaryColor,
  '--line-height': store.theme.lineHeight,
  '--paragraph-spacing': `${store.theme.paragraphSpacing}px`
}))
</script>
