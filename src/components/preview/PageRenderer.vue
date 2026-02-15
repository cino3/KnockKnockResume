<template>
  <div
    v-for="(_page, index) in renderPages"
    :key="index"
    class="resume-paper screen-page"
    :style="resumeStyle"
  >
    <div :id="`page-content-${index}`" class="page-content-wrapper"></div>
    <div class="page-number">{{ index + 1 }} / {{ renderPages.length }}</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useResumeStore } from '@/stores/resume'

defineProps<{
  renderPages: number[]
}>()

const store = useResumeStore()

const resumeStyle = computed(() => ({
  '--primary': store.theme.primaryColor,
  '--line-height': store.theme.lineHeight,
  '--paragraph-spacing': `${store.theme.paragraphSpacing}px`
}))
</script>
