<template>
  <div class="sidebar-header">
    <!-- 品牌 -->
    <div class="brand">
      <img class="brand-logo" :src="logoUrl" alt="KnockKnock logo" />
      <span class="brand-text">KnockKnock</span>
    </div>

    <!-- 语言切换 -->
    <div class="lang-switch">
      <span class="lang-opt active">CN</span>
      <span class="lang-opt">EN</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import logoUrl from '@/assets/logo0220.png'
</script>
