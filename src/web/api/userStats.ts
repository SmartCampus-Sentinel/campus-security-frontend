import request from './index';

/**
 * 获取用户核心统计数据
 * @returns 登录次数、处理报警数、管理设备数
 */
export function getUserStats() {
  return request({
    url: '/api/user/stats',
    method: 'get',
    headers: { hideLoading: false }
  });
}