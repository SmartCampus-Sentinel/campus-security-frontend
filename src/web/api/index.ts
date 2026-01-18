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
      ElMessage.error(res.msg || '请求失败');
      // token过期/无效，跳登录页
      if (res.code === 401) {
        localStorage.removeItem('token');
        router.push('/login');
      }
      return Promise.reject(res);
    }
    return res;
  },
  (error) => {
    loadingInstance?.close();
    ElMessage.error(error.message || '服务器异常');
    return Promise.reject(error);
  }
);

// 导出请求方法
export default service;