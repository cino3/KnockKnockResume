import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import dayjs from 'dayjs'
import type { Profile, Experience, Project, Education, ThemeConfig, ResumeData } from '@/types/resume'
import { generateUUID } from '@/utils/uuid'

export const useResumeStore = defineStore('resume', () => {
  // 基础信息
  const profile = ref<Profile>({
    name: '张三',
    title: '前端工程师',
    mobile: '138-0000-0000',
    email: 'zhangsan@example.com',
    birthday: '2000-01',
    github: 'https://github.com/zhangsan',
    website: 'https://zhangsan.dev',
    summary: '拥有5年前端开发经验，精通 Vue.js、React 等现代前端框架，擅长构建高性能、可维护的 Web 应用。'
  })

  // 工作经历
  const experiences = ref<Experience[]>([
    {
      id: generateUUID(),
      isVisible: true,
      company: 'ABC科技有限公司',
      position: '高级前端工程师',
      startDate: '2021-01',
      endDate: '2024-12',
      description: '负责公司核心产品的前端架构设计与开发\n• 使用 Vue 3 + TypeScript 重构了主要业务模块，性能提升 40%\n• 建立了前端工程化体系，包括 CI/CD、代码规范、组件库等\n• 指导团队技术成长，组织技术分享会'
    },
    {
      id: generateUUID(),
      isVisible: true,
      company: 'XYZ互联网公司',
      position: '前端工程师',
      startDate: '2019-06',
      endDate: '2020-12',
      description: '参与多个 B 端和 C 端项目的开发\n• 使用 React + Redux 开发了电商平台前端\n• 优化页面加载速度，首屏时间减少 30%\n• 与后端协作完成 API 接口设计与联调'
    }
  ])

  // 项目经历
  const projects = ref<Project[]>([
    {
      id: generateUUID(),
      isVisible: true,
      name: '企业级管理系统',
      role: '前端负责人',
      startDate: '2022-03',
      endDate: '2023-06',
      description: '基于 Vue 3 + Element Plus 构建的企业级后台管理系统，支持多租户、权限管理、数据可视化等功能。项目采用微前端架构，提升了系统的可维护性和扩展性。'
    },
    {
      id: generateUUID(),
      isVisible: true,
      name: '移动端 H5 应用',
      role: '核心开发者',
      startDate: '2021-08',
      endDate: '2022-02',
      description: '使用 Vue 3 + Vant 开发的移动端应用，支持 PWA，实现了离线缓存、推送通知等功能。通过性能优化，在低端设备上也能流畅运行。'
    }
  ])

  // 教育背景
  const educations = ref<Education[]>([
    {
      id: generateUUID(),
      isVisible: true,
      school: 'XX大学',
      major: '计算机科学与技术',
      degree: '本科',
      startDate: '2015-09',
      endDate: '2019-06'
    }
  ])

  // 主题配置
  const theme = ref<ThemeConfig>({
    primaryColor: '#000000',
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    lineHeight: 1.6,
    paragraphSpacing: 8
  })

  // 预览缩放（固定为 70%）
  const previewScale = ref(0.7)

  // 最后保存时间
  const lastSavedTime = ref<string | null>(null)

  // 计算属性：生成简历文件名
  const resumeFileName = computed(() => {
    return `${profile.value.name}_${profile.value.title}_简历`
  })

  // Actions
  function addExperience() {
    experiences.value.push({
      id: generateUUID(),
      isVisible: true,
      company: '',
      position: '',
      startDate: '',
      endDate: '',
      description: ''
    })
  }

  function removeExperience(id: string) {
    const index = experiences.value.findIndex(exp => exp.id === id)
    if (index > -1) {
      experiences.value.splice(index, 1)
    }
  }

  function addProject() {
    projects.value.push({
      id: generateUUID(),
      isVisible: true,
      name: '',
      role: '',
      startDate: '',
      endDate: '',
      description: ''
    })
  }

  function removeProject(id: string) {
    const index = projects.value.findIndex(proj => proj.id === id)
    if (index > -1) {
      projects.value.splice(index, 1)
    }
  }

  function addEducation() {
    educations.value.push({
      id: generateUUID(),
      isVisible: true,
      school: '',
      major: '',
      degree: '',
      startDate: '',
      endDate: ''
    })
  }

  function removeEducation(id: string) {
    const index = educations.value.findIndex(edu => edu.id === id)
    if (index > -1) {
      educations.value.splice(index, 1)
    }
  }

  function resetData() {
    profile.value = {
      name: '',
      title: '',
      mobile: '',
      email: '',
      summary: ''
    }
    experiences.value = []
    projects.value = []
    educations.value = []
    theme.value = {
      primaryColor: '#000000',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      lineHeight: 1.6,
      paragraphSpacing: 8
    }
  }

  function updateLastSavedTime() {
    lastSavedTime.value = dayjs().format('HH:mm')
  }

  function getExportData() {
    return {
      profile: profile.value,
      experiences: experiences.value,
      projects: projects.value,
      educations: educations.value,
      theme: theme.value,
      exportTime: dayjs().format('YYYY-MM-DD HH:mm:ss')
    }
  }

  return {
    profile,
    experiences,
    projects,
    educations,
    theme,
    previewScale,
    lastSavedTime,
    resumeFileName,
    addExperience,
    removeExperience,
    addProject,
    removeProject,
    addEducation,
    removeEducation,
    resetData,
    updateLastSavedTime,
    getExportData
  }
}, {
  persist: true
})

