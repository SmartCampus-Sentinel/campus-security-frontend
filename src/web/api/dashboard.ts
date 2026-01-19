// 导入统一封装的axios实例
import request from './index';
import { ApiResponse } from './types';

// ======================== TS类型定义（贴合校园安防场景） ========================
/**
 * 今日报警趋势数据类型
 */
export interface AlarmTrend {
  // X轴：小时（如 ["08:00", "09:00", ..., "20:00"]）
  xAxis: string[];
  // Y轴：对应小时的报警数（如 [0, 2, 1, 5, ...]）
  yAxis: number[];
}

/**
 * 设备状态分布数据类型
 */
export interface DeviceStatus {
  // 状态名称（如 "在线"、"离线"、"故障"）
  name: string;
  // 对应数量
  value: number;
}

/**
 * 待处理报警列表项类型
 */
export interface PendingAlarmItem {
  // 报警ID
  id: string;
  // 设备名称
  deviceName: string;
  // 报警类型（如 "移动侦测"、"越界报警"、"设备离线"）
  alarmType: string;
  // 报警时间（格式：YYYY-MM-DD HH:mm:ss）
  alarmTime: string;
  // 安装位置（如 "图书馆1楼大厅"）
  location: string;
}

/**
 * 首页看板核心数据类型
 */
export interface DashboardData {
  // 设备总数
  deviceTotal: number;
  // 在线设备数
  deviceOnline: number;
  // 今日报警数
  alarmToday: number;
  // 待处理报警数
  alarmPending: number;
  // 待处理报警列表（最近10条）
  pendingAlarmList: PendingAlarmItem[];
  // 今日报警趋势
  alarmTrend: AlarmTrend;
  // 设备状态分布（饼图数据）
  deviceStatus: DeviceStatus[];
}

// ======================== 接口封装（贴合校园安防业务） ========================
/**
 * 获取首页看板数据
 * @returns 看板核心数据
 */
export function getDashboardData(): Promise<ApiResponse<DashboardData>> {
  return request({
    url: '/dashboard/overview', // 后端接口路径（可根据实际调整）
    method: 'get',
    headers: {
      hideLoading: false // 显示加载动画（全局请求拦截器会处理）
    }
  });
}

/**
 * 刷新看板数据（可选：用于手动刷新按钮）
 * @returns 最新看板数据
 */
export function refreshDashboardData(): Promise<ApiResponse<DashboardData>> {
  return request({
    url: '/dashboard/refresh',
    method: 'post',
    headers: {
      hideLoading: true // 手动刷新时可关闭全局加载（避免重复加载）
    }
  });
}