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
          <Bold :size="14" />
        </template>
      </el-button>
      <el-button
        size="small"
        type="primary"
        text
        @click="insertBullet"
      >
        <template #icon>
          <List :size="14" />
        </template>
      </el-button>
      <el-tooltip
        content="对齐上一行列表缩进"
        placement="top"
      >
        <el-button
          size="small"
          type="primary"
          text
          @click="insertListIndent"
        >
          <span class="indent-icon">↳</span>
        </el-button>
      </el-tooltip>
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
import { ref, watch, onMounted, nextTick } from 'vue'
import { Bold, List } from 'lucide-vue-next'

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

  // 使用现代 Selection API 实现加粗
  let selection = window.getSelection()
  if (!selection || selection.rangeCount === 0) {
    // 如果没有选区，创建一个在末尾的选区
    const range = document.createRange()
    range.selectNodeContents(editorRef.value)
    range.collapse(false)
    selection = window.getSelection()
    if (!selection) return
    selection.removeAllRanges()
    selection.addRange(range)
  }

  const range = selection.getRangeAt(0)
  
  // 检查当前选区是否已经在加粗标签内
  let isBoldActive = false
  let ancestor: Node | null = range.commonAncestorContainer
  while (ancestor && ancestor !== editorRef.value) {
    if (ancestor.nodeType === Node.ELEMENT_NODE) {
      const el = ancestor as HTMLElement
      if (el.tagName === 'STRONG' || el.tagName === 'B') {
        isBoldActive = true
        break
      }
    }
    ancestor = ancestor.parentNode
  }

  if (isBoldActive) {
    // 如果已加粗，则取消加粗：移除 strong/b 标签但保留内容
    const strongElement = (ancestor as HTMLElement)
    const parent = strongElement.parentNode
    if (parent) {
      while (strongElement.firstChild) {
        parent.insertBefore(strongElement.firstChild, strongElement)
      }
      strongElement.remove()
    }
  } else {
    // 如果未加粗，则添加加粗：用 strong 标签包裹选区
    try {
      const strong = document.createElement('strong')
      if (range.collapsed) {
        // 如果只是光标位置，插入一个空的 strong 标签
        range.insertNode(strong)
        range.setStart(strong, 0)
        range.collapse(true)
      } else {
        // 如果有选中内容，用 strong 包裹
        const contents = range.extractContents()
        strong.appendChild(contents)
        range.insertNode(strong)
      }
      if (selection) {
        selection.removeAllRanges()
        selection.addRange(range)
      }
    } catch {
      // 如果操作失败，回退到 execCommand（虽然已弃用，但作为后备方案）
      // eslint-disable-next-line deprecation/deprecation
      document.execCommand('bold', false)
    }
  }

  // 更新内容
  content.value = editorRef.value.innerHTML
  emit('update:modelValue', content.value)

  // 检查当前光标位置是否加粗
  nextTick(() => {
    checkBoldState()
  })
}

// 插入项目符号
const insertBullet = () => {
  if (!editorRef.value) return

  // 聚焦编辑器（如果未聚焦）
  editorRef.value.focus()

  // 使用现代 Selection API 插入项目符号和空格
  let selection = window.getSelection()
  if (!selection || selection.rangeCount === 0) {
    // 如果没有选区，在末尾插入
    const range = document.createRange()
    range.selectNodeContents(editorRef.value)
    range.collapse(false)
    selection = window.getSelection()
    if (!selection) return
    selection.removeAllRanges()
    selection.addRange(range)
  }

  const range = selection.getRangeAt(0)
  range.deleteContents()
  
  const textNode = document.createTextNode('  •  ')
  range.insertNode(textNode)
  
  // 将光标移动到插入文本之后
  range.setStartAfter(textNode)
  range.collapse(true)
  selection.removeAllRanges()
  selection.addRange(range)

  // 更新内容
  content.value = editorRef.value.innerHTML
  emit('update:modelValue', content.value)
}

// 插入列表续行缩进（固定 6 个空格）
const insertListIndent = () => {
  if (!editorRef.value) return

  editorRef.value.focus()

  let selection = window.getSelection()
  if (!selection || selection.rangeCount === 0) {
    const range = document.createRange()
    range.selectNodeContents(editorRef.value)
    range.collapse(false)
    selection = window.getSelection()
    if (!selection) return
    selection.removeAllRanges()
    selection.addRange(range)
  }

  const range = selection.getRangeAt(0)
  range.deleteContents()

  const br = document.createElement('br')
  range.insertNode(br)

  range.setStartAfter(br)
  range.collapse(true)

  const spacesNode = document.createTextNode('      ')
  range.insertNode(spacesNode)

  range.setStartAfter(spacesNode)
  range.collapse(true)
  selection.removeAllRanges()
  selection.addRange(range)

  content.value = editorRef.value.innerHTML
  emit('update:modelValue', content.value)
}

// 检查当前选区是否加粗
const checkBoldState = () => {
  const selection = window.getSelection()
  if (!selection || selection.rangeCount === 0) {
    isBold.value = false
    return
  }

  try {
    // 使用现代 API 检查是否在加粗标签内
    const range = selection.getRangeAt(0)
    let ancestor: Node | null = range.commonAncestorContainer
    
    // 如果选区是空的（只是光标），检查父节点
    if (range.collapsed) {
      if (ancestor && ancestor.nodeType === Node.TEXT_NODE) {
        ancestor = ancestor.parentNode
      }
    }
    
    // 向上遍历查找 strong 或 b 标签
    while (ancestor && ancestor !== editorRef.value) {
      if (ancestor.nodeType === Node.ELEMENT_NODE) {
        const el = ancestor as HTMLElement
        if (el.tagName === 'STRONG' || el.tagName === 'B') {
          isBold.value = true
          return
        }
      }
      ancestor = ancestor.parentNode
    }
    
    isBold.value = false
  } catch {
    isBold.value = false
  }
}

// 处理键盘事件（阻止某些默认行为）
const handleKeydown = (e: KeyboardEvent) => {
  // Enter 键默认行为（插入 div），改为插入 br
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    
    // 使用现代 Selection API 插入换行
    const selection = window.getSelection()
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0)
      const br = document.createElement('br')
      range.deleteContents()
      range.insertNode(br)
      
      // 将光标移动到 br 之后
      range.setStartAfter(br)
      range.collapse(true)
      selection.removeAllRanges()
      selection.addRange(range)
      
      // 触发 input 事件以更新内容
      if (editorRef.value) {
        content.value = editorRef.value.innerHTML
        emit('update:modelValue', content.value)
      }
    }
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
  border: 1px solid var(--border-color, #E6E4DD);
  border-radius: 6px;
  overflow: hidden;
  background: white;
  transition: border-color 0.2s;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

.bold-textarea-wrapper:focus-within {
  border-color: var(--primary-color, #465E69);
}

.toolbar {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  background-color: #fafafa;
  border-bottom: 1px solid var(--border-color, #E6E4DD);
}

.toolbar .el-button {
  padding: 2px 8px;
  min-width: 28px;
  height: 24px;
  font-size: 13px;
  font-weight: 700;
  font-family: var(--font-serif);
  color: var(--primary-color, #465E69);
  background-color: transparent !important;
  transition: all 0.2s;
}

.toolbar .el-button:hover {
  color: white !important;
  background-color: rgba(70, 94, 105, 0.6) !important;
}

.toolbar .el-button.is-active {
  background-color: var(--primary-color, #465E69) !important;
  color: white !important;
}

.toolbar .el-button.is-active:hover {
  background-color: #384c55 !important;
  color: white !important;
}

.toolbar .indent-icon {
  display: inline-block;
  font-size: 14px;
  line-height: 1;
  transform: translateY(-1px);
}

.editor-content {
  padding: 8px 12px;
  min-height: 88px;
  max-height: 300px;
  overflow-y: auto;
  font-size: 13px !important;
  line-height: 1.6;
  color: #606266;
  word-break: break-word;
  white-space: pre-wrap;
  font-family: var(--font-sans);
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
