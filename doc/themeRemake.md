这是 **Jeffrey Zeldman** 为你整理的最终实施文档。

这份文档将我们之前讨论的所有核心设计——**Slate 配色**、**原生字体栈**、**四段式侧边栏架构**、**双页签模式**、**Dock 底座** 以及 **Mini 收起模式**——完美整合到了 **Vue 3 + Element Plus** 的技术栈中。

请将这份文档直接发送给你的 AI 助手（Claude）或前端开发人员。

***

# Element Plus Implementation Guide: The "Claude-Style" Resume Builder

## 1. 设计概述 (Design Overview)

本项目旨在构建一个极简、高雅且功能强大的简历生成器。
**核心交互哲学：**
1.  **分离关注点：** 通过“双页签”分离 *内容编辑* 与 *外观样式*。
2.  **固定底座 (The Dock)：** 无论内容多长，核心操作（导出/保存）永远悬停在左侧底部。
3.  **专注模式 (Mini Sidebar)：** 侧边栏可收起为 70px 的图标栏，为 A4 预览腾出空间。
4.  **原生排版：** 不依赖 WebFont，使用系统衬线体营造“书卷气”。

---

## 2. 全局样式变量 (CSS Variables)

请在 `src/styles/variables.scss` 或 `App.vue` 的 `:root` 中定义。

```scss
:root {
  /* --- 1. 配色方案 (Slate Blue Theme) --- */
  --primary-color: #465E69;      /* 核心主色：石板蓝 */
  --app-bg: #F2F0EB;             /* APP背景：暖米色 */
  --sidebar-bg: #F9F8F6;         /* 侧边栏背景：极淡米白 */
  --border-color: #E6E4DD;       /* 柔和边框 */
  --text-main: #2D2D29;          /* 主要文字：暖炭黑 */
  --text-secondary: #666660;     /* 次要文字 */

  /* --- 2. 原生字体栈 (Native Typography) --- */
  /* UI 氛围字体：用于标题、按钮、Logo (宋体/Georgia) */
  --font-serif: "Georgia", "Times New Roman", "Songti SC", "SimSun", serif;
  /* 内容功能字体：用于输入框、正文 (系统黑体) */
  --font-sans: "Inter", -apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", sans-serif;

  /* --- 3. 尺寸定义 --- */
  --sidebar-width-expanded: 380px;
  --sidebar-width-collapsed: 72px;
}

/* 全局重置 */
body {
  margin: 0;
  background-color: var(--app-bg);
  color: var(--text-main);
  font-family: var(--font-sans);
  overflow: hidden; /* 防止双重滚动条 */
}
```

---

## 3. Vue 组件实现 (App.vue)

### 3.1 Template 结构

```html
<template>
  <div class="app-container">
    
    <!-- =======================
         LEFT: 智能侧边栏 
         ======================= -->
    <aside class="sidebar" :class="{ 'is-collapsed': isCollapsed }">
      
      <!-- 0. 切换把手 (Toggle Handle) -->
      <div class="sidebar-toggle" @click="toggleSidebar">
        <el-icon size="12">
          <ArrowRight v-if="isCollapsed" />
          <ArrowLeft v-else />
        </el-icon>
      </div>

      <!-- 1. 顶栏：全局设置 (Header) -->
      <div class="sidebar-header">
        <!-- 品牌：展开显示全名，收起显示首字母 -->
        <div class="brand">
          <span v-if="!isCollapsed" class="brand-text">Resume Craft</span>
          <span v-else class="brand-icon">R</span>
        </div>
        
        <!-- 语言切换：收起时隐藏 -->
        <div class="lang-switch" v-show="!isCollapsed">
          <span class="lang-opt active">CN</span>
          <span class="lang-opt">EN</span>
        </div>
      </div>

      <!-- 2. 导航栏：模式切换 (Tabs) -->
      <!-- 使用自定义 Div 模拟 Tab，比 Element Tabs 更容易做变形动画 -->
      <div class="tab-nav">
        <el-tooltip content="内容编辑" placement="right" :disabled="!isCollapsed">
          <div 
            class="tab-item" 
            :class="{ active: currentTab === 'content' }"
            @click="currentTab = 'content'"
          >
            <el-icon :size="18"><EditPen /></el-icon>
            <span class="tab-text">内容编辑</span>
          </div>
        </el-tooltip>

        <el-tooltip content="外观样式" placement="right" :disabled="!isCollapsed">
          <div 
            class="tab-item" 
            :class="{ active: currentTab === 'design' }"
            @click="currentTab = 'design'"
          >
            <el-icon :size="18"><Brush /></el-icon>
            <span class="tab-text">外观样式</span>
          </div>
        </el-tooltip>
      </div>

      <!-- 3. 滚动内容区 (Scroll Area) -->
      <div class="scroll-content" v-show="!isCollapsed">
        
        <!-- Panel A: 内容编辑器 (手风琴) -->
        <div v-show="currentTab === 'content'" class="panel-fade">
          <el-collapse v-model="activeNames" accordion class="claude-accordion">
            
            <el-collapse-item name="1">
              <template #title>
                <span class="accordion-title">基本信息</span>
              </template>
              <div class="form-body">
                <el-form label-position="top" class="ghost-form">
                  <el-form-item label="姓名 / Full Name">
                    <el-input v-model="form.name" />
                  </el-form-item>
                  <el-form-item label="职位 / Job Title">
                    <el-input v-model="form.title" />
                  </el-form-item>
                </el-form>
              </div>
            </el-collapse-item>

            <el-collapse-item name="2">
              <template #title>
                <span class="accordion-title">教育经历</span>
              </template>
              <div class="form-body">
                <!-- 更多表单项... -->
                <el-input v-model="form.school" placeholder="学校名称" class="ghost-input-standalone"/>
              </div>
            </el-collapse-item>

          </el-collapse>
        </div>

        <!-- Panel B: 外观设计器 (滑块 & 模板) -->
        <div v-show="currentTab === 'design'" class="panel-fade">
          
          <div class="control-group">
            <div class="control-label">排版控制</div>
            <div class="slider-item">
              <span>行高</span>
              <el-slider v-model="style.lineHeight" :min="1" :max="2" :step="0.1" size="small" />
            </div>
            <div class="slider-item">
              <span>间距</span>
              <el-slider v-model="style.spacing" :min="10" :max="40" size="small" />
            </div>
          </div>

          <div class="control-group">
            <div class="control-label">选择模板</div>
            <div class="template-grid">
               <!-- 模拟模板卡片 -->
               <div class="tpl-card active">经典</div>
               <div class="tpl-card">极简</div>
            </div>
          </div>

        </div>
      </div>

      <!-- 4. 底部底座 (The Dock) -->
      <div class="sidebar-footer">
        <!-- 左侧：次要操作 (收起时竖排) -->
        <div class="secondary-actions">
          <el-tooltip content="保存草稿" placement="right">
            <button class="icon-btn"><el-icon><collection-tag /></el-icon></button>
          </el-tooltip>
          
          <el-dropdown trigger="click" placement="top-start">
            <button class="icon-btn"><el-icon><MoreFilled /></el-icon></button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item>导出 JSON</el-dropdown-item>
                <el-dropdown-item>导入配置</el-dropdown-item>
                <el-dropdown-item divided style="color:#f56c6c">重置</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>

        <!-- 右侧：主要操作 (收起时变成圆钮) -->
        <el-tooltip content="导出 PDF" placement="right" :disabled="!isCollapsed">
          <button class="primary-btn">
            <el-icon><Download /></el-icon>
            <span class="btn-text">导出 PDF</span>
          </button>
        </el-tooltip>
      </div>

    </aside>

    <!-- =======================
         RIGHT: 预览区 
         ======================= -->
    <main class="preview-area">
      <div class="a4-paper" :style="{ lineHeight: style.lineHeight }">
        <h1 class="resume-name">{{ form.name }}</h1>
        <p>{{ form.title }}</p>
        <p class="resume-content">这里是简历预览区域...</p>
      </div>
    </main>

  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { 
  ArrowLeft, ArrowRight, EditPen, Brush, 
  CollectionTag, MoreFilled, Download 
} from '@element-plus/icons-vue'

const isCollapsed = ref(false)
const currentTab = ref('content') // 'content' | 'design'
const activeNames = ref('1')

const form = reactive({
  name: 'Jeffrey Zeldman',
  title: 'Web Standards Evangelist',
  school: ''
})

const style = reactive({
  lineHeight: 1.6,
  spacing: 20
})

const toggleSidebar = () => isCollapsed.value = !isCollapsed.value
</script>
```

---

## 4. 样式实现 (SCSS)

### 4.1 核心布局与动画

```scss
/* 布局容器 */
.app-container {
  display: flex;
  height: 100vh;
  width: 100vw;
}

/* === 侧边栏容器 (Transition Magic) === */
.sidebar {
  width: var(--sidebar-width-expanded);
  background: var(--sidebar-bg);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  position: relative;
  transition: width 0.35s cubic-bezier(0.25, 0.8, 0.25, 1); /* 丝滑缓动 */
  z-index: 10;

  /* 收起状态 */
  &.is-collapsed {
    width: var(--sidebar-width-collapsed);

    /* 收起时的特殊处理 */
    .tab-nav { flex-direction: column; gap: 16px; padding: 20px 0; }
    .tab-item { border-bottom: none; border-left: 3px solid transparent; padding: 10px 0; justify-content: center; }
    .tab-item.active { border-left-color: var(--primary-color); }
    .tab-text { display: none; }
    
    .sidebar-footer { flex-direction: column; gap: 16px; padding: 20px 0; }
    .secondary-actions { flex-direction: column; }
    
    .primary-btn { width: 40px; height: 40px; padding: 0; border-radius: 50%; }
    .btn-text { display: none; }
  }
}

/* 把手 (Toggle Handle) */
.sidebar-toggle {
  position: absolute;
  top: 50%;
  right: -12px;
  width: 24px; height: 24px;
  background: white;
  border: 1px solid var(--border-color);
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  z-index: 20;
  box-shadow: 0 2px 6px rgba(0,0,0,0.05);
  transition: transform 0.2s;
  color: var(--text-secondary);

  &:hover {
    transform: scale(1.1);
    color: var(--primary-color);
    border-color: var(--primary-color);
  }
}
```

### 4.2 内部模块样式

```scss
/* 1. 顶栏 Header */
.sidebar-header {
  height: 60px;
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 24px;
  border-bottom: 1px solid rgba(0,0,0,0.04);
  
  .brand-text {
    font-family: var(--font-serif);
    font-weight: 700;
    color: var(--primary-color);
    font-size: 18px;
    white-space: nowrap;
  }
  .brand-icon {
    font-family: var(--font-serif);
    font-weight: 700;
    color: var(--primary-color);
    font-size: 24px;
    width: 100%; text-align: center;
  }
}

/* 语言切换 */
.lang-switch {
  background: #EAEAEA;
  border-radius: 12px;
  padding: 2px;
  display: flex;
  
  .lang-opt {
    font-size: 10px; padding: 2px 6px; cursor: pointer; border-radius: 10px; color: #666;
    &.active { background: white; color: black; font-weight: 600; box-shadow: 0 1px 2px rgba(0,0,0,0.1); }
  }
}

/* 2. 导航 Tabs */
.tab-nav {
  display: flex;
  padding: 0 24px;
  border-bottom: 1px solid rgba(0,0,0,0.04);
  transition: all 0.3s;
}

.tab-item {
  flex: 1;
  display: flex; align-items: center; justify-content: center; gap: 6px;
  padding: 14px 0;
  cursor: pointer;
  color: var(--text-secondary);
  border-bottom: 2px solid transparent;
  transition: all 0.2s;
  
  &:hover { color: var(--primary-color); }
  &.active { color: var(--primary-color); border-bottom-color: var(--primary-color); }
  
  .tab-text { font-size: 13px; font-weight: 600; white-space: nowrap; }
}

/* 3. 滚动内容区 */
.scroll-content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 24px;
  
  /* 隐藏滚动条但保持功能 */
  &::-webkit-scrollbar { width: 4px; }
  &::-webkit-scrollbar-thumb { background: #ddd; border-radius: 2px; }
}

/* Panel 动画 */
.panel-fade {
  animation: fadeIn 0.3s ease-out;
}
@keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }

/* 4. 底部 Dock (关键) */
.sidebar-footer {
  padding: 16px 24px;
  background: var(--sidebar-bg);
  border-top: 1px solid rgba(0,0,0,0.06);
  display: flex; justify-content: space-between; align-items: center; gap: 12px;
  box-shadow: 0 -4px 12px rgba(0,0,0,0.02);
  z-index: 5;
}

/* 次要操作 */
.secondary-actions {
  display: flex; gap: 8px;
}
.icon-btn {
  width: 36px; height: 36px;
  border: none; background: transparent; border-radius: 6px;
  color: var(--text-secondary); cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: 0.2s;
  
  &:hover { background: rgba(0,0,0,0.05); color: var(--primary-color); }
}

/* 主要按钮 */
.primary-btn {
  flex: 1;
  height: 40px;
  background: var(--primary-color);
  color: white;
  border: none; border-radius: 6px;
  font-family: var(--font-serif); font-weight: 600;
  display: flex; align-items: center; justify-content: center; gap: 8px;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(70, 94, 105, 0.2);
  transition: 0.2s;
  
  &:hover { background: #384c55; }
}

/* 右侧预览区 */
.preview-area {
  flex: 1;
  padding: 60px;
  overflow-y: auto;
  display: flex; justify-content: center;
}
.a4-paper {
  width: 210mm; min-height: 297mm;
  background: white;
  box-shadow: 0 10px 30px rgba(0,0,0,0.08);
  padding: 50px;
  transition: all 0.3s;
}
```

### 4.3 Element Plus 样式覆盖 (Overrides)

```scss
/* 幽灵表单：去除边框，只留底线 */
.ghost-form .el-input__wrapper {
  box-shadow: none !important;
  background: transparent !important;
  border-bottom: 1px solid #dcdfe6;
  border-radius: 0;
  padding-left: 0;
  
  &.is-focus { border-bottom-color: var(--primary-color); }
}

/* 手风琴标题 */
.claude-accordion {
  border: none;
  --el-collapse-header-bg-color: transparent;
  --el-collapse-content-bg-color: transparent;
  
  .el-collapse-item__header {
    font-family: var(--font-serif);
    font-size: 15px;
    font-weight: 600;
    color: var(--primary-color);
    border-bottom: 1px solid #eee;
  }
  
  .el-collapse-item__wrap { border: none; }
  .el-collapse-item__content { padding-bottom: 30px; }
}

/* 标签样式 */
.el-form-item__label {
  font-size: 11px !important;
  color: var(--text-secondary) !important;
  text-transform: uppercase;
  font-weight: 700 !important;
  letter-spacing: 0.5px;
}
```

## 5. 实现清单 (Checklist for Developers)

1.  **Icon 引入：** 确保安装了 `@element-plus/icons-vue` 并在组件中引入。
2.  **状态管理：** 使用 `isCollapsed` 控制侧边栏宽度和内部元素的显隐。
3.  **过渡动画：** CSS 的 `transition: width` 是关键，配合 `white-space: nowrap` 防止文字在收起过程中换行闪烁。
4.  **字体加载：** 不需要 `<link>` 标签，直接依靠 CSS 中的 `font-family` 调用系统本地字体。