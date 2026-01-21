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