import axios, { InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { ElMessage, ElMessageBox } from 'element-plus';
// 导入路由实例（需确保router/index.ts存在）
import router from '@/router';

// 创建Axios实例
const service = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json;charset=utf-8'
  }
});

// 请求拦截器：添加Token
service.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    ElMessage.error(error.message || '请求拦截异常');
    return Promise.reject(error);
  }
);

// 响应拦截器：统一处理返回结果
service.interceptors.response.use(
  (res: AxiosResponse) => {
    const { code, msg, data } = res.data;
    // 业务状态码非200时提示错误
    if (code !== 200) {
      ElMessage.error(msg || '请求失败');
      return Promise.reject(new Error(msg || '请求失败'));
    }
    // 业务状态码200，返回数据
    return data;
  },
  (error) => {
    // 401：Token过期/未登录
    if (error.response?.status === 401) {
      ElMessageBox.confirm(
        '登录状态已过期，请重新登录',
        '提示',
        {
          confirmButtonText: '重新登录',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(() => {
        // 清除Token并跳登录页
        localStorage.removeItem('token');
        router.push('/login').catch(err => console.warn('路由跳转异常:', err));
      });
    }
    // 其他错误提示
    ElMessage.error(error.message || '服务器请求异常');
    return Promise.reject(error);
  }
);

export default service;