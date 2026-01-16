<template>
  <div class="main-layout">
    <!-- 侧边栏（保持路由path和样式不变） -->
    <div class="sidebar">
      <el-menu
        default-active="/dashboard"
        router
        background-color="#2e3b4e"
        text-color="#fff"
        active-text-color="#409eff"
      >
        <!-- 首页：直接使用全局注册的House图标 -->
        <el-menu-item index="/dashboard">
          <template #title>首页</template>
          <el-icon><House /></el-icon>
        </el-menu-item>
        <!-- 设备管理：直接使用全局注册的Monitor图标 -->
        <el-menu-item index="/dashboard/device/list">
          <template #title>设备管理</template>
          <el-icon><Monitor /></el-icon>
        </el-menu-item>
        <!-- 报警管理：直接使用全局注册的Warning图标 -->
        <el-menu-item index="/dashboard/alarm/list">
          <template #title>报警管理</template>
          <el-icon color="red"><Warning /></el-icon>
        </el-menu-item>
      </el-menu>
    </div>
    <!-- 主内容区（路由出口不变） -->
    <div class="main-content">
      <router-view></router-view>
    </div>
  </div>
</template>

<script setup lang="ts">

</script>

<style scoped>
.main-layout {
  display: flex;
  height: 100vh;
  overflow: hidden;
}
.sidebar {
  width: 200px;
  background: #2e3b4e;
  color: #fff;
  height: 100%;
}
.main-content {
  flex: 1;
  padding: 20px;
  background: #f9f9f9;
  overflow-y: auto;
}

/* 菜单样式优化（保持不变） */
:deep(.el-menu) {
  height: 100%;
  border-right: none;
}
:deep(.el-menu-item:hover) {
  background-color: #1f2d3d !important;
}
:deep(.el-menu-item.is-active) {
  background-color: #1f2d3d !important;
  color: #409eff !important;
}
</style>