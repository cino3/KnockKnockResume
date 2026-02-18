import { ref } from 'vue'

/**
 * 文件上传Composable
 * 提供文件上传的通用逻辑
 */
export function useFileUpload() {
  const fileInput = ref<HTMLInputElement | null>(null)

  /**
   * 上传图片文件
   * @param file 文件对象
   * @param onSuccess 成功回调,接收base64数据
   * @param maxSize 最大文件大小(字节),默认500KB
   */
  const uploadImage = async (
    file: File,
    onSuccess: (base64: string) => void,
    maxSize: number = 500 * 1024
  ) => {
    // 验证文件大小
    if (file.size > maxSize) {
      ElMessage.error(`图片大小不能超过 ${maxSize / 1024}KB`)
      throw new Error('File too large')
    }

    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      ElMessage.error('只能上传图片文件')
      throw new Error('Invalid file type')
    }

    return new Promise<void>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const base64 = e.target?.result as string
        onSuccess(base64)
        ElMessage.success('头像上传成功')
        resolve()
      }
      reader.onerror = () => {
        ElMessage.error('图片读取失败')
        reject(new Error('Image read failed'))
      }
      reader.readAsDataURL(file)
    })
  }

  /**
   * 触发文件输入框点击
   */
  const triggerFileInput = () => {
    fileInput.value?.click()
  }

  return {
    fileInput,
    uploadImage,
    triggerFileInput
  }
}
