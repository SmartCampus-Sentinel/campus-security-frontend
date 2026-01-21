import request from './index';

/**
 * 登录请求参数
 */
export interface LoginParams {
  username: string;
  password: string;
}

/**
 * 登录响应数据
 */
export interface LoginResponse {
  token: string;
  userId: string;
  username: string;
  email?: string;
  phone?: string;
  role: string;
  permissions?: string[];
}

/**
 * WebSocket连接信息
 */
export interface WebSocketInfo {
  url: string;
  userId: string;
  timestamp: number;
}

/**
 * 用户登录接口
 * @param data 登录参数
 * @returns 登录响应，包含token和用户信息
 */
export const login = (data: LoginParams) => {
  return request({
    url: '/auth/login',
    method: 'post',
    data,
    headers: { hideLoading: false }
  });
};

/**
 * 获取WebSocket连接信息
 * @returns WebSocket连接信息
 */
export const getWebSocketInfo = () => {
  return request({
    url: '/auth/websocket-info',
    method: 'get',
    headers: { hideLoading: true }
  });
};

/**
 * 退出登录接口
 * @returns 退出登录响应
 */
export const logout = () => {
  return request({
    url: '/auth/logout',
    method: 'post',
    headers: { hideLoading: false }
  });
};