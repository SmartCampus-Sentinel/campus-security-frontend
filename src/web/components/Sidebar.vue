<!-- src/components/Sidebar.vue -->
<template>
  <div class="sidebar" :class="{ 'sidebar-collapsed': isCollapsed }">
    <!-- 收起/展开按钮 -->
    <div class="collapse-toggle" @click="toggleCollapse">
      <el-button
        type="primary"
        :icon="isCollapsed ? ArrowRight : ArrowLeft"
        size="small"
        circle
        class="collapse-btn"
      />
    </div>

    <el-menu
      :default-active="defaultActive"
      :collapse="isCollapsed"
      router
      background-color="#2e3b4e"
      text-color="#fff"
      active-text-color="#409eff"
      class="sidebar-menu"
    >
      <el-menu-item
        v-for="item in menuItems"
        :key="item.index"
        :index="item.index"
      >
        <template #title>{{ item.title }}</template>
        <el-icon :color="item.iconColor">
          <component :is="item.icon" />
        </el-icon>
      </el-menu-item>
    </el-menu>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { House, Monitor, Warning, User, ArrowLeft, ArrowRight } from '@element-plus/icons-vue';

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
const defaultActive = computed(() => route.path || '/dashboard');

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
</script>

<style scoped>

/* 移动端适配 */
@media screen and (max-width: 768px) {
  .sidebar {
    position: fixed;
    left: 0;
    top: 0;
    height: 100vh;
    z-index: 1000;
    transform: translateX(0);
    transition: transform var(--transition-duration) ease;
  }

  .sidebar.sidebar-collapsed {
    transform: translateX(-100%);
  }

  .collapse-toggle {
    position: absolute;
    left: 100%;
    top: 50%;
    transform: translateY(-50%);
    z-index: 1001;
  }
}

/* 平板适配 */
@media screen and (min-width: 769px) and (max-width: 1024px) {
  .sidebar {
    width: 220px;
  }
}

/* 桌面端适配 */
@media screen and (min-width: 1025px) and (max-width: 1440px) {
  .sidebar {
    width: 180px;
  }
}


.sidebar {
  width: 20%;
  background: #2e3b4e;
  color: #fff;
  height: 100%;
  transition: all 0.3s ease;
  position: relative;
}

.sidebar-collapsed {
  width: 64px;
}

.collapse-toggle {
  position: absolute;
  right: -24px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 10;
  cursor: pointer;
}

.collapse-btn {
  width: 24px;
  height: 48px;
  border-radius: 0 4px 4px 0;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.sidebar-menu {
  height: 100%;
  border-right: none;
}

/* 菜单样式优化 */
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

/* 收起状态下图标的居中显示 */
:deep(.el-menu--collapse .el-sub-menu__title span),
:deep(.el-menu--collapse .el-menu-item span) {
  display: inline-block;
  width: 0;
  white-space: nowrap;
  overflow: hidden;
  opacity: 0;
}

:root {
  --mobile-breakpoint: 768px;
  --tablet-breakpoint: 1024px;
  --desktop-breakpoint: 1200px;
  --sidebar-width: 200px;
  --sidebar-collapsed-width: 64px;
  --transition-duration: 0.3s;
}

</style>
