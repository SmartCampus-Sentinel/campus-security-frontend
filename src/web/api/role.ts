import request from './index';
import { ApiResponse, PageResponse } from './types';

/**
 * 角色信息接口
 */
export interface RoleItem {
  id: string;
  roleName: string;
  roleCode: string;
  description?: string;
  permissions: string[];
  createTime: string;
  status: number; // 0-禁用 1-启用
}

/**
 * 获取角色列表
 * @param params 查询参数（分页、筛选）
 * @returns 角色列表
 */
export const getRoleList = (params?: {
  pageNum?: number;
  pageSize?: number;
  roleName?: string;
  status?: number;
}): Promise<ApiResponse<PageResponse<RoleItem>>> => {
  return request({
    url: '/role/list',
    method: 'get',
    params,
    headers: { hideLoading: false }
  });
};