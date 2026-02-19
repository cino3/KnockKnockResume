// 基础信息
export interface Profile {
  name: string;
  title: string;         // 职位
  mobile: string;
  email: string;
  birthday?: string;     // 出生年月
  avatar?: string;       // 头像 base64
  github?: string;
  website?: string;
  summary: string;       // 个人简介
  skills: string;        // 专业技能
}

// 经历列表项 (共用接口)
export interface ResumeItem {
  id: string; // UUID
  isVisible: boolean;
}

export interface Education extends ResumeItem {
  school: string;
  major: string;
  degree: string;
  startDate: string;
  endDate: string;
}

export interface Experience extends ResumeItem {
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  description: string; // 支持换行
}

export interface Project extends ResumeItem {
  name: string;
  role: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface Awards {
  content: string;     // 获奖经历内容，支持换行
}

export interface SelfEvaluation {
  content: string;     // 个人评价内容，支持换行
}

// 主题配置
export interface ThemeConfig {
  primaryColor: string; // 主色调
  dividerColor: string; // 分割线颜色
  fontFamily: string;
  lineHeight: number;   // 1.2 ~ 1.8
  paragraphSpacing: number; // 段间距
  titleFontSize: number; // 标题字体大小
  titleFontWeight: number; // 标题字体粗细
  language: 'zh' | 'en'; // 语言：中文或英文
}

// Resume 完整数据结构
export interface ResumeData {
  profile: Profile;
  experiences: Experience[];
  projects: Project[];
  educations: Education[];
  awards: Awards;
  selfEvaluation: SelfEvaluation;
  theme: ThemeConfig;
}

