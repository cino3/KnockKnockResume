<template>
  <!-- 头部 -->
  <header class="resume-header">
    <div class="header-top">
      <div class="header-left">
        <h1 class="name" :style="{ color: store.theme.primaryColor, fontSize: store.theme.titleFontSize + 'px', fontWeight: store.theme.titleFontWeight, fontFamily: nameFont, letterSpacing: titleLetterSpacing }">{{ store.profile.name }}</h1>
        <p class="title" :style="{ fontFamily: sectionTitleFont }">{{ store.profile.title }}</p>
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
    <h2 class="section-title" :class="{ 'en-title': store.theme.language === 'en' }" :style="{ color: store.theme.primaryColor, fontSize: (store.theme.titleFontSize - 11) + 'px', fontWeight: store.theme.titleFontWeight, fontFamily: sectionTitleFont, letterSpacing: titleLetterSpacing }">{{ t.education }}</h2>
    <div class="section-divider" :style="{ borderBottomColor: store.theme.dividerColor }"></div>
    <div
      v-for="edu in visibleEducations"
      :key="edu.id"
      class="education-item"
    >
      <div class="item-header">
        <div>
          <h3
            class="item-title"
            :style="store.theme.language === 'en' ? { fontFamily: sectionTitleFont } : {}"
          >
            <span class="education-school">
              {{ edu.school || '(未填写学校)' }}
            </span>
            -
            <span class="education-degree">{{ edu.degree || '' }}</span>
            <span class="education-major-inline">{{ edu.major || '' }}</span>
          </h3>
        </div>
        <span
          class="item-date"
          :style="store.theme.language === 'en' ? { fontFamily: sectionTitleFont } : {}"
        >
          {{ formatDateRange(edu.startDate, edu.endDate) }}
        </span>
      </div>
    </div>
  </section>

  <!-- 专业技能 -->
  <section v-if="store.profile.skills" class="resume-section">
    <h2 class="section-title" :class="{ 'en-title': store.theme.language === 'en' }" :style="{ color: store.theme.primaryColor, fontSize: (store.theme.titleFontSize - 11) + 'px', fontWeight: store.theme.titleFontWeight, fontFamily: sectionTitleFont, letterSpacing: titleLetterSpacing }">{{ t.skills }}</h2>
    <div class="section-divider" :style="{ borderBottomColor: store.theme.dividerColor }"></div>
    <div class="section-content">
      <div
        v-for="(line, index) in formatDescriptionLines(store.profile.skills)"
        :key="index"
        class="text-line"
        :style="textLineStyle"
        v-html="line"
      ></div>
    </div>
  </section>

  <!-- 工作经历 -->
  <section v-if="visibleExperiences.length > 0" class="resume-section">
    <h2 class="section-title" :class="{ 'en-title': store.theme.language === 'en' }" :style="{ color: store.theme.primaryColor, fontSize: (store.theme.titleFontSize - 11) + 'px', fontWeight: store.theme.titleFontWeight, fontFamily: sectionTitleFont, letterSpacing: titleLetterSpacing }">{{ t.experience }}</h2>
    <div class="section-divider" :style="{ borderBottomColor: store.theme.dividerColor }"></div>
    <div
      v-for="exp in visibleExperiences"
      :key="exp.id"
      class="experience-item"
    >
      <div class="item-header">
        <div>
          <h3
            class="item-title"
            :style="store.theme.language === 'en' ? { fontFamily: sectionTitleFont } : {}"
          >
            {{ exp.company }} <span class="item-subtitle-inline">{{ exp.position }}</span>
          </h3>
        </div>
        <span
          class="item-date"
          :style="store.theme.language === 'en' ? { fontFamily: sectionTitleFont } : {}"
        >
          {{ formatDateRange(exp.startDate, exp.endDate) }}
        </span>
      </div>
      <!-- 描述文本拆分为多行 -->
      <div v-if="exp.description" class="item-description-wrapper">
        <div
          v-for="(line, index) in formatDescriptionLines(exp.description)"
          :key="index"
          class="text-line"
          :style="textLineStyle"
          v-html="line"
        ></div>
      </div>
    </div>
  </section>

  <!-- 项目经历 -->
  <section v-if="visibleProjects.length > 0" class="resume-section">
    <h2 class="section-title" :class="{ 'en-title': store.theme.language === 'en' }" :style="{ color: store.theme.primaryColor, fontSize: (store.theme.titleFontSize - 11) + 'px', fontWeight: store.theme.titleFontWeight, fontFamily: sectionTitleFont, letterSpacing: titleLetterSpacing }">{{ t.project }}</h2>
    <div class="section-divider" :style="{ borderBottomColor: store.theme.dividerColor }"></div>
    <div
      v-for="proj in visibleProjects"
      :key="proj.id"
      class="project-item"
    >
      <div class="item-header">
        <div>
          <h3
            class="item-title"
            :style="store.theme.language === 'en' ? { fontFamily: sectionTitleFont } : {}"
          >
            {{ proj.name }} <span class="item-subtitle-inline">{{ proj.role }}</span>
          </h3>
        </div>
        <span
          class="item-date"
          :style="store.theme.language === 'en' ? { fontFamily: sectionTitleFont } : {}"
        >
          {{ formatDateRange(proj.startDate, proj.endDate) }}
        </span>
      </div>
      <div v-if="proj.description" class="item-description-wrapper">
        <div
          v-for="(line, index) in formatDescriptionLines(proj.description)"
          :key="index"
          class="text-line"
          :style="textLineStyle"
          v-html="line"
        ></div>
      </div>
    </div>
  </section>

  <!-- 获奖经历 -->
  <section v-if="store.awards.content" class="resume-section">
    <h2 class="section-title" :class="{ 'en-title': store.theme.language === 'en' }" :style="{ color: store.theme.primaryColor, fontSize: (store.theme.titleFontSize - 11) + 'px', fontWeight: store.theme.titleFontWeight, fontFamily: sectionTitleFont, letterSpacing: titleLetterSpacing }">{{ t.award }}</h2>
    <div class="section-divider" :style="{ borderBottomColor: store.theme.dividerColor }"></div>
    <div class="section-content">
      <div
        v-for="(line, index) in formatDescriptionLines(store.awards.content)"
        :key="index"
        class="text-line"
        :style="textLineStyle"
        v-html="line"
      ></div>
    </div>
  </section>

  <!-- 个人评价 -->
  <section v-if="store.selfEvaluation.content" class="resume-section">
    <h2 class="section-title" :class="{ 'en-title': store.theme.language === 'en' }" :style="{ color: store.theme.primaryColor, fontSize: (store.theme.titleFontSize - 11) + 'px', fontWeight: store.theme.titleFontWeight, fontFamily: sectionTitleFont, letterSpacing: titleLetterSpacing }">{{ t.selfEvaluation }}</h2>
    <div class="section-divider" :style="{ borderBottomColor: store.theme.dividerColor }"></div>
    <div class="section-content">
      <div
        v-for="(line, index) in formatDescriptionLines(store.selfEvaluation.content)"
        :key="index"
        class="text-line"
        :style="textLineStyle"
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
import { useI18n } from '@/composables/useI18n'

const store = useResumeStore()
const { t } = useI18n()

const visibleExperiences = computed(() => store.experiences.filter(exp => exp.isVisible))
const visibleProjects = computed(() => store.projects.filter(proj => proj.isVisible))
const visibleEducations = computed(() => store.educations.filter(edu => edu.isVisible))

// 根据语言计算标题字体
const sectionTitleFont = computed(() => {
  return store.theme.language === 'en' 
    ? 'var(--font-sans-en)'  // 英文：系统无衬线字体
    : 'var(--font-serif-cn)'  // 中文：Noto Serif SC
})

// 根据语言计算名字字体
const nameFont = computed(() => {
  return store.theme.language === 'en'
    ? 'var(--font-sans-en)'  // 英文：Lora 衬线字体
    : 'var(--font-serif-cn)'  // 中文：Noto Serif SC
})

// 根据语言计算标题间距
const titleLetterSpacing = computed(() => {
  return store.theme.language === 'en'
    ? 'normal'  // 英文：默认间距
    : '1px'     // 中文：1px 间距
})

// 英文模式下，正文与英文标题使用同一套英文字体；中文模式下保持默认正文字体
const textLineStyle = computed(() => {
  return store.theme.language === 'en'
    ? { fontFamily: sectionTitleFont.value }
    : {}
})

function formatDateRange(start: string, end: string): string {
  if (!start && !end) return ''
  const startStr = start ? dayjs(start).format('YYYY.MM') : ''

  // 根据语言切换“至今”文案：中文用“至今”，英文用“Present”
  const openEndLabel = store.theme.language === 'en' ? 'Present' : '至今'
  const endStr = end ? dayjs(end).format('YYYY.MM') : openEndLabel

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
    .filter((line: string) => line.trim() !== '') // 先过滤纯空白行
    .map((line: string) => line.trimEnd()) // 只去除行尾空白，保留行首缩进
}
</script>

<style scoped>
/* 基础样式 */
.resume-header { padding-bottom: 8px; margin-bottom: 8px; }
.header-top { display: flex; align-items: center; margin-bottom: 8px; position: relative; }
.header-left { display: flex; align-items: baseline; gap: 12px; }
.name {
  font-size: 28px;
  margin-bottom: 0;
  letter-spacing: 1px;
  /* 名字与大标题使用同一套中文衬线字体 */
  font-family: var(--font-serif-cn);
}
.title { font-size: 18px; color: #000000; margin-bottom: 0; }
.avatar-wrapper { position: absolute; right: 0; top: 0; }
.avatar { width: 80px; height: 100px; object-fit: cover; display: block; }
.contact-info { display: flex; flex-direction: column; gap: 4px; font-size: var(--font-size-body); color: #000000; min-height: 50px; }
.contact-info.has-avatar { margin-right: 96px; }
.contact-info-row { display: flex; flex-wrap: wrap; gap: 12px; width: 100%; }
.contact-row { display: flex; flex-wrap: wrap; gap: 16px; }
.contact-item { display: flex; align-items: center; gap: 6px; }
.contact-item :deep(svg) { flex-shrink: 0; }

.resume-section { margin-bottom: 18px; }
.section-title {
  font-size: 17px;
  margin-bottom: 1px;
  margin-top: 5px;
  padding-bottom: 0;
  letter-spacing: 1px;
  /* 模块标题（教育经历、专业技能等）使用中文人文宋体栈 */
  font-family: var(--font-serif-cn);
}

/* 英文模式下标题首字母放大 */
.section-title.en-title::first-letter {
  font-size: 1.2em; /* 首字母比正常字母大 30% */
}
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
/* 教育经历中学校名称保持加粗强调 */
.education-school {
  font-weight: var(--font-weight-item-title);
}
/* 每个 section 中的最后一个 item 移除下边距 */
.resume-section .experience-item:last-child,
.resume-section .project-item:last-child,
.resume-section .education-item:last-child {
  margin-bottom: 0px;
}

.item-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0px; }
.item-title {
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-item-title);
  color: #333;
  margin: 0 0 4px 0;
}
.item-subtitle-inline { font-size: var(--font-size-body); font-weight: 400; color: #000000; margin-left: 8px; }
.item-subtitle { font-size: var(--font-size-body); color: #000000; }
.education-major { font-size: var(--font-size-body); color: #000000; }
.education-major-inline { font-size: var(--font-size-body); font-weight: 400; color: #000000; margin-left: 8px; }
.education-degree { font-size: var(--font-size-body); font-weight: 600; color: #333; }
.item-date { font-size: var(--font-size-body); color: #000000; white-space: nowrap; }

.item-description-wrapper { margin-top: 0px; margin-bottom: 0px; }

/* 每一行文本的样式：保持高度一致 */
.text-line {
  font-size: var(--font-size-body);
  color: #000000;
  line-height: var(--line-height, 1.6);
  white-space: pre-wrap;
}

@media print {
  .resume-section { margin-bottom: 20px; }
}
</style>
