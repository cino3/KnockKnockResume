import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import dayjs from 'dayjs'
import type { Profile, Experience, Project, Education, Awards, SelfEvaluation, ThemeConfig, ResumeData } from '@/types/resume'
import { generateUUID } from '@/utils/uuid'

export const useResumeStore = defineStore('resume', () => {
  // ================= 数据迁移：从旧格式迁移到新格式 =================
  // 检查 localStorage 中的 awards 数据，如果是数组则迁移
  const storedData = localStorage.getItem('resume')
  if (storedData) {
    try {
      const parsed = JSON.parse(storedData)
      // 如果 awards 是数组，转换为对象格式
      if (parsed.awards && Array.isArray(parsed.awards)) {
        const oldAwards = parsed.awards as any[]
        const newAwards = {
          content: oldAwards
            .filter((a: any) => a.isVisible !== false)
            .map((a: any) => {
              const parts = []
              if (a.date) parts.push(a.date)
              if (a.name) parts.push(a.name)
              if (a.level) parts.push(`(${a.level})`)
              return parts.join(' ')
            })
            .join('\n')
        }
        // 更新 localStorage
        parsed.awards = newAwards
        localStorage.setItem('resume', JSON.stringify(parsed))
      }
    } catch (e) {
      console.error('数据迁移失败:', e)
    }
  }

  // 基础信息
  const profile = ref<Profile>({
    name: '张三',
    title: '前端工程师',
    mobile: '138-0000-0000',
    email: 'zhangsan@example.com',
    birthday: '2000-01',
    github: 'https://github.com/zhangsan',
    website: 'https://zhangsan.dev',
    summary: '拥有5年前端开发经验，精通 Vue.js、React 等现代前端框架，擅长构建高性能、可维护的 Web 应用。',
    skills: 'Vue.js, React, TypeScript, Node.js,Webpack, Vite'
  })

  // 头像上传
  function uploadAvatar(file: File): Promise<void> {
    return new Promise((resolve, reject) => {
      // 检查文件大小（2MB）
      if (file.size > 2 * 1024 * 1024) {
        reject(new Error('图片大小不能超过 2MB'))
        return
      }

      // 检查文件类型
      if (!file.type.startsWith('image/')) {
        reject(new Error('只能上传图片文件'))
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        profile.value.avatar = e.target?.result as string
        resolve()
      }
      reader.onerror = () => {
        reject(new Error('图片读取失败'))
      }
      reader.readAsDataURL(file)
    })
  }

  function removeAvatar() {
    profile.value.avatar = undefined
  }

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

  // 获奖经历
  const awards = ref<Awards>({
    content: '2023年 全国大学生数学建模竞赛一等奖\n2022年 省级程序设计竞赛银奖\n2021年 校级优秀学生干部\n2020年 国家励志奖学金'
  })

  // 个人评价
  const selfEvaluation = ref<SelfEvaluation>({
    content: '具有良好的沟通能力和团队协作精神，工作积极主动，能够快速适应新环境。热爱技术，持续学习，追求代码质量和用户体验的完美结合。'
  })

  // 主题配置
  const theme = ref<ThemeConfig>({
    primaryColor: '#000000',
    dividerColor: '#000000',
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    lineHeight: 1.6,
    paragraphSpacing: 8,
    titleFontSize: 28,  // S=28 / M=29 / L=30 / XL=31
    titleFontWeight: 600,  // 600 细 / 800 粗（默认细）
    language: 'zh'  // 默认中文
  })

  // 预览缩放（默认 74%）
  const previewScale = ref(0.85)

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

  // 初始模板数据（重置时恢复到此状态）
  const initialTemplate = {
    profile: {
      name: '张三',
      title: '前端工程师',
      mobile: '138-0000-0000',
      email: 'zhangsan@example.com',
      birthday: '2000-01',
      github: 'https://github.com/zhangsan',
      website: 'https://zhangsan.dev',
      summary: '拥有5年前端开发经验，精通 Vue.js、React 等现代前端框架，擅长构建高性能、可维护的 Web 应用。',
      skills: 'Vue.js, React, TypeScript, Node.js,Webpack, Vite',
      avatar: undefined as string | undefined
    },
    experiences: [
      {
        id: '',
        isVisible: true,
        company: 'ABC科技有限公司',
        position: '高级前端工程师',
        startDate: '2021-01',
        endDate: '2024-12',
        description: '负责公司核心产品的前端架构设计与开发\n• 使用 Vue 3 + TypeScript 重构了主要业务模块，性能提升 40%\n• 建立了前端工程化体系，包括 CI/CD、代码规范、组件库等\n• 指导团队技术成长，组织技术分享会'
      },
      {
        id: '',
        isVisible: true,
        company: 'XYZ互联网公司',
        position: '前端工程师',
        startDate: '2019-06',
        endDate: '2020-12',
        description: '参与多个 B 端和 C 端项目的开发\n• 使用 React + Redux 开发了电商平台前端\n• 优化页面加载速度，首屏时间减少 30%\n• 与后端协作完成 API 接口设计与联调'
      }
    ],
    projects: [
      {
        id: '',
        isVisible: true,
        name: '企业级管理系统',
        role: '前端负责人',
        startDate: '2022-03',
        endDate: '2023-06',
        description: '基于 Vue 3 + Element Plus 构建的企业级后台管理系统，支持多租户、权限管理、数据可视化等功能。项目采用微前端架构，提升了系统的可维护性和扩展性。'
      },
      {
        id: '',
        isVisible: true,
        name: '移动端 H5 应用',
        role: '核心开发者',
        startDate: '2021-08',
        endDate: '2022-02',
        description: '使用 Vue 3 + Vant 开发的移动端应用，支持 PWA，实现了离线缓存、推送通知等功能。通过性能优化，在低端设备上也能流畅运行。'
      }
    ],
    educations: [
      {
        id: '',
        isVisible: true,
        school: 'XX大学',
        major: '计算机科学与技术',
        degree: '本科',
        startDate: '2015-09',
        endDate: '2019-06'
      }
    ],
    awards: {
      content: '2023年 全国大学生数学建模竞赛一等奖\n2022年 省级程序设计竞赛银奖\n2021年 校级优秀学生干部\n2020年 国家励志奖学金'
    },
    selfEvaluation: {
      content: '具有良好的沟通能力和团队协作精神，工作积极主动，能够快速适应新环境。热爱技术，持续学习，追求代码质量和用户体验的完美结合。'
    },
    theme: {
      primaryColor: '#000000',
      dividerColor: '#000000',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      lineHeight: 1.6,
      paragraphSpacing: 8,
      titleFontSize: 28,
      titleFontWeight: 600,
      language: 'zh' as const
    }
  }

  function resetData() {
    const t = initialTemplate
    profile.value = {
      name: t.profile.name,
      title: t.profile.title,
      mobile: t.profile.mobile,
      email: t.profile.email,
      birthday: t.profile.birthday,
      github: t.profile.github,
      website: t.profile.website,
      summary: t.profile.summary,
      skills: t.profile.skills,
      avatar: undefined
    }
    experiences.value = t.experiences.map((e) => ({
      ...e,
      id: generateUUID()
    }))
    projects.value = t.projects.map((p) => ({
      ...p,
      id: generateUUID()
    }))
    educations.value = t.educations.map((edu) => ({
      ...edu,
      id: generateUUID()
    }))
    awards.value = { content: t.awards.content }
    selfEvaluation.value = { content: t.selfEvaluation.content }
    theme.value = {
      ...t.theme,
      language: theme.value.language  // 保留用户选择的语言
    }
  }

  function updateLastSavedTime() {
    lastSavedTime.value = dayjs().format('HH:mm')
  }

  function getExportData() {
    // 导出时排除头像图片数据，创建不包含 avatar 的对象
    const exportData = {
      profile: {
        name: profile.value.name,
        title: profile.value.title,
        mobile: profile.value.mobile,
        email: profile.value.email,
        birthday: profile.value.birthday,
        github: profile.value.github,
        website: profile.value.website,
        skills: profile.value.skills
      },
      experiences: experiences.value,
      projects: projects.value,
      educations: educations.value,
      awards: awards.value,
      selfEvaluation: selfEvaluation.value,
      theme: theme.value,
      exportTime: dayjs().format('YYYY-MM-DD HH:mm:ss')
    }

    return exportData
  }

  function importData(data: any) {
    try {
      // 验证数据结构
      if (!data || typeof data !== 'object') {
        throw new Error('无效的数据格式')
      }

      // 导入个人基本信息
      if (data.profile) {
        profile.value = {
          ...profile.value,
          name: data.profile.name || '',
          title: data.profile.title || '',
          mobile: data.profile.mobile || '',
          email: data.profile.email || '',
          birthday: data.profile.birthday || '',
          github: data.profile.github || '',
          website: data.profile.website || '',
          skills: data.profile.skills || '',
          summary: profile.value.summary, // 保持原有的 summary
          avatar: profile.value.avatar // 保持原有的头像
        }
      }

      // 导入工作经历
      if (Array.isArray(data.experiences)) {
        experiences.value = data.experiences
      }

      // 导入项目经历
      if (Array.isArray(data.projects)) {
        projects.value = data.projects
      }

      // 导入教育背景
      if (Array.isArray(data.educations)) {
        educations.value = data.educations
      }

      // 导入获奖经历
      if (data.awards && typeof data.awards === 'object') {
        awards.value = {
          content: data.awards.content || ''
        }
      }

      // 导入自我评价
      if (data.selfEvaluation && typeof data.selfEvaluation === 'object') {
        selfEvaluation.value = {
          content: data.selfEvaluation.content || ''
        }
      }

      // 导入主题设置
      if (data.theme && typeof data.theme === 'object') {
        theme.value = {
          primaryColor: data.theme.primaryColor || '#000000',
          dividerColor: data.theme.dividerColor || '#000000',
          fontFamily: data.theme.fontFamily || 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          lineHeight: data.theme.lineHeight || 1.6,
          paragraphSpacing: data.theme.paragraphSpacing || 8,
          titleFontSize: data.theme.titleFontSize || 28,
          titleFontWeight: data.theme.titleFontWeight || 700,
          language: data.theme.language || 'zh'
        }
      }

      return true
    } catch (error) {
      console.error('导入数据失败:', error)
      return false
    }
  }

  return {
    profile,
    experiences,
    projects,
    educations,
    awards,
    selfEvaluation,
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
    getExportData,
    importData,
    uploadAvatar,
    removeAvatar
  }
}, {
  persist: {
    key: 'resume',
    // 只持久化简历内容数据和语言设置，不持久化其他 theme 配置
    // 这样修改默认主题配置后可以立即生效
    paths: [
      'profile',
      'experiences',
      'projects',
      'educations',
      'awards',
      'selfEvaluation',
      'theme.language'  // 持久化语言选择
    ]
  }
})

