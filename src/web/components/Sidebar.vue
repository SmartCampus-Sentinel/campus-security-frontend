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
        background-color="transparent"
        text-color="#a0aebf"
        active-text-color="#409eff"
        class="sidebar-menu"
        :unique-opened="true"
        @select="handleMenuSelect"
      >
        <el-menu-item
          v-for="item in filteredMenuItems"
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

    <!-- 侧边栏底部操作栏 -->
    <div class="sidebar-footer">
      <!-- 登出按钮 -->
      <el-button
        type="danger"
        :icon="SwitchButton"
        size="small"
        circle
        class="logout-btn"
        @click="handleLogout"
        :title="isCollapsed ? '登出' : ''"
      >
        <span v-if="!isCollapsed" class="logout-text">登出</span>
      </el-button>
      
      <!-- 折叠/展开按钮 -->
      <el-button
        type="primary"
        :icon="isCollapsed ? ArrowRight : ArrowLeft"
        size="small"
        circle
        class="collapse-btn"
        @click="toggleCollapse"
        :title="isCollapsed ? '展开侧边栏' : '收起侧边栏'"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { House, Monitor, Warning, User, ArrowLeft, ArrowRight, SwitchButton } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { stopAutoLogout } from '@/utils/autoLogout';

// 定义菜单项类型
interface MenuItem {
  index: string;
  title: string;
  icon: any;
  iconColor?: string;
  permission?: string; // 权限标识
  path?: string; // 路由路径
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
const router = useRouter();

// 计算当前激活的菜单项（根据路由名称）
const defaultActive = computed(() => {
  // 首先尝试使用路由名称
  const routeName = route.name as string;
  if (routeName) {
    // 检查菜单中是否有对应的索引
    const menuItem = props.menuItems.find(item => item.index === routeName);
    if (menuItem) {
      return routeName;
    }
  }
  
  // 如果路由名称不匹配，尝试使用路径
  const routePath = route.path;
  const menuItem = props.menuItems.find(item => item.path === routePath);
  if (menuItem) {
    return menuItem.index;
  }
  
  return routeName || '';
});

// 过滤有权限的菜单项
const filteredMenuItems = computed(() => {
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

// 处理菜单选择
const handleMenuSelect = (index: string) => {
  // 详细的调试日志（仅开发环境）
  if (import.meta.env.DEV) {
    console.group('🔍 菜单选择事件');
    console.log('点击菜单项索引:', index);
    console.log('当前路由状态 - name:', route.name, 'path:', route.path);
    console.log('菜单项总数:', props.menuItems.length);
    console.log('已过滤菜单项:', filteredMenuItems.value.map(item => ({ index: item.index, path: item.path })));
    console.groupEnd();
  }

  const selectedItem = filteredMenuItems.value.find(item => item.index === index);
  
  if (!selectedItem) {
    console.error('❌ 菜单项未找到 - index:', index);
    return;
  }

  if (!selectedItem.path) {
    console.error('❌ 菜单项路径未定义 - index:', index, 'item:', selectedItem);
    return;
  }

  // 检查是否已经在该路由上
  if (route.path === selectedItem.path) {
    if (import.meta.env.DEV) {
      console.log('ℹ️ 已在该路由上，无需跳转:', selectedItem.path);
    }
    return;
  }

  // 执行路由导航
  if (import.meta.env.DEV) {
    console.log('🚀 导航到路径:', selectedItem.path);
  }

  router.push(selectedItem.path).then(() => {
    if (import.meta.env.DEV) {
      console.log('✅ 导航成功 - 当前路由:', route.name, route.path);
    }
  }).catch(err => {
    console.error('❌ 路由导航失败 - 路径:', selectedItem.path, '错误:', err);
    ElMessage.error(`导航失败: ${err.message || '未知错误'}`);
  });
};

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
  --sidebar-bg: linear-gradient(180deg, #2e3b4e 0%, #1a232e 100%);
  --sidebar-header-bg: #263240;
  --sidebar-text-color: #a0aebf;
  --sidebar-active-color: #409eff;
  --sidebar-hover-bg: rgba(64, 158, 255, 0.1);
  --transition-duration: 0.3s;
  --border-radius: 8px;
}

/* 基础样式 */
.sidebar {
  width: var(--sidebar-width);
  background: var(--sidebar-bg);
  color: var(--sidebar-text-color);
  height: 100vh;
  position: relative;
  overflow: hidden;
  transition: all var(--transition-duration) cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  box-shadow: 4px 0 12px rgba(0, 0, 0, 0.25);
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
  margin: 6px 10px;
  border-radius: var(--border-radius);
  transition: all 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  position: relative;
  overflow: hidden;
}

:deep(.el-menu-item) {
  height: 44px;
  line-height: 44px;
  background-color: transparent !important;
  transition: all 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  padding: 0 16px !important;
}

:deep(.el-menu-item:hover) {
  background-color: var(--sidebar-hover-bg) !important;
  color: var(--sidebar-active-color) !important;
  padding-left: 20px !important;
}

:deep(.el-menu-item.is-active) {
  background-color: rgba(64, 158, 255, 0.2) !important;
  color: var(--sidebar-active-color) !important;
  padding-left: 20px !important;
  border-left: 3px solid var(--sidebar-active-color);
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
  box-shadow: 0 0 10px rgba(64, 158, 255, 0.5);
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
  padding: 16px 12px;
  display: flex;
  gap: 10px;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  transition: all var(--transition-duration) ease;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0.1) 100%);
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(8px);
}

/* 登出按钮 */
.logout-btn {
  flex: 1;
  min-width: 36px;
  height: 40px;
  padding: 0 12px !important;
  background: linear-gradient(135deg, #f56c6c 0%, #f78989 100%) !important;
  border: none !important;
  border-radius: 8px !important;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  box-shadow: 0 4px 12px rgba(245, 108, 108, 0.25);
  position: relative;
  overflow: hidden;
  font-weight: 600;
  color: white !important;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.logout-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.2);
  transition: left 0.4s ease;
  z-index: 0;
}

.logout-btn:hover::before {
  left: 100%;
}

.logout-btn > * {
  position: relative;
  z-index: 1;
}

.logout-btn:hover {
  transform: translateY(-4px) scale(1.08);
  box-shadow: 0 8px 20px rgba(245, 108, 108, 0.4);
  background: linear-gradient(135deg, #fa7b7b 0%, #fc9191 100%) !important;
}

.logout-btn:active {
  transform: translateY(-1px) scale(1.04);
  box-shadow: 0 4px 12px rgba(245, 108, 108, 0.3);
}

.logout-text {
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.logout-btn :deep(.el-icon) {
  font-size: 16px;
  transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.logout-btn:hover :deep(.el-icon) {
  transform: scale(1.15) rotate(-10deg);
}

/* 折叠/展开按钮 */
.collapse-btn {
  width: 40px;
  height: 40px;
  padding: 0 !important;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #409eff 0%, #66b1ff 100%) !important;
  border: none !important;
  border-radius: 8px !important;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.25);
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  position: relative;
  overflow: hidden;
  flex-shrink: 0;
}

.collapse-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.25);
  transition: left 0.4s ease;
  z-index: 0;
}

.collapse-btn:hover::before {
  left: 100%;
}

.collapse-btn > * {
  position: relative;
  z-index: 1;
}

.collapse-btn:hover {
  transform: translateY(-4px) scale(1.12);
  box-shadow: 0 8px 20px rgba(64, 158, 255, 0.4);
  background: linear-gradient(135deg, #53a8ff 0%, #7abfff 100%) !important;
}

.collapse-btn:active {
  transform: translateY(-1px) scale(1.06);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
}

.collapse-btn :deep(.el-icon) {
  font-size: 18px;
  transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  color: white;
}

.collapse-btn:hover :deep(.el-icon) {
  transform: scale(1.2);
}

/* 侧边栏收起状态下的按钮优化 */
.sidebar.sidebar-collapsed .sidebar-footer {
  padding: 12px 8px;
}

.sidebar.sidebar-collapsed .logout-btn {
  min-width: 36px;
  padding: 0 !important;
}

.sidebar.sidebar-collapsed .logout-btn :deep(.el-icon) {
  font-size: 16px;
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

  .sidebar-footer {
    padding: 16px 12px;
    bottom: 16px;
    gap: 8px;
  }

  .logout-btn {
    height: 40px;
    font-size: 14px;
  }

  .collapse-btn {
    width: 40px;
    height: 40px;
  }
}

/* 触摸设备优化 */
@media (hover: none) and (pointer: coarse) {
  .logout-btn,
  .collapse-btn {
    transition: all 0.15s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  }

  .logout-btn:active {
    transform: translateY(-2px) scale(1.06);
  }

  .collapse-btn:active {
    transform: translateY(-2px) scale(1.08);
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

@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-3px);
  }
}

@keyframes pulse {
  0%, 100% {
    box-shadow: 0 4px 12px rgba(64, 158, 255, 0.25);
  }
  50% {
    box-shadow: 0 6px 16px rgba(64, 158, 255, 0.4);
  }
}

@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.sidebar-menu-item {
  animation: slideInLeft 0.4s ease forwards;
}

.sidebar-menu-item:nth-child(1) { animation-delay: 0.05s; }
.sidebar-menu-item:nth-child(2) { animation-delay: 0.1s; }
.sidebar-menu-item:nth-child(3) { animation-delay: 0.15s; }
.sidebar-menu-item:nth-child(4) { animation-delay: 0.2s; }
.sidebar-menu-item:nth-child(5) { animation-delay: 0.25s; }

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

:deep(.logout-btn .el-button__text) {
  display: flex;
  align-items: center;
  gap: 4px;
}

:deep(.logout-btn.is-circle) {
  border-radius: 8px !important;
}

:deep(.collapse-btn.is-circle) {
  border-radius: 8px !important;
}
</style>
