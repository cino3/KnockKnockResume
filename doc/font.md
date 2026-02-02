这是 \*\*Jeffrey Zeldman\*\* 为你准备的\*\*排版适配增补文档\*\*。



这份文档专注于 \*\*Web Typography (网页排版)\*\* 的落地。它作为上一份“主题配色文档”的补充，旨在解决 \*\*“如何在不引入外部字体（Google Fonts）的情况下，用系统自带字体实现高级感”\*\*。



请将此文档发给开发人员（或者喂给 Claude），用于覆盖字体相关的 CSS 设置。



\*\*\*



\# Supplement: Native Typography Strategy (No-External-Fonts)



\## 1. 核心设计哲学 (Typography Philosophy)



本方案采用 \*\*“双字体栈策略 (Dual-Stack Strategy)”\*\*：

1\.  \*\*UI 氛围层 (Atmosphere):\*\* 使用系统原生的 \*\*衬线体 (Serif)\*\* —— `Georgia` (英) + `宋体` (中)。用于营造 Claude 风格的冷静与书卷气。

2\.  \*\*内容功能层 (Utility):\*\* 使用系统原生的 \*\*无衬线体 (Sans-Serif)\*\* —— `System UI` + `微软雅黑/苹方`。用于输入框、正文和简历预览，保证最高的清晰度和打印兼容性。



---



\## 2. 全局变量定义 (CSS Variables)



请在 `src/styles/variables.scss` 或 `App.vue` 的 `:root` 中\*\*增加\*\*以下字体变量定义。



> \*\*注意：\*\* 我们完全移除了对 Google Fonts 的请求，实现了 0ms 字体加载延迟。



```scss

:root {

&nbsp; /\* =========================================================

&nbsp;    Typography System (Native Stacks)

&nbsp;    ========================================================= \*/



&nbsp; /\* \[Stack A] UI 衬线栈：用于侧边栏标题、Logo、按钮 \*/

&nbsp; /\* 策略：Windows/Mac 都有 Georgia，中文回退到宋体，营造古典感 \*/

&nbsp; --font-ui-serif: "Georgia", "Times New Roman", "Songti SC", "SimSun", serif;



&nbsp; /\* \[Stack B] 内容安全栈：用于输入框文字、简历正文、小标签 \*/

&nbsp; /\* 策略：使用操作系统默认的现代黑体，保证易读性 \*/

&nbsp; --font-resume-safe: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif;

&nbsp; 

&nbsp; /\* 基础字号设定 \*/

&nbsp; --font-size-heading: 16px;

&nbsp; --font-size-body: 14px;

&nbsp; --font-size-small: 12px;

}



/\* 全局应用默认字体 (黑体优先) \*/

body {

&nbsp; font-family: var(--font-resume-safe);

&nbsp; -webkit-font-smoothing: antialiased; /\* Mac 字体平滑 \*/

&nbsp; -moz-osx-font-smoothing: grayscale;

}

```



---



\## 3. Element Plus 组件字体覆盖 (Component Overrides)



为了实现“UI 用衬线，内容用黑体”的分离，我们需要精确覆盖 Element Plus 的特定类名。



请将以下代码添加到 `src/styles/element-overrides.scss` 或 `App.vue` 的 `<style>` 中。



```scss

/\* =========================================================

&nbsp;  Element Plus Typography Overrides

&nbsp;  ========================================================= \*/



/\* --- 1. 侧边栏 \& 导航 (氛围区) --- \*/



/\* 品牌 Logo / 大标题 \*/

.brand-title {

&nbsp; font-family: var(--font-ui-serif) !important;

&nbsp; font-weight: 700;

&nbsp; letter-spacing: -0.02em; /\* 稍微收紧，更精致 \*/

}



/\* 手风琴/折叠面板的标题 (如“教育经历”) \*/

/\* 这里的衬线体是 Claude 风格的灵魂 \*/

.el-collapse-item\_\_header {

&nbsp; font-family: var(--font-ui-serif) !important;

&nbsp; font-size: 16px !important;

&nbsp; font-weight: 600 !important;

&nbsp; letter-spacing: 0.02em;

}



/\* 按钮文字 (增加一点点复古打字机的感觉) \*/

.el-button {

&nbsp; font-family: var(--font-ui-serif) !important;

&nbsp; font-weight: 600;

}



/\* --- 2. 表单与输入 (功能区) --- \*/



/\* 输入框内部文字：必须用黑体，防止宋体在小字号下看不清 \*/

.el-input\_\_inner,

.el-textarea\_\_inner {

&nbsp; font-family: var(--font-resume-safe) !important;

&nbsp; font-size: 15px !important; /\* 稍微调大输入字号，体验更好 \*/

&nbsp; font-weight: 400;

}



/\* 表单的小标签 (Label)：保持黑体，清晰为主 \*/

.el-form-item\_\_label {

&nbsp; font-family: var(--font-resume-safe) !important;

&nbsp; font-size: 11px !important;

&nbsp; text-transform: uppercase; /\* 全大写，增加设计感 \*/

&nbsp; letter-spacing: 0.05em;

&nbsp; font-weight: 600 !important;

}



/\* --- 3. 简历预览区 (打印区) --- \*/



.a4-paper {

&nbsp; /\* 强制简历内容使用安全黑体，确保 ATS 系统友好且打印清晰 \*/

&nbsp; font-family: var(--font-resume-safe) !important;

&nbsp; 

&nbsp; h1, h2, h3, h4, p, span {

&nbsp;   font-family: inherit; /\* 继承上面的设置 \*/

&nbsp; }



&nbsp; /\* 可选：如果你希望简历里的“姓名”稍微有点艺术感，可以单独开启 \*/

&nbsp; .resume-name {

&nbsp;   /\* font-family: var(--font-ui-serif) !important; \*/ /\* 解开注释可启用 \*/

&nbsp; }

}

```



---



\## 4. 实施后的预期效果 (Checklist)



应用上述 CSS 后，请检查以下细节以确保适配成功：



1\.  \*\*侧边栏标题 (Sidebar Headings):\*\* "基本信息"、"教育经历" 的字体应该是 \*\*宋体\*\* (中文) 或 \*\*Georgia\*\* (英文/数字)。边角有装饰线。

2\.  \*\*输入框 (Inputs):\*\* 当你输入 "Hello 123" 时，字体应该是无装饰的 \*\*黑体\*\* (Sans-serif)。清晰、锐利。

3\.  \*\*加载速度 (Performance):\*\* 刷新页面时，文字应该立即出现，不应该有任何闪烁 (FOIT)，因为我们使用的是本机自带字体。

4\.  \*\*按钮 (Buttons):\*\* "导出 PDF" 按钮的字体应该带有衬线，显得比较正式。



---



\## 5. (可选) 给开发者的 Vue Template 补充



如果在 `App.vue` 中直接使用，可以参考这个结构：



```html

<template>

&nbsp; <!-- 在最外层容器加个类名方便控制 -->

&nbsp; <div class="app-container native-font-optimization">

&nbsp;    <!-- ... 你的代码 ... -->

&nbsp; </div>

</template>



<style lang="scss">

/\* 建议使用非 scoped 样式来覆盖 Element Plus 内部样式 \*/

.native-font-optimization {

&nbsp; 

&nbsp; /\* 针对 Sidebar 容器内的特殊处理 \*/

&nbsp; .editor-sidebar {

&nbsp;   /\* 让侧边栏里的所有数字默认用 Georgia，比较好看 \*/

&nbsp;   font-family: var(--font-ui-serif); 

&nbsp; }



&nbsp; /\* 修正：侧边栏里的 form-label 和 input 还是回退到黑体 \*/

&nbsp; .editor-sidebar .el-form-item\_\_label,

&nbsp; .editor-sidebar .el-input\_\_inner {

&nbsp;   font-family: var(--font-resume-safe);

&nbsp; }

}

</style>

```

