import request from './index';

/**
 * 报警类型定义（TS类型约束）
 */
export interface AlarmItem {
  id: string; // 报警ID
  deviceId: string; // 关联设备ID
  deviceName: string; // 关联设备名称
  alarmType: string; // 报警类型（如移动侦测、异常闯入、设备离线）
  alarmLevel: 1 | 2 | 3; // 报警级别（1-低 2-中 3-高）
  alarmTime: string; // 报警时间
  location: string; // 报警位置
  handleStatus: 0 | 1; // 0-未处理 1-已处理
  handlePerson?: string; // 处理人
  handleTime?: string; // 处理时间
  handleDesc?: string; // 处理说明
}

/**
 * 报警统计数据（适配dashboard）
 */
export interface AlarmStats {
  todayTotal: number; // 今日报警总数
  unhandled: number; // 未处理报警数
  todayTrend: Array<{
    hour: string; // 小时（如08:00）
    count: number; // 该小时报警数
  }>; // 今日报警趋势
  typeDistribution: Array<{
    name: string; // 报警类型
    value: number; // 数量
  }>; // 报警类型分布
}

/**
 * 获取报警列表（支持分页、筛选）
 * @param params 分页+筛选参数
 * @returns 报警列表 + 总数
 */
export function getAlarmList(params: {
  pageNum: number;
  pageSize: number;
  alarmType?: string; // 报警类型筛选
  alarmLevel?: number; // 报警级别筛选
  handleStatus?: number; // 处理状态筛选
  startTime?: string; // 开始时间
  endTime?: string; // 结束时间
}) {
  return request({
    url: '/api/alarm/list',
    method: 'get',
    params,
    headers: { hideLoading: false }
  });
}

/**
 * 获取报警详情
 * @param id 报警ID
 * @returns 报警完整信息
 */
export function getAlarmDetail(id: string) {
  return request({
    url: `/api/alarm/detail/${id}`,
    method: 'get',
    headers: { hideLoading: false }
  });
}

/**
 * 处理报警（更新处理状态、添加处理说明）
 * @param params 处理参数
 * @returns 操作结果
 */
export function handleAlarm(params: {
  id: string;
  handleStatus: 1; // 标记为已处理
  handleDesc: string; // 处理说明
}) {
  return request({
    url: `/api/alarm/handle/${params.id}`,
    method: 'post',
    data: {
      handleStatus: params.handleStatus,
      handleDesc: params.handleDesc
    },
    headers: { hideLoading: false }
  });
}

/**
 * 获取报警统计数据（适配dashboard）
 * @returns 今日报警数、未处理数、趋势、类型分布
 */
export function getAlarmStats() {
  return request({
    url: '/api/alarm/stats',
    method: 'get',
    headers: { hideLoading: true }
  });
}

/**
 * 获取今日报警趋势（适配dashboard图表）
 * @returns 按小时统计的报警数
 */
export function getTodayAlarmTrend() {
  return request({
    url: '/api/alarm/trend/today',
    method: 'get',
    headers: { hideLoading: true }
  });
}

/**
 * 导出报警数据
 * @param params 筛选参数
 * @returns 导出文件流
 */
export function exportAlarmData(params: {
  startTime?: string;
  endTime?: string;
  handleStatus?: number;
}) {
  return request({
    url: '/api/alarm/export',
    method: 'get',
    params,
    responseType: 'blob', // 导出文件需指定响应类型
    headers: { hideLoading: false }
  });
}