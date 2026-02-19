import { computed } from 'vue'
import { useResumeStore } from '@/stores/resume'

// 多语言映射
const translations = {
  zh: {
    education: '教育经历',
    skills: '专业技能',
    experience: '工作经历',
    project: '项目经历',
    award: '获奖经历',
    selfEvaluation: '个人评价',
    profile: '基本信息'
  },
  en: {
    education: 'EDUCATION',
    skills: 'SKILLS',
    experience: 'EXPERIENCE',
    project: 'PROJECTS',
    award: 'AWARDS',
    selfEvaluation: 'SELF EVALUATION',
    profile: 'BASIC INFO'
  }
}

export function useI18n() {
  const store = useResumeStore()
  
  const t = computed(() => {
    const lang = store.theme.language || 'zh'
    return translations[lang]
  })
  
  return { t }
}

