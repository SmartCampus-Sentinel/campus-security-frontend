import request from './index';
import { ApiResponse } from './types';

// 用户信息接口定义
export interface UserInfo {
  id: string;
  username: string;
  nickname?: string;
  email?: string;
  phone?: string;
  avatar: string;
  role: string;
  lastLoginTime: string;
  loginIp: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * 获取用户信息
 * @returns 用户基本信息
 */
export function getUserInfo(): Promise<ApiResponse<UserInfo>> {
  return request({
    url: '/api/user/info',
    method: 'get'
  });
}

/**
 * 修改密码
 * @param params { oldPassword: string, newPassword: string }
 * @returns 操作结果
 */
export function updatePassword(params: { oldPassword: string; newPassword: string }): Promise<ApiResponse<null>> {
  return request({
    url: '/api/user/update/password',
    method: 'post',
    data: params
  });
}

/**
 * 上传头像（可选）
 * @param params FormData格式
 * @returns 新头像地址
 */
export function uploadAvatar(params: FormData): Promise<ApiResponse<{ avatarUrl: string }>> {
  return request({
    url: '/api/user/upload/avatar',
    method: 'post',
    data: params,
    headers: {
      'Content-Type': 'multipart/form-data' // 上传文件需指定头
    }
  });
}

/**
 * 更新用户信息
 * @param params 用户信息
 * @returns 操作结果
 */
export function updateUserInfo(params: {
  username?: string;
  nickname?: string;
  email?: string;
  phone?: string;
}): Promise<ApiResponse<null>> {
  return request({
    url: '/api/user/update/info',
    method: 'post',
    data: params
  });
}