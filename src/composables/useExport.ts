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
   * 导入JSON文件
   * @param onImport 导入回调，接收解析后的数据
   */
  const importJSON = (onImport: (data: any) => boolean) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'application/json,.json'

    input.onchange = (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      const reader = new FileReader()
      reader.onload = (event) => {
        try {
          const jsonData = JSON.parse(event.target?.result as string)

          // 验证必需的字段
          if (!jsonData.profile && !jsonData.experiences && !jsonData.projects) {
            throw new Error('无效的简历数据格式')
          }

          // 调用导入回调
          const success = onImport(jsonData)
          if (success) {
            ElMessage.success({
              message: '简历导入成功',
              duration: 2000
            })
          } else {
            ElMessage.error({
              message: '简历导入失败',
              duration: 2000
            })
          }
        } catch (error) {
          console.error('导入JSON失败:', error)
          ElMessage.error({
            message: error instanceof Error ? error.message : 'JSON 文件格式错误',
            duration: 3000
          })
        }
      }

      reader.readAsText(file)
    }

    input.click()
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
    importJSON,
    save,
    reset
  }
}
