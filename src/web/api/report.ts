import request from './index';
import { ApiResponse, PageResponse } from './types';

/**
 * 学生报告接口
 */
export interface StudentReportItem {
  id: string;
  studentId: string;
  studentName: string;
  reportType: string;
  reportContent: string;
  reportTime: string;
  status: number; // 0-未处理 1-处理中 2-已处理
  handler?: string;
  handleTime?: string;
  handleResult?: string;
}

/**
 * 获取学生报告列表
 * @param params 查询参数（分页、筛选）
 * @returns 学生报告列表
 */
export const getStudentReportList = (params?: {
  pageNum?: number;
  pageSize?: number;
  studentId?: string;
  studentName?: string;
  reportType?: string;
  status?: number;
  startTime?: string;
  endTime?: string;
}): Promise<ApiResponse<PageResponse<StudentReportItem>>> => {
  return request({
    url: '/student-report/list',
    method: 'get',
    params,
    headers: { hideLoading: false }
  });
};