# 校园安防前端 API 和 WebSocket 接口文档

## 概述

本文档描述了前端与后端的交互接口，包括 REST API 和 WebSocket 实时通信接口。所有 API 请求基于 HTTP/HTTPS，所有 WebSocket 连接均支持自动重连和心跳检测。

---

## 服务器配置

- **服务器地址**: `http://localhost:8080`
- **API 基础路径**: `/api`
- **WebSocket 基础路径**: `/websocket`
- **Swagger 文档**: `http://localhost:8080/api/swagger-ui.html`

---

## REST API 接口

### 1. 认证接口 (AuthController)

#### 1.1 用户登录
```
POST /auth/login
```

**请求参数:**
```typescript
{
  username: string;  // 用户名
  password: string;  // 密码
}
```

**响应数据:**
```typescript
{
  token: string;           // JWT Token
  userId: string;          // 用户ID
  username: string;        // 用户名
  email?: string;          // 邮箱
  phone?: string;          // 电话
  role: string;            // 角色
  permissions?: string[];  // 权限列表
}
```

**前端使用示例:**
```typescript
import { login } from '@/api';

const response = await login({
  username: 'admin',
  password: 'password123'
});

// 保存 token
localStorage.setItem('token', response.token);
localStorage.setItem('userId', response.userId);
```

#### 1.2 获取 WebSocket 连接信息
```
GET /auth/websocket-info
```

**响应数据:**
```typescript
{
  url: string;      // WebSocket 连接 URL
  userId: string;   // 用户ID
  timestamp: number;// 时间戳
}
```

**前端使用示例:**
```typescript
import { getWebSocketInfo } from '@/api';

const wsInfo = await getWebSocketInfo();
// 使用返回的信息建立 WebSocket 连接
```

---

### 2. 用户接口 (UserController)

#### 2.1 获取用户列表
```
GET /user/list
```

**查询参数:**
```typescript
{
  pageNum?: number;    // 页码，默认 1
  pageSize?: number;   // 每页数量，默认 10
  username?: string;   // 用户名搜索
  role?: string;       // 角色筛选
  status?: number;     // 状态筛选 (0-禁用, 1-启用)
}
```

**响应数据:**
```typescript
{
  list: UserItem[];  // 用户列表
  total: number;     // 总数
  pageNum: number;   // 当前页
  pageSize: number;  // 每页数量
}
```

**前端使用示例:**
```typescript
import { getUserList } from '@/api';

const response = await getUserList({
  pageNum: 1,
  pageSize: 10,
  username: 'admin'
});

console.log(response.list); // 用户列表
```

---

### 3. 设备接口 (DeviceInfoController)

#### 3.1 获取设备列表
```
GET /device-info/list
```

**查询参数:**
```typescript
{
  pageNum?: number;      // 页码
  pageSize?: number;     // 每页数量
  deviceName?: string;   // 设备名称搜索
  deviceType?: string;   // 设备类型筛选
  status?: number;       // 状态筛选 (0-离线, 1-在线, 2-异常)
}
```

**响应数据:**
```typescript
{
  list: DeviceItem[];  // 设备列表
  total: number;       // 总数
  pageNum: number;     // 当前页
  pageSize: number;    // 每页数量
}
```

**前端使用示例:**
```typescript
import { getDeviceInfoList } from '@/api';

const response = await getDeviceInfoList({
  pageNum: 1,
  pageSize: 20,
  status: 1  // 获取在线设备
});
```

---

### 4. 报警事件接口 (AlarmEventController)

#### 4.1 获取报警事件列表
```
GET /alarm-event/list
```

**查询参数:**
```typescript
{
  pageNum?: number;      // 页码
  pageSize?: number;     // 每页数量
  alarmType?: string;    // 报警类型筛选
  alarmLevel?: number;   // 报警级别筛选 (1-低, 2-中, 3-高)
  startTime?: string;    // 开始时间 (YYYY-MM-DD HH:mm:ss)
  endTime?: string;      // 结束时间
}
```

**响应数据:**
```typescript
{
  list: AlarmEventItem[];  // 报警事件列表
  total: number;           // 总数
  pageNum: number;         // 当前页
  pageSize: number;        // 每页数量
}
```

**前端使用示例:**
```typescript
import { getAlarmList } from '@/api';

const response = await getAlarmList({
  pageNum: 1,
  pageSize: 10,
  alarmLevel: 3,  // 获取高级别报警
  startTime: '2026-01-01 00:00:00',
  endTime: '2026-01-31 23:59:59'
});
```

#### 4.2 更新报警状态
```
POST /alarm-event/{id}/handle
```

**请求参数:**
```typescript
{
  handleStatus: number;  // 处理状态 (0-待处理, 1-已处理, 2-已忽略)
  handleDesc?: string;   // 处理说明
  handlePerson?: string; // 处理人
}
```

**前端使用示例:**
```typescript
import { handleAlarm } from '@/api';

await handleAlarm({
  id: 'alarm-123',
  handleStatus: 1,  // 标记为已处理
  handleDesc: '已处理，无安全隐患'
});
```

---

### 5. 报警处置接口 (AlarmDisposalController)

#### 5.1 获取报警处置记录列表
```
GET /alarm-disposal/list
```

**查询参数:**
```typescript
{
  pageNum?: number;      // 页码
  pageSize?: number;     // 每页数量
  alarmId?: string;      // 报警ID筛选
  handler?: string;      // 处理人筛选
  startTime?: string;    // 开始时间
  endTime?: string;      // 结束时间
}
```

**前端使用示例:**
```typescript
import { getAlarmDisposalList } from '@/api';

const response = await getAlarmDisposalList({
  pageNum: 1,
  pageSize: 10
});
```

---

### 6. 角色接口 (RoleController)

#### 6.1 获取角色列表
```
GET /role/list
```

**查询参数:**
```typescript
{
  pageNum?: number;   // 页码
  pageSize?: number;  // 每页数量
  roleName?: string;  // 角色名称搜索
  status?: number;    // 状态筛选 (0-禁用, 1-启用)
}
```

**前端使用示例:**
```typescript
import { getRoleList } from '@/api';

const response = await getRoleList({
  pageNum: 1,
  pageSize: 10
});
```

---

### 7. 传感器数据接口 (SensorDataController)

#### 7.1 获取传感器数据列表
```
GET /sensor-data/list
```

**查询参数:**
```typescript
{
  pageNum?: number;      // 页码
  pageSize?: number;     // 每页数量
  deviceId?: string;     // 设备ID筛选
  sensorType?: string;   // 传感器类型筛选
  startTime?: string;    // 开始时间
  endTime?: string;      // 结束时间
}
```

**前端使用示例:**
```typescript
import { getSensorDataList } from '@/api';

const response = await getSensorDataList({
  pageNum: 1,
  pageSize: 10,
  sensorType: 'temperature'
});
```

---

### 8. 学生报告接口 (StudentReportController)

#### 8.1 获取学生报告列表
```
GET /student-report/list
```

**查询参数:**
```typescript
{
  pageNum?: number;      // 页码
  pageSize?: number;     // 每页数量
  studentId?: string;    // 学生ID筛选
  reportType?: string;   // 报告类型筛选
  status?: number;       // 状态筛选 (0-未处理, 1-处理中, 2-已处理)
  startTime?: string;    // 开始时间
  endTime?: string;      // 结束时间
}
```

**前端使用示例:**
```typescript
import { getStudentReportList } from '@/api';

const response = await getStudentReportList({
  pageNum: 1,
  pageSize: 10,
  status: 0  // 获取未处理报告
});
```

---

## WebSocket 实时通信接口

### 端点

#### 1. 用户专属 WebSocket 连接
```
/websocket/{userId}
```

- 用于建立用户与服务器的双向实时通信
- 支持自动重连（最多 5 次，延迟逐次增加）
- 支持心跳检测（30 秒间隔）
- 支持消息队列（连接前的消息将在连接后自动发送）

#### 2. 登录页面通用 WebSocket 连接
```
/websocket/login
```

- 用于登录页面的实时通信
- 不需要用户ID

### 前端 WebSocket 使用方式

#### 方式 1：使用 WebSocketManager 单例（推荐）

```typescript
import { websocketManager, useWebSocket } from '@/utils/websocketManager';

// 在登录成功后连接 WebSocket
const userId = localStorage.getItem('userId');
websocketManager.connect(userId, {
  onOpen: () => {
    console.log('WebSocket 已连接');
  },
  onClose: () => {
    console.log('WebSocket 已断开');
  },
  onError: (event) => {
    console.error('WebSocket 错误:', event);
  },
  onMessage: (event) => {
    console.log('收到消息:', event.data);
  }
});

// 发送消息
websocketManager.send({
  type: 'alarm_ack',
  data: { alarmId: '123' }
});

// 发送特定类型消息
websocketManager.sendMessage('heartbeat', { timestamp: Date.now() });

// 监听特定类型消息
websocketManager.onMessage('alarm_notification', (data) => {
  console.log('收到报警通知:', data);
  // 处理报警通知...
});

// 断开连接
websocketManager.disconnect();
```

#### 方式 2：在 Vue 组件中使用 Composition API

```typescript
import { useWebSocket } from '@/utils/websocketManager';

export default {
  setup() {
    const {
      connectionStatus,
      isConnected,
      connectionStatusText,
      connect,
      disconnect,
      send,
      sendMessage,
      onMessage,
      offMessage
    } = useWebSocket();

    // 连接
    const userId = localStorage.getItem('userId');
    connect(userId);

    // 监听消息
    const handleAlarmNotification = (data) => {
      console.log('报警通知:', data);
    };

    onMessage('alarm_notification', handleAlarmNotification);

    // 组件卸载时移除监听
    onBeforeUnmount(() => {
      offMessage('alarm_notification', handleAlarmNotification);
      disconnect();
    });

    return {
      connectionStatus,
      isConnected,
      connectionStatusText
    };
  }
};
```

### WebSocket 消息格式

#### 请求消息格式
```typescript
{
  type: string;        // 消息类型 (如: 'alarm_ack', 'device_status')
  data: any;           // 消息数据
  timestamp?: number;  // 时间戳（自动生成，可选）
  id?: string;         // 消息ID（自动生成，可选）
}
```

#### 响应消息格式
```typescript
{
  type: string;        // 消息类型
  data: any;           // 消息数据
  timestamp: number;   // 时间戳
  id?: string;         // 消息ID
}
```

### 常见 WebSocket 消息类型

| 消息类型 | 方向 | 说明 |
|---------|------|------|
| `heartbeat` | 双向 | 心跳检测消息 |
| `alarm_notification` | 服务器→客户端 | 报警通知 |
| `alarm_ack` | 客户端→服务器 | 报警已读确认 |
| `device_status_change` | 服务器→客户端 | 设备状态变化通知 |
| `sensor_data_update` | 服务器→客户端 | 传感器数据更新 |
| `user_login` | 客户端→服务器 | 用户登录通知 |
| `user_logout` | 客户端→服务器 | 用户登出通知 |

---

## 错误处理

### HTTP 响应错误码

所有 API 响应遵循以下格式:

```typescript
{
  code: number;      // 业务错误码
  msg: string;       // 错误信息
  data?: any;        // 响应数据（仅在成功时）
}
```

### 常见错误码

| 错误码 | 说明 |
|-------|------|
| 200 | 成功 |
| 400 | 请求参数错误 |
| 401 | 未授权/Token 过期 |
| 403 | 权限不足 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

### 前端错误处理

```typescript
import { getUserList } from '@/api';

try {
  const response = await getUserList();
  console.log(response);
} catch (error) {
  if (error.response?.status === 401) {
    // Token 过期，跳转登录页
    router.push('/login');
  } else {
    // 其他错误，已由全局拦截器处理
    console.error('请求失败:', error);
  }
}
```

---

## 环境配置

### .env 文件配置

```env
# API 基础 URL
VITE_API_BASE_URL=http://localhost:8080/api

# WebSocket 基础 URL（可选，会自动从当前域名推导）
# VITE_WS_BASE_URL=ws://localhost:8080
```

---

## 常见使用场景

### 场景 1：登录流程

```typescript
import { login, getWebSocketInfo } from '@/api';
import { websocketManager } from '@/utils/websocketManager';

// 1. 用户登录
const loginResponse = await login({
  username: 'admin',
  password: 'password123'
});

// 2. 保存 token 和用户信息
localStorage.setItem('token', loginResponse.token);
localStorage.setItem('userId', loginResponse.userId);

// 3. 获取 WebSocket 连接信息
const wsInfo = await getWebSocketInfo();

// 4. 建立 WebSocket 连接
websocketManager.connect(loginResponse.userId);

// 5. 跳转到首页
router.push('/dashboard');
```

### 场景 2：报警处理流程

```typescript
import { getAlarmList, handleAlarm } from '@/api';
import { websocketManager } from '@/utils/websocketManager';

// 1. 获取报警列表
const alarmListResponse = await getAlarmList({
  pageNum: 1,
  pageSize: 10
});

// 2. 监听服务器推送的报警通知
websocketManager.onMessage('alarm_notification', async (data) => {
  console.log('收到新报警:', data);
  
  // 3. 更新报警列表（或在收到通知时刷新）
  const updatedList = await getAlarmList({
    pageNum: 1,
    pageSize: 10
  });
});

// 4. 处理报警
await handleAlarm({
  id: 'alarm-123',
  handleStatus: 1,  // 标记为已处理
  handleDesc: '已检查，无问题'
});
```

### 场景 3：实时设备监控

```typescript
import { getDeviceInfoList } from '@/api';
import { websocketManager } from '@/utils/websocketManager';

// 获取初始设备列表
const devicesResponse = await getDeviceInfoList({
  pageNum: 1,
  pageSize: 50
});

// 监听设备状态变化
websocketManager.onMessage('device_status_change', (data) => {
  console.log('设备状态变化:', data);
  // 更新本地设备列表
  // 如果设备状态变为离线或异常，显示警告
});

// 监听传感器数据更新
websocketManager.onMessage('sensor_data_update', (data) => {
  console.log('传感器数据更新:', data);
  // 更新图表或实时数据显示
});
```

---

## API 调用示例

### 完整的组件示例

```vue
<template>
  <div>
    <h1>设备列表</h1>
    <el-table :data="deviceList" stripe>
      <el-table-column prop="deviceName" label="设备名称" />
      <el-table-column prop="status" label="状态" />
      <el-table-column prop="location" label="位置" />
    </el-table>
    <el-pagination
      :current-page="pageNum"
      :page-size="pageSize"
      :total="total"
      @current-change="pageNum = $event"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { getDeviceInfoList } from '@/api';

const deviceList = ref([]);
const pageNum = ref(1);
const pageSize = ref(10);
const total = ref(0);

const loadDeviceList = async () => {
  try {
    const response = await getDeviceInfoList({
      pageNum: pageNum.value,
      pageSize: pageSize.value
    });
    deviceList.value = response.list;
    total.value = response.total;
  } catch (error) {
    console.error('加载设备列表失败:', error);
  }
};

onMounted(() => {
  loadDeviceList();
});

watch(() => pageNum.value, () => {
  loadDeviceList();
});
</script>
```

---

## 版本历史

| 版本 | 日期 | 说明 |
|------|------|------|
| 1.0 | 2026-01-21 | 初始版本，支持所有核心 API 和 WebSocket 接口 |

---

## 支持

有任何问题或建议，请联系开发团队或查看 Swagger 文档：
`http://localhost:8080/api/swagger-ui.html`
