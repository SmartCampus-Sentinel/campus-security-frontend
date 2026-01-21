# 前端 API 和 WebSocket 接口重写完成

## 📋 完成清单

✅ **所有 API 接口已重新编写，完全适配后端接口**

### 重写的文件

1. **认证接口** - `src/web/api/login.ts`
   - ✅ `POST /auth/login` - 用户登录
   - ✅ `GET /auth/websocket-info` - 获取 WebSocket 连接信息

2. **用户接口** - `src/web/api/user.ts`
   - ✅ `GET /user/list` - 获取用户列表

3. **设备接口** - `src/web/api/device.ts`
   - ✅ `GET /device-info/list` - 获取设备列表

4. **报警接口** - `src/web/api/alarm.ts`
   - ✅ `GET /alarm-event/list` - 获取报警事件列表
   - ✅ `GET /alarm-disposal/list` - 获取报警处置记录列表
   - ✅ `POST /alarm-event/{id}/handle` - 处理报警

5. **角色接口** - `src/web/api/role.ts`
   - ✅ `GET /role/list` - 获取角色列表

6. **传感器接口** - `src/web/api/sensor.ts`
   - ✅ `GET /sensor-data/list` - 获取传感器数据列表

7. **报告接口** - `src/web/api/report.ts`
   - ✅ `GET /student-report/list` - 获取学生报告列表

8. **WebSocket 服务** - `src/web/api/websocket.ts`
   - ✅ 完整的 WebSocket 连接管理
   - ✅ 自动重连机制（最多 5 次）
   - ✅ 心跳检测（30 秒间隔）
   - ✅ 消息队列支持

9. **WebSocket 管理器** - `src/web/utils/websocketManager.ts`
   - ✅ 全局单例管理
   - ✅ Vue 3 Composition API 集成
   - ✅ 消息订阅/发布模式

---

## 🚀 快速开始

### 1. 用户登录

```typescript
import { login } from '@/api';

// 登录
const response = await login({
  username: 'admin',
  password: 'password123'
});

// 保存 Token
localStorage.setItem('token', response.token);
localStorage.setItem('userId', response.userId);
```

### 2. 建立 WebSocket 连接

```typescript
import { websocketManager } from '@/utils/websocketManager';

const userId = localStorage.getItem('userId');

// 连接 WebSocket
websocketManager.connect(userId);

// 监听报警通知
websocketManager.onMessage('alarm_notification', (data) => {
  console.log('收到报警:', data);
});
```

### 3. 查询数据

```typescript
import { getAlarmList, getDeviceInfoList } from '@/api';

// 获取报警列表
const alarmResponse = await getAlarmList({
  pageNum: 1,
  pageSize: 10
});

// 获取设备列表
const deviceResponse = await getDeviceInfoList({
  pageNum: 1,
  pageSize: 20
});
```

---

## 📖 详细文档

更详细的 API 使用说明，请参考项目根目录的 `API_DOCUMENTATION.md` 文件。

包含以下内容：
- 所有 API 端点详细说明
- WebSocket 消息格式和常见消息类型
- 错误处理方式
- 完整的使用示例
- 常见场景的实现代码

---

## 🔧 关键改进

### 1. API 请求优化
- ✅ 所有 API 端点都已对齐后端接口路径
- ✅ 添加了完整的 TypeScript 类型定义
- ✅ 支持隐藏加载动画的选项
- ✅ 完整的错误处理和日志记录

### 2. WebSocket 增强
- ✅ **自动重连**: 连接断开时自动尝试重新连接（最多 5 次）
- ✅ **心跳检测**: 每 30 秒发送一次心跳包，保持连接活跃
- ✅ **消息队列**: 连接断开期间发送的消息会排队，连接后自动发送
- ✅ **消息订阅**: 支持按消息类型订阅和处理
- ✅ **状态管理**: 提供响应式的连接状态管理

### 3. 开发体验
- ✅ **单例模式**: WebSocketManager 和 WebSocketService 都采用单例模式，保证全局唯一
- ✅ **Composition API**: 提供 `useWebSocket()` Hook，与 Vue 3 无缝集成
- ✅ **详细日志**: 所有关键操作都有日志记录，便于调试

---

## 📡 WebSocket 端点

### 用户专属连接
```
Protocol: ws:// 或 wss://（HTTPS 时）
Endpoint: /websocket/{userId}
Example: ws://localhost:8080/websocket/user123
```

### 登录页通用连接
```
Endpoint: /websocket/login
Example: ws://localhost:8080/websocket/login
```

---

## ⚙️ 配置说明

### 后端服务器配置
```
地址: localhost:8080
API 基础路径: /api
WebSocket 基础路径: /websocket
Swagger UI: http://localhost:8080/api/swagger-ui.html
```

### 前端环境配置 (.env)
```env
VITE_API_BASE_URL=http://localhost:8080/api
```

---

## 🔐 安全特性

- ✅ 所有请求自动附加 Authorization Token
- ✅ 401 错误自动清除 Token 并跳转登录页
- ✅ CORS 跨域请求支持
- ✅ XSS 防护（JSON 解析）

---

## 📊 API 响应格式

### 成功响应
```typescript
{
  code: 200,
  msg: "Success",
  data: {
    // 实际数据
  }
}
```

### 错误响应
```typescript
{
  code: 400 | 401 | 403 | 404 | 500,
  msg: "Error message",
  data?: any
}
```

---

## 🧪 测试建议

1. **登录测试**
   - 使用正确的用户名密码登录
   - 验证 Token 保存成功
   - 检查自动跳转到首页

2. **WebSocket 测试**
   - 登录后自动建立 WebSocket 连接
   - 在浏览器开发者工具 Network 标签中查看 WebSocket 连接
   - 观察心跳包（每 30 秒一次）
   - 测试网络断开后的自动重连

3. **API 请求测试**
   - 测试各个端点的数据获取
   - 验证分页功能
   - 测试筛选和搜索功能
   - 检查错误处理（如 401 错误）

---

## 🐛 调试建议

### 启用详细日志
WebSocket 和 API 所有操作都会输出日志，前缀为：
- `[WebSocket]` - WebSocket 服务日志
- `[WebSocketManager]` - WebSocket 管理器日志

### 查看 WebSocket 连接状态
```typescript
import { useWebSocket } from '@/utils/websocketManager';

const { connectionStatus, isConnected, connectionStatusText } = useWebSocket();

// 在模板中显示
console.log(connectionStatusText.value); // "已连接" | "连接中" | "已断开" etc.
```

### 监控网络请求
打开浏览器开发者工具，在 Network 标签中可以看到：
- HTTP 请求
- WebSocket 连接和消息

---

## 📝 注意事项

1. **Token 管理**
   - Token 保存在 localStorage 中
   - 每个 API 请求都会自动附加 Token
   - Token 过期时系统会自动跳转登录页

2. **WebSocket 连接生命周期**
   - 登录后立即建立连接
   - 页面刷新时会重新连接
   - 用户登出时断开连接

3. **消息处理**
   - 心跳消息会被自动忽略
   - 需要手动订阅关心的消息类型
   - 使用 `onMessage()` 和 `offMessage()` 管理监听

---

## 🔄 更新历史

| 日期 | 版本 | 说明 |
|------|------|------|
| 2026-01-21 | 1.0 | 完成所有 API 和 WebSocket 接口重写 |

---

## 📞 支持

- 查看 Swagger API 文档：http://localhost:8080/api/swagger-ui.html
- 查看详细文档：`API_DOCUMENTATION.md`
- 检查浏览器控制台日志获取调试信息

---

祝编码愉快！🎉
