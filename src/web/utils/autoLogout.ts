/**
 * 自动登出工具
 * 功能：监测用户活动，5分钟无活动则自动退出登录
 */

import { useRouter } from 'vue-router';

// 配置常量
const INACTIVITY_TIMEOUT = 5 * 60 * 1000; // 5分钟（毫秒）
const ACTIVITY_EVENTS = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];

// 全局状态
let inactivityTimer: ReturnType<typeof setTimeout> | null = null;
let isAutoLogoutEnabled = false;

/**
 * 重置不活动计时器
 */
const resetInactivityTimer = (router: ReturnType<typeof useRouter>) => {
  // 清除之前的计时器
  if (inactivityTimer) {
    clearTimeout(inactivityTimer);
  }

  // 设置新的不活动计时器
  inactivityTimer = setTimeout(() => {
    console.warn('⏱️ 用户5分钟无活动，自动退出登录');
    
    // 清除本地存储的登录信息
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    localStorage.removeItem('userInfo');
    localStorage.removeItem('currentUserId');

    // 显示提示信息
    const message = '由于长时间未操作，您已被自动退出，请重新登录';
    console.log(message);
    
    // 重定向到登录页面
    if (router.currentRoute.value.path !== '/login') {
      router.push('/login');
    }

    // 禁用自动退出功能（防止重复触发）
    stopAutoLogout();
  }, INACTIVITY_TIMEOUT);
};

/**
 * 启动自动登出监听
 */
export const startAutoLogout = () => {
  if (isAutoLogoutEnabled) {
    console.log('⏰ 自动登出功能已启动');
    return;
  }

  const router = useRouter();
  isAutoLogoutEnabled = true;

  // 只在用户已登录时启动
  const token = localStorage.getItem('token');
  if (!token) {
    return;
  }

  console.log('⏰ 启动自动登出监听（5分钟无活动将自动退出）');

  // 初始化计时器
  resetInactivityTimer(router);

  // 添加活动事件监听器
  ACTIVITY_EVENTS.forEach(event => {
    document.addEventListener(event, () => {
      // 只在用户已登录时重置计时器
      const currentToken = localStorage.getItem('token');
      if (currentToken && currentToken.trim() && currentToken !== 'undefined' && currentToken !== 'null') {
        resetInactivityTimer(router);
      }
    }, { passive: true }); // 使用passive以提高滚动性能
  });
};

/**
 * 停止自动登出监听
 */
export const stopAutoLogout = () => {
  if (inactivityTimer) {
    clearTimeout(inactivityTimer);
    inactivityTimer = null;
  }
  isAutoLogoutEnabled = false;
  console.log('⏹️ 停止自动登出监听');
};

/**
 * 检查自动登出是否启用
 */
export const isAutoLogoutActive = (): boolean => {
  return isAutoLogoutEnabled;
};

/**
 * 获取剩余不活动时间（毫秒）
 */
export const getRemainingInactivityTime = (): number => {
  // 此函数仅用于调试或显示倒计时
  return inactivityTimer ? INACTIVITY_TIMEOUT : 0;
};
