<template>
  <!-- 头部 -->
  <header class="resume-header">
    <div class="header-top">
      <h1 class="name">{{ store.profile.name }}</h1>
      <p class="title">{{ store.profile.title }}</p>
    </div>
    <div class="contact-info">
      <div class="contact-row">
        <span v-if="store.profile.mobile" class="contact-item">
          <Phone :size="14" />
          {{ store.profile.mobile }}
        </span>
        <span v-if="store.profile.email" class="contact-item">
          <Mail :size="14" />
          {{ store.profile.email }}
        </span>
        <span v-if="store.profile.birthday" class="contact-item">
          <Cake :size="14" />
          {{ store.profile.birthday }}
        </span>
      </div>
      <div class="contact-row">
        <span v-if="store.profile.github" class="contact-item">
          <Link :size="14" />
          {{ store.profile.github }}
        </span>
        <span v-if="store.profile.website" class="contact-item">
          <Globe :size="14" />
          {{ store.profile.website }}
        </span>
      </div>
    </div>
  </header>

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
    <div class="section-divider"></div>
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
          <h3 class="item-title">{{ exp.company }} <span class="item-subtitle-inline">{{ exp.position }}</span></h3>
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
    <div class="section-divider"></div>
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
          <h3 class="item-title">{{ proj.name }} <span class="item-subtitle-inline">{{ proj.role }}</span></h3>
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
    <div class="section-divider"></div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useResumeStore } from '@/stores/resume'
import { Phone, Mail, Link, Globe, Cake } from 'lucide-vue-next'
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
.resume-header { border-bottom: 2px dashed #d1d5db; padding-bottom: 8px; margin-bottom: 8px; }
.header-top { display: flex; align-items: baseline; gap: 12px; margin-bottom: 8px; }
.name { font-size: 32px; font-weight: 700; color: var(--primary, #000000); margin-bottom: 0; }
.title { font-size: 18px; color: #666; margin-bottom: 0; }
.contact-info { display: flex; flex-direction: column; gap: 4px; font-size: 14px; color: #666; }
.contact-info-row { display: flex; flex-wrap: wrap; gap: 12px; width: 100%; }
.contact-row { display: flex; flex-wrap: wrap; gap: 16px; }
.contact-item { display: flex; align-items: center; gap: 6px; }
.contact-item :deep(svg) { flex-shrink: 0; }

.resume-section { margin-bottom: 8px; }
.section-title { font-size: 20px; font-weight: 600; color: var(--primary, #000000); margin-bottom: 7px; margin-top: 5px; }
.section-content { margin-bottom: var(--paragraph-spacing, 8px); }

/* 模块间分隔线 */
.section-divider {
  border-bottom: 2px dashed #d1d5db;
  margin-top: 7px;
}
.resume-section:last-child .section-divider {
  display: none;
}

.experience-item, .project-item, .education-item { margin-bottom: 9px; }

.item-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0px; }
.item-title { font-size: 16px; font-weight: 600; color: #333; margin-bottom: 4px; }
.item-subtitle-inline { font-size: 14px; font-weight: 400; color: #666; margin-left: 8px; }
.item-subtitle { font-size: 14px; color: #666; }
.item-date { font-size: 14px; color: #999; white-space: nowrap; }

.item-description-wrapper { margin-top: 0px; }

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
