<template>
  <div class="panel-fade">
    <el-collapse v-model="activeNames" accordion class="cloud-accordion">

      <!-- 基本信息 -->
      <el-collapse-item name="profile">
        <template #title>
          <span class="accordion-title">基本信息</span>
        </template>
        <div class="form-body">
          <el-form :model="store.profile" label-position="top" class="ghost-form basic-info-form">
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
                <img
                  v-if="store.profile.avatar"
                  :src="store.profile.avatar"
                  class="avatar-preview"
                  alt="头像预览"
                />
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
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useResumeStore } from '@/stores/resume'
import { ElMessage } from 'element-plus'
import EducationList from '../editor/EducationList.vue'
import ExperienceList from '../editor/ExperienceList.vue'
import ProjectList from '../editor/ProjectList.vue'
import AwardList from '../editor/AwardList.vue'
import SelfEvaluationEditor from '../editor/SelfEvaluationEditor.vue'
import BoldTextarea from '../editor/BoldTextarea.vue'

const store = useResumeStore()
const activeNames = ref(['profile'])
const avatarInput = ref<HTMLInputElement | null>(null)

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
