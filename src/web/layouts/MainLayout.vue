<template>
  <div class="main-layout">
    <!-- 侧边栏（修复菜单index为路由path） -->
    <div class="sidebar">
      <!-- 1. default-active：默认选中首页路由path -->
      <el-menu
        default-active="/dashboard"
        router
        background-color="#2e3b4e"
        text-color="#fff"
        active-text-color="#409eff"
      >
        <!-- 首页：对应路由path="/dashboard" -->
        <el-menu-item index="/dashboard">
          <template #title>首页</template>
          <el-icon><House /></el-icon>
        </el-menu-item>
        <!-- 设备管理：对应路由path="/dashboard/device/list" -->
        <el-menu-item index="/dashboard/device/list">
          <template #title>设备管理</template>
          <el-icon><Monitor /></el-icon>
        </el-menu-item>
        <!-- 报警管理：对应路由path="/dashboard/alarm/list" -->
        <el-menu-item index="/dashboard/alarm/list">
          <template #title>报警管理</template>
          <el-icon><Warning /></el-icon>
        </el-menu-item>
      </el-menu>
    </div>
    <!-- 主内容区（路由出口，保留） -->
    <div class="main-content">
      <router-view></router-view>
    </div>
  </div>
</template>

<script setup lang="ts">
// 导入Element Plus图标（保留）
import { House, Monitor, Warning } from '@element-plus/icons-vue';
</script>

<style scoped>
.main-layout {
  display: flex;
  height: 100vh;
  /* 防止布局溢出 */
  overflow: hidden;
}
.sidebar {
  width: 200px;
  background: #2e3b4e;
  color: #fff;
  /* 修复菜单高度占满侧边栏 */
  height: 100%;
}
.main-content {
  flex: 1;
  padding: 20px;
  background: #f9f9f9;
  /* 内容区超出滚动 */
  overflow-y: auto;
}

/* 优化菜单样式（替代原有的强制覆盖） */
:deep(.el-menu) {
  height: 100%;
  border-right: none; /* 去掉默认右边框 */
}
/* 菜单hover/选中样式优化 */
:deep(.el-menu-item:hover) {
  background-color: #1f2d3d !important;
}
:deep(.el-menu-item.is-active) {
  background-color: #1f2d3d !important;
  color: #409eff !important;
}
</style>