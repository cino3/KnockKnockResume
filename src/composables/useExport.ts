import dayjs from 'dayjs'

/**
 * 简历导出Composable
 * 提供导出、保存、重置等通用操作
 */
export function useExport(filename: string) {
  /**
   * 导出JSON文件
   * @param data 要导出的数据
   * @param prefix 文件名前缀
   */
  const exportJSON = (data: any, prefix?: string) => {
    const jsonString = JSON.stringify(data, null, 2)
    const blob = new Blob([jsonString], { type: 'application/json' })
    const url = URL.createObjectURL(blob)

    const link = document.createElement('a')
    const timestamp = dayjs().format('YYYYMMDD_HHmmss')
    link.href = url
    link.download = `${prefix || filename}_${timestamp}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    ElMessage.success({
      message: 'JSON 文件已导出',
      duration: 2000
    })
  }

  /**
   * 保存简历
   * @param onSave 保存回调
   */
  const save = (onSave?: () => void) => {
    if (onSave) {
      onSave()
    }

    ElMessage.success({
      message: '简历已保存',
      duration: 2000
    })
  }

  /**
   * 重置简历数据
   * @param onReset 重置回调
   */
  const reset = (onReset: () => void) => {
    if (confirm('确定要重置所有数据吗？此操作不可恢复。')) {
      onReset()
      ElMessage.success('简历已重置')
    }
  }

  return {
    exportJSON,
    save,
    reset
  }
}
