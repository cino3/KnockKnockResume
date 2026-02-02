这是 \*\*Jeffrey Zeldman\*\* 为你整理的最终实施文档。



这份文档将我们之前讨论的所有核心设计——\*\*Slate 配色\*\*、\*\*原生字体栈\*\*、\*\*四段式侧边栏架构\*\*、\*\*双页签模式\*\*、\*\*Dock 底座\*\* 以及 \*\*Mini 收起模式\*\*——完美整合到了 \*\*Vue 3 + Element Plus\*\* 的技术栈中。



请将这份文档直接发送给你的 AI 助手（Claude）或前端开发人员。



\*\*\*



\# Element Plus Implementation Guide: The "Claude-Style" Resume Builder



\## 1. 设计概述 (Design Overview)



本项目旨在构建一个极简、高雅且功能强大的简历生成器。

\*\*核心交互哲学：\*\*

1\.  \*\*分离关注点：\*\* 通过“双页签”分离 \*内容编辑\* 与 \*外观样式\*。

2\.  \*\*固定底座 (The Dock)：\*\* 无论内容多长，核心操作（导出/保存）永远悬停在左侧底部。

3\.  \*\*专注模式 (Mini Sidebar)：\*\* 侧边栏可收起为 70px 的图标栏，为 A4 预览腾出空间。

4\.  \*\*原生排版：\*\* 不依赖 WebFont，使用系统衬线体营造“书卷气”。



---



\## 2. 全局样式变量 (CSS Variables)



请在 `src/styles/variables.scss` 或 `App.vue` 的 `:root` 中定义。



```scss

:root {

&nbsp; /\* --- 1. 配色方案 (Slate Blue Theme) --- \*/

&nbsp; --primary-color: #465E69;      /\* 核心主色：石板蓝 \*/

&nbsp; --app-bg: #F2F0EB;             /\* APP背景：暖米色 \*/

&nbsp; --sidebar-bg: #F9F8F6;         /\* 侧边栏背景：极淡米白 \*/

&nbsp; --border-color: #E6E4DD;       /\* 柔和边框 \*/

&nbsp; --text-main: #2D2D29;          /\* 主要文字：暖炭黑 \*/

&nbsp; --text-secondary: #666660;     /\* 次要文字 \*/



&nbsp; /\* --- 2. 原生字体栈 (Native Typography) --- \*/

&nbsp; /\* UI 氛围字体：用于标题、按钮、Logo (宋体/Georgia) \*/

&nbsp; --font-serif: "Georgia", "Times New Roman", "Songti SC", "SimSun", serif;

&nbsp; /\* 内容功能字体：用于输入框、正文 (系统黑体) \*/

&nbsp; --font-sans: "Inter", -apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", sans-serif;



&nbsp; /\* --- 3. 尺寸定义 --- \*/

&nbsp; --sidebar-width-expanded: 380px;

&nbsp; --sidebar-width-collapsed: 72px;

}



/\* 全局重置 \*/

body {

&nbsp; margin: 0;

&nbsp; background-color: var(--app-bg);

&nbsp; color: var(--text-main);

&nbsp; font-family: var(--font-sans);

&nbsp; overflow: hidden; /\* 防止双重滚动条 \*/

}

```



---



\## 3. Vue 组件实现 (App.vue)



\### 3.1 Template 结构



```html

<template>

&nbsp; <div class="app-container">

&nbsp;   

&nbsp;   <!-- =======================

&nbsp;        LEFT: 智能侧边栏 

&nbsp;        ======================= -->

&nbsp;   <aside class="sidebar" :class="{ 'is-collapsed': isCollapsed }">

&nbsp;     

&nbsp;     <!-- 0. 切换把手 (Toggle Handle) -->

&nbsp;     <div class="sidebar-toggle" @click="toggleSidebar">

&nbsp;       <el-icon size="12">

&nbsp;         <ArrowRight v-if="isCollapsed" />

&nbsp;         <ArrowLeft v-else />

&nbsp;       </el-icon>

&nbsp;     </div>



&nbsp;     <!-- 1. 顶栏：全局设置 (Header) -->

&nbsp;     <div class="sidebar-header">

&nbsp;       <!-- 品牌：展开显示全名，收起显示首字母 -->

&nbsp;       <div class="brand">

&nbsp;         <span v-if="!isCollapsed" class="brand-text">Resume Craft</span>

&nbsp;         <span v-else class="brand-icon">R</span>

&nbsp;       </div>

&nbsp;       

&nbsp;       <!-- 语言切换：收起时隐藏 -->

&nbsp;       <div class="lang-switch" v-show="!isCollapsed">

&nbsp;         <span class="lang-opt active">CN</span>

&nbsp;         <span class="lang-opt">EN</span>

&nbsp;       </div>

&nbsp;     </div>



&nbsp;     <!-- 2. 导航栏：模式切换 (Tabs) -->

&nbsp;     <!-- 使用自定义 Div 模拟 Tab，比 Element Tabs 更容易做变形动画 -->

&nbsp;     <div class="tab-nav">

&nbsp;       <el-tooltip content="内容编辑" placement="right" :disabled="!isCollapsed">

&nbsp;         <div 

&nbsp;           class="tab-item" 

&nbsp;           :class="{ active: currentTab === 'content' }"

&nbsp;           @click="currentTab = 'content'"

&nbsp;         >

&nbsp;           <el-icon :size="18"><EditPen /></el-icon>

&nbsp;           <span class="tab-text">内容编辑</span>

&nbsp;         </div>

&nbsp;       </el-tooltip>



&nbsp;       <el-tooltip content="外观样式" placement="right" :disabled="!isCollapsed">

&nbsp;         <div 

&nbsp;           class="tab-item" 

&nbsp;           :class="{ active: currentTab === 'design' }"

&nbsp;           @click="currentTab = 'design'"

&nbsp;         >

&nbsp;           <el-icon :size="18"><Brush /></el-icon>

&nbsp;           <span class="tab-text">外观样式</span>

&nbsp;         </div>

&nbsp;       </el-tooltip>

&nbsp;     </div>



&nbsp;     <!-- 3. 滚动内容区 (Scroll Area) -->

&nbsp;     <div class="scroll-content" v-show="!isCollapsed">

&nbsp;       

&nbsp;       <!-- Panel A: 内容编辑器 (手风琴) -->

&nbsp;       <div v-show="currentTab === 'content'" class="panel-fade">

&nbsp;         <el-collapse v-model="activeNames" accordion class="claude-accordion">

&nbsp;           

&nbsp;           <el-collapse-item name="1">

&nbsp;             <template #title>

&nbsp;               <span class="accordion-title">基本信息</span>

&nbsp;             </template>

&nbsp;             <div class="form-body">

&nbsp;               <el-form label-position="top" class="ghost-form">

&nbsp;                 <el-form-item label="姓名 / Full Name">

&nbsp;                   <el-input v-model="form.name" />

&nbsp;                 </el-form-item>

&nbsp;                 <el-form-item label="职位 / Job Title">

&nbsp;                   <el-input v-model="form.title" />

&nbsp;                 </el-form-item>

&nbsp;               </el-form>

&nbsp;             </div>

&nbsp;           </el-collapse-item>



&nbsp;           <el-collapse-item name="2">

&nbsp;             <template #title>

&nbsp;               <span class="accordion-title">教育经历</span>

&nbsp;             </template>

&nbsp;             <div class="form-body">

&nbsp;               <!-- 更多表单项... -->

&nbsp;               <el-input v-model="form.school" placeholder="学校名称" class="ghost-input-standalone"/>

&nbsp;             </div>

&nbsp;           </el-collapse-item>



&nbsp;         </el-collapse>

&nbsp;       </div>



&nbsp;       <!-- Panel B: 外观设计器 (滑块 \& 模板) -->

&nbsp;       <div v-show="currentTab === 'design'" class="panel-fade">

&nbsp;         

&nbsp;         <div class="control-group">

&nbsp;           <div class="control-label">排版控制</div>

&nbsp;           <div class="slider-item">

&nbsp;             <span>行高</span>

&nbsp;             <el-slider v-model="style.lineHeight" :min="1" :max="2" :step="0.1" size="small" />

&nbsp;           </div>

&nbsp;           <div class="slider-item">

&nbsp;             <span>间距</span>

&nbsp;             <el-slider v-model="style.spacing" :min="10" :max="40" size="small" />

&nbsp;           </div>

&nbsp;         </div>



&nbsp;         <div class="control-group">

&nbsp;           <div class="control-label">选择模板</div>

&nbsp;           <div class="template-grid">

&nbsp;              <!-- 模拟模板卡片 -->

&nbsp;              <div class="tpl-card active">经典</div>

&nbsp;              <div class="tpl-card">极简</div>

&nbsp;           </div>

&nbsp;         </div>



&nbsp;       </div>

&nbsp;     </div>



&nbsp;     <!-- 4. 底部底座 (The Dock) -->

&nbsp;     <div class="sidebar-footer">

&nbsp;       <!-- 左侧：次要操作 (收起时竖排) -->

&nbsp;       <div class="secondary-actions">

&nbsp;         <el-tooltip content="保存草稿" placement="right">

&nbsp;           <button class="icon-btn"><el-icon><collection-tag /></el-icon></button>

&nbsp;         </el-tooltip>

&nbsp;         

&nbsp;         <el-dropdown trigger="click" placement="top-start">

&nbsp;           <button class="icon-btn"><el-icon><MoreFilled /></el-icon></button>

&nbsp;           <template #dropdown>

&nbsp;             <el-dropdown-menu>

&nbsp;               <el-dropdown-item>导出 JSON</el-dropdown-item>

&nbsp;               <el-dropdown-item>导入配置</el-dropdown-item>

&nbsp;               <el-dropdown-item divided style="color:#f56c6c">重置</el-dropdown-item>

&nbsp;             </el-dropdown-menu>

&nbsp;           </template>

&nbsp;         </el-dropdown>

&nbsp;       </div>



&nbsp;       <!-- 右侧：主要操作 (收起时变成圆钮) -->

&nbsp;       <el-tooltip content="导出 PDF" placement="right" :disabled="!isCollapsed">

&nbsp;         <button class="primary-btn">

&nbsp;           <el-icon><Download /></el-icon>

&nbsp;           <span class="btn-text">导出 PDF</span>

&nbsp;         </button>

&nbsp;       </el-tooltip>

&nbsp;     </div>



&nbsp;   </aside>



&nbsp;   <!-- =======================

&nbsp;        RIGHT: 预览区 

&nbsp;        ======================= -->

&nbsp;   <main class="preview-area">

&nbsp;     <div class="a4-paper" :style="{ lineHeight: style.lineHeight }">

&nbsp;       <h1 class="resume-name">{{ form.name }}</h1>

&nbsp;       <p>{{ form.title }}</p>

&nbsp;       <p class="resume-content">这里是简历预览区域...</p>

&nbsp;     </div>

&nbsp;   </main>



&nbsp; </div>

</template>



<script setup>

import { ref, reactive } from 'vue'

import { 

&nbsp; ArrowLeft, ArrowRight, EditPen, Brush, 

&nbsp; CollectionTag, MoreFilled, Download 

} from '@element-plus/icons-vue'



const isCollapsed = ref(false)

const currentTab = ref('content') // 'content' | 'design'

const activeNames = ref('1')



const form = reactive({

&nbsp; name: 'Jeffrey Zeldman',

&nbsp; title: 'Web Standards Evangelist',

&nbsp; school: ''

})



const style = reactive({

&nbsp; lineHeight: 1.6,

&nbsp; spacing: 20

})



const toggleSidebar = () => isCollapsed.value = !isCollapsed.value

</script>

```



---



\## 4. 样式实现 (SCSS)



\### 4.1 核心布局与动画



```scss

/\* 布局容器 \*/

.app-container {

&nbsp; display: flex;

&nbsp; height: 100vh;

&nbsp; width: 100vw;

}



/\* === 侧边栏容器 (Transition Magic) === \*/

.sidebar {

&nbsp; width: var(--sidebar-width-expanded);

&nbsp; background: var(--sidebar-bg);

&nbsp; border-right: 1px solid var(--border-color);

&nbsp; display: flex;

&nbsp; flex-direction: column;

&nbsp; position: relative;

&nbsp; transition: width 0.35s cubic-bezier(0.25, 0.8, 0.25, 1); /\* 丝滑缓动 \*/

&nbsp; z-index: 10;



&nbsp; /\* 收起状态 \*/

&nbsp; \&.is-collapsed {

&nbsp;   width: var(--sidebar-width-collapsed);



&nbsp;   /\* 收起时的特殊处理 \*/

&nbsp;   .tab-nav { flex-direction: column; gap: 16px; padding: 20px 0; }

&nbsp;   .tab-item { border-bottom: none; border-left: 3px solid transparent; padding: 10px 0; justify-content: center; }

&nbsp;   .tab-item.active { border-left-color: var(--primary-color); }

&nbsp;   .tab-text { display: none; }

&nbsp;   

&nbsp;   .sidebar-footer { flex-direction: column; gap: 16px; padding: 20px 0; }

&nbsp;   .secondary-actions { flex-direction: column; }

&nbsp;   

&nbsp;   .primary-btn { width: 40px; height: 40px; padding: 0; border-radius: 50%; }

&nbsp;   .btn-text { display: none; }

&nbsp; }

}



/\* 把手 (Toggle Handle) \*/

.sidebar-toggle {

&nbsp; position: absolute;

&nbsp; top: 50%;

&nbsp; right: -12px;

&nbsp; width: 24px; height: 24px;

&nbsp; background: white;

&nbsp; border: 1px solid var(--border-color);

&nbsp; border-radius: 50%;

&nbsp; display: flex; align-items: center; justify-content: center;

&nbsp; cursor: pointer;

&nbsp; z-index: 20;

&nbsp; box-shadow: 0 2px 6px rgba(0,0,0,0.05);

&nbsp; transition: transform 0.2s;

&nbsp; color: var(--text-secondary);



&nbsp; \&:hover {

&nbsp;   transform: scale(1.1);

&nbsp;   color: var(--primary-color);

&nbsp;   border-color: var(--primary-color);

&nbsp; }

}

```



\### 4.2 内部模块样式



```scss

/\* 1. 顶栏 Header \*/

.sidebar-header {

&nbsp; height: 60px;

&nbsp; display: flex; align-items: center; justify-content: space-between;

&nbsp; padding: 0 24px;

&nbsp; border-bottom: 1px solid rgba(0,0,0,0.04);

&nbsp; 

&nbsp; .brand-text {

&nbsp;   font-family: var(--font-serif);

&nbsp;   font-weight: 700;

&nbsp;   color: var(--primary-color);

&nbsp;   font-size: 18px;

&nbsp;   white-space: nowrap;

&nbsp; }

&nbsp; .brand-icon {

&nbsp;   font-family: var(--font-serif);

&nbsp;   font-weight: 700;

&nbsp;   color: var(--primary-color);

&nbsp;   font-size: 24px;

&nbsp;   width: 100%; text-align: center;

&nbsp; }

}



/\* 语言切换 \*/

.lang-switch {

&nbsp; background: #EAEAEA;

&nbsp; border-radius: 12px;

&nbsp; padding: 2px;

&nbsp; display: flex;

&nbsp; 

&nbsp; .lang-opt {

&nbsp;   font-size: 10px; padding: 2px 6px; cursor: pointer; border-radius: 10px; color: #666;

&nbsp;   \&.active { background: white; color: black; font-weight: 600; box-shadow: 0 1px 2px rgba(0,0,0,0.1); }

&nbsp; }

}



/\* 2. 导航 Tabs \*/

.tab-nav {

&nbsp; display: flex;

&nbsp; padding: 0 24px;

&nbsp; border-bottom: 1px solid rgba(0,0,0,0.04);

&nbsp; transition: all 0.3s;

}



.tab-item {

&nbsp; flex: 1;

&nbsp; display: flex; align-items: center; justify-content: center; gap: 6px;

&nbsp; padding: 14px 0;

&nbsp; cursor: pointer;

&nbsp; color: var(--text-secondary);

&nbsp; border-bottom: 2px solid transparent;

&nbsp; transition: all 0.2s;

&nbsp; 

&nbsp; \&:hover { color: var(--primary-color); }

&nbsp; \&.active { color: var(--primary-color); border-bottom-color: var(--primary-color); }

&nbsp; 

&nbsp; .tab-text { font-size: 13px; font-weight: 600; white-space: nowrap; }

}



/\* 3. 滚动内容区 \*/

.scroll-content {

&nbsp; flex: 1;

&nbsp; overflow-y: auto;

&nbsp; overflow-x: hidden;

&nbsp; padding: 24px;

&nbsp; 

&nbsp; /\* 隐藏滚动条但保持功能 \*/

&nbsp; \&::-webkit-scrollbar { width: 4px; }

&nbsp; \&::-webkit-scrollbar-thumb { background: #ddd; border-radius: 2px; }

}



/\* Panel 动画 \*/

.panel-fade {

&nbsp; animation: fadeIn 0.3s ease-out;

}

@keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }



/\* 4. 底部 Dock (关键) \*/

.sidebar-footer {

&nbsp; padding: 16px 24px;

&nbsp; background: var(--sidebar-bg);

&nbsp; border-top: 1px solid rgba(0,0,0,0.06);

&nbsp; display: flex; justify-content: space-between; align-items: center; gap: 12px;

&nbsp; box-shadow: 0 -4px 12px rgba(0,0,0,0.02);

&nbsp; z-index: 5;

}



/\* 次要操作 \*/

.secondary-actions {

&nbsp; display: flex; gap: 8px;

}

.icon-btn {

&nbsp; width: 36px; height: 36px;

&nbsp; border: none; background: transparent; border-radius: 6px;

&nbsp; color: var(--text-secondary); cursor: pointer;

&nbsp; display: flex; align-items: center; justify-content: center;

&nbsp; transition: 0.2s;

&nbsp; 

&nbsp; \&:hover { background: rgba(0,0,0,0.05); color: var(--primary-color); }

}



/\* 主要按钮 \*/

.primary-btn {

&nbsp; flex: 1;

&nbsp; height: 40px;

&nbsp; background: var(--primary-color);

&nbsp; color: white;

&nbsp; border: none; border-radius: 6px;

&nbsp; font-family: var(--font-serif); font-weight: 600;

&nbsp; display: flex; align-items: center; justify-content: center; gap: 8px;

&nbsp; cursor: pointer;

&nbsp; box-shadow: 0 2px 8px rgba(70, 94, 105, 0.2);

&nbsp; transition: 0.2s;

&nbsp; 

&nbsp; \&:hover { background: #384c55; }

}



/\* 右侧预览区 \*/

.preview-area {

&nbsp; flex: 1;

&nbsp; padding: 60px;

&nbsp; overflow-y: auto;

&nbsp; display: flex; justify-content: center;

}

.a4-paper {

&nbsp; width: 210mm; min-height: 297mm;

&nbsp; background: white;

&nbsp; box-shadow: 0 10px 30px rgba(0,0,0,0.08);

&nbsp; padding: 50px;

&nbsp; transition: all 0.3s;

}

```



\### 4.3 Element Plus 样式覆盖 (Overrides)



```scss

/\* 幽灵表单：去除边框，只留底线 \*/

.ghost-form .el-input\_\_wrapper {

&nbsp; box-shadow: none !important;

&nbsp; background: transparent !important;

&nbsp; border-bottom: 1px solid #dcdfe6;

&nbsp; border-radius: 0;

&nbsp; padding-left: 0;

&nbsp; 

&nbsp; \&.is-focus { border-bottom-color: var(--primary-color); }

}



/\* 手风琴标题 \*/

.claude-accordion {

&nbsp; border: none;

&nbsp; --el-collapse-header-bg-color: transparent;

&nbsp; --el-collapse-content-bg-color: transparent;

&nbsp; 

&nbsp; .el-collapse-item\_\_header {

&nbsp;   font-family: var(--font-serif);

&nbsp;   font-size: 15px;

&nbsp;   font-weight: 600;

&nbsp;   color: var(--primary-color);

&nbsp;   border-bottom: 1px solid #eee;

&nbsp; }

&nbsp; 

&nbsp; .el-collapse-item\_\_wrap { border: none; }

&nbsp; .el-collapse-item\_\_content { padding-bottom: 30px; }

}



/\* 标签样式 \*/

.el-form-item\_\_label {

&nbsp; font-size: 11px !important;

&nbsp; color: var(--text-secondary) !important;

&nbsp; text-transform: uppercase;

&nbsp; font-weight: 700 !important;

&nbsp; letter-spacing: 0.5px;

}

```



\## 5. 实现清单 (Checklist for Developers)



1\.  \*\*Icon 引入：\*\* 确保安装了 `@element-plus/icons-vue` 并在组件中引入。

2\.  \*\*状态管理：\*\* 使用 `isCollapsed` 控制侧边栏宽度和内部元素的显隐。

3\.  \*\*过渡动画：\*\* CSS 的 `transition: width` 是关键，配合 `white-space: nowrap` 防止文字在收起过程中换行闪烁。

4\.  \*\*字体加载：\*\* 不需要 `<link>` 标签，直接依靠 CSS 中的 `font-family` 调用系统本地字体。

