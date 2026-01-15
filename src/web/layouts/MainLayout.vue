<template>
  <div class="main-layout">
    <!-- 侧边栏（占位） -->
    <div class="sidebar">
      <el-menu default-active="1" router>
        <el-menu-item index="1">
          <template #title>首页</template>
          <el-icon><House /></el-icon>
        </el-menu-item>
        <el-menu-item index="2">
          <template #title>设备管理</template>
          <el-icon><Monitor /></el-icon>
        </el-menu-item>
        <el-menu-item index="3">
          <template #title>报警管理</template>
          <el-icon><Warning /></el-icon>
        </el-menu-item>
      </el-menu>
    </div>
    <!-- 主内容区（路由出口） -->
    <div class="main-content">
      <router-view></router-view>
    </div>
  </div>
</template>

<script setup lang="ts">
import { House, Monitor, Warning } from '@element-plus/icons-vue';
</script>

<style scoped>
.main-layout {
  display: flex;
  height: 100vh;
}
.sidebar {
  width: 200px;
  background: #2e3b4e;
  color: #fff;
}
.main-content {
  flex: 1;
  padding: 20px;
  background: #f9f9f9;
}
.el-menu {
  height: 100%;
  background-color: #2e3b4e !important;
  color: #fff !important;
}
</style>