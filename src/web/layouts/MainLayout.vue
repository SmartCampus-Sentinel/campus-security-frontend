<template>
  <div class="main-layout">
    <!-- 侧边栏 -->
    <Sidebar
      :is-collapsed="isCollapsed"
      :menu-items="menuItems"
      :permissions="userPermissions"
      @update:isCollapsed="handleCollapseChange"
    />

    <!-- 主内容区 -->
    <div class="main-content" :class="{ 'content-expanded': isCollapsed }">
      <router-view></router-view>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRoute } from 'vue-router';
import { House, Monitor, Warning, User } from '@element-plus/icons-vue';
import Sidebar from '@/components/Sidebar.vue'; // 引入侧边栏组件

// 定义菜单项类型
interface MenuItem {
  index: string;
  title: string;
  icon: any;
  iconColor?: string;
  permission?: string;
}

// 控制侧边栏收起状态
const isCollapsed = ref(false);

// 用户权限（示例）
const userPermissions = ref<string[]>(['admin', 'device_manager', 'alarm_manager', 'user_center_view'])


// 菜单项配置
const menuItems: MenuItem[] = [
  {
    index: '/dashboard',
    title: '首页',
    icon: House
  },
  {
    index: '/dashboard/device/list',
    title: '设备管理',
    icon: Monitor
  },
  {
    index: '/dashboard/alarm/list',
    title: '报警管理',
    icon: Warning,
    iconColor: 'red'
  },
  {
    index: '/dashboard/root/root',
    title: '用户中心',
    icon: User,
    iconColor: 'red',
    permission: 'user_center_view'
  }
];

// 处理侧边栏收起状态变化
const handleCollapseChange = (value: boolean) => {
  isCollapsed.value = value;
};
</script>

<style scoped>

/* 移动端适配 */
@media screen and (max-width: 768px) {
  .main-layout {
    flex-direction: column;
  }

  .main-content {
    width: 100%;
    margin-left: 0;
    padding: 10px;
  }

  .content-expanded {
    margin-left: 0;
  }
}

/* 平板适配 */
@media screen and (min-width: 769px) and (max-width: 1024px) {
  .main-content {
    padding: 15px;
  }
}


.main-layout {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

.main-content {
  flex: 1;
  padding: 20px;
  background: #f9f9f9;
  overflow-y: auto;
  transition: all 0.3s ease;
}

.content-expanded {
  flex: 1 calc(100% - 64px);
}
</style>
