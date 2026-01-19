// 通用响应类型接口
export interface ApiResponse<T = any> {
  code: number;
  msg: string;
  data: T;
}

// 分页响应类型接口
export interface PageResponse<T = any> {
  list: T[];
  total: number;
  pageNum: number;
  pageSize: number;
}