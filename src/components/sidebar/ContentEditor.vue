<template>
  <div class="panel-fade">
    <el-collapse v-model="activeName" accordion class="cloud-accordion">

      <!-- 基本信息（固定置顶，不参与拖拽） -->
      <el-collapse-item name="profile">
        <template #title>
          <span class="accordion-title basic-title">基本信息</span>
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
              <div class="avatar-hint">建议尺寸 80x100px，最大 2MB</div>
            </el-form-item>
          </el-form>
        </div>
      </el-collapse-item>

      <draggable
        v-model="draggableSections"
        item-key="key"
        handle=".drag-handle"
        tag="div"
        class="sortable-sections"
        :animation="180"
        ghost-class="drag-ghost"
        chosen-class="drag-chosen"
      >
        <template #item="{ element }">
          <el-collapse-item :name="element.key">
            <template #title>
              <div class="section-title-row">
                <GripVertical class="drag-handle" :size="16" @mousedown.stop @click.stop />
                <span class="accordion-title">{{ element.title }}</span>
              </div>
            </template>

            <div class="form-body">
              <!-- 教育经历 -->
              <div v-if="element.key === 'education'" class="list-container">
                <el-button type="primary" size="small" @click="store.addEducation" style="margin-bottom: 12px;">
                  + 添加教育
                </el-button>
                <EducationList />
              </div>

              <!-- 专业技能 -->
              <el-form v-else-if="element.key === 'skills'" :model="store.profile" label-position="top" class="ghost-form">
                <el-form-item>
                  <BoldTextarea
                    v-model="store.profile.skills"
                    placeholder="请输入专业技能，可换行输入多个技能项，支持加粗"
                    :rows="6"
                  />
                </el-form-item>
              </el-form>

              <!-- 工作经历 -->
              <div v-else-if="element.key === 'experience'" class="list-container">
                <el-button type="primary" size="small" @click="store.addExperience" style="margin-bottom: 12px;">
                  + 添加经历
                </el-button>
                <ExperienceList />
              </div>

              <!-- 项目经历 -->
              <div v-else-if="element.key === 'project'" class="list-container">
                <el-button type="primary" size="small" @click="store.addProject" style="margin-bottom: 12px;">
                  + 添加项目
                </el-button>
                <ProjectList />
              </div>

              <!-- 获奖经历 -->
              <div v-else-if="element.key === 'award'" class="list-container">
                <AwardList />
              </div>

              <!-- 发表文章 -->
              <div v-else-if="element.key === 'publication'" class="list-container">
                <PublishedArticlesEditor />
              </div>

              <!-- 个人评价 -->
              <div v-else-if="element.key === 'selfEvaluation'" class="list-container">
                <SelfEvaluationEditor />
              </div>
            </div>
          </el-collapse-item>
        </template>
      </draggable>

    </el-collapse>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import draggable from 'vuedraggable'
import { GripVertical } from 'lucide-vue-next'
import { useResumeStore } from '@/stores/resume'
import type { ResumeSectionKey } from '@/types/resume'
import { ElMessage } from 'element-plus'
import EducationList from '../editor/EducationList.vue'
import ExperienceList from '../editor/ExperienceList.vue'
import ProjectList from '../editor/ProjectList.vue'
import AwardList from '../editor/AwardList.vue'
import PublishedArticlesEditor from '../editor/PublishedArticlesEditor.vue'
import SelfEvaluationEditor from '../editor/SelfEvaluationEditor.vue'
import BoldTextarea from '../editor/BoldTextarea.vue'

interface SortableSection {
  key: ResumeSectionKey;
  title: string;
}

const SECTION_TITLES: Record<ResumeSectionKey, string> = {
  education: '教育经历',
  skills: '专业技能',
  experience: '工作经历',
  project: '项目经历',
  award: '获奖经历',
  publication: '发表文章',
  selfEvaluation: '个人评价'
}

const store = useResumeStore()
const activeName = ref<'profile' | ResumeSectionKey>('profile')
const avatarInput = ref<HTMLInputElement | null>(null)

const draggableSections = computed<SortableSection[]>({
  get: () => store.sectionOrder.map((key) => ({ key, title: SECTION_TITLES[key] })),
  set: (sections) => {
    store.setSectionOrder(sections.map((section) => section.key))
  }
})

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
.section-title-row {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
}

.basic-title {
  display: inline-block;
  padding-left: 24px;
}

.basic-info-form {
  padding-left: 24px;
}

.drag-handle {
  cursor: move;
  color: #9ca3af;
}

.drag-handle:hover {
  color: #6b7280;
}

.sortable-sections :deep(.drag-ghost) {
  opacity: 0.55;
}

.sortable-sections :deep(.drag-chosen) {
  background: rgba(64, 158, 255, 0.06);
}
</style>
