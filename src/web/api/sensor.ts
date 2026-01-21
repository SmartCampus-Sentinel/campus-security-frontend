import request from './index';
import { ApiResponse, PageResponse } from './types';

/**
 * 传感器数据接口
 */
export interface SensorDataItem {
  id: string;
  deviceId: string;
  deviceName: string;
  sensorType: string;
  value: number;
  unit: string;
  collectTime: string;
  status: number; // 0-异常 1-正常
}

/**
 * 获取传感器数据列表
 * @param params 查询参数（分页、筛选）
 * @returns 传感器数据列表
 */
export const getSensorDataList = (params?: {
  pageNum?: number;
  pageSize?: number;
  deviceId?: string;
  sensorType?: string;
  startTime?: string;
  endTime?: string;
}): Promise<ApiResponse<PageResponse<SensorDataItem>>> => {
  return request({
    url: '/sensor-data/list',
    method: 'get',
    params,
    headers: { hideLoading: false }
  });
};