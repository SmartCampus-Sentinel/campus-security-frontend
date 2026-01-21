import { ref, computed } from 'vue';
import WebSocketService, { WebSocketOptions } from '@/api/websocket';

/**
 * WebSocket连接状态枚举
 */
export enum WebSocketConnectionStatus {
  CONNECTING = 0,
  OPEN = 1,
  CLOSING = 2,
  CLOSED = 3
}

/**
 * 全局WebSocket管理器类
 * 提供单例模式和响应式状态管理
 */
class WebSocketManager {
  private wsService: WebSocketService;
  private connectionStatus = ref<WebSocketConnectionStatus>(WebSocketConnectionStatus.CLOSED);
  private userId = ref<string | null>(null);
  private reconnectCount = ref<number>(0);
  private maxReconnectAttempts = 5;
  private listeners = new Map<string, Array<(data: any) => void>>();

  constructor() {
    this.wsService = WebSocketService.getInstance();
  }

  /**
   * 连接到WebSocket服务器
   * @param userId 用户ID
   * @param options 连接配置选项
   */
  connect(userId: string, options?: WebSocketOptions) {
    if (this.isConnected()) {
      console.warn('[WebSocketManager] WebSocket已经连接，无需重复连接');
      return;
    }

    this.userId.value = userId;
    this.connectionStatus.value = WebSocketConnectionStatus.CONNECTING;

    // 合并默认选项和传入选项
    const connectOptions: WebSocketOptions = {
      userId,
      onOpen: (event: Event) => {
        console.log(`[WebSocketManager] 用户 ${userId} 的WebSocket连接已建立`);
        this.connectionStatus.value = WebSocketConnectionStatus.OPEN;
        this.reconnectCount.value = 0;
        if (options?.onOpen) options.onOpen(event);
      },
      onClose: (event: CloseEvent) => {
        console.log(`[WebSocketManager] 用户 ${userId} 的WebSocket连接已关闭`);
        this.connectionStatus.value = WebSocketConnectionStatus.CLOSED;
        if (options?.onClose) options.onClose(event);
      },
      onError: (event: Event) => {
        console.error(`[WebSocketManager] 用户 ${userId} 的WebSocket连接发生错误:`, event);
        this.connectionStatus.value = WebSocketConnectionStatus.CLOSED;
        this.reconnectCount.value++;
        if (options?.onError) options.onError(event);
      },
      onMessage: (event: MessageEvent) => {
        this.handleMessage(event);
        if (options?.onMessage) options.onMessage(event);
      }
    };

    this.wsService.connect(userId, connectOptions);
  }

  /**
   * 断开WebSocket连接
   */
  disconnect() {
    this.wsService.close();
    this.connectionStatus.value = WebSocketConnectionStatus.CLOSED;
    this.userId.value = null;
  }

  /**
   * 发送消息
   * @param data 要发送的数据
   * @returns 是否发送成功
   */
  send(data: any): boolean {
    if (!this.isConnected()) {
      console.warn('[WebSocketManager] WebSocket未连接，无法发送消息');
      return false;
    }
    this.wsService.send(data);
    return true;
  }

  /**
   * 发送特定类型的消息
   * @param type 消息类型
   * @param payload 消息数据
   * @returns 是否发送成功
   */
  sendMessage(type: string, payload: any): boolean {
    if (!this.isConnected()) {
      console.warn('[WebSocketManager] WebSocket未连接，无法发送消息');
      return false;
    }
    this.wsService.sendMessage(type, payload);
    return true;
  }

  /**
   * 监听特定类型的消息
   * @param messageType 消息类型
   * @param callback 回调函数
   */
  onMessage(messageType: string, callback: (data: any) => void) {
    if (!this.listeners.has(messageType)) {
      this.listeners.set(messageType, []);
    }
    const callbacks = this.listeners.get(messageType)!;
    callbacks.push(callback);
  }

  /**
   * 移除消息监听器
   * @param messageType 消息类型
   * @param callback 回调函数
   */
  offMessage(messageType: string, callback: (data: any) => void) {
    if (this.listeners.has(messageType)) {
      const callbacks = this.listeners.get(messageType)!;
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  /**
   * 处理接收到的消息
   * @param event WebSocket消息事件
   */
  private handleMessage(event: MessageEvent) {
    try {
      const messageData = JSON.parse(event.data as string);
      const { type, data } = messageData;

      console.log(`[WebSocketManager] 处理消息类型: ${type}`, data);

      // 触发特定类型的消息监听器
      if (this.listeners.has(type)) {
        const callbacks = this.listeners.get(type)!;
        callbacks.forEach(callback => {
          try {
            callback(data);
          } catch (error) {
            console.error(`[WebSocketManager] 处理消息类型 "${type}" 时发生错误:`, error);
          }
        });
      }
    } catch (error) {
      console.error('[WebSocketManager] 解析WebSocket消息失败:', error);
    }
  }

  /**
   * 检查是否已连接
   */
  isConnected(): boolean {
    return this.wsService.isConnected();
  }

  /**
   * 获取连接状态
   */
  getConnectionStatus(): WebSocketConnectionStatus {
    return this.connectionStatus.value;
  }

  /**
   * 获取当前用户ID
   */
  getCurrentUserId(): string | null {
    return this.userId.value;
  }

  /**
   * 获取连接状态文本描述
   */
  getConnectionStatusText(): string {
    switch (this.connectionStatus.value) {
      case WebSocketConnectionStatus.CONNECTING:
        return '连接中';
      case WebSocketConnectionStatus.OPEN:
        return '已连接';
      case WebSocketConnectionStatus.CLOSING:
        return '关闭中';
      case WebSocketConnectionStatus.CLOSED:
        return '已断开';
      default:
        return '未知状态';
    }
  }
}

// 创建全局单例实例
export const websocketManager = new WebSocketManager();

/**
 * Vue 3 Composition API 风格的 WebSocket Hook
 * 用于在组件中使用WebSocket
 */
export function useWebSocket() {
  const connectionStatus = computed(() => websocketManager.getConnectionStatus());
  const isConnected = computed(() => websocketManager.isConnected());
  const connectionStatusText = computed(() => websocketManager.getConnectionStatusText());
  const currentUserId = computed(() => websocketManager.getCurrentUserId());

  return {
    // 响应式状态
    connectionStatus,
    isConnected,
    connectionStatusText,
    currentUserId,

    // 连接管理方法
    connect: websocketManager.connect.bind(websocketManager),
    disconnect: websocketManager.disconnect.bind(websocketManager),

    // 消息发送方法
    send: websocketManager.send.bind(websocketManager),
    sendMessage: websocketManager.sendMessage.bind(websocketManager),

    // 消息监听方法
    onMessage: websocketManager.onMessage.bind(websocketManager),
    offMessage: websocketManager.offMessage.bind(websocketManager)
  };
}