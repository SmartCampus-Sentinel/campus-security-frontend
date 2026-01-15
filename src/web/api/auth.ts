import request from '@/utils/request';

// 登录接口
export const login = (data: { username: string; password: string; type: number }) => {
  return request({
    url: '/auth/login',
    method: 'post',
    data,
  });
};

// 退出登录接口
export const logout = () => {
  return request({
    url: '/auth/logout',
    method: 'post',
  });
};