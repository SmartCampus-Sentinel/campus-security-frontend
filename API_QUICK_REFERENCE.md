# 🎯 API 快速参考卡片

## 所有 API 端点一览表

| 功能 | 方法 | 端点 | 文件 |
|------|------|------|------|
| **登录** | POST | `/auth/login` | `login.ts` |
| **WebSocket 信息** | GET | `/auth/websocket-info` | `login.ts` |
| **用户列表** | GET | `/user/list` | `user.ts` |
| **设备列表** | GET | `/device-info/list` | `device.ts` |
| **报警列表** | GET | `/alarm-event/list` | `alarm.ts` |
| **报警处置** | POST | `/alarm-event/{id}/handle` | `alarm.ts` |
| **报警处置记录** | GET | `/alarm-disposal/list` | `alarm.ts` |
| **角色列表** | GET | `/role/list` | `role.ts` |
| **传感器数据** | GET | `/sensor-data/list` | `sensor.ts` |
| **学生报告** | GET | `/student-report/list` | `report.ts` |

---

## 🔑 核心代码片段

### 登录
```typescript
import { login } from '@/api';

const response = await login({
  username: 'admin',
  password: 'password123'
});
localStorage.setItem('token', response.token);
```

### WebSocket 连接
```typescript
import { websocketManager } from '@/utils/websocketManager';

websocketManager.connect(userId, {
  onOpen: () => console.log('连接成功'),
  onMessage: (event) => console.log('消息:', event.data)
});
```

### 发送 WebSocket 消息
```typescript
// 方法 1: 发送对象
websocketManager.send({
  type: 'alarm_ack',
  data: { alarmId: '123' }
});

// 方法 2: 发送特定类型
websocketManager.sendMessage('alarm_ack', { alarmId: '123' });
```

### 监听 WebSocket 消息
```typescript
websocketManager.onMessage('alarm_notification', (data) => {
  console.log('收到报警:', data);
});
```

### 获取报警列表
```typescript
import { getAlarmList } from '@/api';

const response = await getAlarmList({
  pageNum: 1,
  pageSize: 10,
  alarmLevel: 3
});
```

### 处理报警
```typescript
import { handleAlarm } from '@/api';

await handleAlarm({
  id: 'alarm-123',
  handleStatus: 1,  // 0-待处理, 1-已处理, 2-已忽略
  handleDesc: '已处理'
});
```

### 在 Vue 组件中使用 WebSocket Hook
```typescript
import { useWebSocket } from '@/utils/websocketManager';

const { 
  isConnected,      // 计算属性：是否已连接
  connect,          // 方法：连接
  disconnect,       // 方法：断开
  onMessage,        // 方法：监听消息
  offMessage        // 方法：移除监听
} = useWebSocket();

// 连接
connect(userId);

// 监听
onMessage('alarm_notification', handleAlarm);

// 卸载时断开
onBeforeUnmount(() => {
  offMessage('alarm_notification', handleAlarm);
  disconnect();
});
```

---

## 🗂️ 文件结构

```
src/web/
├── api/
│   ├── index.ts              # 主入口，axios 实例和导出
│   ├── types.ts              # 通用类型定义
│   ├── login.ts              # 登录和认证
│   ├── user.ts               # 用户相关
│   ├── device.ts             # 设备相关
│   ├── alarm.ts              # 报警相关
│   ├── role.ts               # 角色相关
│   ├── sensor.ts             # 传感器相关
│   ├── report.ts             # 报告相关
│   ├── dashboard.ts          # 仪表板相关
│   ├── websocket.ts          # WebSocket 服务
│   └── loginLog.ts           # 登录日志
└── utils/
    └── websocketManager.ts   # WebSocket 管理器

文档:
├── API_DOCUMENTATION.md      # 详细文档
├── API_REWRITE_SUMMARY.md   # 重写总结
└── API_QUICK_REFERENCE.md   # 快速参考（本文件）
```

---

## 📡 WebSocket 消息类型

### 系统消息
| 类型 | 方向 | 说明 |
|------|------|------|
| `heartbeat` | 双向 | 心跳检测 |

### 报警相关
| 类型 | 方向 | 说明 |
|------|------|------|
| `alarm_notification` | S→C | 报警通知 |
| `alarm_ack` | C→S | 报警已读 |
| `alarm_update` | S→C | 报警更新 |

### 设备相关
| 类型 | 方向 | 说明 |
|------|------|------|
| `device_status_change` | S→C | 设备状态变化 |
| `device_online` | S→C | 设备上线 |
| `device_offline` | S→C | 设备离线 |

### 传感器相关
| 类型 | 方向 | 说明 |
|------|------|------|
| `sensor_data_update` | S→C | 传感器数据更新 |
| `sensor_alert` | S→C | 传感器告警 |

### 用户相关
| 类型 | 方向 | 说明 |
|------|------|------|
| `user_login` | C→S | 用户登录 |
| `user_logout` | C→S | 用户登出 |
| `user_online` | S→C | 用户在线状态 |

**说明**: S→C (服务器→客户端), C→S (客户端→服务器)

---

## ⚠️ 常见错误处理

### 401 - Token 过期
```typescript
// 已自动处理！系统会：
// 1. 清除本地 Token
// 2. 显示错误消息
// 3. 跳转到登录页
```

### 403 - 权限不足
```typescript
// 用户权限不足，无法执行此操作
ElMessage.error('权限不足，无法执行此操作');
```

### 网络断开时 WebSocket 自动重连
```typescript
// WebSocket 会自动尝试重连（最多 5 次）
// 重连延迟: 5s, 10s, 15s, 20s, 25s
// 连接成功后待发送消息会自动发送
```

---

## 🔄 常见工作流

### 1️⃣ 页面初始化流程
```typescript
// 1. 检查 Token
if (!localStorage.getItem('token')) {
  router.push('/login');
}

// 2. 建立 WebSocket
const userId = localStorage.getItem('userId');
websocketManager.connect(userId);

// 3. 加载初始数据
const alarmData = await getAlarmList({ pageNum: 1, pageSize: 10 });
const deviceData = await getDeviceInfoList({ pageNum: 1, pageSize: 20 });

// 4. 订阅实时消息
websocketManager.onMessage('alarm_notification', handleNewAlarm);
websocketManager.onMessage('device_status_change', handleDeviceChange);
```

### 2️⃣ 实时报警处理
```typescript
// 监听报警
websocketManager.onMessage('alarm_notification', async (data) => {
  // 显示通知
  ElMessage.warning(`新报警：${data.alarmType}`);
  
  // 更新列表
  const updated = await getAlarmList({ pageNum: 1, pageSize: 10 });
  alarmList.value = updated.list;
  
  // 发送已读确认
  websocketManager.sendMessage('alarm_ack', {
    alarmId: data.id,
    userId: userId
  });
});
```

### 3️⃣ 报警处理流程
```typescript
// 1. 用户点击处理按钮
async function handleAlarmClick(alarmId: string) {
  // 2. 显示处理对话框
  const result = await showHandleDialog(alarmId);
  
  // 3. 调用 API 处理
  await handleAlarm({
    id: alarmId,
    handleStatus: 1,      // 标记为已处理
    handleDesc: result.description,
    handlePerson: currentUser.name
  });
  
  // 4. 刷新列表
  const updated = await getAlarmList({ pageNum: 1, pageSize: 10 });
  alarmList.value = updated.list;
  
  // 5. 显示成功消息
  ElMessage.success('报警已处理');
}
```

---

## 📊 响应数据示例

### 列表响应
```typescript
{
  list: [
    { id: '1', name: 'Device 1', status: 1 },
    { id: '2', name: 'Device 2', status: 0 }
  ],
  total: 2,
  pageNum: 1,
  pageSize: 10
}
```

### 单个对象响应
```typescript
{
  id: '123',
  name: 'Device Name',
  status: 1,
  // ... 更多字段
}
```

### WebSocket 消息
```typescript
{
  type: 'alarm_notification',
  data: {
    id: 'alarm-123',
    alarmType: 'motion_detection',
    alarmLevel: 3,
    deviceName: 'Camera 1',
    location: 'Main Entrance',
    alarmTime: '2026-01-21 10:30:45'
  },
  timestamp: 1674283845123,
  id: 'msg-abc123'
}
```

---

## 🔍 调试技巧

### 查看 WebSocket 连接状态
```typescript
import { websocketManager } from '@/utils/websocketManager';

console.log(websocketManager.getConnectionStatus());  // 连接状态
console.log(websocketManager.getCurrentUserId());     // 当前用户
console.log(websocketManager.isConnected());          // 是否已连接
```

### 查看请求/响应日志
- 打开浏览器开发者工具
- 切换到 Network 标签
- 查看 HTTP 请求和 WebSocket 消息
- 所有 API 操作都会输出到 Console

### 手动发送测试消息
```typescript
websocketManager.sendMessage('test', {
  data: 'test message',
  timestamp: Date.now()
});
```

---

## 🎓 学习资源

| 资源 | 链接/路径 |
|------|----------|
| 详细文档 | `API_DOCUMENTATION.md` |
| 重写总结 | `API_REWRITE_SUMMARY.md` |
| Swagger API 文档 | http://localhost:8080/api/swagger-ui.html |
| TypeScript 类型 | `src/web/api/types.ts` |

---

## ✅ 检查清单

初始化项目时确保：

- [ ] 后端服务运行在 `http://localhost:8080`
- [ ] Token 已保存到 localStorage
- [ ] WebSocket 已自动连接
- [ ] 浏览器控制台无错误
- [ ] Network 标签可见 WebSocket 连接
- [ ] API 请求都有 Authorization header

---

## 📞 获取帮助

1. **查看日志**: 浏览器 Console 会输出所有操作日志
2. **查看网络**: Network 标签查看请求和 WebSocket 消息
3. **查看文档**: 参考 `API_DOCUMENTATION.md`
4. **查看 Swagger**: http://localhost:8080/api/swagger-ui.html

---

*最后更新: 2026-01-21*
