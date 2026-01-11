***

# 终极修复：简历行级分页 + 打印空白修复

## 目标
这是一个综合性的修复任务，旨在解决两个核心问题：
1.  **分页优化**：将内容分页粒度细化到“文本行（Line）”级别，避免整个模块跨页导致的底部大片留白。
2.  **打印修复**：修复点击浏览器打印/导出 PDF 时页面空白或样式错乱的问题。

---

## 步骤 1：重构 `ResumeContent.vue` (内容原子化)

我们需要将原本长段的文本描述拆分成独立的 DOM 节点（行），以便分页算法可以逐行搬运。

**操作**：请**完全替换** `src/components/ResumeContent.vue` 的内容。

```vue
<template>
  <!-- 头部 -->
  <header class="resume-header">
    <h1 class="name">{{ store.profile.name }}</h1>
    <p class="title">{{ store.profile.title }}</p>
    <div class="contact-info">
      <span v-if="store.profile.mobile">📱 {{ store.profile.mobile }}</span>
      <span v-if="store.profile.email">✉️ {{ store.profile.email }}</span>
      <span v-if="store.profile.location">📍 {{ store.profile.location }}</span>
      <span v-if="store.profile.github">🔗 {{ store.profile.github }}</span>
      <span v-if="store.profile.website">🌐 {{ store.profile.website }}</span>
    </div>
  </header>

  <!-- 个人简介 -->
  <section v-if="store.profile.summary" class="resume-section">
    <h2 class="section-title">个人简介</h2>
    <div class="section-content">
      <!-- 将简介拆分为多行 -->
      <div 
        v-for="(line, index) in formatDescriptionLines(store.profile.summary)" 
        :key="index"
        class="text-line"
      >{{ line }}</div>
    </div>
  </section>

  <!-- 工作经历 -->
  <section v-if="visibleExperiences.length > 0" class="resume-section">
    <h2 class="section-title">工作经历</h2>
    <div
      v-for="exp in visibleExperiences"
      :key="exp.id"
      class="experience-item"
    >
      <div class="item-header">
        <div>
          <h3 class="item-title">{{ exp.company }}</h3>
          <p class="item-subtitle">{{ exp.position }}</p>
        </div>
        <span class="item-date">{{ formatDateRange(exp.startDate, exp.endDate) }}</span>
      </div>
      <!-- 描述文本拆分为多行 -->
      <div class="item-description-wrapper">
        <div 
          v-for="(line, index) in formatDescriptionLines(exp.description)" 
          :key="index"
          class="text-line"
        >{{ line }}</div>
      </div>
    </div>
  </section>

  <!-- 项目经历 -->
  <section v-if="visibleProjects.length > 0" class="resume-section">
    <h2 class="section-title">项目经历</h2>
    <div
      v-for="proj in visibleProjects"
      :key="proj.id"
      class="project-item"
    >
      <div class="item-header">
        <div>
          <h3 class="item-title">{{ proj.name }}</h3>
          <p class="item-subtitle">{{ proj.role }}</p>
        </div>
        <span class="item-date">{{ formatDateRange(proj.startDate, proj.endDate) }}</span>
      </div>
      <div class="item-description-wrapper">
        <div 
          v-for="(line, index) in formatDescriptionLines(proj.description)" 
          :key="index"
          class="text-line"
        >{{ line }}</div>
      </div>
    </div>
  </section>

  <!-- 教育背景 -->
  <section v-if="visibleEducations.length > 0" class="resume-section">
    <h2 class="section-title">教育背景</h2>
    <div
      v-for="edu in visibleEducations"
      :key="edu.id"
      class="education-item"
    >
      <div class="item-header">
        <div>
          <h3 class="item-title">{{ edu.school || '(未填写学校)' }}</h3>
          <p class="item-subtitle">{{ edu.major || '' }} · {{ edu.degree || '' }}</p>
        </div>
        <span class="item-date">{{ formatDateRange(edu.startDate, edu.endDate) }}</span>
      </div>
    </div>
  </section>
  
  <section v-else class="resume-section">
    <div style="color: #999; font-size: 14px; padding: 16px; text-align: center; border: 1px dashed #ddd; border-radius: 4px;">
      暂无教育背景信息
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useResumeStore } from '@/stores/resume'
import dayjs from 'dayjs'

const store = useResumeStore()

const visibleExperiences = computed(() => store.experiences.filter(exp => exp.isVisible))
const visibleProjects = computed(() => store.projects.filter(proj => proj.isVisible))
const visibleEducations = computed(() => store.educations.filter(edu => edu.isVisible))

function formatDateRange(start: string, end: string): string {
  if (!start && !end) return ''
  const startStr = start ? dayjs(start).format('YYYY.MM') : ''
  const endStr = end ? dayjs(end).format('YYYY.MM') : '至今'
  return `${startStr} - ${endStr}`
}

// 核心工具：按换行符拆分文本
function formatDescriptionLines(text: string | undefined): string[] {
  if (!text) return []
  return text.split('\n')
}
</script>

<style scoped>
/* 基础样式 */
.resume-header { border-bottom: 2px solid var(--primary, #2563eb); padding-bottom: 16px; margin-bottom: 24px; }
.name { font-size: 32px; font-weight: 700; color: var(--primary, #2563eb); margin-bottom: 8px; }
.title { font-size: 18px; color: #666; margin-bottom: 12px; }
.contact-info { display: flex; flex-wrap: wrap; gap: 16px; font-size: 14px; color: #666; }
.contact-info span { display: flex; align-items: center; gap: 4px; }

.resume-section { margin-bottom: 32px; }
.section-title { font-size: 20px; font-weight: 600; color: var(--primary, #2563eb); margin-bottom: 16px; padding-bottom: 8px; border-bottom: 1px solid #e5e7eb; }
.section-content { margin-bottom: var(--paragraph-spacing, 8px); }

.experience-item, .project-item, .education-item { margin-bottom: 24px; }

.item-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px; }
.item-title { font-size: 16px; font-weight: 600; color: #333; margin-bottom: 4px; }
.item-subtitle { font-size: 14px; color: #666; }
.item-date { font-size: 14px; color: #999; white-space: nowrap; }

.item-description-wrapper { margin-top: 8px; }

/* 每一行文本的样式：保持高度一致 */
.text-line {
  color: #555;
  line-height: var(--line-height, 1.6);
  min-height: 1.6em; /* 确保空行也有高度 */
  white-space: pre-wrap;
}

@media print {
  .resume-section { margin-bottom: 20px; }
}
</style>
```

---

## 步骤 2: 重构 `ResumePreview.vue` (算法 + 打印样式)

这里合并了“深度优先分页算法”和“打印 CSS 修复”。

**操作**：请**完全替换** 主预览组件（如 `ResumePreview.vue`）的内容。

```vue
<template>
  <div class="preview-container">
    <!-- 缩放控制器 -->
    <div class="scale-control">
      <span>缩放: {{ Math.round(scale * 100) }}%</span>
      <el-slider v-model="scale" :min="0.5" :max="1.5" :step="0.1" style="width: 200px; margin: 0 12px;" />
    </div>

    <!-- 简历页面容器 -->
    <div class="resume-pages-container" :style="{ transform: `scale(${scale})`, transformOrigin: 'top center' }">
      
      <!-- 1. 测量容器 (永远隐藏，仅用于计算) -->
      <div ref="measureRef" class="resume-paper measure-container" :style="resumeStyle">
        <ResumeContent />
      </div>

      <!-- 2. 真实渲染的分页 (JS 计算结果) -->
      <div 
        v-for="(page, index) in renderPages" 
        :key="index"
        class="resume-paper screen-page"
        :style="resumeStyle"
      >
        <div :id="`page-content-${index}`" class="page-content-wrapper"></div>
        <div class="page-number">{{ index + 1 }} / {{ renderPages.length }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, watch, onMounted } from 'vue'
import { useResumeStore } from '@/stores/resume'
import ResumeContent from './ResumeContent.vue'

const store = useResumeStore()
const scale = ref(1)
const measureRef = ref<HTMLElement | null>(null)
const renderPages = ref<number[]>([1])

const resumeStyle = computed(() => ({
  '--primary': store.theme.primaryColor,
  '--line-height': store.theme.lineHeight,
  '--paragraph-spacing': `${store.theme.paragraphSpacing}px`
}))

// A4 规格 (96 DPI)
const A4_HEIGHT_PX = 1123 
const PAGE_PADDING_Y = 150 // 约 20mm * 2
const MAX_CONTENT_HEIGHT = A4_HEIGHT_PX - PAGE_PADDING_Y - 5 // 紧凑计算

/**
 * 深度优先分页算法 (按行拆分)
 */
async function calculatePages() {
  await nextTick()
  if (!measureRef.value) return

  const sourceRoot = measureRef.value
  const pagesData: HTMLElement[][] = []
  
  let currentPageNodes: HTMLElement[] = []
  let currentHeight = 0
  
  const startNewPage = () => {
    if (currentPageNodes.length > 0) pagesData.push(currentPageNodes)
    currentPageNodes = []
    currentHeight = 0
  }

  const getOuterHeight = (el: HTMLElement) => {
    const style = window.getComputedStyle(el)
    const margin = parseFloat(style.marginTop || '0') + parseFloat(style.marginBottom || '0')
    return el.offsetHeight + margin + 1 // +1 缓冲精度
  }

  const topLevelNodes = Array.from(sourceRoot.children) as HTMLElement[]

  for (const sectionNode of topLevelNodes) {
    const isSection = sectionNode.classList.contains('resume-section')
    
    // 非 Section 节点 (如 Header)
    if (!isSection) {
      const h = getOuterHeight(sectionNode)
      if (currentHeight + h > MAX_CONTENT_HEIGHT && currentHeight > 0) startNewPage()
      currentPageNodes.push(sectionNode.cloneNode(true) as HTMLElement)
      currentHeight += h
      continue
    }

    // Section 节点：深入内部拆分
    let currentSectionWrapper = sectionNode.cloneNode(false) as HTMLElement
    currentPageNodes.push(currentSectionWrapper)
    
    const sectionChildren = Array.from(sectionNode.children) as HTMLElement[]
    
    for (const childNode of sectionChildren) {
      const isItem = childNode.classList.contains('experience-item') || 
                     childNode.classList.contains('project-item') || 
                     childNode.classList.contains('education-item')
      const isContent = childNode.classList.contains('section-content')
      
      if (isItem || isContent) {
        // 创建 Item Wrapper
        let currentItemWrapper = childNode.cloneNode(false) as HTMLElement
        currentSectionWrapper.appendChild(currentItemWrapper)
        
        // 递归收集所有原子元素 (Header, Text Lines)
        const atoms: HTMLElement[] = []
        const traverseAtoms = (node: HTMLElement) => {
           if (node.classList.contains('item-header') || node.classList.contains('text-line')) {
             atoms.push(node)
           } else if (node.children.length > 0) {
             Array.from(node.children).forEach(c => traverseAtoms(c as HTMLElement))
           } else {
             atoms.push(node)
           }
        }
        traverseAtoms(childNode)

        // 逐个放入原子元素
        for (const atom of atoms) {
          const atomHeight = getOuterHeight(atom)
          
          if (currentHeight + atomHeight > MAX_CONTENT_HEIGHT) {
            startNewPage()
            // 换页后重建层级：Section -> Item
            currentSectionWrapper = sectionNode.cloneNode(false) as HTMLElement
            currentPageNodes.push(currentSectionWrapper)
            currentItemWrapper = childNode.cloneNode(false) as HTMLElement
            currentSectionWrapper.appendChild(currentItemWrapper)
          }
          
          currentItemWrapper.appendChild(atom.cloneNode(true))
          currentHeight += atomHeight
        }
      } else {
        // 普通子元素 (如 Section Title)
        const h = getOuterHeight(childNode)
        if (currentHeight + h > MAX_CONTENT_HEIGHT) {
          startNewPage()
          currentSectionWrapper = sectionNode.cloneNode(false) as HTMLElement
          currentPageNodes.push(currentSectionWrapper)
        }
        currentSectionWrapper.appendChild(childNode.cloneNode(true))
        currentHeight += h
      }
    }
  }

  if (currentPageNodes.length > 0) pagesData.push(currentPageNodes)
  renderPages.value = pagesData.length > 0 ? Array(pagesData.length).fill(1) : [1]

  await nextTick()
  pagesData.forEach((nodes, index) => {
    const container = document.getElementById(`page-content-${index}`)
    if (container) {
      container.innerHTML = ''
      nodes.forEach(node => container.appendChild(node))
    }
  })
}

watch([() => store.profile, () => store.experiences, () => store.projects, () => store.educations, () => store.theme], () => { calculatePages() }, { deep: true })
onMounted(() => { setTimeout(calculatePages, 500) })
</script>

<style scoped>
/* ================= 预览样式 ================= */
.preview-container {
  position: relative; width: 100%; height: 100%;
  background: #525659; overflow: auto;
}
.scale-control {
  position: fixed; top: 20px; right: 20px; z-index: 100;
  display: flex; align-items: center; background: white;
  padding: 12px 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
.resume-pages-container {
  display: flex; flex-direction: column; align-items: center;
  gap: 20px; padding: 40px 0; width: 100%;
}
.resume-paper {
  width: 210mm; height: 297mm; background: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15); margin: 0;
  box-sizing: border-box; text-align: left;
}

/* 测量容器：永远隐藏 */
.measure-container {
  position: absolute; top: 0; left: 0; visibility: hidden; z-index: -100;
  height: auto !important; min-height: 297mm; padding: 20mm;
}
.screen-page { position: relative; overflow: hidden; }
.page-content-wrapper { width: 100%; height: 100%; padding: 20mm; box-sizing: border-box; }
.page-number {
  position: absolute; bottom: 10px; right: 20px;
  font-size: 12px; color: #999; pointer-events: none;
}

/* ================= 打印样式 (修复空白的关键) ================= */
@media print {
  body * { visibility: hidden; }
  .scale-control, .measure-container, .el-button { display: none !important; }
  
  /* 只让简历内容可见 */
  .preview-container, .resume-pages-container, .resume-pages-container * {
    visibility: visible;
  }

  .preview-container {
    background: white !important; position: absolute; left: 0; top: 0;
    width: 100%; height: auto; margin: 0; padding: 0; overflow: visible;
  }

  /* 核心修复：强制取消缩放 */
  .resume-pages-container {
    transform: none !important; width: 100% !important; margin: 0 !important;
    padding: 0 !important; display: block !important;
  }

  .resume-paper.screen-page {
    box-shadow: none !important; margin: 0 !important; border: none !important;
    width: 100% !important; height: auto !important; min-height: 297mm;
    overflow: visible !important; break-after: page; page-break-after: always;
  }
  
  .resume-paper.screen-page:last-child { break-after: auto; page-break-after: auto; }
  .page-number { display: none; }
  * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
}
</style>
```