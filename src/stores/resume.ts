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
    name: '你好乔',
    title: '后端开发',
    mobile: '18939393333',
    email: 'linjiale333@gmail.com',
    birthday: '2002-03',
    github: '',
    website: 'knockknockresume.top',
    summary: '',
    skills: '  •  <strong>Java基础</strong><strong>：</strong>掌握 Java 基础知识，集合框架、I/O流、反射机制等，了解HashMap存储原理；中常见的设计模<br>      式，如工厂模式、代理模式、单例模式等\n  •  <strong>MySQL</strong><strong>：</strong> 熟练使用 MySQL，掌握索引、事务、锁、日志等核心概念，了解sql优化<br>  •  <strong>MQ</strong><strong>：</strong>了解RabbitMQ 消息队列，例如交换机、消息确认机制、TTL机制、死信队列<br>  •  <strong>并发编程</strong><strong>：</strong>了解 Java 多线程，例如线程池、锁、ThreadLocal 等关键知识点的原理\n'
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
      company: '比特跳动',
      position: '初级开发工程师',
      startDate: '2025-10',
      endDate: '2026-01',
      description: '  •  工作内容：主要负责平台<strong>从零到一</strong>的<strong>设计</strong>与<strong>实现</strong>'
    }
  ])

  // 项目经历
  const projects = ref<Project[]>([
    {
      id: generateUUID(),
      isVisible: true,
      name: '在线电商平台',
      role: '后端开发',
      startDate: '2025-10',
      endDate: '2025-12',
      description: '<p style="--tw-scale-x: 1; --tw-scale-y: 1; --tw-pan-x: ; --tw-pan-y: ; --tw-pinch-zoom: ; --tw-scroll-snap-strictness: proximity; --tw-gradient-from-position: ; --tw-gradient-via-position: ; --tw-gradient-to-position: ; --tw-ordinal: ; --tw-slashed-zero: ; --tw-numeric-figure: ; --tw-numeric-spacing: ; --tw-numeric-fraction: ; --tw-ring-inset: ; --tw-ring-offset-width: 0px; --tw-ring-offset-color: #fff; --tw-ring-color: rgb(59 130 246 / 0.5); --tw-ring-offset-shadow: 0 0 #0000; --tw-ring-shadow: 0 0 #0000; --tw-shadow: 0 0 #0000; --tw-shadow-colored: 0 0 #0000; --tw-blur: ; --tw-brightness: ; --tw-contrast: ; --tw-grayscale: ; --tw-hue-rotate: ; --tw-invert: ; --tw-saturate: ; --tw-sepia: ; --tw-drop-shadow: ; --tw-backdrop-blur: ; --tw-backdrop-brightness: ; --tw-backdrop-contrast: ; --tw-backdrop-grayscale: ; --tw-backdrop-hue-rotate: ; --tw-backdrop-invert: ; --tw-backdrop-opacity: ; --tw-backdrop-saturate: ; --tw-backdrop-sepia: ; --tw-contain-size: ; --tw-contain-layout: ; --tw-contain-paint: ; --tw-contain-style: ;">  •  设计并实现了一个完整的B2C电商平台，包含商品管理、订单处理、支付集成、用户管理等模块<br></p><p>  •  采用微服务架构，将系统拆分为用户服务、商品服务、订单服务等独立模块</p><p>  •  实现JWT身份认证和RBAC权限控制，保证系统安全</p><p>  •  使用Redis实现购物车缓存和会话管理，提升系统性能</p>'
    },
    {
      id: generateUUID(),
      isVisible: true,
      name: '智能校园社交APP',
      role: '后端开发',
      startDate: '2025-12',
      endDate: '2026-02',
      description: '<p style="--tw-scale-x: 1; --tw-scale-y: 1; --tw-pan-x: ; --tw-pan-y: ; --tw-pinch-zoom: ; --tw-scroll-snap-strictness: proximity; --tw-gradient-from-position: ; --tw-gradient-via-position: ; --tw-gradient-to-position: ; --tw-ordinal: ; --tw-slashed-zero: ; --tw-numeric-figure: ; --tw-numeric-spacing: ; --tw-numeric-fraction: ; --tw-ring-inset: ; --tw-ring-offset-width: 0px; --tw-ring-offset-color: #fff; --tw-ring-color: rgb(59 130 246 / 0.5); --tw-ring-offset-shadow: 0 0 #0000; --tw-ring-shadow: 0 0 #0000; --tw-shadow: 0 0 #0000; --tw-shadow-colored: 0 0 #0000; --tw-blur: ; --tw-brightness: ; --tw-contrast: ; --tw-grayscale: ; --tw-hue-rotate: ; --tw-invert: ; --tw-saturate: ; --tw-sepia: ; --tw-drop-shadow: ; --tw-backdrop-blur: ; --tw-backdrop-brightness: ; --tw-backdrop-contrast: ; --tw-backdrop-grayscale: ; --tw-backdrop-hue-rotate: ; --tw-backdrop-invert: ; --tw-backdrop-opacity: ; --tw-backdrop-saturate: ; --tw-backdrop-sepia: ; --tw-contain-size: ; --tw-contain-layout: ; --tw-contain-paint: ; --tw-contain-style: ;">  •  开发了一款面向高校学生的社交应用，支持动态发布、活动组织、即时通讯等功能</p><p>  •  实现实时聊天功能，支持文字、图片和文件传输</p><p>  •  集成第三方登录和地图服务，提升用户体验</p>'
    }
  ])

  // 教育背景
  const educations = ref<Education[]>([
    {
      id: generateUUID(),
      isVisible: true,
      school: '瀚海大学',
      major: '软件工程',
      degree: '硕士',
      startDate: '2025-09',
      endDate: ''
    },
    {
      id: generateUUID(),
      isVisible: true,
      school: '北辰理工大学',
      major: '软件工程',
      degree: '本科',
      startDate: '2021-09',
      endDate: '2025-06'
    }
  ])

  // 获奖经历
  const awards = ref<Awards>({
    content: '证书：CET-4，CET-6<br>第三十三届"软件杯"省赛一等奖'
  })

  // 个人评价
  const selfEvaluation = ref<SelfEvaluation>({
    content: '喜欢自己捣鼓捣鼓小项目<br>具有较强的自学能力，喜欢啃阅读各种经典技术书籍'
  })

  // 主题配置
  const theme = ref<ThemeConfig>({
    primaryColor: '#000000',
    dividerColor: '#000000',
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    lineHeight: 1.6,
    paragraphSpacing: 8,
    titleFontSize: 28,
    titleFontWeight: 800,
    bodyFontSize: 'md',
    language: 'zh'
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
      name: '你好乔',
      title: '后端开发',
      mobile: '18939393333',
      email: 'linjiale333@gmail.com',
      birthday: '2002-03',
      github: '',
      website: 'knockknockresume.top',
      summary: '',
      skills: '  •  <strong>Java基础</strong><strong>：</strong>掌握 Java 基础知识，集合框架、I/O流、反射机制等，了解HashMap存储原理；中常见的设计模<br>      式，如工厂模式、代理模式、单例模式等\n  •  <strong>MySQL</strong><strong>：</strong> 熟练使用 MySQL，掌握索引、事务、锁、日志等核心概念，了解sql优化<br>  •  <strong>MQ</strong><strong>：</strong>了解RabbitMQ 消息队列，例如交换机、消息确认机制、TTL机制、死信队列<br>  •  <strong>并发编程</strong><strong>：</strong>了解 Java 多线程，例如线程池、锁、ThreadLocal 等关键知识点的原理\n',
      avatar: undefined as string | undefined
    },
    experiences: [
      {
        id: '',
        isVisible: true,
        company: '比特跳动',
        position: '初级开发工程师',
        startDate: '2025-10',
        endDate: '2026-01',
        description: '  •  工作内容：主要负责平台<strong>从零到一</strong>的<strong>设计</strong>与<strong>实现</strong>'
      }
    ],
    projects: [
      {
        id: '',
        isVisible: true,
        name: '在线电商平台',
        role: '后端开发',
        startDate: '2025-10',
        endDate: '2025-12',
        description: '<p style="--tw-scale-x: 1; --tw-scale-y: 1; --tw-pan-x: ; --tw-pan-y: ; --tw-pinch-zoom: ; --tw-scroll-snap-strictness: proximity; --tw-gradient-from-position: ; --tw-gradient-via-position: ; --tw-gradient-to-position: ; --tw-ordinal: ; --tw-slashed-zero: ; --tw-numeric-figure: ; --tw-numeric-spacing: ; --tw-numeric-fraction: ; --tw-ring-inset: ; --tw-ring-offset-width: 0px; --tw-ring-offset-color: #fff; --tw-ring-color: rgb(59 130 246 / 0.5); --tw-ring-offset-shadow: 0 0 #0000; --tw-ring-shadow: 0 0 #0000; --tw-shadow: 0 0 #0000; --tw-shadow-colored: 0 0 #0000; --tw-blur: ; --tw-brightness: ; --tw-contrast: ; --tw-grayscale: ; --tw-hue-rotate: ; --tw-invert: ; --tw-saturate: ; --tw-sepia: ; --tw-drop-shadow: ; --tw-backdrop-blur: ; --tw-backdrop-brightness: ; --tw-backdrop-contrast: ; --tw-backdrop-grayscale: ; --tw-backdrop-hue-rotate: ; --tw-backdrop-invert: ; --tw-backdrop-opacity: ; --tw-backdrop-saturate: ; --tw-backdrop-sepia: ; --tw-contain-size: ; --tw-contain-layout: ; --tw-contain-paint: ; --tw-contain-style: ;">  •  设计并实现了一个完整的B2C电商平台，包含商品管理、订单处理、支付集成、用户管理等模块<br></p><p>  •  采用微服务架构，将系统拆分为用户服务、商品服务、订单服务等独立模块</p><p>  •  实现JWT身份认证和RBAC权限控制，保证系统安全</p><p>  •  使用Redis实现购物车缓存和会话管理，提升系统性能</p>'
      },
      {
        id: '',
        isVisible: true,
        name: '智能校园社交APP',
        role: '后端开发',
        startDate: '2025-12',
        endDate: '2026-02',
        description: '<p style="--tw-scale-x: 1; --tw-scale-y: 1; --tw-pan-x: ; --tw-pan-y: ; --tw-pinch-zoom: ; --tw-scroll-snap-strictness: proximity; --tw-gradient-from-position: ; --tw-gradient-via-position: ; --tw-gradient-to-position: ; --tw-ordinal: ; --tw-slashed-zero: ; --tw-numeric-figure: ; --tw-numeric-spacing: ; --tw-numeric-fraction: ; --tw-ring-inset: ; --tw-ring-offset-width: 0px; --tw-ring-offset-color: #fff; --tw-ring-color: rgb(59 130 246 / 0.5); --tw-ring-offset-shadow: 0 0 #0000; --tw-ring-shadow: 0 0 #0000; --tw-shadow: 0 0 #0000; --tw-shadow-colored: 0 0 #0000; --tw-blur: ; --tw-brightness: ; --tw-contrast: ; --tw-grayscale: ; --tw-hue-rotate: ; --tw-invert: ; --tw-saturate: ; --tw-sepia: ; --tw-drop-shadow: ; --tw-backdrop-blur: ; --tw-backdrop-brightness: ; --tw-backdrop-contrast: ; --tw-backdrop-grayscale: ; --tw-backdrop-hue-rotate: ; --tw-backdrop-invert: ; --tw-backdrop-opacity: ; --tw-backdrop-saturate: ; --tw-backdrop-sepia: ; --tw-contain-size: ; --tw-contain-layout: ; --tw-contain-paint: ; --tw-contain-style: ;">  •  开发了一款面向高校学生的社交应用，支持动态发布、活动组织、即时通讯等功能</p><p>  •  实现实时聊天功能，支持文字、图片和文件传输</p><p>  •  集成第三方登录和地图服务，提升用户体验</p>'
      }
    ],
    educations: [
      {
        id: '',
        isVisible: true,
        school: '瀚海大学',
        major: '软件工程',
        degree: '硕士',
        startDate: '2025-09',
        endDate: ''
      },
      {
        id: '',
        isVisible: true,
        school: '北辰理工大学',
        major: '软件工程',
        degree: '本科',
        startDate: '2021-09',
        endDate: '2025-06'
      }
    ],
    awards: {
      content: '证书：CET-4，CET-6<br>第三十三届"软件杯"省赛一等奖'
    },
    selfEvaluation: {
      content: '喜欢自己捣鼓捣鼓小项目<br>具有较强的自学能力，喜欢啃阅读各种经典技术书籍'
    },
    theme: {
      primaryColor: '#000000',
      dividerColor: '#000000',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      lineHeight: 1.6,
      paragraphSpacing: 8,
      titleFontSize: 28,
      titleFontWeight: 800,
      bodyFontSize: 'md',
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
          bodyFontSize: data.theme.bodyFontSize || 'md',
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
