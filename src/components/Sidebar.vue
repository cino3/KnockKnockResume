<template>
  <div class="sidebar-wrapper">
    <!-- 0. 切换把手 (Toggle Handle) - 独立在外部 -->
    <div class="sidebar-toggle" @click="toggleSidebar">
      <el-icon size="12">
        <ArrowRight v-if="isCollapsed" />
        <ArrowLeft v-else />
      </el-icon>
    </div>

    <aside class="sidebar" :class="{ 'is-collapsed': isCollapsed }">

      <!-- 1. 顶栏：全局设置 (Header) -->
      <div class="sidebar-header" v-show="!isCollapsed">
        <!-- 品牌 -->
        <div class="brand">
          <span class="brand-text">KnockKnock</span>
        </div>

        <!-- 语言切换 -->
        <div class="lang-switch">
          <span class="lang-opt active">CN</span>
          <span class="lang-opt">EN</span>
        </div>
      </div>

      <!-- 2. 导航栏：模式切换 (Tabs) -->
      <div class="tab-nav" v-show="!isCollapsed">
        <div
          class="tab-item"
          :class="{ active: currentTab === 'content' }"
          @click="currentTab = 'content'"
        >
          <el-icon :size="18"><Pencil /></el-icon>
          <span class="tab-text">编辑</span>
        </div>

        <div
          class="tab-item"
          :class="{ active: currentTab === 'design' }"
          @click="currentTab = 'design'"
        >
          <el-icon :size="18"><Palette /></el-icon>
          <span class="tab-text">样式</span>
        </div>
      </div>

      <!-- 3. 滚动内容区 (Scroll Area) -->
      <div class="scroll-content" v-show="!isCollapsed">

        <!-- Panel A: 内容编辑器 (手风琴) -->
        <div v-show="currentTab === 'content'" class="panel-fade">
          <el-collapse v-model="activeNames" accordion class="claude-accordion">

            <!-- 基本信息 -->
            <el-collapse-item name="profile">
              <template #title>
                <span class="accordion-title">基本信息</span>
              </template>
              <div class="form-body">
                <el-form :model="store.profile" label-position="top" class="ghost-form">
                  <el-form-item label="姓名">
                    <el-input v-model="store.profile.name" placeholder="请输入姓名" />
                  </el-form-item>
                  <el-form-item label="职位">
                    <el-input v-model="store.profile.title" placeholder="请输入职位" />
                  </el-form-item>
                  <el-form-item label="手机">
                    <el-input v-model="store.profile.mobile" placeholder="请输入手机号" />
                  </el-form-item>
                  <el-form-item label="邮箱">
                    <el-input v-model="store.profile.email" placeholder="请输入邮箱" />
                  </el-form-item>
                  <el-form-item label="出生年月">
                    <el-input v-model="store.profile.birthday" placeholder="2000-01（可选）" />
                  </el-form-item>
                  <el-form-item label="GitHub">
                    <el-input v-model="store.profile.github" placeholder="GitHub 链接（可选）" />
                  </el-form-item>
                  <el-form-item label="网站">
                    <el-input v-model="store.profile.website" placeholder="个人网站（可选）" />
                  </el-form-item>
                  <el-form-item label="头像">
                    <input
                      ref="avatarInput"
                      type="file"
                      accept="image/*"
                      style="display: none"
                      @change="handleAvatarChange"
                    />
                    <div class="avatar-uploader">
                      <img v-if="store.profile.avatar" :src="store.profile.avatar" class="avatar-preview" />
                      <el-button v-else size="small" type="primary" @click="triggerFileInput">选择图片</el-button>
                    </div>
                    <div v-if="store.profile.avatar" style="margin-top: 8px;">
                      <el-button size="small" type="danger" text @click="handleRemoveAvatar">删除头像</el-button>
                    </div>
                    <div class="avatar-hint">建议尺寸 80x100px，最大 500KB</div>
                  </el-form-item>
                </el-form>
              </div>
            </el-collapse-item>

            <!-- 教育经历 -->
            <el-collapse-item name="education">
              <template #title>
                <span class="accordion-title">教育经历</span>
              </template>
              <div class="form-body">
                <div class="list-container">
                  <el-button type="primary" size="small" @click="store.addEducation" style="margin-bottom: 12px;">
                    + 添加教育
                  </el-button>
                  <EducationList />
                </div>
              </div>
            </el-collapse-item>

            <!-- 专业技能 -->
            <el-collapse-item name="skills">
              <template #title>
                <span class="accordion-title">专业技能</span>
              </template>
              <div class="form-body">
                <el-form :model="store.profile" label-position="top" class="ghost-form">
                  <el-form-item>
                    <BoldTextarea
                      v-model="store.profile.skills"
                      placeholder="请输入专业技能，可换行输入多个技能项，支持加粗"
                      :rows="6"
                    />
                  </el-form-item>
                </el-form>
              </div>
            </el-collapse-item>

            <!-- 工作经历 -->
            <el-collapse-item name="experience">
              <template #title>
                <span class="accordion-title">工作经历</span>
              </template>
              <div class="form-body">
                <div class="list-container">
                  <el-button type="primary" size="small" @click="store.addExperience" style="margin-bottom: 12px;">
                    + 添加经历
                  </el-button>
                  <ExperienceList />
                </div>
              </div>
            </el-collapse-item>

            <!-- 项目经历 -->
            <el-collapse-item name="project">
              <template #title>
                <span class="accordion-title">项目经历</span>
              </template>
              <div class="form-body">
                <div class="list-container">
                  <el-button type="primary" size="small" @click="store.addProject" style="margin-bottom: 12px;">
                    + 添加项目
                  </el-button>
                  <ProjectList />
                </div>
              </div>
            </el-collapse-item>

            <!-- 获奖经历 -->
            <el-collapse-item name="award">
              <template #title>
                <span class="accordion-title">获奖经历</span>
              </template>
              <div class="form-body">
                <div class="list-container">
                  <AwardList />
                </div>
              </div>
            </el-collapse-item>

            <!-- 个人评价 -->
            <el-collapse-item name="self-evaluation">
              <template #title>
                <span class="accordion-title">个人评价</span>
              </template>
              <div class="form-body">
                <div class="list-container">
                  <SelfEvaluationEditor />
                </div>
              </div>
            </el-collapse-item>

          </el-collapse>
        </div>

        <!-- Panel B: 外观设计器 (滑块 & 模板) -->
        <div v-show="currentTab === 'design'" class="panel-fade">

          <div class="control-group">
            <div class="control-label">颜色</div>
            <div class="control-item">
              <span class="control-item-label">标题</span>
              <el-color-picker
                v-model="store.theme.primaryColor"
                show-alpha
                size="small"
                :predefine="predefineColors"
              />
            </div>
            <div class="control-item">
              <span class="control-item-label">分割线</span>
              <el-color-picker
                v-model="store.theme.dividerColor"
                show-alpha
                size="small"
                :predefine="predefineColors"
              />
            </div>
          </div>

          <div class="control-group">
            <div class="control-label">字体</div>
            <div class="control-item">
              <span class="control-item-label">标题大小</span>
              <el-radio-group v-model="store.theme.titleFontSize" size="small" class="font-size-radio-group">
                <el-radio-button :value="28">S</el-radio-button>
                <el-radio-button :value="29">M</el-radio-button>
                <el-radio-button :value="30">L</el-radio-button>
                <el-radio-button :value="31">XL</el-radio-button>
              </el-radio-group>
            </div>
            <div class="control-item">
              <span class="control-item-label">标题粗细</span>
              <el-radio-group v-model="store.theme.titleFontWeight" size="small" class="font-weight-radio-group">
                <el-radio-button :value="500">细</el-radio-button>
                <el-radio-button :value="600">粗</el-radio-button>
              </el-radio-group>
            </div>
          </div>

          <div class="control-group">
            <div class="control-label">排版</div>
            <div class="control-item">
              <span class="control-item-label">行高</span>
              <el-radio-group v-model="store.theme.lineHeight" size="small" class="line-height-radio-group">
                <el-radio-button :value="1.6">1</el-radio-button>
                <el-radio-button :value="1.7">2</el-radio-button>
                <el-radio-button :value="1.8">3</el-radio-button>
              </el-radio-group>
            </div>
          </div>

          <div class="control-group">
            <div class="control-label">语言</div>
            <div class="template-grid">
               <div class="tpl-card active">中文</div>
               <div class="tpl-card">English</div>
            </div>
          </div>

        </div>

      </div>

      <!-- 4. 底部底座 (The Dock) -->
      <div class="sidebar-footer" v-show="!isCollapsed">
        <!-- 左侧：次要操作 -->
        <div class="secondary-actions">
          <el-tooltip content="保存草稿" placement="top">
            <button class="icon-btn" @click="handleSave">
              <el-icon><Save :size="18" /></el-icon>
            </button>
          </el-tooltip>

          <el-dropdown trigger="click" placement="top-start">
            <button class="icon-btn">
              <el-icon><MoreFilled /></el-icon>
            </button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="handleExportJSON">
                  <el-icon><FileDown :size="16" /></el-icon>
                  <span>导出 JSON</span>
                </el-dropdown-item>
                <el-dropdown-item disabled>
                  <el-icon><Upload /></el-icon>
                  <span>导入简历</span>
                </el-dropdown-item>
                <el-dropdown-item divided @click="handleReset">
                  <el-icon><Delete /></el-icon>
                  <span style="color:#f56c6c">重置</span>
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>

        <!-- 右侧：主要操作 -->
        <button class="primary-btn" @click="handleExportPDF">
          <el-icon><Download /></el-icon>
          <span class="btn-text">导出 PDF</span>
        </button>
      </div>

    </aside>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useResumeStore } from '@/stores/resume'
import { usePrint } from '@/composables/usePrint'
import { ElMessage } from 'element-plus'
import dayjs from 'dayjs'
import ExperienceList from './editor/ExperienceList.vue'
import ProjectList from './editor/ProjectList.vue'
import EducationList from './editor/EducationList.vue'
import AwardList from './editor/AwardList.vue'
import SelfEvaluationEditor from './editor/SelfEvaluationEditor.vue'
import BoldTextarea from './editor/BoldTextarea.vue'
import { Plus } from '@element-plus/icons-vue'
import { Save, FileDown, Pencil, Palette } from 'lucide-vue-next'

const store = useResumeStore()
const { printResume } = usePrint(store.resumeFileName)

const isCollapsed = ref(false)
const currentTab = ref<'content' | 'design'>('content')
const activeNames = ref(['profile'])
const avatarInput = ref<HTMLInputElement | null>(null)

// 预定义颜色
const predefineColors = ref([
  '#000000',  // 黑色
  '#465E69',  // 石板蓝
  '#2C3E50',  // 深蓝灰
  '#C0392B',  // 深红
  '#2980B9',  // 蓝色
  '#27AE60',  // 绿色
  '#8E44AD',  // 紫色
  '#D35400'   // 橙色
])

const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value
}

const handleExportPDF = () => {
  printResume()
}

const handleSave = () => {
  store.updateLastSavedTime()
  ElMessage.success({
    message: '简历已保存',
    duration: 2000
  })
}

const handleExportJSON = () => {
  const data = store.getExportData()
  const jsonString = JSON.stringify(data, null, 2)
  const blob = new Blob([jsonString], { type: 'application/json' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  const timestamp = dayjs().format('YYYYMMDD_HHmmss')
  link.href = url
  link.download = `${store.resumeFileName}_${timestamp}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)

  ElMessage.success({
    message: 'JSON 文件已导出',
    duration: 2000
  })
}

const handleReset = () => {
  if (confirm('确定要重置所有数据吗？此操作不可恢复。')) {
    store.resetData()
  }
}

const triggerFileInput = () => {
  avatarInput.value?.click()
}

const handleAvatarChange = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  try {
    await store.uploadAvatar(file)
    ElMessage.success('头像上传成功')
  } catch (error: any) {
    ElMessage.error(error.message || '头像上传失败')
  }

  // 清空 input，允许重复上传同一文件
  if (target) {
    target.value = ''
  }
}

const handleRemoveAvatar = () => {
  store.removeAvatar()
  ElMessage.success('头像已删除')
}
</script>

<style scoped>
/* === 外层容器 === */
.sidebar-wrapper {
  position: relative;
  display: flex;
  height: 100vh;
}

/* === 侧边栏容器 (Transition Magic) === */
.sidebar {
  width: var(--sidebar-width-expanded);
  background: var(--sidebar-bg);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  position: relative;
  transition: width 0.35s cubic-bezier(0.25, 0.8, 0.25, 1); /* 丝滑缓动 */
  z-index: 10;
  overflow: hidden;
}

/* 收起状态：完全隐藏 */
.sidebar.is-collapsed {
  width: 0;
  border-right: none;
}

/* === 切换把手 (Toggle Handle) === */
.sidebar-toggle {
  position: absolute;
  top: 50%;
  left: var(--sidebar-width-expanded);
  transform: translateY(-50%);
  width: 12px;
  height: 48px;
  background: white;
  border: 1px solid var(--border-color);
  border-radius: 0 6px 6px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 20;
  box-shadow: 2px 0 6px rgba(0,0,0,0.05);
  transition: all 0.35s cubic-bezier(0.25, 0.8, 0.25, 1);
  color: var(--text-secondary);
}

/* 收起时把手位置 */
.sidebar-wrapper:has(.sidebar.is-collapsed) .sidebar-toggle {
  left: 0;
}

.sidebar-toggle:hover {
  width: 16px;
  color: var(--primary-color);
  border-color: var(--primary-color);
  background: var(--primary-color);
}

.sidebar-toggle:hover .el-icon {
  color: white;
}

/* === 1. 顶栏 Header === */
.sidebar-header {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  border-bottom: 1px solid rgba(0,0,0,0.04);
}

.brand-text {
  font-family: var(--font-serif);
  font-weight: 700;
  color: var(--primary-color);
  font-size: 22px;
  letter-spacing: -0.5px;
  white-space: nowrap;
}

/* 语言切换 */
.lang-switch {
  background: #EAEAEA;
  border-radius: 12px;
  padding: 2px;
  display: flex;
}

.lang-opt {
  font-size: 10px;
  padding: 2px 6px;
  cursor: pointer;
  border-radius: 10px;
  color: #666;
}

.lang-opt.active {
  background: white;
  color: black;
  font-weight: 600;
  box-shadow: 0 1px 2px rgba(0,0,0,0.1);
}

/* === 2. 导航 Tabs === */
.tab-nav {
  display: flex;
  padding: 0 24px;
  border-bottom: 1px solid rgba(0,0,0,0.04);
  transition: all 0.3s;
}

.tab-item {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 14px 0;
  cursor: pointer;
  color: var(--text-secondary);
  border-bottom: 2px solid transparent;
  transition: all 0.2s;
}

.tab-item:hover {
  color: var(--primary-color);
}

.tab-item.active {
  color: var(--primary-color);
  border-bottom-color: var(--primary-color);
}

.tab-text {
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
}

/* === 3. 滚动内容区 === */
.scroll-content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 24px;

  /* 隐藏滚动条但保持功能 */
  &::-webkit-scrollbar {
    width: 0;
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: transparent;
  }
  /* Firefox */
  scrollbar-width: none;
  /* IE/Edge */
  -ms-overflow-style: none;
}

.panel-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  color: var(--text-secondary);
  font-size: 14px;
}

/* === Panel 动画 === */
.panel-fade {
  animation: fadeIn 0.3s ease-out;
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* === 幽灵表单样式 === */
/* 基本信息区域使用 horizontal-form 类，不强制垂直布局 */
.ghost-form:not(.horizontal-form) .el-form-item {
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
}

/* 重置表单项内容区域的样式 */
.ghost-form :deep(.el-form-item__content) {
  line-height: 2.5 !important;
}

/* 输入框 - 0212font.html 风格 */
.ghost-form :deep(.el-input__wrapper) {
  background: #ffffff !important;
  border: 1px solid var(--border-color) !important;
  border-radius: 8px !important;
  box-shadow: 0 2px 8px rgba(60, 56, 54, 0.04) !important;
  padding: 6px 12px !important;
  transition: all 0.3s ease !important;
}

.ghost-form :deep(.el-input__wrapper:hover) {
  border-color: #D1CEC9 !important;
}

.ghost-form :deep(.el-input__wrapper.is-focus) {
  border-color: var(--primary-color) !important;
  box-shadow: none !important;
}

.ghost-form :deep(.el-input__inner) {
  font-size: 13px !important;
  font-family: var(--font-sans) !important;
  color: var(--text-main) !important;
  line-height: 1.5 !important;
}

/* 文本域 - 0212font.html 风格 */
.ghost-form :deep(.el-textarea__inner) {
  background: #ffffff !important;
  border: 1px solid var(--border-color) !important;
  border-radius: 8px !important;
  box-shadow: 0 2px 8px rgba(60, 56, 54, 0.04) !important;
  padding: 12px 14px !important;
  font-size: 13px !important;
  font-family: var(--font-sans) !important;
  color: var(--text-main) !important;
  line-height: 1.5 !important;
  resize: none;
  transition: all 0.3s ease !important;
}

.ghost-form :deep(.el-textarea__inner:hover) {
  border-color: #D1CEC9 !important;
}

.ghost-form :deep(.el-textarea__inner:focus) {
  border-color: var(--primary-color) !important;
  box-shadow: 0 0 0 3px rgba(70, 94, 105, 0.15) !important;
}

/* === 表单标签样式 === */
.ghost-form :deep(.el-form-item__label) {
  font-size: 13px !important;
  font-weight: 500 !important;
  color: var(--text-secondary) !important;
  font-family: var(--font-sans) !important;
  margin-bottom: 8px !important;
  line-height: 1.5 !important;
  text-transform: none !important;
  letter-spacing: normal !important;
}

/* === 水平表单布局 === */
/* 基本信息区域使用全局 horizontal-form 样式（水平布局） */

/* 基本信息区域：调整输入框高度 */
.ghost-form:not(.horizontal-form) :deep(.el-input__wrapper) {
  padding: 4px 12px !important;
  min-height: 32px !important;
}

/* === 列表容器 === */
.list-container {
  padding: 8px 0;
}

/* === 头像上传 === */
.avatar-uploader {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.avatar-preview {
  width: 80px;
  height: 100px;
  object-fit: cover;
  background: #F2F0EB;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(60, 56, 54, 0.04);
  transition: all 0.3s ease;
}

.avatar-preview:hover {
  transform: translateY(-1px);
  border-color: #D1CEC9;
  box-shadow: 0 4px 12px rgba(60, 56, 54, 0.08);
}

.avatar-hint {
  display: block;
  width: 100%;
  font-size: 12px;
  color: var(--text-secondary);
  margin-top: 2px !important;
}

/* === 控件组 === */
.control-group {
  margin-bottom: 56px;
}
.control-label {
  font-family: var(--font-serif);
  font-size: 16px;
  font-weight: 900;
  color: var(--primary-color);
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
  margin-bottom: 16px;
  /* 用 text-shadow 增强粗细效果 */
  text-shadow:
    0 0 0 currentColor,
    0 0 1px rgba(0, 0, 0, 0.2);
  -webkit-text-stroke: 0.01em currentColor;
}

/* === 手风琴标题样式 === */
:deep(.el-collapse-item__header) {
  font-family: var(--font-serif) !important;
  font-size: 16px !important;
  font-weight: 900 !important;
  color: var(--primary-color) !important;
  /* 用 text-shadow 增强粗细效果 */
  text-shadow:
    0 0 0 currentColor,
    0 0 1px rgba(0, 0, 0, 0.2);
  -webkit-text-stroke: 0.01em currentColor;
}

:deep(.accordion-title) {
  font-family: var(--font-serif);
  font-size: 16px;
  font-weight: 900;
  color: inherit;
}
.control-item {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}
.control-item-label {
  font-size: 13px;
  color: var(--text-secondary);
  width: 60px;
  flex-shrink: 0;
}

/* === 行高选择器样式 === */
.line-height-radio-group {
  width: 180px;
  flex: none;
}

/* === 字体大小选择器样式 === */
.font-size-radio-group {
  width: 220px;
  flex: none;
}

/* === 字体粗细选择器样式 === */
.font-weight-radio-group {
  width: 120px;
  flex: none;
}

/* === 模板卡片 === */
.template-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}
.tpl-card {
  padding: 10px;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  font-family: var(--font-sans);
  font-weight: 600;
  font-size: 13px;
  color: var(--text-secondary);
}
.tpl-card:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
}
.tpl-card.active {
  border-color: var(--primary-color);
  background: var(--primary-color);
  color: white;
}

/* === 4. 底部 Dock (关键) === */
.sidebar-footer {
  padding: 16px 24px;
  background: var(--sidebar-bg);
  border-top: 1px solid rgba(0,0,0,0.06);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  box-shadow: 0 -4px 12px rgba(0,0,0,0.02);
  z-index: 5;
}

/* 次要操作 */
.secondary-actions {
  display: flex;
  gap: 8px;
}

.icon-btn {
  width: 36px;
  height: 36px;
  border: none;
  background: transparent;
  border-radius: 6px;
  color: var(--text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: 0.2s;
}

.icon-btn:hover {
  background: rgba(0,0,0,0.05);
  color: var(--primary-color);
}

/* 主要按钮 */
.primary-btn {
  flex: 1;
  height: 40px;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 6px;
  font-family: var(--font-serif);
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(70, 94, 105, 0.2);
  transition: 0.2s;
}

.primary-btn:hover {
  background: #384c55;
}

/* === 下拉菜单样式优化 === */
:deep(.el-dropdown-menu__item) {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  font-size: 13px;
}
:deep(.el-dropdown-menu__item .el-icon) {
  font-size: 16px;
  color: #888;
}
:deep(.el-dropdown-menu__item:hover .el-icon) {
  color: var(--primary-color);
}
</style>
