// 导入封装好的axios实例
import request from './index';

export function getRecentLoginLog() {
  return request({
    url: '/api/user/login/log/recent',
    method: 'get',
    headers: { hideLoading: true }
  });
}

export function getLoginLogList(params: { pageNum: number; pageSize: number }) {
  return request({
    url: '/api/user/login/log',
    method: 'get',
    params,
    headers: { hideLoading: false }
  });
}