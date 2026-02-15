/**
 * 格式化命令 Composable
 * 从 BoldTextarea.vue 提取（原第109-263行）
 * 负责处理文本格式化：加粗、插入项目符号、检测格式状态
 */

import { ref, Ref, nextTick } from 'vue'

/**
 * 使用格式化命令
 * @param editorRef - 编辑器元素引用
 */
export function useFormatCommands(editorRef: Ref<HTMLElement | null>) {
  const isBold = ref(false)

  /**
   * 处理 HTML 内容，移除空的标签和多余的换行
   */
  const cleanHTML = (html: string): string => {
    if (!html) return ''

    // 创建临时 DOM 来解析 HTML
    const temp = document.createElement('div')
    temp.innerHTML = html

    // 移除空的 div、p、span 块级元素
    const emptyElements = temp.querySelectorAll('div:empty, p:empty, span:empty')
    emptyElements.forEach(el => el.remove())

    // 移除连续的 br 标签（保留一个）
    const cleaned = temp.innerHTML.replace(/(<br\s*\/?>[\s\n]*){2,}/gi, '<br>')

    // 移除开头和结尾的 br 标签
    const trimmed = cleaned.replace(/^<br\s*\/?>|<br\s*\/?>$/gi, '')

    return trimmed
  }

  /**
   * 切换加粗
   */
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
    const content = editorRef.value.innerHTML
    return { content }
  }

  /**
   * 插入项目符号
   */
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

    // 返回更新后的内容
    const content = editorRef.value.innerHTML
    return { content }
  }

  /**
   * 检查当前选区是否加粗
   */
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

  /**
   * 处理键盘事件（Enter 键改为插入 br）
   */
  const handleKeydown = (e: KeyboardEvent, updateContent: (content: string) => void) => {
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
          const content = editorRef.value.innerHTML
          updateContent(content)
        }
      }
    }
  }

  /**
   * 处理鼠标抬起（检测选区格式状态）
   */
  const handleMouseUp = () => {
    // 延迟执行，确保选区稳定后再检测
    setTimeout(() => {
      checkBoldState()
    }, 10)
  }

  /**
   * 处理失焦（清理空标签）
   */
  const handleBlur = (currentContent: string) => {
    if (!editorRef.value) return { content: currentContent }

    // 保存最终内容（清理空标签）
    const finalContent = cleanHTML(editorRef.value.innerHTML)
    return { content: finalContent }
  }

  return {
    isBold,
    toggleBold,
    insertBullet,
    checkBoldState,
    handleKeydown,
    handleMouseUp,
    handleBlur,
    cleanHTML
  }
}
