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
import { ref, onMounted, onUnmounted } from 'vue';
import { House, Monitor, Warning, User } from '@element-plus/icons-vue';
import Sidebar from '@/components/Sidebar.vue'; // 引入侧边栏组件
import { useWebSocket } from '@/utils/websocketManager'; // 引入WebSocket管理器

// 定义菜单项类型
interface MenuItem {
  index: string;
  title: string;
  icon: any;
  iconColor?: string;
  permission?: string;
}

// 控制侧边栏收起状态（从本地存储读取）
const isCollapsed = ref<boolean>(localStorage.getItem('sidebarCollapse') === 'true');

// 用户权限（示例）
const userPermissions = ref<string[]>(['admin', 'device_manager', 'alarm_manager', 'user_center_view']);

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
    index: '/dashboard/setting',
    title: '用户中心',
    icon: User,
    permission: 'user_center_view'
  }
];

// 处理侧边栏收起状态变化
const handleCollapseChange = (value: boolean) => {
  isCollapsed.value = value;
  // 同步到本地存储
  localStorage.setItem('sidebarCollapse', value.toString());
};

// 初始化WebSocket连接
const { connect, disconnect, onMessage, isConnected } = useWebSocket();

// 获取用户ID（从localStorage或其他地方获取）
const getCurrentUserId = (): string | null => {
  // 优先从localStorage直接获取用户ID
  const userId = localStorage.getItem('userId');
  if (userId) {
    return userId;
  }
  
  // 从token中解析用户ID或从localStorage中获取
  const token = localStorage.getItem('token');
  if (token) {
    try {
      // 解析JWT token获取用户信息
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => 
        '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
      ).join(''));
      
      const userData = JSON.parse(jsonPayload);
      return userData.userId || userData.sub || userData.id || userData.user_id;
    } catch (e) {
      console.error('解析token失败:', e);
      // 如果无法从token解析，尝试从其他地方获取用户ID
      return localStorage.getItem('currentUserId');
    }
  }
  return null;
};

// 监听登录状态变化
const handleLoginStatusChange = () => {
  const userId = getCurrentUserId();
  if (userId) {
    // 用户已登录，连接WebSocket
    connect(userId, {
      onOpen: (event) => {
        console.log('WebSocket连接已打开', event);
      },
      onClose: (event) => {
        console.log('WebSocket连接已关闭', event);
      },
      onError: (event) => {
        console.error('WebSocket连接发生错误', event);
      },
      onMessage: (event) => {
        console.log('收到WebSocket消息', event.data);
      }
    });

    // 监听报警消息
    onMessage('alarm', (data) => {
      console.log('收到报警消息:', data);
      // 在这里可以处理报警消息，比如显示通知
    });
  } else {
    // 用户未登录，断开WebSocket
    disconnect();
  }
};

onMounted(() => {
  // 页面加载时根据登录状态连接或断开WebSocket
  handleLoginStatusChange();
  
  // 监听storage事件，以响应其他标签页的登录/登出操作
  const storageHandler = (e: StorageEvent) => {
    if (e.key === 'token' || e.key === 'userId') {
      handleLoginStatusChange();
    }
  };
  window.addEventListener('storage', storageHandler);
});

onUnmounted(() => {
  // 页面卸载时断开连接
  disconnect();
  
  // 移除事件监听器
  window.removeEventListener('storage', storageHandler);
});
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
