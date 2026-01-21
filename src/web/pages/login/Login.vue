<template>
  <div class="login-container">
    <el-card class="login-card">
      <h2 class="login-title">校园安防平台-管理员登录</h2>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="用户名" prop="username">
          <el-input 
            v-model="form.username" 
            placeholder="请输入用户名" 
            :prefix-icon="User"
            @keyup.enter="handleLogin"
          />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input 
            v-model="form.password" 
            type="password" 
            placeholder="请输入密码" 
            :prefix-icon="Lock"
            @keyup.enter="handleLogin"
          />
        </el-form-item>
        <el-form-item>
          <el-checkbox v-model="form.rememberMe" v-if="!isLoading">记住密码</el-checkbox>
          <div class="login-options">
            <el-link type="primary" href="#" @click.prevent="handleForgotPassword">忘记密码？</el-link>
          </div>
        </el-form-item>
        <el-form-item>
          <el-button 
            type="primary" 
            @click="handleLogin" 
            class="login-btn"
            :loading="isLoading"
            :disabled="isLoading"
          >
            {{ isLoading ? '登录中...' : '登录' }}
          </el-button>
        </el-form-item>
      </el-form>
      <div class="server-status">
        <el-tag :type="connectionStatusTag" size="small">
          {{ connectionStatusText }}
        </el-tag>
      </div>
      <!-- 系统通知区域 -->
      <div v-if="systemNotifications.length > 0" class="system-notifications">
        <div v-for="(notice, index) in systemNotifications" :key="index"
             :class="['notification-item', notice.type.toLowerCase()]">
          <strong>{{ notice.title }}</strong>: {{ notice.content }}
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, reactive } from 'vue';
import { ElMessage, ElForm, ElNotification } from 'element-plus';
import { useRouter } from 'vue-router';
import { User, Lock } from '@element-plus/icons-vue';
import { login } from '@/api/login'; // 使用真实的登录API
import { useWebSocket } from '@/utils/websocketManager'; // 导入WebSocket管理器

// 定义通知类型
interface SystemNotification {
  type: 'MAINTENANCE' | 'SECURITY' | 'USER_LOGIN' | 'INFO';
  title: string;
  content: string;
  timestamp: number;
}

// 系统通知列表
const systemNotifications = ref<SystemNotification[]>([]);

// 登录页面WebSocket连接
const loginWebSocket = ref<WebSocket | null>(null);

// 建立登录页面专用的WebSocket连接
const connectLoginWebSocket = () => {
  // 使用相对路径，通过Vite代理自动转发到后端
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const host = window.location.host;
  const wsUrl = `${protocol}//${host}/api/websocket/login`;

  try {
    loginWebSocket.value = new WebSocket(wsUrl);

    loginWebSocket.value.onopen = function(event) {
      console.log('登录页面WebSocket连接已建立');
    };

    loginWebSocket.value.onmessage = function(event) {
      try {
        const message = JSON.parse(event.data as string);

        // 显示系统通知
        if (message.type === 'MAINTENANCE') {
          showMaintenanceNotice(message.title, message.content);
        } else if (message.type === 'SECURITY') {
          showSecurityAlert(message.title, message.content);
        } else if (message.type === 'USER_LOGIN') {
          showUserLoginNotice(message.title, message.content);
        } else if (message.type === 'INFO') {
          showInfoNotice(message.title, message.content);
        }
      } catch (error) {
        console.error('解析WebSocket消息失败:', error);
      }
    };

    loginWebSocket.value.onerror = function(event) {
      console.error('登录页面WebSocket连接发生错误:', event);
    };

    loginWebSocket.value.onclose = function(event) {
      console.log('登录页面WebSocket连接已关闭:', event);
    };
  } catch (error) {
    console.error('创建登录页面WebSocket连接失败:', error);
  }
};

// 显示维护通知
const showMaintenanceNotice = (title: string, content: string) => {
  systemNotifications.value.unshift({
    type: 'MAINTENANCE',
    title,
    content,
    timestamp: Date.now()
  });

  // 显示Element Plus通知
  ElNotification({
    title: title || '系统维护',
    message: content,
    type: 'warning',
    duration: 0 // 持久显示
  });
};

// 显示安全警告
const showSecurityAlert = (title: string, content: string) => {
  systemNotifications.value.unshift({
    type: 'SECURITY',
    title,
    content,
    timestamp: Date.now()
  });

  // 显示Element Plus通知
  ElNotification({
    title: title || '安全警告',
    message: content,
    type: 'error',
    duration: 0 // 持久显示
  });

  // 也可以显示浏览器原生alert
  alert(`⚠️ 安全警告: ${content}`);
};

// 显示用户登录通知
const showUserLoginNotice = (title: string, content: string) => {
  systemNotifications.value.unshift({
    type: 'USER_LOGIN',
    title,
    content,
    timestamp: Date.now()
  });

  // 显示Element Plus通知
  ElNotification({
    title: title || '用户活动',
    message: content,
    type: 'info'
  });
};

// 显示一般信息通知
const showInfoNotice = (title: string, content: string) => {
  systemNotifications.value.unshift({
    type: 'INFO',
    title,
    content,
    timestamp: Date.now()
  });

  // 显示Element Plus通知
  ElNotification({
    title: title || '系统通知',
    message: content,
    type: 'info'
  });
};

// ========== 1. WebSocket连接状态 ==========
const { connectionStatusText, connectionStatus } = useWebSocket();

// ========== 2. 计算连接状态标签类型 ==========
const connectionStatusTag = ref<'success' | 'warning' | 'danger' | 'info'>('info');

// ========== 2. 表单相关配置 ==========
const formRef = ref<InstanceType<typeof ElForm>>();
// 配置初始账号密码（默认填充admin/123456，方便测试）
const form = ref({
  username: '',
  password: '',
  rememberMe: false
});

// 表单校验规则
const rules = ref({
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度应在3-20个字符之间', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度应在6-20个字符之间', trigger: 'blur' }
  ],
});

// 加载状态
const isLoading = ref(false);

// ========== 3. 路由实例 ==========
const router = useRouter();

// ========== 4. 从localStorage加载记住的凭据 ==========
const loadRememberedCredentials = () => {
  const remembered = localStorage.getItem('rememberedCredentials');
  if (remembered) {
    try {
      const credentials = JSON.parse(remembered);
      form.value.username = credentials.username || '';
      form.value.password = credentials.password || '';
      form.value.rememberMe = true;
    } catch (e) {
      console.warn('读取记住的凭据失败:', e);
    }
  }
};

// ========== 5. 保存记住的凭据 ==========
const saveRememberedCredentials = () => {
  if (form.value.rememberMe) {
    const credentials = {
      username: form.value.username,
      password: form.value.password
    };
    localStorage.setItem('rememberedCredentials', JSON.stringify(credentials));
  } else {
    localStorage.removeItem('rememberedCredentials');
  }
};

// ========== 6. 登录方法 ==========
const handleLogin = async () => {
  if (!formRef.value) return;

  // 检查账户是否被锁定
  const lockStatus = isAccountLocked();
  if (lockStatus.locked) {
    const minutesLeft = Math.ceil(lockStatus.remainingTime / 60000);
    ElMessage.error(`账户已被锁定，请${minutesLeft}分钟后重试`);
    return;
  }

  try {
    // 表单校验
    await formRef.value.validate();

    // 验证通过，设置加载状态
    isLoading.value = true;

    // 调用登录接口
    const res = await login({
      username: form.value.username,
      password: form.value.password,
      type: 1, // 1=管理员
    });

    // 检查响应数据
    if (!res || !res.data || !res.data.token) {
      throw new Error('登录响应数据异常');
    }

    // 存储token和用户信息
    localStorage.setItem('token', res.data.token);
    localStorage.setItem('username', form.value.username);
    
    // 如果有用户ID，也存储起来
    if (res.data.userId) {
      localStorage.setItem('userId', res.data.userId);
    }
    
    // 保存记住的凭据
    saveRememberedCredentials();
    
    // 清除登录失败计数（如果有）
    localStorage.removeItem('loginFailureCount');
    localStorage.removeItem('lastLoginFailureTime');
    localStorage.removeItem('accountLockedUntil');
    
    ElMessage.success('登录成功！即将跳转到首页');

    // 登录成功后，准备跳转前初始化WebSocket连接
    const userId = localStorage.getItem('userId') || form.value.username;
    if (userId) {
      // 使用nextTick确保DOM更新完成后再连接WebSocket
      setTimeout(() => {
        // 连接WebSocket（在MainLayout中处理）
        console.log(`准备为用户 ${userId} 建立WebSocket连接`);
      }, 500);
    }
    
    // 跳转到首页
    setTimeout(() => {
      router.push('/dashboard').catch(err => console.warn('路由跳转失败:', err));
    }, 1000);

  } catch (err: any) {
    // 检查是否是网络错误
    if (err.code === 'ERR_NETWORK' || err.message.includes('Network Error')) {
      ElMessage.error('网络连接失败，请检查网络连接');
    } 
    // 区分校验失败和登录失败
    else if (err.message && err.message.includes('Validation')) {
      ElMessage.warning('请完善表单信息');
    } 
    // 检查是否是登录失败（通常是401错误）
    else if (err.response?.status === 401 || err.message?.includes('密码错误') || err.message?.includes('用户不存在')) {
      // 记录登录失败次数
      recordLoginFailure();
      ElMessage.error('用户名或密码错误');
    }
    else {
      // 其他错误
      ElMessage.error(err.message || '登录失败，请稍后重试');
    }
  } finally {
    // 重置加载状态
    isLoading.value = false;
  }
};

// ========== 6.1 记录登录失败 ==========
const recordLoginFailure = () => {
  const failureCount = parseInt(localStorage.getItem('loginFailureCount') || '0');
  const lastFailureTime = localStorage.getItem('lastLoginFailureTime');
  const now = new Date().getTime();
  
  // 如果距离上次失败不到30分钟，增加计数
  if (lastFailureTime && (now - parseInt(lastFailureTime)) < 30 * 60 * 1000) {
    const newCount = failureCount + 1;
    localStorage.setItem('loginFailureCount', newCount.toString());
    localStorage.setItem('lastLoginFailureTime', now.toString());
    
    // 如果失败次数超过5次，锁定账户一段时间
    if (newCount >= 5) {
      localStorage.setItem('accountLockedUntil', (now + 30 * 60 * 1000).toString()); // 锁定30分钟
      ElMessage.error('登录失败次数过多，请30分钟后再试');
    }
  } else {
    // 重置计数
    localStorage.setItem('loginFailureCount', '1');
    localStorage.setItem('lastLoginFailureTime', now.toString());
  }
};

// ========== 6.2 检查账户是否被锁定 ==========
const isAccountLocked = () => {
  const lockedUntil = localStorage.getItem('accountLockedUntil');
  if (lockedUntil) {
    const now = new Date().getTime();
    const unlockTime = parseInt(lockedUntil);
    if (now < unlockTime) {
      return { locked: true, remainingTime: unlockTime - now };
    } else {
      // 超过解锁时间，清除锁定状态
      localStorage.removeItem('accountLockedUntil');
      localStorage.removeItem('loginFailureCount');
      localStorage.removeItem('lastLoginFailureTime');
    }
  }
  return { locked: false, remainingTime: 0 };
};

// ========== 7. 忘记密码处理 ==========
const handleForgotPassword = () => {
  ElMessage.info('请联系系统管理员重置密码');
};

// ========== 8. 页面挂载时加载记住的凭据 ==========
onMounted(() => {
  loadRememberedCredentials();
  
  // 检查账户是否被锁定
  const lockStatus = isAccountLocked();
  if (lockStatus.locked) {
    const minutesLeft = Math.ceil(lockStatus.remainingTime / 60000);
    ElMessage.error(`账户已被锁定，请${minutesLeft}分钟后重试`);
  }
  
  // 连接登录页面专用的WebSocket
  connectLoginWebSocket();

  // 监听连接状态变化
  const updateConnectionStatus = () => {
    if (connectionStatus.value === 1) { // OPEN
      connectionStatusTag.value = 'success';
    } else if (connectionStatus.value === 0) { // CONNECTING
      connectionStatusTag.value = 'warning';
    } else {
      connectionStatusTag.value = 'danger';
    }
  };
  
  // 初始设置
  updateConnectionStatus();
  
  // 监听连接状态变化
  const interval = setInterval(updateConnectionStatus, 1000);
  
  // 组件销毁时清除定时器
  onUnmounted(() => {
    clearInterval(interval);
  });
});

// 组件卸载时断开WebSocket连接
onUnmounted(() => {
  // 断开登录页面的WebSocket连接
  if (loginWebSocket.value) {
    loginWebSocket.value.close();
    loginWebSocket.value = null;
  }
});
</script>

<style scoped>
/* 补充缺失的样式，保证页面美观 */
.login-container {
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #780206, #061161);
  background-size: cover;
  position: relative;
}
.login-card {
  width: 420px;
  padding: 30px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
  border-radius: 10px;
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  position: relative;
}
.login-title {
  text-align: center;
  margin-bottom: 30px;
  color: white;
  font-size: 24px;
  font-weight: bold;
  text-shadow: 0 2px 4px rgba(0,0,0,0.3);
}
.login-btn {
  width: 100%;
  height: 45px;
  font-size: 16px;
  letter-spacing: 2px;
}
.login-options {
  display: flex;
  justify-content: flex-end;
  margin-top: -15px;
  margin-bottom: 10px;
}
.server-status {
  text-align: center;
  margin-top: 10px;
}
.system-notifications {
  margin-top: 20px;
  max-height: 200px;
  overflow-y: auto;
  padding: 10px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 5px;
}
.notification-item {
  padding: 8px;
  margin-bottom: 5px;
  border-radius: 3px;
  font-size: 12px;
}
.notification-item.maintenance {
  background: rgba(255, 165, 0, 0.2);
  border-left: 3px solid orange;
}
.notification-item.security {
  background: rgba(255, 0, 0, 0.2);
  border-left: 3px solid red;
}
.notification-item.user_login {
  background: rgba(0, 123, 255, 0.2);
  border-left: 3px solid blue;
}
.notification-item.info {
  background: rgba(40, 167, 69, 0.2);
  border-left: 3px solid green;
}
:deep(.el-input__wrapper) {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 6px;
}
:deep(.el-input__inner) {
  background: transparent;
}
:deep(.el-checkbox__label) {
  color: white !important;
}
:deep(.el-link) {
  color: white !important;
  text-decoration: underline;
}
</style>