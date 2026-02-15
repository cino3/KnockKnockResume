<template>
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
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'

interface Props {
  modelValue: string
  placeholder?: string
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '请输入内容'
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'check-bold-state': []
}>()

const editorRef = ref<HTMLDivElement | null>(null)
const content = ref('')

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
  emit('check-bold-state')
}

// 暴露编辑器引用和当前内容
defineExpose({
  editorRef,
  content
})
</script>
