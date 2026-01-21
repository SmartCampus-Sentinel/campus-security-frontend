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

// WebSocket相关类型接口
export interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: number;
  userId?: string;
}
