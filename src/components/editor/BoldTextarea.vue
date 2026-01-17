<template>
  <div class="bold-textarea-wrapper">
    <div class="toolbar">
      <el-button
        size="small"
        type="primary"
        text
        :class="{ 'is-active': isBold }"
        @click="toggleBold"
      >
        <template #icon>
          <Bold :size="16" />
        </template>
        加粗
      </el-button>
    </div>
    <div
      ref="editorRef"
      class="editor-content"
      :class="{ 'is-empty': !content }"
      contenteditable="true"
      :data-placeholder="placeholder"
      @input="handleInput"
      @keydown="handleKeydown"
      @mouseup="handleMouseUp"
      @blur="handleBlur"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, nextTick, computed } from 'vue'
import { Bold } from 'lucide-vue-next'

interface Props {
  modelValue: string
  placeholder?: string
  rows?: number
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '请输入内容',
  rows: 4
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const editorRef = ref<HTMLDivElement | null>(null)
const content = ref('')
const isBold = ref(false)
const isComposing = ref(false)

// 初始化内容
onMounted(() => {
  if (editorRef.value && props.modelValue) {
    editorRef.value.innerHTML = props.modelValue
    content.value = props.modelValue
  }
})

// 监听外部数据变化
watch(() => props.modelValue, (newVal) => {
  if (editorRef.value && newVal !== content.value) {
    editorRef.value.innerHTML = newVal || ''
    content.value = newVal || ''
  }
})

// 处理输入
const handleInput = () => {
  if (!editorRef.value) return
  content.value = editorRef.value.innerHTML
  emit('update:modelValue', content.value)
  checkBoldState()
}

// 清理 HTML 内容，移除空的标签和多余的换行
const cleanHTML = (html: string): string => {
  if (!html) return ''

  // 创建临时 DOM 来解析 HTML
  const temp = document.createElement('div')
  temp.innerHTML = html

  // 移除空的 div、p 等块级元素
  const emptyElements = temp.querySelectorAll('div:empty, p:empty, span:empty')
  emptyElements.forEach(el => el.remove())

  // 移除连续的 br 标签（保留一个）
  const cleaned = temp.innerHTML.replace(/(<br\s*\/?>[\s\n]*){2,}/gi, '<br>')

  // 移除开头和结尾的 br 标签
  const trimmed = cleaned.replace(/^<br\s*\/?>|<br\s*\/?>$/gi, '')

  return trimmed
}

// 切换加粗
const toggleBold = () => {
  if (!editorRef.value) return

  // 聚焦编辑器（如果未聚焦）
  editorRef.value.focus()

  // 使用浏览器原生命令实现加粗
  document.execCommand('bold', false)

  // 更新内容
  content.value = editorRef.value.innerHTML
  emit('update:modelValue', content.value)

  // 检查当前光标位置是否加粗
  nextTick(() => {
    checkBoldState()
  })
}

// 检查当前选区是否加粗
const checkBoldState = () => {
  const selection = window.getSelection()
  if (!selection || selection.rangeCount === 0) {
    isBold.value = false
    return
  }

  try {
    const commandValue = document.queryCommandValue('bold')
    isBold.value = commandValue === true || commandValue === 'true'
  } catch {
    isBold.value = false
  }
}

// 处理键盘事件（阻止某些默认行为）
const handleKeydown = (e: KeyboardEvent) => {
  // Enter 键默认行为（插入 div），改为插入 br
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    document.execCommand('insertLineBreak', false)
  }
}

// 处理鼠标抬起（检测选区格式状态）
const handleMouseUp = () => {
  // 延迟执行，确保选区稳定后再检测
  setTimeout(() => {
    checkBoldState()
  }, 10)
}

// 处理失焦
const handleBlur = () => {
  if (!editorRef.value) return

  // 保存最终内容（清理空标签）
  const finalContent = cleanHTML(editorRef.value.innerHTML)
  if (finalContent !== content.value) {
    content.value = finalContent
    emit('update:modelValue', content.value)
  }
}
</script>

<style scoped>
.bold-textarea-wrapper {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  overflow: hidden;
  transition: border-color 0.2s;
}

.bold-textarea-wrapper:focus-within {
  border-color: var(--el-color-primary);
}

.toolbar {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px;
  background-color: #f5f7fa;
  border-bottom: 1px solid #dcdfe6;
}

.toolbar .el-button {
  padding: 4px 8px;
}

.toolbar .el-button.is-active {
  background-color: var(--el-color-primary);
  color: white;
}

.editor-content {
  padding: 8px 12px;
  min-height: 88px;
  max-height: 300px;
  overflow-y: auto;
  font-size: 14px;
  line-height: 1.5;
  color: #606266;
  word-break: break-word;
  white-space: pre-wrap;
}

.editor-content:empty::before {
  content: attr(data-placeholder);
  color: #a8abb2;
  pointer-events: none;
}

.editor-content:focus {
  outline: none;
}

/* 加粗样式 */
.editor-content :deep(strong),
.editor-content :deep(b) {
  font-weight: bold;
  font-weight: 700;
}

/* 换行样式 */
.editor-content :deep(br) {
  display: block;
  content: '';
  margin-top: 0.5em;
}
</style>
