<template>
  <div class="sponsor-container">
    <!-- 隐蔽的打赏按钮 -->
    <el-button
      class="sponsor-trigger"
      :icon="Coffee"
      circle
      size="small"
      @click="dialogVisible = true"
      title="打赏"
    />

    <!-- 打赏弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :show-header="false"
      width="300px"
      :append-to-body="true"
      center
    >
      <div class="sponsor-content">
        <p class="sponsor-text">感谢您的支持～</p>
        <div class="qrcode-container">
          <img
            :src="qrcodeUrl"
            alt="微信打赏码"
            class="qrcode-image"
          />
        </div>
        <el-divider style="margin: 16px 0;" />
        <div class="contact-info">
          <p class="contact-label">联系方式</p>
          <div class="wechat-container">
            <span class="wechat-label">微信号：</span>
            <span class="wechat-text">L00jiaLe</span>
          </div>
          <div class="email-container">
            <el-icon class="email-icon"><Message /></el-icon>
            <span class="email-text">linjiale333@gmail.com</span>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Coffee } from 'lucide-vue-next'
import { Message } from '@element-plus/icons-vue'
import wechatQrcode from '@/assets/wechat.jpg'

// 控制弹窗显示
const dialogVisible = ref(false)

// 微信打赏码图片地址
const qrcodeUrl = ref(wechatQrcode)
</script>

<style scoped>
.sponsor-container {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 1000;
}

.sponsor-trigger {
  opacity: 0.5;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.sponsor-trigger:hover {
  opacity: 1;
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.sponsor-content {
  text-align: center;
  padding: 8px 0;
}

.sponsor-text {
  color: #606266;
  font-size: 14px;
  margin-bottom: 16px;
  line-height: 1.6;
}

.qrcode-container {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 16px 0;
}

.qrcode-image {
  width: 200px;
  height: 200px;
  object-fit: contain;
  border-radius: 8px;
}

.contact-info {
  margin-top: 8px;
}

.contact-label {
  color: #606266;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 12px;
}

.email-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 8px;
  transition: all 0.3s ease;
  cursor: pointer;
}

.email-container:hover {
  background: #e6f7ff;
}

.email-icon {
  font-size: 18px;
  color: #409eff;
}

.email-text {
  color: #303133;
  font-size: 14px;
  font-family: 'Consolas', 'Monaco', monospace;
}

/* 打印时隐藏打赏按钮和弹窗，避免出现在导出的简历中 */
@media print {
  .sponsor-container {
    display: none !important;
  }
}

.wechat-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 10px 12px;
  background: #f0f9ff;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.wechat-container:hover {
  background: #dbeafe;
}

.wechat-label {
  color: #07c160;
  font-size: 13px;
  font-weight: 500;
}

.wechat-text {
  color: #303133;
  font-size: 14px;
  font-family: 'Consolas', 'Monaco', monospace;
  font-weight: 500;
}

.email-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 8px;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 8px;
  transition: all 0.3s ease;
  cursor: pointer;
}

.email-container:hover {
  background: #e6f7ff;
}

.email-icon {
  font-size: 18px;
  color: #409eff;
}

.email-text {
  color: #303133;
  font-size: 14px;
  font-family: 'Consolas', 'Monaco', monospace;
}

/* 弹窗样式调整 */
:deep(.el-dialog__body) {
  padding: 24px 20px;
}

:deep(.el-dialog) {
  border-radius: 12px;
}
</style>
