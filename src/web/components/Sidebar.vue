<!-- src/components/Sidebar.vue -->
<template>
  <div class="sidebar" :class="{ 'sidebar-collapsed': isCollapsed }">
    <!-- 侧边栏头部 -->
    <div class="sidebar-header">
      <div class="sidebar-logo" v-if="!isCollapsed">
        <el-icon class="logo-icon"><Monitor /></el-icon>
        <span class="logo-text">校园安防</span>
      </div>
      <el-button
        v-else
        class="logo-icon-btn"
        circle
        :icon="Monitor"
        type="primary"
      />
    </div>

    <!-- 菜单区域 -->
    <div class="menu-container">
      <el-menu
        :default-active="defaultActive"
        :collapse="isCollapsed"
        :collapse-transition="false"
        router
        background-color="transparent"
        text-color="#a0aebf"
        active-text-color="#409eff"
        class="sidebar-menu"
        :unique-opened="true"
      >
        <el-menu-item
          v-for="item in menuItems"
          :key="item.index"
          :index="item.index"
          class="sidebar-menu-item"
        >
          <template #title>
            <span class="menu-title">{{ item.title }}</span>
          </template>
          <el-icon class="menu-icon" :color="item.iconColor || '#a0aebf'">
            <component :is="item.icon" />
          </el-icon>
          <template #suffix>
            <el-tooltip
              v-if="isCollapsed"
              :content="item.title"
              placement="right"
              effect="dark"
            >
              <div class="tooltip-trigger"></div>
            </el-tooltip>
          </template>
        </el-menu-item>
      </el-menu>
    </div>

    <!-- 收起/展开按钮 -->
    <div class="sidebar-footer">
      <el-button
        type="danger"
        :icon="LogOut"
        size="small"
        circle
        class="logout-btn"
        @click="handleLogout"
        :title="isCollapsed ? '登出' : ''"
      >
        <span v-if="!isCollapsed">登出</span>
      </el-button>
      <el-button
        type="primary"
        :icon="isCollapsed ? ArrowRight : ArrowLeft"
        size="small"
        circle
        class="collapse-btn"
        @click="toggleCollapse"
        :tooltip="isCollapsed ? '展开侧边栏' : '收起侧边栏'"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { House, Monitor, Warning, User, ArrowLeft, ArrowRight, LogOut } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { stopAutoLogout } from '@/utils/autoLogout';

// 定义菜单项类型
interface MenuItem {
  index: string;
  title: string;
  icon: any;
  iconColor?: string;
  permission?: string; // 权限标识
}

// 定义组件属性
interface Props {
  isCollapsed: boolean;
  menuItems: MenuItem[];
  permissions?: string[]; // 用户权限
}

// 定义事件类型
interface Emits {
  (e: 'update:isCollapsed', value: boolean): void;
}

// 接收父组件传入的属性
const props = withDefaults(defineProps<Props>(), {
  permissions: () => []
});

// 定义组件触发的事件
const emit = defineEmits<Emits>();

// 获取当前路由
const route = useRoute();

// 计算当前激活的菜单项
const defaultActive = computed(() => route.path);

// 过滤有权限的菜单项
const menuItems = computed(() => {
  if (!props.permissions.length) return props.menuItems;

  return props.menuItems.filter(item => {
    if (!item.permission) return true;
    return props.permissions.includes(item.permission);
  });
});

// 切换收起/展开状态
const toggleCollapse = () => {
  emit('update:isCollapsed', !props.isCollapsed);
};

// 获取router
const router = useRouter();

// 处理登出
const handleLogout = async () => {
  try {
    // 显示确认对话框
    await ElMessageBox.confirm(
      '确定要退出登录吗？',
      '确认退出',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    );

    // 停止自动登出监听
    stopAutoLogout();

    // 清除本地存储的登录信息
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    localStorage.removeItem('userInfo');
    localStorage.removeItem('currentUserId');
    localStorage.removeItem('sidebarCollapse');

    ElMessage.success('登出成功');

    // 跳转到登录页面
    setTimeout(() => {
      router.push('/login').catch(err => console.warn('路由跳转失败:', err));
    }, 500);
  } catch (err: any) {
    // 用户点击取消按钮
    if (err.message === 'cancel') {
      return;
    }
    console.error('登出失败:', err);
    ElMessage.error('登出失败，请稍后重试');
  }
};
</script>

<style scoped>
/* 变量定义 */
:root {
  --sidebar-width: 220px;
  --sidebar-collapsed-width: 64px;
  --sidebar-bg: #2e3b4e;
  --sidebar-header-bg: #263240;
  --sidebar-text-color: #a0aebf;
  --sidebar-active-color: #409eff;
  --sidebar-hover-bg: #1f2d3d;
  --transition-duration: 0.3s;
  --border-radius: 4px;
}

/* 基础样式 */
.sidebar {
  width: var(--sidebar-width);
  background-color: var(--sidebar-bg);
  color: var(--sidebar-text-color);
  height: 100vh;
  position: relative;
  overflow: hidden;
  transition: all var(--transition-duration) cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.15);
}

/* 折叠状态 */
.sidebar.sidebar-collapsed {
  width: var(--sidebar-collapsed-width);
}

/* 侧边栏头部 */
.sidebar-header {
  height: 60px;
  background-color: var(--sidebar-header-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  transition: all var(--transition-duration) ease;
}

.sidebar-logo {
  display: flex;
  align-items: center;
  gap: 10px;
}

.logo-icon {
  font-size: 24px;
  color: var(--sidebar-active-color);
}

.logo-text {
  font-size: 18px;
  font-weight: 600;
  color: #fff;
  white-space: nowrap;
}

.logo-icon-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

/* 菜单容器 */
.menu-container {
  flex: 1;
  overflow-y: auto;
  padding: 10px 0;
}

/* 自定义滚动条 */
.menu-container::-webkit-scrollbar {
  width: 4px;
}

.menu-container::-webkit-scrollbar-track {
  background: transparent;
}

.menu-container::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
}

.menu-container::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.2);
}

/* 菜单样式 */
.sidebar-menu {
  height: 100%;
  border-right: none;
  background-color: transparent;
}

:deep(.el-menu) {
  border-right: none;
  background-color: transparent;
}

/* 菜单项样式 */
.sidebar-menu-item {
  height: 44px;
  margin: 4px 8px;
  border-radius: var(--border-radius);
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
}

:deep(.el-menu-item) {
  height: 44px;
  line-height: 44px;
  background-color: transparent !important;
  transition: all 0.2s ease;
}

:deep(.el-menu-item:hover) {
  background-color: var(--sidebar-hover-bg) !important;
  color: var(--sidebar-active-color) !important;
}

:deep(.el-menu-item.is-active) {
  background-color: var(--sidebar-hover-bg) !important;
  color: var(--sidebar-active-color) !important;
}

:deep(.el-menu-item.is-active::before) {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 24px;
  background-color: var(--sidebar-active-color);
  border-radius: 0 3px 3px 0;
}

.menu-title {
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
}

:deep(.el-menu-item:hover .menu-title) {
  color: var(--sidebar-active-color);
}

:deep(.el-menu-item.is-active .menu-title) {
  color: var(--sidebar-active-color);
}

.menu-icon {
  font-size: 18px;
  transition: all 0.2s ease;
  margin-right: 12px;
}

:deep(.el-menu-item:hover .menu-icon) {
  color: var(--sidebar-active-color);
}

:deep(.el-menu-item.is-active .menu-icon) {
  color: var(--sidebar-active-color);
}

/* 侧边栏底部（登出和收起按钮） */
.sidebar-footer {
  position: absolute;
  bottom: 20px;
  left: 0;
  right: 0;
  padding: 0 12px;
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  transition: all var(--transition-duration) ease;
}

.logout-btn {
  flex: 1;
  min-width: 36px;
  height: 36px;
  padding: 0;
}

.logout-btn :deep(.el-icon) {
  font-size: 16px;
}

.collapse-btn {
  width: 36px;
  height: 36px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.15);
  transition: all 0.2s ease;
}

.collapse-btn:hover {
  transform: scale(1.05);
  box-shadow: 2px 0 12px rgba(64, 158, 255, 0.3);
}

/* 工具提示 */
.tooltip-trigger {
  width: 20px;
  height: 44px;
}

/* 收起状态下的样式调整 */
.sidebar.sidebar-collapsed .sidebar-header {
  padding: 0;
}

.sidebar.sidebar-collapsed .menu-container {
  padding: 5px 0;
}

.sidebar.sidebar-collapsed .sidebar-menu-item {
  margin: 2px 4px;
}

.sidebar.sidebar-collapsed :deep(.el-menu-item.is-active::before) {
  width: 2px;
  height: 16px;
}

/* 移动端适配 */
@media screen and (max-width: 768px) {
  .sidebar {
    position: fixed;
    left: 0;
    top: 0;
    z-index: 1000;
    transform: translateX(0);
    transition: transform var(--transition-duration) ease;
  }

  .sidebar.sidebar-collapsed {
    transform: translateX(-100%);
  }
}

/* 动画效果 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.sidebar-menu-item {
  animation: fadeIn 0.3s ease forwards;
}

.sidebar-menu-item:nth-child(1) { animation-delay: 0.05s; }
.sidebar-menu-item:nth-child(2) { animation-delay: 0.1s; }
.sidebar-menu-item:nth-child(3) { animation-delay: 0.15s; }
.sidebar-menu-item:nth-child(4) { animation-delay: 0.2s; }
.sidebar-menu-item:nth-child(5) { animation-delay: 0.25s; }
.sidebar-menu-item:nth-child(6) { animation-delay: 0.3s; }

/* 优化Element UI默认样式 */
:deep(.el-menu-item__content) {
  padding: 0 16px !important;
}

:deep(.el-menu--collapse .el-menu-item__content) {
  padding: 0 20px !important;
}

:deep(.el-menu--collapse .el-menu-item__icon) {
  margin-right: 0;
}
</style>
