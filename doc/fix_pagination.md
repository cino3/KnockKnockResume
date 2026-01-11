\*\*\*



\# Fix Vue3 Resume Pagination Truncation Issue



\## Objective

The current resume pagination logic uses `translateY` offsets which visually truncates content (e.g., cutting text in half) when it crosses page boundaries.

We need to refactor this to use a \*\*"Bin Packing" algorithm\*\*:

1\. Render the full content in a hidden measurement container.

2\. Calculate the height of each DOM element.

3\. Distribute elements into separate page containers (DOM nodes).

4\. If a section crosses a page break, split the section container so items flow naturally to the next page without being cut off.



\## Task 1: Update `ResumeContent.vue`

Ensure the content component has the correct class names for the pagination algorithm to recognize.



\*\*File Path\*\*: Please locate the file corresponding to the resume content (e.g., `src/components/ResumeContent.vue` or similar).



\*\*Action\*\*: Replace the file content with the following. The key changes are the addition of `avoid-break` classes and ensuring the `resume-section` structure is consistent.



```vue

<template>

&nbsp; <!-- 头部 -->

&nbsp; <header class="resume-header">

&nbsp;   <h1 class="name">{{ store.profile.name }}</h1>

&nbsp;   <p class="title">{{ store.profile.title }}</p>

&nbsp;   <div class="contact-info">

&nbsp;     <span v-if="store.profile.mobile">📱 {{ store.profile.mobile }}</span>

&nbsp;     <span v-if="store.profile.email">✉️ {{ store.profile.email }}</span>

&nbsp;     <span v-if="store.profile.location">📍 {{ store.profile.location }}</span>

&nbsp;     <span v-if="store.profile.github">🔗 {{ store.profile.github }}</span>

&nbsp;     <span v-if="store.profile.website">🌐 {{ store.profile.website }}</span>

&nbsp;   </div>

&nbsp; </header>



&nbsp; <!-- 个人简介 -->

&nbsp; <section v-if="store.profile.summary" class="resume-section">

&nbsp;   <h2 class="section-title">个人简介</h2>

&nbsp;   <p class="section-content">{{ store.profile.summary }}</p>

&nbsp; </section>



&nbsp; <!-- 工作经历 -->

&nbsp; <section v-if="visibleExperiences.length > 0" class="resume-section">

&nbsp;   <h2 class="section-title">工作经历</h2>

&nbsp;   <div

&nbsp;     v-for="exp in visibleExperiences"

&nbsp;     :key="exp.id"

&nbsp;     class="experience-item avoid-break"

&nbsp;   >

&nbsp;     <div class="item-header">

&nbsp;       <div>

&nbsp;         <h3 class="item-title">{{ exp.company }}</h3>

&nbsp;         <p class="item-subtitle">{{ exp.position }}</p>

&nbsp;       </div>

&nbsp;       <span class="item-date">{{ formatDateRange(exp.startDate, exp.endDate) }}</span>

&nbsp;     </div>

&nbsp;     <p class="item-description">{{ exp.description }}</p>

&nbsp;   </div>

&nbsp; </section>



&nbsp; <!-- 项目经历 -->

&nbsp; <section v-if="visibleProjects.length > 0" class="resume-section">

&nbsp;   <h2 class="section-title">项目经历</h2>

&nbsp;   <div

&nbsp;     v-for="proj in visibleProjects"

&nbsp;     :key="proj.id"

&nbsp;     class="project-item avoid-break"

&nbsp;   >

&nbsp;     <div class="item-header">

&nbsp;       <div>

&nbsp;         <h3 class="item-title">{{ proj.name }}</h3>

&nbsp;         <p class="item-subtitle">{{ proj.role }}</p>

&nbsp;       </div>

&nbsp;       <span class="item-date">{{ formatDateRange(proj.startDate, proj.endDate) }}</span>

&nbsp;     </div>

&nbsp;     <p class="item-description">{{ proj.description }}</p>

&nbsp;   </div>

&nbsp; </section>



&nbsp; <!-- 教育背景 -->

&nbsp; <section v-if="visibleEducations.length > 0" class="resume-section">

&nbsp;   <h2 class="section-title">教育背景</h2>

&nbsp;   <div

&nbsp;     v-for="edu in visibleEducations"

&nbsp;     :key="edu.id"

&nbsp;     class="education-item avoid-break"

&nbsp;   >

&nbsp;     <div class="item-header">

&nbsp;       <div>

&nbsp;         <h3 class="item-title">{{ edu.school || '(未填写学校)' }}</h3>

&nbsp;         <p class="item-subtitle">{{ edu.major || '' }} · {{ edu.degree || '' }}</p>

&nbsp;       </div>

&nbsp;       <span class="item-date">{{ formatDateRange(edu.startDate, edu.endDate) }}</span>

&nbsp;     </div>

&nbsp;   </div>

&nbsp; </section>

&nbsp; 

&nbsp; <section v-else class="resume-section">

&nbsp;   <div style="color: #999; font-size: 14px; padding: 16px; text-align: center; border: 1px dashed #ddd; border-radius: 4px;">

&nbsp;     暂无教育背景信息

&nbsp;   </div>

&nbsp; </section>

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

&nbsp; if (!start \&\& !end) return ''

&nbsp; const startStr = start ? dayjs(start).format('YYYY.MM') : ''

&nbsp; const endStr = end ? dayjs(end).format('YYYY.MM') : '至今'

&nbsp; return `${startStr} - ${endStr}`

}

</script>



<style scoped>

/\* Base Styles \*/

.resume-header { border-bottom: 2px solid var(--primary, #2563eb); padding-bottom: 16px; margin-bottom: 24px; }

.name { font-size: 32px; font-weight: 700; color: var(--primary, #2563eb); margin-bottom: 8px; }

.title { font-size: 18px; color: #666; margin-bottom: 12px; }

.contact-info { display: flex; flex-wrap: wrap; gap: 16px; font-size: 14px; color: #666; }

.contact-info span { display: flex; align-items: center; gap: 4px; }



.resume-section { margin-bottom: 32px; }

.section-title { font-size: 20px; font-weight: 600; color: var(--primary, #2563eb); margin-bottom: 16px; padding-bottom: 8px; border-bottom: 1px solid #e5e7eb; }

.section-content { color: #555; white-space: pre-wrap; margin-bottom: var(--paragraph-spacing, 8px); }



.experience-item, .project-item, .education-item { margin-bottom: 24px; }



/\* Critical for calculation: Identify items that shouldn't be broken internally \*/

.experience-item.avoid-break,

.project-item.avoid-break,

.education-item.avoid-break {

&nbsp; break-inside: avoid;

&nbsp; page-break-inside: avoid;

}



.item-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px; }

.item-title { font-size: 16px; font-weight: 600; color: #333; margin-bottom: 4px; }

.item-subtitle { font-size: 14px; color: #666; }

.item-date { font-size: 14px; color: #999; white-space: nowrap; }

.item-description { color: #555; white-space: pre-wrap; margin-top: 8px; line-height: var(--line-height, 1.6); }



@media print {

&nbsp; /\* Ensure clean print \*/

&nbsp; .resume-section { margin-bottom: 20px; }

}

</style>

```



\## Task 2: Update `ResumePreview.vue` (The Container)

Refactor the main preview component to implement the node-splitting logic.



\*\*File Path\*\*: Please locate the main file provided in the context (usually `src/views/ResumePreview.vue` or similar, the one with `resume-pages-container`).



\*\*Action\*\*: Replace the file content with this completely refactored version.



```vue

<template>

&nbsp; <div class="preview-container">

&nbsp;   <!-- Scale Controller -->

&nbsp;   <div class="scale-control">

&nbsp;     <span>缩放: {{ Math.round(scale \* 100) }}%</span>

&nbsp;     <el-slider v-model="scale" :min="0.5" :max="1.5" :step="0.1" style="width: 200px; margin: 0 12px;" />

&nbsp;   </div>



&nbsp;   <div class="resume-pages-container" :style="{ transform: `scale(${scale})`, transformOrigin: 'top center' }">

&nbsp;     

&nbsp;     <!-- 1. Measurement Container (Invisible Source) -->

&nbsp;     <!-- This renders the full content once so we can measure heights -->

&nbsp;     <div ref="measureRef" class="resume-paper measure-container" :style="resumeStyle">

&nbsp;       <ResumeContent />

&nbsp;     </div>



&nbsp;     <!-- 2. Actual Rendered Pages (Generated by JS) -->

&nbsp;     <div 

&nbsp;       v-for="(page, index) in renderPages" 

&nbsp;       :key="index"

&nbsp;       class="resume-paper screen-page"

&nbsp;       :style="resumeStyle"

&nbsp;     >

&nbsp;       <!-- Dynamic content will be injected here -->

&nbsp;       <div :id="`page-content-${index}`" class="page-content-wrapper"></div>

&nbsp;       

&nbsp;       <!-- Page Number -->

&nbsp;       <div class="page-number">

&nbsp;         {{ index + 1 }} / {{ renderPages.length }}

&nbsp;       </div>

&nbsp;     </div>

&nbsp;   </div>

&nbsp; </div>

</template>



<script setup lang="ts">

import { ref, computed, nextTick, watch, onMounted } from 'vue'

import { useResumeStore } from '@/stores/resume'

import ResumeContent from './ResumeContent.vue'



const store = useResumeStore()

const scale = ref(1)



// References

const measureRef = ref<HTMLElement | null>(null)

// This array's length determines how many page containers to render

const renderPages = ref<number\[]>(\[1])



const resumeStyle = computed(() => ({

&nbsp; '--primary': store.theme.primaryColor,

&nbsp; '--line-height': store.theme.lineHeight,

&nbsp; '--paragraph-spacing': `${store.theme.paragraphSpacing}px`

}))



// Constants for A4 (96 DPI)

const A4\_HEIGHT\_PX = 1123 

const PAGE\_PADDING\_Y = 150 // Approx 20mm \* 2 (top + bottom)

const MAX\_CONTENT\_HEIGHT = A4\_HEIGHT\_PX - PAGE\_PADDING\_Y - 10 // Safety buffer



/\*\*

&nbsp;\* Core Logic: Calculate Pages by distributing DOM nodes

&nbsp;\*/

async function calculatePages() {

&nbsp; // 1. Wait for Vue to render the measurement source

&nbsp; await nextTick()

&nbsp; if (!measureRef.value) return



&nbsp; const sourceRoot = measureRef.value

&nbsp; const pagesData: HTMLElement\[]\[] = \[] 

&nbsp; 

&nbsp; let currentPageNodes: HTMLElement\[] = \[]

&nbsp; let currentHeight = 0

&nbsp; 

&nbsp; // Helper: Commit current page and start a new one

&nbsp; const startNewPage = () => {

&nbsp;   if (currentPageNodes.length > 0) {

&nbsp;     pagesData.push(currentPageNodes)

&nbsp;   }

&nbsp;   currentPageNodes = \[]

&nbsp;   currentHeight = 0

&nbsp; }



&nbsp; // Helper: Get element height including margin

&nbsp; const getOuterHeight = (el: HTMLElement) => {

&nbsp;   const style = window.getComputedStyle(el)

&nbsp;   const margin = parseInt(style.marginTop || '0') + parseInt(style.marginBottom || '0')

&nbsp;   return el.offsetHeight + margin

&nbsp; }



&nbsp; // 2. Traverse high-level blocks (Headers, Sections)

&nbsp; const topLevelNodes = Array.from(sourceRoot.children) as HTMLElement\[]



&nbsp; for (const node of topLevelNodes) {

&nbsp;   const isSection = node.classList.contains('resume-section')

&nbsp;   

&nbsp;   if (isSection) {

&nbsp;     // --- Handle Complex Sections (Title + Items) ---

&nbsp;     const title = node.querySelector('.section-title') as HTMLElement

&nbsp;     const content = node.querySelector('.section-content') as HTMLElement // For Summary

&nbsp;     // Find all list items (Experience, Project, Education)

&nbsp;     const items = Array.from(node.querySelectorAll('.experience-item, .project-item, .education-item')) as HTMLElement\[]

&nbsp;     

&nbsp;     // If it's a simple section (like Summary), treat as one block if possible

&nbsp;     if (content \&\& items.length === 0) {

&nbsp;       const nodeHeight = getOuterHeight(node)

&nbsp;       if (currentHeight + nodeHeight > MAX\_CONTENT\_HEIGHT) {

&nbsp;          startNewPage()

&nbsp;       }

&nbsp;       currentPageNodes.push(node.cloneNode(true) as HTMLElement)

&nbsp;       currentHeight += nodeHeight

&nbsp;       continue

&nbsp;     }



&nbsp;     // If it's a list section, we split it

&nbsp;     const titleHeight = title ? getOuterHeight(title) : 0

&nbsp;     

&nbsp;     // Check if Title fits

&nbsp;     if (currentHeight + titleHeight > MAX\_CONTENT\_HEIGHT) {

&nbsp;       startNewPage()

&nbsp;     }



&nbsp;     // Create a wrapper for this section on the current page

&nbsp;     let currentSectionWrapper = node.cloneNode(false) as HTMLElement

&nbsp;     currentPageNodes.push(currentSectionWrapper)

&nbsp;     

&nbsp;     if (title) {

&nbsp;       currentSectionWrapper.appendChild(title.cloneNode(true))

&nbsp;       currentHeight += titleHeight

&nbsp;     }



&nbsp;     // Process Items

&nbsp;     for (const item of items) {

&nbsp;       const itemHeight = getOuterHeight(item)

&nbsp;       

&nbsp;       // Check if Item fits

&nbsp;       if (currentHeight + itemHeight > MAX\_CONTENT\_HEIGHT) {

&nbsp;         startNewPage()

&nbsp;         

&nbsp;         // New page needs a new Section Wrapper (to keep CSS context)

&nbsp;         currentSectionWrapper = node.cloneNode(false) as HTMLElement

&nbsp;         currentPageNodes.push(currentSectionWrapper)

&nbsp;         // Optional: You could re-add the title here if you want "Experience (cont.)"

&nbsp;       }

&nbsp;       

&nbsp;       currentSectionWrapper.appendChild(item.cloneNode(true))

&nbsp;       currentHeight += itemHeight

&nbsp;     }



&nbsp;   } else {

&nbsp;     // --- Handle Simple Nodes (Header, Contact, etc.) ---

&nbsp;     const nodeHeight = getOuterHeight(node)

&nbsp;     

&nbsp;     if (currentHeight + nodeHeight > MAX\_CONTENT\_HEIGHT) {

&nbsp;       startNewPage()

&nbsp;     }

&nbsp;     

&nbsp;     currentPageNodes.push(node.cloneNode(true) as HTMLElement)

&nbsp;     currentHeight += nodeHeight

&nbsp;   }

&nbsp; }



&nbsp; // Commit the final page

&nbsp; if (currentPageNodes.length > 0) {

&nbsp;   pagesData.push(currentPageNodes)

&nbsp; }



&nbsp; // 3. Update State and Render

&nbsp; // Set array length to trigger v-for

&nbsp; renderPages.value = pagesData.length > 0 ? Array(pagesData.length).fill(1) : \[1]



&nbsp; // Inject DOM nodes into the rendered pages

&nbsp; await nextTick()

&nbsp; pagesData.forEach((nodes, index) => {

&nbsp;   const container = document.getElementById(`page-content-${index}`)

&nbsp;   if (container) {

&nbsp;     container.innerHTML = '' 

&nbsp;     nodes.forEach(node => container.appendChild(node))

&nbsp;   }

&nbsp; })

}



// Watchers

watch(

&nbsp; \[() => store.profile, () => store.experiences, () => store.projects, () => store.educations, () => store.theme],

&nbsp; () => { calculatePages() },

&nbsp; { deep: true }

)



onMounted(() => {

&nbsp; // Small delay to ensure fonts/styles are fully applied before measuring

&nbsp; setTimeout(calculatePages, 500)

})

</script>



<style scoped>

.preview-container { position: relative; width: 100%; height: 100%; }



.scale-control {

&nbsp; position: fixed; top: 20px; right: 20px; z-index: 100;

&nbsp; display: flex; align-items: center; background: white;

&nbsp; padding: 12px 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

}



.resume-pages-container {

&nbsp; display: flex; flex-direction: column; align-items: center;

&nbsp; gap: 20px; padding: 20px 0; width: 100%;

}



.resume-paper {

&nbsp; width: 210mm; height: 297mm;

&nbsp; background: white;

&nbsp; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

&nbsp; margin: 0; box-sizing: border-box;

&nbsp; /\* Reset print styles \*/

&nbsp; page-break-after: always;

}



/\* Measurement Container: Hidden but preserves layout for reading \*/

.measure-container {

&nbsp; position: absolute; top: 0; left: 0;

&nbsp; visibility: hidden; z-index: -100;

&nbsp; height: auto !important; min-height: 297mm;

&nbsp; padding: 20mm; /\* Match the padding of real pages \*/

}



/\* Real Pages \*/

.screen-page {

&nbsp; position: relative;

&nbsp; overflow: hidden;

}



.page-content-wrapper {

&nbsp; width: 100%; height: 100%;

&nbsp; padding: 20mm; /\* Consistent padding \*/

&nbsp; box-sizing: border-box;

}



.page-number {

&nbsp; position: absolute; bottom: 10px; right: 20px;

&nbsp; font-size: 12px; color: #999;

}



@media print {

&nbsp; .scale-control, .measure-container { display: none !important; }

&nbsp; .resume-pages-container { width: 100%; padding: 0; margin: 0; gap: 0; }

&nbsp; .resume-paper { box-shadow: none; margin: 0; page-break-after: always; }

&nbsp; .page-number { display: none; }

}

</style>

```

