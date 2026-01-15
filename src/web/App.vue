<template>
  <!-- 路由出口：所有路由页面都会渲染到这里 -->
  <router-view></router-view>
</template>

<script setup lang="ts">
// 根组件无需额外逻辑，仅作为路由容器
</script>

<style scoped>
/* 全局基础样式（可根据需求扩展） */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
</style>