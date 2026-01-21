import axios from 'axios';
import { ElMessage, ElLoading } from 'element-plus';
import router from '@/router';

// 创建axios实例
const service = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api', // 接口基地址（从.env文件读取）
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json;charset=utf-8'
  }
});

// 加载状态实例
let loadingInstance: ReturnType<typeof ElLoading.service> | null = null;

// 请求拦截器：添加token、显示加载
service.interceptors.request.use(
  (config) => {
    // 显示加载（可通过config.headers.hideLoading关闭）
    if (!config.headers?.hideLoading) {
      loadingInstance = ElLoading.service({
        lock: true,
        text: '加载中...',
        background: 'rgba(0, 0, 0, 0.5)'
      });
    }
    // 添加token到请求头
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    loadingInstance?.close();
    ElMessage.error('请求异常，请稍后重试');
    return Promise.reject(error);
  }
);

// 响应拦截器：处理异常、关闭加载
service.interceptors.response.use(
  (response) => {
    loadingInstance?.close();
    const res = response.data;
    // 接口自定义错误码（假设200为成功）
    if (res.code !== 200) {
      // 根据自定义错误码提供更明确的错误信息
      let errorMessage = res.msg || '请求失败';

      // 对常见的自定义错误码提供更友好的提示
      switch (res.code) {
        case 401:
          errorMessage = '登录已过期，请重新登录';
          localStorage.removeItem('token');
          router.push('/login');
          break;
        case 403:
          errorMessage = '权限不足，无法执行此操作';
          break;
        case 404:
          errorMessage = '请求的数据不存在';
          break;
        case 500:
          errorMessage = '服务器内部错误，请稍后重试';
          break;
        case 501:
          errorMessage = '功能暂未实现';
          break;
        case 502:
          errorMessage = '网关错误，请稍后重试';
          break;
        case 503:
          errorMessage = '服务暂时不可用，请稍后重试';
          break;
        case 504:
          errorMessage = '网关超时，请稍后重试';
          break;
        default:
          errorMessage = res.msg || `请求失败 (错误码: ${res.code})`;
      }

      ElMessage.error(errorMessage);
      return Promise.reject(res);
    }
    return res.data || res; // 返回data字段或整个响应
  },
  (error) => {
    loadingInstance?.close();

    // 处理不同的HTTP错误状态码
    if (error.response) {
      const { status, data } = error.response;

      switch (status) {
        case 400:
          ElMessage.error(`请求参数错误: ${data.message || 'Bad Request'}`);
          break;
        case 401:
          // 清除token并跳转到登录页
          localStorage.removeItem('token');
          router.push('/login');
          ElMessage.error('登录已过期，请重新登录');
          break;
        case 403:
          ElMessage.error('权限不足，无法访问此资源');
          break;
        case 404:
          ElMessage.error('请求的资源不存在，请检查路径是否正确');
          break;
        case 500:
          ElMessage.error('服务器内部错误，请稍后重试或联系管理员');
          break;
        case 502:
          ElMessage.error('网关错误，请稍后重试');
          break;
        case 503:
          ElMessage.error('服务暂时不可用，请稍后重试');
          break;
        case 504:
          ElMessage.error('网关超时，请稍后重试');
          break;
        default:
          ElMessage.error(`请求失败 (${status}): ${data.message || '服务器异常'}`);
      }
    } else if (error.request) {
      // 请求已发出但没有收到响应
      ElMessage.error('网络连接失败，请检查网络连接');
    } else {
      // 其他错误
      ElMessage.error(error.message || '请求异常，请稍后重试');
    }

    return Promise.reject(error);
  }
);

// 导出请求方法
export default service;

// 导出WebSocket服务
export { default as websocketService } from './websocket';
export type { WebSocketOptions, WebSocketMessage } from './websocket';

// 导出所有API接口
export * from './login';
export * from './user';
export * from './device';
export * from './alarm';
export * from './role';
export * from './sensor';
export * from './report';
export * from './dashboard';