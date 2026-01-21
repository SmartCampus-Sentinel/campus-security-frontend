# WebSocket 连接调试指南

## 问题修复

### 原因分析
WebSocket 连接失败，错误 URL：`ws://localhost:8080/ws/api/websocket/login`

这说明 Vite 代理配置中存在冲突：
- `/api` 代理规则被应用
- 导致路径重写错误，变成 `/ws/api/websocket/login`

### 解决方案

#### 修改 1：简化 vite.config.ts 代理配置
**文件**：`vite.config.ts`
```typescript
proxy: {
  '/api': {
    target: 'http://localhost:8080',
    ws: true,  // ✅ 统一支持 HTTP 和 WebSocket
    changeOrigin: true
    // ❌ 移除冲突的 rewrite 和 '/api/websocket' 规则
  }
}
```

**原理**：
- 单个 `/api` 规则代理所有 `/api/*` 请求
- `ws: true` 使其同时支持 WebSocket 连接
- 无需重写路径，直接透传

#### 修改 2：Login.vue 使用相对路径
**文件**：`src/web/pages/login/Login.vue`
```typescript
// ✅ 使用相对路径，通过 Vite 代理自动转发
const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
const host = window.location.host;
const wsUrl = `${protocol}//${host}/api/websocket/login`;

// ❌ 不再使用环境变量 VITE_WS_BASE_URL
```

**连接流程**：
1. 前端：`ws://localhost:5173/api/websocket/login`
2. Vite 代理转发
3. 后端：`ws://localhost:8080/api/websocket/login`

## 测试步骤

### 1. 清除缓存重启
```bash
# 方式 A：停止并重新启动 npm run dev
# 按 Ctrl+C 停止当前开发服务器
# 然后运行：
npm run dev

# 方式 B：清除浏览器缓存
# 按 F12 打开开发者工具
# 按 Ctrl+Shift+Delete 清除缓存
# F5 刷新页面
```

### 2. 验证 WebSocket 连接
打开浏览器开发者工具（F12）：

**Network 标签**：
1. 切换到 "WS" 过滤器
2. 刷新页面
3. 应该看到：`ws://localhost:5173/api/websocket/login`
4. 状态应为：`101 Switching Protocols`（绿色）

**Console 标签**：
应该看到日志：
```
✅ 登录页面WebSocket连接已建立
```

### 3. 完整连接诊断

如果仍有问题，在浏览器控制台执行：

```javascript
// 测试 WebSocket 连接
const wsUrl = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/api/websocket/login`;
console.log('目标 WebSocket URL:', wsUrl);

const testWs = new WebSocket(wsUrl);
testWs.onopen = () => console.log('✅ WebSocket 连接成功');
testWs.onerror = (e) => console.error('❌ WebSocket 连接失败:', e);
testWs.onclose = () => console.log('ℹ️ WebSocket 连接已关闭');
```

## 网络代理流程

### 开发环境
```
┌─────────────────────────────────┐
│   浏览器 (5173)                  │
│  ws://localhost:5173/api/...    │
└──────────────┬──────────────────┘
               │
               ↓
┌─────────────────────────────────┐
│   Vite 开发服务器 代理          │
│   /api → http://localhost:8080  │
│   ws: true                      │
└──────────────┬──────────────────┘
               │
               ↓
┌─────────────────────────────────┐
│   后端服务 (8080)               │
│  ws://localhost:8080/api/...    │
└─────────────────────────────────┘
```

### Docker 环境
```
┌─────────────────────────────────┐
│   前端容器 (5173)               │
│  ws://localhost:5173/api/...    │
│  或 ws://frontend:5173/api/...  │
└──────────────┬──────────────────┘
               │
               ↓
┌─────────────────────────────────┐
│   Nginx 反向代理 (5173)         │
│   /api → backend:8080           │
│   /websocket → backend:8080/api │
└──────────────┬──────────────────┘
               │
               ↓
┌─────────────────────────────────┐
│   后端容器 (8080)               │
│  ws://backend:8080/api/...      │
└─────────────────────────────────┘
```

## 常见错误及解决方案

| 错误信息 | 原因 | 解决方案 |
|---------|------|--------|
| `ws://localhost:8080/ws/api/websocket/login` | 代理路径重写冲突 | ✅ 已修复：移除重写规则 |
| `WebSocket connection failed` | 后端服务未启动 | 检查：`npm run dev` 和 `java -jar` |
| `403 Forbidden` | CORS 或权限问题 | 检查后端 CORS 配置 |
| `401 Unauthorized` | Token 过期 | 重新登录 |

## 相关文件

- [vite.config.ts](./vite.config.ts) ✅ 已修复
- [src/web/pages/login/Login.vue](./src/web/pages/login/Login.vue) ✅ 已修复
- [src/web/api/websocket.ts](./src/web/api/websocket.ts) ✅ 已正确
- [.env](./.env) - 环境变量配置
