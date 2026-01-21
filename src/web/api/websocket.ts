/**
 * WebSocket连接配置选项
 */
export interface WebSocketOptions {
  userId?: string;
  onOpen?: (event: Event) => void;
  onClose?: (event: CloseEvent) => void;
  onError?: (event: Event) => void;
  onMessage?: (event: MessageEvent) => void;
}

/**
 * WebSocket消息格式定义
 */
export interface WebSocketMessage {
  type: string;
  data: any;
  timestamp?: number;
  id?: string;
}

/**
 * 单例 WebSocket 服务类
 * 支持自动重连、心跳检测、消息队列等功能
 */
class WebSocketService {
  private static instance: WebSocketService;
  private ws: WebSocket | null = null;
  private url: string = '';
  private options: WebSocketOptions = {};
  private reconnectTimer: NodeJS.Timeout | null = null;
  private maxReconnectAttempts: number = 5;
  private reconnectAttempts: number = 0;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private heartbeatInterval: number = 30000; // 30秒心跳间隔
  private userId: string | null = null;
  private messageQueue: WebSocketMessage[] = []; // 待发送消息队列

  /**
   * 获取单例实例
   */
  public static getInstance(): WebSocketService {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService();
    }
    return WebSocketService.instance;
  }

  /**
   * 连接到WebSocket服务器
   * @param userId 用户ID，用于构建连接URL
   * @param options 连接配置选项
   */
  public connect(userId: string, options: WebSocketOptions = {}) {
    // 如果已有连接，则先关闭
    if (this.ws) {
      this.close();
    }

    this.userId = userId;
    this.options = options;

    // 构建WebSocket连接URL，包含 /api 路径
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    this.url = `${protocol}//${host}/api/websocket/${userId}`;

    try {
      this.ws = new WebSocket(this.url);
      console.log(`[WebSocket] 正在连接: ${this.url}`);

      this.ws.onopen = (event) => {
        console.log(`[WebSocket] 连接已建立: ${this.url}`);
        this.reconnectAttempts = 0; // 重置重连次数
        this.startHeartbeat(); // 开始心跳检测
        this.flushMessageQueue(); // 发送待发送消息
        if (options.onOpen) {
          options.onOpen(event);
        }
      };

      this.ws.onmessage = (event) => {
        try {
          // 尝试解析JSON消息
          const messageData: WebSocketMessage = JSON.parse(event.data as string);
          if (messageData.type === 'heartbeat') {
            // 忽略心跳响应
            return;
          }
          console.log(`[WebSocket] 收到消息:`, messageData);
        } catch (e) {
          // 如果不是JSON格式的消息，按原样处理
          console.log(`[WebSocket] 收到非JSON格式消息:`, event.data);
        }

        if (options.onMessage) {
          options.onMessage(event);
        }
      };

      this.ws.onerror = (event) => {
        console.error(`[WebSocket] 连接错误:`, event);
        if (options.onError) {
          options.onError(event);
        }
      };

      this.ws.onclose = (event) => {
        console.log(`[WebSocket] 连接已关闭`, event);
        this.stopHeartbeat(); // 停止心跳检测

        if (options.onClose) {
          options.onClose(event);
        }

        // 尝试重连（如果未超过最大重连次数）
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnect(userId, options);
        } else {
          console.error(`[WebSocket] 达到最大重连尝试次数 (${this.maxReconnectAttempts}), 停止重连`);
        }
      };
    } catch (error) {
      console.error(`[WebSocket] 连接失败:`, error);
      if (options.onError) {
        options.onError(error as Event);
      }
      // 尝试重连
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnect(userId, options);
      }
    }
  }

  /**
   * 发送心跳消息
   */
  private sendHeartbeat() {
    if (this.isConnected()) {
      this.send({ type: 'heartbeat', data: { timestamp: Date.now() } });
    }
  }

  /**
   * 开始心跳检测
   */
  private startHeartbeat() {
    this.stopHeartbeat(); // 先停止现有心跳
    this.heartbeatTimer = setInterval(() => {
      this.sendHeartbeat();
    }, this.heartbeatInterval);
  }

  /**
   * 停止心跳检测
   */
  private stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  /**
   * 发送数据
   * @param data 要发送的数据对象或字符串
   */
  public send(data: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      // 如果发送的是对象，添加时间戳和ID
      let messageToSend = data;
      if (typeof data === 'object' && data !== null && !data.id) {
        messageToSend = {
          ...data,
          timestamp: Date.now(),
          id: this.generateId()
        };
      }

      this.ws.send(JSON.stringify(messageToSend));
      console.log(`[WebSocket] 已发送消息:`, messageToSend);
    } else {
      console.warn(`[WebSocket] 未连接，消息已加入队列`);
      this.messageQueue.push(data);
    }
  }

  /**
   * 发送特定类型的消息
   * @param type 消息类型
   * @param payload 消息数据
   */
  public sendMessage(type: string, payload: any): void {
    const message: WebSocketMessage = {
      type,
      data: payload,
      timestamp: Date.now(),
      id: this.generateId()
    };
    this.send(message);
  }

  /**
   * 生成唯一ID
   */
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  /**
   * 发送待发送消息队列中的所有消息
   */
  private flushMessageQueue() {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      if (message) {
        this.send(message);
      }
    }
  }

  /**
   * 关闭WebSocket连接
   */
  public close() {
    this.stopHeartbeat(); // 关闭前停止心跳

    if (this.ws) {
      this.ws.close();
      this.ws = null;

      if (this.reconnectTimer) {
        clearTimeout(this.reconnectTimer);
        this.reconnectTimer = null;
      }
    }

    this.userId = null;
    this.messageQueue = []; // 清空待发送消息队列
    console.log(`[WebSocket] 连接已断开`);
  }

  /**
   * 重连
   */
  private reconnect(userId: string, options: WebSocketOptions) {
    // 取消之前的重连定时器
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    this.reconnectAttempts++;
    const delayMs = 5000 * this.reconnectAttempts;
    console.log(`[WebSocket] 将在 ${delayMs}ms 后进行第 ${this.reconnectAttempts} 次重连尝试`);

    // 设置重连定时器
    this.reconnectTimer = setTimeout(() => {
      console.log(`[WebSocket] 正在尝试重新连接...`);
      this.connect(userId, options);
    }, delayMs);
  }

  /**
   * 检查是否已连接
   */
  public isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  /**
   * 获取WebSocket就绪状态
   */
  public getReadyState(): number | null {
    return this.ws ? this.ws.readyState : null;
  }

  /**
   * 获取当前用户ID
   */
  public getCurrentUserId(): string | null {
    return this.userId;
  }
}

export default WebSocketService;
