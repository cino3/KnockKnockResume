<template>
  <!-- 头部 -->
  <header class="resume-header">
    <div class="header-top">
      <div class="header-left">
        <h1 class="name" :style="{ color: store.theme.primaryColor }">{{ store.profile.name }}</h1>
        <p class="title">{{ store.profile.title }}</p>
      </div>
      <div v-if="store.profile.avatar" class="avatar-wrapper">
        <img :src="store.profile.avatar" class="avatar" alt="头像" />
      </div>
    </div>
    <div class="contact-info" :class="{ 'has-avatar': store.profile.avatar }">
      <div class="contact-row">
        <span v-if="store.profile.mobile" class="contact-item">
          <Phone :size="14" />
          {{ store.profile.mobile }}
        </span>
        <span v-if="store.profile.birthday" class="contact-item">
          <Cake :size="14" />
          {{ store.profile.birthday }}
        </span>
        <span v-if="store.profile.github" class="contact-item">
          <Link :size="14" />
          {{ store.profile.github }}
        </span>
      </div>
      <div class="contact-row">
        <span v-if="store.profile.email" class="contact-item">
          <Mail :size="14" />
          {{ store.profile.email }}
        </span>
        <span v-if="store.profile.website" class="contact-item">
          <Globe :size="14" />
          {{ store.profile.website }}
        </span>
      </div>
    </div>
  </header>

  <!-- 教育经历 -->
  <section v-if="visibleEducations.length > 0" class="resume-section">
    <h2 class="section-title" :style="{ color: store.theme.primaryColor }">教育经历</h2>
    <div class="section-divider" :style="{ borderBottomColor: store.theme.dividerColor }"></div>
    <div
      v-for="edu in visibleEducations"
      :key="edu.id"
      class="education-item"
    >
      <div class="item-header">
        <div>
          <h3 class="item-title">{{ edu.school || '(未填写学校)' }}  -  <span class="education-degree">{{ edu.degree || '' }}</span> <span class="education-major-inline">{{ edu.major || '' }}</span></h3>
        </div>
        <span class="item-date">{{ formatDateRange(edu.startDate, edu.endDate) }}</span>
      </div>
    </div>
  </section>

  <!-- 专业技能 -->
  <section v-if="store.profile.skills" class="resume-section">
    <h2 class="section-title" :style="{ color: store.theme.primaryColor }">专业技能</h2>
    <div class="section-divider" :style="{ borderBottomColor: store.theme.dividerColor }"></div>
    <div class="section-content">
      <div
        v-for="(line, index) in formatDescriptionLines(store.profile.skills)"
        :key="index"
        class="text-line"
        v-html="line"
      ></div>
    </div>
  </section>

  <!-- 工作经历 -->
  <section v-if="visibleExperiences.length > 0" class="resume-section">
    <h2 class="section-title" :style="{ color: store.theme.primaryColor }">工作经历</h2>
    <div class="section-divider" :style="{ borderBottomColor: store.theme.dividerColor }"></div>
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
      <div v-if="exp.description" class="item-description-wrapper">
        <div
          v-for="(line, index) in formatDescriptionLines(exp.description)"
          :key="index"
          class="text-line"
          v-html="line"
        ></div>
      </div>
    </div>
  </section>

  <!-- 项目经历 -->
  <section v-if="visibleProjects.length > 0" class="resume-section">
    <h2 class="section-title" :style="{ color: store.theme.primaryColor }">项目经历</h2>
    <div class="section-divider" :style="{ borderBottomColor: store.theme.dividerColor }"></div>
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
      <div v-if="proj.description" class="item-description-wrapper">
        <div
          v-for="(line, index) in formatDescriptionLines(proj.description)"
          :key="index"
          class="text-line"
          v-html="line"
        ></div>
      </div>
    </div>
  </section>

  <!-- 获奖经历 -->
  <section v-if="store.awards.content" class="resume-section">
    <h2 class="section-title" :style="{ color: store.theme.primaryColor }">获奖经历</h2>
    <div class="section-divider" :style="{ borderBottomColor: store.theme.dividerColor }"></div>
    <div class="section-content">
      <div
        v-for="(line, index) in formatDescriptionLines(store.awards.content)"
        :key="index"
        class="text-line"
        v-html="line"
      ></div>
    </div>
  </section>

  <!-- 个人评价 -->
  <section v-if="store.selfEvaluation.content" class="resume-section">
    <h2 class="section-title" :style="{ color: store.theme.primaryColor }">个人评价</h2>
    <div class="section-divider" :style="{ borderBottomColor: store.theme.dividerColor }"></div>
    <div class="section-content">
      <div
        v-for="(line, index) in formatDescriptionLines(store.selfEvaluation.content)"
        :key="index"
        class="text-line"
        v-html="line"
      ></div>
    </div>
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

// 核心工具：按换行符拆分文本（支持 HTML 内容）
function formatDescriptionLines(text: string | undefined): string[] {
  if (!text) return []
  // 将 <br> 标签替换为换行符，然后按换行符拆分
  const normalizedText = text.replace(/<br\s*\/?>/gi, '\n')
  // 先过滤掉纯空白行，再 trim 剩余行
  return normalizedText
    .split('\n')
    .filter(line => line.trim() !== '') // 先过滤纯空白行
    .map(line => line.trimEnd()) // 只去除行尾空白，保留行首缩进
}
</script>

<style scoped>
/* 基础样式 */
.resume-header { padding-bottom: 8px; margin-bottom: 8px; }
.header-top { display: flex; align-items: center; margin-bottom: 8px; position: relative; }
.header-left { display: flex; align-items: baseline; gap: 12px; }
.name { font-size: 28px; font-weight: 600; margin-bottom: 0; letter-spacing: 1px; }
.title { font-size: 18px; color: #000000; margin-bottom: 0; }
.avatar-wrapper { position: absolute; right: 0; top: 0; }
.avatar { width: 80px; height: 100px; object-fit: cover; display: block; }
.contact-info { display: flex; flex-direction: column; gap: 4px; font-size: 14px; color: #000000; min-height: 50px; }
.contact-info.has-avatar { margin-right: 96px; }
.contact-info-row { display: flex; flex-wrap: wrap; gap: 12px; width: 100%; }
.contact-row { display: flex; flex-wrap: wrap; gap: 16px; }
.contact-item { display: flex; align-items: center; gap: 6px; }
.contact-item :deep(svg) { flex-shrink: 0; }

.resume-section { margin-bottom: 18px; }
.section-title { font-size: 17px; font-weight: 600; margin-bottom: 1px; margin-top: 5px; padding-bottom: 0; letter-spacing: 1px; }
.section-content { margin-bottom: 11px; }

/* 模块间分隔线 */
.section-divider {
  border-bottom: 2px solid #000000;
  margin-top: 0px;
  margin-bottom: 11px;
}
.experience-item, .project-item, .education-item { margin-bottom: 11px; }
/* 工作经历和项目经历：多条记录之间固定间距 */
.experience-item, .project-item { margin-bottom: 14px; }
/* 教育经历：多条记录之间固定间距 */
.education-item { margin-bottom: 8px; }
/* 教育经历条目通常无描述，去掉标题下方额外空隙以收紧条目间距 */
.education-item .item-title { margin-bottom: 0; }
/* 每个 section 中的最后一个 item 移除下边距 */
.resume-section .experience-item:last-child,
.resume-section .project-item:last-child,
.resume-section .education-item:last-child {
  margin-bottom: 0px;
}

.item-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0px; }
.item-title { font-size: var(--font-size-item-title); font-weight: var(--font-weight-item-title); color: #333; margin: 0 0 4px 0; }
.item-subtitle-inline { font-size: 14px; font-weight: 400; color: #000000; margin-left: 8px; }
.item-subtitle { font-size: 14px; color: #000000; }
.education-major { font-size: 13px; color: #000000; }
.education-major-inline { font-size: 14px; font-weight: 400; color: #000000; margin-left: 8px; }
.education-degree { font-size: 14px; font-weight: 600; color: #333; }
.item-date { font-size: 14px; color: #000000; white-space: nowrap; }

.item-description-wrapper { margin-top: 0px; margin-bottom: 0px; }

/* 每一行文本的样式：保持高度一致 */
.text-line {
  font-size: 14px;
  color: #000000;
  line-height: var(--line-height, 1.6);
  white-space: pre-wrap;
}

@media print {
  .resume-section { margin-bottom: 20px; }
}
</style>
