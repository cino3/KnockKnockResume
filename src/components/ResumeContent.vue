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
    <p class="section-content">{{ store.profile.summary }}</p>
  </section>

  <!-- 工作经历 -->
  <section v-if="visibleExperiences.length > 0" class="resume-section">
    <h2 class="section-title">工作经历</h2>
    <!-- 正确：在每一个 item 上防截断，而不是在整个 section 上 -->
    <div
      v-for="exp in visibleExperiences"
      :key="exp.id"
      class="experience-item avoid-break"
    >
      <div class="item-header">
        <div>
          <h3 class="item-title">{{ exp.company }}</h3>
          <p class="item-subtitle">{{ exp.position }}</p>
        </div>
        <span class="item-date">{{ formatDateRange(exp.startDate, exp.endDate) }}</span>
      </div>
      <p class="item-description">{{ exp.description }}</p>
    </div>
  </section>

  <!-- 项目经历 -->
  <section v-if="visibleProjects.length > 0" class="resume-section">
    <h2 class="section-title">项目经历</h2>
    <!-- 正确：在每一个 item 上防截断，而不是在整个 section 上 -->
    <div
      v-for="proj in visibleProjects"
      :key="proj.id"
      class="project-item avoid-break"
    >
      <div class="item-header">
        <div>
          <h3 class="item-title">{{ proj.name }}</h3>
          <p class="item-subtitle">{{ proj.role }}</p>
        </div>
        <span class="item-date">{{ formatDateRange(proj.startDate, proj.endDate) }}</span>
      </div>
      <p class="item-description">{{ proj.description }}</p>
    </div>
  </section>

  <!-- 教育背景 -->
  <section v-if="visibleEducations.length > 0" class="resume-section">
    <h2 class="section-title">教育背景</h2>
    <!-- 正确：在每一个 item 上防截断，而不是在整个 section 上 -->
    <div
      v-for="edu in visibleEducations"
      :key="edu.id"
      class="education-item avoid-break"
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
  <!-- 如果没有教育背景，显示提示 -->
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

const visibleExperiences = computed(() => {
  return store.experiences.filter(exp => exp.isVisible)
})

const visibleProjects = computed(() => {
  return store.projects.filter(proj => proj.isVisible)
})

const visibleEducations = computed(() => {
  return store.educations.filter(edu => edu.isVisible)
})

function formatDateRange(start: string, end: string): string {
  if (!start && !end) return ''
  const startStr = start ? dayjs(start).format('YYYY.MM') : ''
  const endStr = end ? dayjs(end).format('YYYY.MM') : '至今'
  return `${startStr} - ${endStr}`
}
</script>

<style scoped>
.resume-header {
  border-bottom: 2px solid var(--primary, #2563eb);
  padding-bottom: 16px;
  margin-bottom: 24px;
}

.name {
  font-size: 32px;
  font-weight: 700;
  color: var(--primary, #2563eb);
  margin-bottom: 8px;
}

.title {
  font-size: 18px;
  color: #666;
  margin-bottom: 12px;
}

.contact-info {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  font-size: 14px;
  color: #666;
}

.contact-info span {
  display: flex;
  align-items: center;
  gap: 4px;
}

.resume-section {
  margin-bottom: 32px;
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--primary, #2563eb);
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e5e7eb;
}

.section-content {
  color: #555;
  white-space: pre-wrap;
  margin-bottom: var(--paragraph-spacing, 8px);
}

.experience-item,
.project-item,
.education-item {
  margin-bottom: 24px;
}

/* 确保 avoid-break 类正确应用 */
.experience-item.avoid-break,
.project-item.avoid-break,
.education-item.avoid-break {
  break-inside: avoid;
  page-break-inside: avoid;
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}

.item-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.item-subtitle {
  font-size: 14px;
  color: #666;
}

.item-date {
  font-size: 14px;
  color: #999;
  white-space: nowrap;
}

.item-description {
  color: #555;
  white-space: pre-wrap;
  margin-top: 8px;
  line-height: var(--line-height, 1.6);
}
</style>

