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
      <el-button type="danger" @click="handleReset">
        <template #icon>
          <RotateCcw :size="16" />
        </template>
        重置
      </el-button>
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
          <el-form-item label="地址">
            <el-input v-model="store.profile.location" placeholder="请输入地址" />
          </el-form-item>
          <el-form-item label="GitHub">
            <el-input v-model="store.profile.github" placeholder="GitHub 链接（可选）" />
          </el-form-item>
          <el-form-item label="网站">
            <el-input v-model="store.profile.website" placeholder="个人网站（可选）" />
          </el-form-item>
          <el-form-item label="个人简介">
            <el-input
              v-model="store.profile.summary"
              type="textarea"
              :rows="4"
              placeholder="请输入个人简介"
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

      <!-- 教育背景 -->
      <el-collapse-item name="education" title="教育背景">
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

      <!-- 主题设置 -->
      <el-collapse-item name="theme" title="主题设置">
        <el-form :model="store.theme" label-width="100px" size="small">
          <el-form-item label="主色调">
            <el-color-picker v-model="store.theme.primaryColor" />
          </el-form-item>
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
import { Download, RotateCcw, Plus } from 'lucide-vue-next'
import ExperienceList from './editor/ExperienceList.vue'
import ProjectList from './editor/ProjectList.vue'
import EducationList from './editor/EducationList.vue'

const store = useResumeStore()
const activeNames = ref(['profile'])

const { printResume } = usePrint(store.resumeFileName)

const handleExport = () => {
  printResume()
}

const handleReset = () => {
  if (confirm('确定要重置所有数据吗？此操作不可恢复。')) {
    store.resetData()
  }
}
</script>

<style scoped>
.editor {
  padding: 20px;
}

.editor-header {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e5e7eb;
}

.list-container {
  padding: 8px 0;
}
</style>

