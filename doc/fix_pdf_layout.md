---

# Technical Spec: Perfect PDF Pagination & Layout Consistency

## 1. 当前遇到的问题 (Current Issues)
我们在实现简历预览和导出时遇到了以下阻碍，需要立即修复：
1.  **所见非所得**：网页预览的布局和打印出来的 PDF 布局不一致。
2.  **分页截断 (Page Breaking)**：浏览器自动分页时，将文字、图标或一个完整的“工作经历”模块拦腰切断（上半部分在第一页，下半部分在第二页）。
3.  **内容消失**：当内容超过一页时，第二页是空白的，或者内容被 `overflow` 属性隐藏了。

## 2. 核心解决方案 (Core Solutions)
请修改 `src/assets/style.css` (或全局 CSS 文件) 和 `Preview` 组件，严格遵循以下 CSS 打印标准：

### 2.1 物理尺寸锁定
*   网页预览容器必须严格使用 `210mm` 宽度。
*   高度必须设为 `min-height: 297mm` 和 `height: auto`（严禁设置固定 height）。

### 2.2 防截断策略 (CSS Fragmentation)
*   使用 `break-inside: avoid` 属性。
*   该属性**不能**加在大的 Section 容器上（例如“整个工作经历区域”），否则会导致第一页下方出现巨大留白。
*   该属性**必须**加在每一个**最小原子单元**上（例如“某一段工作经历”、“某一个项目”）。

## 3. 代码实现指令 (Instructions for Cursor)

请执行以下 3 个步骤来修复样式：

### Step 1: 更新全局打印样式
在 `src/style.css` (Tailwind 的入口文件) 中，**追加**或**替换**以下 CSS 规则。这是解决问题的核心：

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* === 1. 预览区基础容器 === */
.resume-paper {
  width: 210mm;
  min-height: 297mm;
  height: auto; /* 关键：允许内容无限生长 */
  background: white;
  margin: 0 auto;
  box-sizing: border-box;
  overflow: visible; /* 关键：严禁 hidden，否则第二页看不见 */
  position: relative;
}

/* === 2. 防截断原子类 (关键！) === */
/* 请将此类应用到每一个 li 或 item div 上 */
.avoid-break {
  break-inside: avoid;
  page-break-inside: avoid; /* 兼容旧浏览器 */
  margin-bottom: 0.5rem;    /* 保持间距 */
}

/* === 3. 打印模式专用样式 (Magic Happens Here) === */
@media print {
  @page {
    margin: 0;
    size: auto;
  }

  body {
    background: white;
    margin: 0;
  }

  /* 隐藏所有无关元素 */
  body * {
    visibility: hidden;
  }

  /* 只显示简历容器及其子元素 */
  #resume-preview-content, 
  #resume-preview-content * {
    visibility: visible;
  }

  /* 强制重置容器样式，确保贴合 A4 纸 */
  #resume-preview-content {
    position: absolute;
    left: 0;
    top: 0;
    width: 210mm !important;
    min-height: 297mm !important;
    height: auto !important;
    margin: 0 !important;
    padding: 20mm !important; /* 这里的 padding 对应简历页边距 */
    box-shadow: none !important;
    
    /* 核心：移除屏幕预览时的缩放 transform */
    transform: none !important; 
    
    /* 核心：确保背景色被打印 */
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
}
```

### Step 2: 修改 Preview 组件结构
请检查 `src/components/preview/ResumePreview.vue` (或对应文件)，确保结构符合以下要求：

1.  **容器 ID**: 根 `div` 必须有 `id="resume-preview-content"` 和 `class="resume-paper"`。
2.  **原子化防截断**: 遍历渲染列表（如工作经历、项目经历）时，给**每一项**添加 `.avoid-break` 类。

**错误示范 (Don't do this):**
```html
<!-- 错误：如果在 Section 上防截断，整个模块会跳到第二页，导致第一页留白 -->
<section class="avoid-break">
  <div v-for="item in experiences">...</div>
</section>
```

**正确示范 (Do this):**
```html
<section>
  <h2 class="section-title">工作经历</h2>
  <!-- 正确：在每一个 item 上防截断 -->
  <div 
    v-for="item in experiences" 
    :key="item.id" 
    class="avoid-break mb-4"
  >
    <h3 class="font-bold">{{ item.company }}</h3>
    <!-- ... -->
  </div>
</section>
```

### Step 3: 检查 Flex 布局隐患
在简历的**纵向**排版中（Top-to-Bottom），请尽量减少使用 `display: flex; flex-direction: column;` 来包裹整个大页面。
*   **建议**: 使用标准的 Block 布局（即默认的 div 堆叠）。
*   **原因**: 老旧浏览器的打印引擎在计算跨页的 Flex 容器高度时经常出错，导致内容重叠或消失。局部左右布局（如左边时间，右边公司）使用 Flex 没问题。

## 4. 最终验证标准
执行完代码后，请验证：
1.  内容写满一页后，是否自然流到了第二页？
2.  处于页尾的“工作经历”，是否整体跳到了第二页，而不是标题在第一页，内容在第二页？
3.  点击导出时，第二页是否有内容（不是空白）？

请立即按照 Step 1, 2, 3 修复代码。