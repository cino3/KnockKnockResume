---



\# Project: PureResume (Final - Native Print Version)



\## 1. 项目概述

这是一个基于 Vue 3 的纯前端简历生成器。

\*   \*\*交互逻辑\*\*：左侧编辑，右侧实时预览。

\*   \*\*输出方式\*\*：使用浏览器原生打印功能 (`window.print`) 生成矢量 PDF。

\*   \*\*文件命名\*\*：点击打印时，动态修改页面 Title，确保导出的 PDF 默认文件名为 `\[姓名]\_\[职位]\_简历.pdf`。



\## 2. 技术栈 (Tech Stack)

\*   \*\*Framework\*\*: `vue`, `vite`, `typescript`

\*   \*\*State Management\*\*: `pinia`, `pinia-plugin-persistedstate` (数据持久化)

\*   \*\*UI (Editor)\*\*: `element-plus` (仅用于左侧编辑器), `lucide-vue-next` (图标)

\*   \*\*Layout \& Style (Preview)\*\*: `tailwindcss` (核心排版), `postcss`

\*   \*\*Utils\*\*:

&nbsp;   \*   `vuedraggable@next` (处理列表拖拽排序)

&nbsp;   \*   `dayjs` (日期格式化)

&nbsp;   \*   `@vueuse/core` (响应式工具)



\## 3. 数据结构 (Data Model)

文件: `src/types/resume.ts`



```typescript

// 基础信息

export interface Profile {

&nbsp; name: string;

&nbsp; title: string;         // 职位

&nbsp; mobile: string;

&nbsp; email: string;

&nbsp; location: string;

&nbsp; github?: string;

&nbsp; website?: string;

&nbsp; summary: string;       // 个人简介

}



// 经历列表项 (共用接口)

export interface ResumeItem {

&nbsp; id: string; // UUID

&nbsp; isVisible: boolean;

}



export interface Education extends ResumeItem {

&nbsp; school: string;

&nbsp; major: string;

&nbsp; degree: string;

&nbsp; startDate: string;

&nbsp; endDate: string;

}



export interface Experience extends ResumeItem {

&nbsp; company: string;

&nbsp; position: string;

&nbsp; startDate: string;

&nbsp; endDate: string;

&nbsp; description: string; // 支持换行

}



export interface Project extends ResumeItem {

&nbsp; name: string;

&nbsp; role: string;

&nbsp; startDate: string;

&nbsp; endDate: string;

&nbsp; description: string;

}



// 主题配置

export interface ThemeConfig {

&nbsp; primaryColor: string; // 主色调

&nbsp; fontFamily: string;

&nbsp; lineHeight: number;   // 1.2 ~ 1.8

&nbsp; paragraphSpacing: number; // 段间距

}

```



\## 4. 界面布局与功能



\### 4.1 全局布局 (`App.vue`)

\*   \*\*结构\*\*：Flex 布局，左固定宽 (400px)，右自适应 (Flex-1)。

\*   \*\*打印处理\*\*：在根节点监听打印事件，或者使用 CSS `@media print` 控制显隐。



\### 4.2 左侧编辑器 (`components/editor`)

\*   \*\*组件容器\*\*：使用 `el-collapse` (手风琴模式)。

\*   \*\*模块划分\*\*：

&nbsp;   1.  \*\*基本信息\*\* (`el-form`)

&nbsp;   2.  \*\*工作经历\*\* (列表)：\*\*必须集成 `vuedraggable`\*\*，实现拖拽排序。每项包含编辑表单和删除按钮。

&nbsp;   3.  \*\*项目经历\*\* (列表)：同上。

&nbsp;   4.  \*\*教育背景\*\* (列表)：同上。

&nbsp;   5.  \*\*主题设置\*\*：使用 `el-color-picker` 选色，`el-slider` 调整行高。

\*   \*\*顶部按钮\*\*：

&nbsp;   \*   "导出 PDF" (primary 按钮)

&nbsp;   \*   "重置" (danger 按钮)



\### 4.3 右侧预览区 (`components/preview`)

\*   \*\*缩放功能\*\*：顶部悬浮一个 Slider，控制预览区的 `transform: scale(x)`，范围 0.5 ~ 1.5。

\*   \*\*简历容器\*\* (`.resume-paper`)：

&nbsp;   \*   固定宽度 `210mm`，最小高度 `297mm`。

&nbsp;   \*   背景白色，有阴影。

&nbsp;   \*   \*\*样式\*\*：使用 Tailwind CSS 进行排版。严禁使用 Element Plus 组件。

&nbsp;   \*   \*\*动态样式\*\*：通过 `:style="{ '--primary': theme.primaryColor }"` 绑定主题色。



\## 5. 核心逻辑：导出 PDF 体验优化



\### 5.1 打印 Hook (`usePrint.ts`)

创建一个 Composable 来处理打印逻辑：



```typescript

export function usePrint(resumeName: string) {

&nbsp; const printResume = () => {

&nbsp;   // 1. 备份当前页面标题

&nbsp;   const originalTitle = document.title;

&nbsp;   

&nbsp;   // 2. 修改标题为文件名 (例如: 张三\_前端工程师\_简历)

&nbsp;   // 这样用户保存 PDF 时，文件名会自动变成这个

&nbsp;   document.title = resumeName || '我的简历';

&nbsp;   

&nbsp;   // 3. 调用系统打印

&nbsp;   window.print();

&nbsp;   

&nbsp;   // 4. (可选) 稍微延时后恢复标题，或者通过 window.onafterprint 恢复

&nbsp;   // 但为了确保保存文件名生效，建议不用立即恢复，或者 1秒后恢复

&nbsp;   setTimeout(() => {

&nbsp;     document.title = originalTitle;

&nbsp;   }, 2000);

&nbsp; };

&nbsp; 

&nbsp; return { printResume };

}

```



\### 5.2 打印样式 (`style.css`)

这是\*\*最关键\*\*的部分，请确保 CSS 包含以下规则：



```css

@media print {

&nbsp; /\* 1. 隐藏编辑器、滚动条、背景色、缩放控制器 \*/

&nbsp; body \* {

&nbsp;   visibility: hidden;

&nbsp; }

&nbsp; 

&nbsp; /\* 2. 只显示简历容器 \*/

&nbsp; #resume-preview-content, #resume-preview-content \* {

&nbsp;   visibility: visible;

&nbsp; }



&nbsp; /\* 3. 重置页面设置 \*/

&nbsp; @page {

&nbsp;   margin: 0; /\* 去除浏览器默认页眉页脚 \*/

&nbsp;   size: auto;

&nbsp; }



&nbsp; /\* 4. 定位简历容器铺满纸张 \*/

&nbsp; #resume-preview-content {

&nbsp;   position: absolute;

&nbsp;   left: 0;

&nbsp;   top: 0;

&nbsp;   width: 210mm !important;

&nbsp;   min-height: 297mm !important;

&nbsp;   margin: 0 !important;

&nbsp;   padding: 20mm !important; /\* 保持简历内部的边距 \*/

&nbsp;   box-shadow: none !important;

&nbsp;   transform: none !important; /\* 移除屏幕预览时的缩放 \*/

&nbsp; }

&nbsp; 

&nbsp; /\* 5. 强制打印背景色 (Chrome/Safari 必需) \*/

&nbsp; \* {

&nbsp;   -webkit-print-color-adjust: exact !important;

&nbsp;   print-color-adjust: exact !important;

&nbsp; }

}

```



\## 6. 开发步骤指令 (Instruction for Cursor)



请按照以下顺序生成代码：



1\.  \*\*Init\*\*: 初始化项目，安装所有依赖 (Tailwind, Element Plus, Pinia, VueDraggable)。

2\.  \*\*Store\*\*: 创建 `useResumeStore`，包含所有 Interface 和默认 Mock 数据。

3\.  \*\*Layout\*\*: 搭建左右分栏框架，实现右侧预览区的 `scale` 缩放逻辑。

4\.  \*\*Editor\*\*: 实现左侧折叠面板，重点实现 `ExperienceList.vue` 组件，使用 `draggable` 包裹列表项。

5\.  \*\*Preview\*\*: 实现 A4 纸排版 (Header, Body, Sidebar 布局)。确保 Tailwind 类名使用正确。

6\.  \*\*Print\*\*: 实现 `usePrint` hook 和 `@media print` 样式，绑定到导出按钮。



\*\*Let's build this application.\*\*

