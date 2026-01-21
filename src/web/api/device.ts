import request from './index';
import { ApiResponse, PageResponse } from './types';

/**
 * 设备类型定义（TS类型约束，与后端返回字段对齐）
 */
export interface DeviceItem {
  id: string; // 设备ID
  deviceName: string; // 设备名称
  deviceType: string; // 设备类型（如摄像头、传感器、门禁）
  status: 0 | 1 | 2; // 0-离线 1-在线 2-异常
  location: string; // 安装位置
  ipAddress: string; // 设备IP
  lastOnlineTime: string; // 最后在线时间
  createTime: string; // 创建设备时间
}

/**
 * 获取设备信息列表
 * @param params 查询参数（分页、筛选）
 * @returns 设备列表
 */
export const getDeviceInfoList = (params?: {
  pageNum?: number;
  pageSize?: number;
  deviceName?: string;
  deviceType?: string;
  status?: number;
}): Promise<ApiResponse<PageResponse<DeviceItem>>> => {
  return request({
    url: '/device-info/list',
    method: 'get',
    params,
    headers: { hideLoading: false }
  });
};

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