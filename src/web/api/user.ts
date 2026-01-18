import request from './index';

/**
 * 获取用户信息
 * @returns 用户基本信息
 */
export function getUserInfo() {
  return request({
    url: '/api/user/info',
    method: 'get'
  });
}

/**
 * 修改密码
 * @param params { oldPassword: string, newPassword: string }
 * @returns
 */
export function updatePassword(params: { oldPassword: string; newPassword: string }) {
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
export function uploadAvatar(params: FormData) {
  return request({
    url: '/api/user/upload/avatar',
    method: 'post',
    data: params,
    headers: {
      'Content-Type': 'multipart/form-data' // 上传文件需指定头
    }
  });
}