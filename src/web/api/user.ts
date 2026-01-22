import request from './index';
import { ApiResponse, PageResponse } from './types';

/**
 * 用户信息接口
 */
export interface UserItem {
  id: string;
  username: string;
  email?: string;
  phone?: string;
  role: string;
  status: number; // 0-禁用 1-启用
  createTime: string;
  lastLoginTime?: string;
}

/**
 * 用户详细信息接口
 */
export interface UserInfo {
  id: string;
  username: string;
  nickname?: string;
  email?: string;
  phone?: string;
  avatar?: string;
  role: string;
  status?: number;
  createdAt?: string;
  updatedAt?: string;
  createTime?: string;
  updateTime?: string;
  lastLoginTime?: string;
  loginIp?: string;
}

/**
 * 获取当前用户信息
 * @returns 用户详细信息
 */
export const getUserInfo = (): Promise<ApiResponse<UserInfo>> => {
  return request({
    url: '/api/user/info',
    method: 'get',
    headers: { hideLoading: false }
  });
};

/**
 * 获取所有用户列表
 * @param params 查询参数（分页、筛选）
 * @returns 用户列表
 */
export const getUserList = (params?: {
  pageNum?: number;
  pageSize?: number;
  username?: string;
  role?: string;
  status?: number;
}): Promise<ApiResponse<PageResponse<UserItem>>> => {
  return request({
    url: '/user/list',
    method: 'get',
    params,
    headers: { hideLoading: false }
  });
};

/**
 * 更新用户信息
 * @param data 用户信息
 * @returns 更新结果
 */
export const updateUserInfo = (data: Partial<UserInfo>): Promise<ApiResponse<UserInfo>> => {
  return request({
    url: '/api/user/info',
    method: 'put',
    data,
    headers: { hideLoading: false }
  });
};

/**
 * 修改密码
 * @param data 旧密码和新密码
 * @returns 修改结果
 */
export const updatePassword = (data: {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}): Promise<ApiResponse<{ message: string }>> => {
  return request({
    url: '/api/user/password',
    method: 'put',
    data,
    headers: { hideLoading: false }
  });
};

/**
 * 上传头像
 * @param formData 图片文件
 * @returns 上传结果
 */
export const uploadAvatar = (formData: FormData): Promise<ApiResponse<{ avatarUrl: string }>> => {
  return request({
    url: '/user/avatar',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
      hideLoading: false
    }
  });
};