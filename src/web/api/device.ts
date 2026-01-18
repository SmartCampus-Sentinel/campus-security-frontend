import request from './index'; // 复用项目统一的request请求实例

/**
 * 设备类型定义（TS类型约束，与后端返回字段对齐）
 */
export interface DeviceItem {
  deviceId: string; // 设备ID
  deviceName: string; // 设备名称
  deviceType: string; // 设备类型（如摄像头、传感器、门禁）
  deviceStatus: 0 | 1 | 2; // 0-离线 1-在线 2-异常
  location: string; // 安装位置
  ipAddress: string; // 设备IP
  lastOnlineTime: string; // 最后在线时间
  createTime: string; // 创建设备时间
  config: { [key: string]: any }; // 设备配置参数
}

// 添加设备参数接口
export interface AddDeviceParams {
  deviceName: string; // 设备名称
  deviceType: string; // 设备类型
  location: string; // 安装位置
  ipAddress: string; // 设备IP
  config?: { [key: string]: any }; // 设备配置参数（可选）
}

/**
 * 设备统计数据（适配dashboard设备状态分布图表）
 */
export interface DeviceStats {
  total: number; // 设备总数
  online: number; // 在线数
  offline: number; // 离线数
  abnormal: number; // 异常数
  statusDistribution: Array<{
    name: string; // 状态名称（在线/离线/异常）
    value: number; // 数量
  }>;
}

/**
 * 获取设备列表（支持分页、筛选）
 * @param params 分页+筛选参数
 * @returns 设备列表 + 总数
 */
export function getDeviceList(params: {
  pageNum: number;
  pageSize: number;
  deviceName?: string; // 设备名称模糊查询
  deviceType?: string; // 设备类型筛选
  deviceStatus?: number; // 设备状态筛选
}) {
  return request({
    url: '/api/device/list',
    method: 'get',
    params,
    headers: { hideLoading: false }
  });
}

/**
 * 获取设备详情
 * @param deviceId 设备ID
 * @returns 设备完整信息
 */
export function getDeviceDetail(deviceId: string) {
  return request({
    url: `/api/device/detail/${deviceId}`,
    method: 'get',
    headers: { hideLoading: false }
  });
}

/**
 * 更新设备配置
 * @param deviceId 设备ID
 * @param config 新配置参数
 * @returns 操作结果
 */
export function updateDeviceConfig(deviceId: string, config: { [key: string]: any }) {
  return request({
    url: `/api/device/config/${deviceId}`,
    method: 'post',
    data: { config },
    headers: { hideLoading: false }
  });
}

/**
 * 修改设备状态（启用/禁用/重启）
 * @param deviceId 设备ID
 * @param status 目标状态（0-离线 1-在线 2-异常）
 * @returns 操作结果
 */
export function updateDeviceStatus(deviceId: string, status: number) {
  return request({
    url: `/api/device/status/${deviceId}`,
    method: 'put',
    data: { status },
    headers: { hideLoading: false }
  });
}

/**
 * 获取设备统计数据（适配dashboard）
 * @returns 设备总数、在线/离线/异常数、状态分布
 */
export function getDeviceStats() {
  return request({
    url: '/api/device/stats',
    method: 'get',
    headers: { hideLoading: true }
  });
}

/**
 * 删除设备（支持批量）
 * @param deviceIds 设备ID列表
 * @returns 操作结果
 */
export function deleteDevice(deviceIds: string[]) {
  return request({
    url: '/api/device/delete',
    method: 'delete',
    data: { deviceIds },
    headers: { hideLoading: false }
  });
}

/**
 * 添加新设备
 * @param params 添加设备参数
 * @returns 操作结果
 */
export function addDevice(params: AddDeviceParams) {
  return request({
    url: '/api/device/add',
    method: 'post',
    data: params,
    headers: { hideLoading: false }
  });
}
