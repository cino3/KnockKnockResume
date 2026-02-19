<template>
  <div class="sidebar-wrapper">
    <SidebarToggle
      :is-collapsed="isCollapsed"
      @toggle="toggleSidebar"
    />

    <aside class="sidebar" :class="{ 'is-collapsed': isCollapsed }">
      <SidebarHeader v-show="!isCollapsed" />

      <SidebarTabs
        v-show="!isCollapsed"
        v-model="currentTab"
      />

      <div class="scroll-content" v-show="!isCollapsed">
        <ContentEditor v-show="currentTab === 'content'" />
        <DesignEditor v-show="currentTab === 'design'" />
      </div>

      <SidebarFooter
        v-show="!isCollapsed"
        @save="handleSave"
        @export-json="handleExportJSON"
        @import-json="handleImportJSON"
        @export-pdf="handleExportPDF"
        @reset="handleReset"
      />
    </aside>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useResumeStore } from '@/stores/resume'
import { usePrint } from '@/composables/usePrint'
import { useExport } from '@/composables/useExport'
import SidebarToggle from './sidebar/SidebarToggle.vue'
import SidebarHeader from './sidebar/SidebarHeader.vue'
import SidebarTabs from './sidebar/SidebarTabs.vue'
import ContentEditor from './sidebar/ContentEditor.vue'
import DesignEditor from './sidebar/DesignEditor.vue'
import SidebarFooter from './sidebar/SidebarFooter.vue'

const store = useResumeStore()
const { printResume } = usePrint(store.resumeFileName)
const { exportJSON, importJSON, save, reset } = useExport(store.resumeFileName)

const isCollapsed = ref(false)
const currentTab = ref<'content' | 'design'>('content')

const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value
}

const handleExportPDF = () => {
  printResume()
}

const handleSave = () => {
  save(() => store.updateLastSavedTime())
}

const handleExportJSON = () => {
  const data = store.getExportData()
  exportJSON(data)
}

const handleReset = () => {
  reset(() => store.resetData())
}

const handleImportJSON = () => {
  importJSON((data) => {
    return store.importData(data)
  })
}
</script>

<style>
@import '@/styles/sidebar.scss';
</style>
