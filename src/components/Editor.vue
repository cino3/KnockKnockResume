<template>
  <div class="editor">
    <!-- 顶部按钮 -->
    <div class="editor-header">
      <el-button type="primary" @click="handleExport">
        <template #icon>
          <Download :size="16" />
        </template>
        导出 PDF
      </el-button>
      <el-button type="info" @click="handleExportJSON">
        <template #icon>
          <Download :size="16" />
        </template>
        导出 JSON
      </el-button>
      <el-button type="success" @click="handleSave">
        <template #icon>
          <Save :size="16" />
        </template>
        保存
      </el-button>
      <el-button type="danger" @click="handleReset">
        <template #icon>
          <RotateCcw :size="16" />
        </template>
        重置
      </el-button>
    </div>
    <div v-if="store.lastSavedTime" class="save-time">
      最后保存于 {{ store.lastSavedTime }}
    </div>

    <!-- 折叠面板 -->
    <el-collapse v-model="activeNames" accordion>
      <!-- 基本信息 -->
      <el-collapse-item name="profile" title="基本信息">
        <el-form :model="store.profile" label-width="80px" size="small">
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
            <div style="font-size: 12px; color: #999; margin-top: 4px;">建议尺寸 80x100px，最大 500KB</div>
          </el-form-item>
          <el-form-item label="GitHub">
            <el-input v-model="store.profile.github" placeholder="GitHub 链接（可选）" />
          </el-form-item>
          <el-form-item label="网站">
            <el-input v-model="store.profile.website" placeholder="个人网站（可选）" />
          </el-form-item>
        </el-form>
      </el-collapse-item>

      <!-- 教育经历 -->
      <el-collapse-item name="education" title="教育经历">
        <div class="list-container">
          <el-button type="primary" size="small" @click="store.addEducation" style="margin-bottom: 12px;">
            <template #icon>
              <Plus :size="14" />
            </template>
            添加教育
          </el-button>
          <EducationList />
        </div>
      </el-collapse-item>

      <!-- 专业技能 -->
      <el-collapse-item name="skills" title="专业技能">
        <el-form :model="store.profile" label-width="80px" size="small">
          <el-form-item label="技能">
            <el-input
              v-model="store.profile.skills"
              type="textarea"
              :rows="6"
              placeholder="请输入专业技能，可换行输入多个技能项"
            />
          </el-form-item>
        </el-form>
      </el-collapse-item>

      <!-- 工作经历 -->
      <el-collapse-item name="experience" title="工作经历">
        <div class="list-container">
          <el-button type="primary" size="small" @click="store.addExperience" style="margin-bottom: 12px;">
            <template #icon>
              <Plus :size="14" />
            </template>
            添加经历
          </el-button>
          <ExperienceList />
        </div>
      </el-collapse-item>

      <!-- 项目经历 -->
      <el-collapse-item name="project" title="项目经历">
        <div class="list-container">
          <el-button type="primary" size="small" @click="store.addProject" style="margin-bottom: 12px;">
            <template #icon>
              <Plus :size="14" />
            </template>
            添加项目
          </el-button>
          <ProjectList />
        </div>
      </el-collapse-item>

      <!-- 主题设置 -->
      <el-collapse-item name="theme" title="主题设置">
        <el-form :model="store.theme" label-width="100px" size="small">
          <el-form-item label="行高">
            <el-slider
              v-model="store.theme.lineHeight"
              :min="1.2"
              :max="1.8"
              :step="0.1"
              show-input
            />
          </el-form-item>
          <el-form-item label="段间距">
            <el-slider
              v-model="store.theme.paragraphSpacing"
              :min="4"
              :max="16"
              :step="2"
              show-input
            />
          </el-form-item>
        </el-form>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useResumeStore } from '@/stores/resume'
import { usePrint } from '@/composables/usePrint'
import { Download, RotateCcw, Plus, Save } from 'lucide-vue-next'
import { ElMessage } from 'element-plus'
import dayjs from 'dayjs'
import ExperienceList from './editor/ExperienceList.vue'
import ProjectList from './editor/ProjectList.vue'
import EducationList from './editor/EducationList.vue'

const store = useResumeStore()
const activeNames = ref(['profile'])
const avatarInput = ref<HTMLInputElement | null>(null)

const { printResume } = usePrint(store.resumeFileName)

const handleExport = () => {
  printResume()
}

const handleSave = () => {
  // 更新保存时间（数据已经通过 pinia-plugin-persistedstate 自动保存到 localStorage）
  store.updateLastSavedTime()

  // 显示成功提示
  ElMessage.success({
    message: '简历已保存',
    duration: 2000
  })
}

const handleExportJSON = () => {
  // 获取导出数据
  const data = store.getExportData()
  const jsonString = JSON.stringify(data, null, 2)
  const blob = new Blob([jsonString], { type: 'application/json' })
  const url = URL.createObjectURL(blob)

  // 创建下载链接
  const link = document.createElement('a')
  const timestamp = dayjs().format('YYYYMMDD_HHmmss')
  link.href = url
  link.download = `${store.resumeFileName}_${timestamp}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)

  // 显示成功提示
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
.editor {
  padding: 20px;
}

.editor-header {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e5e7eb;
}

.editor-header .el-button {
  flex: 1;
  min-width: 0;
  font-size: 10px;
  padding: 8px 12px;
}

.save-time {
  font-size: 12px;
  color: #999;
  margin-bottom: 16px;
  padding-left: 4px;
}

.list-container {
  padding: 8px 0;
}

.avatar-uploader {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.avatar-preview {
  width: 80px;
  height: 100px;
  object-fit: cover;
  border: 1px solid #e5e7eb;
}
</style>

