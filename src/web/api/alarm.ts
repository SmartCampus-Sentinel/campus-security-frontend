import request from './index';
import { ApiResponse, PageResponse } from './types';

/**
 * 报警状态枚举
 */
export enum AlarmStatus {
  PENDING = 0,  // 待处理
  PROCESSED = 1,  // 已处理
  IGNORED = 2   // 已忽略
}

/**
 * 将前端状态字符串转换为后端枚举值
 * @param statusStr 前端状态字符串（pending/processed/ignored）
 * @returns 后端枚举值
 */
export function statusStrToEnum(statusStr: string): AlarmStatus {
  switch (statusStr) {
    case 'processed':
      return AlarmStatus.PROCESSED;
    case 'ignored':
      return AlarmStatus.IGNORED;
    default:
      return AlarmStatus.PENDING;
  }
}

/**
 * 将后端枚举值转换为前端状态字符串
 * @param statusEnum 后端枚举值
 * @returns 前端状态字符串（pending/processed/ignored）
 */
export function statusEnumToStr(statusEnum: AlarmStatus): string {
  switch (statusEnum) {
    case AlarmStatus.PROCESSED:
      return 'processed';
    case AlarmStatus.IGNORED:
      return 'ignored';
    default:
      return 'pending';
  }
}

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
  handleStatus: AlarmStatus; // 处理状态
  status?: string; // 前端状态字段（用于List.vue的状态显示）
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
 * @returns 分页报警列表
 */
export function getAlarmList(params: {
  pageNum: number;
  pageSize: number;
  alarmType?: string; // 报警类型筛选
  alarmLevel?: number; // 报警级别筛选
  handleStatus?: number; // 处理状态筛选
  startTime?: string; // 开始时间
  endTime?: string; // 结束时间
}): Promise<ApiResponse<PageResponse<AlarmItem>>> {
  return request({
    url: '/alarm-event/list',
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
export function getAlarmDetail(id: string): Promise<ApiResponse<AlarmItem>> {
  return request({
    url: `/alarm-event/${id}`,
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
  handleStatus: AlarmStatus; // 处理状态（支持所有枚举值）
  handleDesc?: string; // 处理说明（可选）
  handlePerson?: string; // 处理人（可选）
}): Promise<ApiResponse<null>> {
  return request({
    url: `/alarm-event/${params.id}/handle`,
    method: 'post',
    data: params,
    headers: { hideLoading: false }
  });
}

/**
 * 获取报警统计数据（适配dashboard）
 * @returns 今日报警数、未处理数、趋势、类型分布
 */
export function getAlarmStats(): Promise<ApiResponse<AlarmStats>> {
  return request({
    url: '/alarm-event/stats',
    method: 'get',
    headers: { hideLoading: true }
  });
}

/**
 * 获取今日报警趋势（适配dashboard图表）
 * @returns 按小时统计的报警数
 */
export function getTodayAlarmTrend(): Promise<ApiResponse<AlarmStats['todayTrend']>> {
  return request({
    url: '/alarm-event/trend/today',
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
}): Promise<Blob> {
  return request({
    url: '/alarm-event/export',
    method: 'get',
    params,
    responseType: 'blob', // 导出文件需指定响应类型
    headers: { hideLoading: false }
  });
}

/**
 * 更新报警状态（用于List.vue的快速操作）
 * @param id 报警ID
 * @param status 前端状态字符串（pending/processed/ignored）
 * @returns 操作结果
 */
export function updateAlarmStatus(id: string, status: string): Promise<ApiResponse<null>> {
  // 使用统一的状态转换函数
  const handleStatus = statusStrToEnum(status);
  
  return request({
    url: `/alarm-event/${id}/handle`,
    method: 'post',
    data: { handleStatus },
    headers: { hideLoading: false }
  });
}

/**
 * 批量处理报警
 * @param params 批量处理参数
 * @returns 操作结果
 */
export function batchHandleAlarm(params: {
  ids: string[]; // 报警ID列表
  handleStatus: AlarmStatus; // 处理状态
  handleDesc?: string; // 处理说明（可选）
}): Promise<ApiResponse<null>> {
  return request({
    url: '/alarm-event/batch-handle',
    method: 'post',
    data: params,
    headers: { hideLoading: false }
  });
}

/**
 * 报警事件接口
 */
export interface AlarmEventItem {
  id: string;
  deviceId: string;
  deviceName: string;
  alarmType: string;
  alarmLevel: number; // 1-低 2-中 3-高
  alarmContent: string;
  alarmTime: string;
  status: number; // 0-未处理 1-处理中 2-已处理
  handler?: string;
  handleTime?: string;
}

/**
 * 报警处置记录接口
 */
export interface AlarmDisposalItem {
  id: string;
  alarmId: string;
  handler: string;
  handleTime: string;
  handleContent: string;
  result: number; // 0-失败 1-成功
}

/**
 * 获取报警事件列表
 */
export const getAlarmEventList = (params?: {
  pageNum?: number;
  pageSize?: number;
  deviceId?: string;
  alarmType?: string;
  alarmLevel?: number;
  status?: number;
  startTime?: string;
  endTime?: string;
}): Promise<ApiResponse<PageResponse<AlarmEventItem>>> => {
  return request({
    url: '/alarm-event/list',
    method: 'get',
    params,
    headers: { hideLoading: false }
  });
};

/**
 * 获取报警处置记录列表
 */
export const getAlarmDisposalList = (params?: {
  pageNum?: number;
  pageSize?: number;
  alarmId?: string;
  handler?: string;
  startTime?: string;
  endTime?: string;
}): Promise<ApiResponse<PageResponse<AlarmDisposalItem>>> => {
  return request({
    url: '/alarm-disposal/list',
    method: 'get',
    params,
    headers: { hideLoading: false }
  });
};