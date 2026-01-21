# 前后端连接故障排除指南

## 已修复的问题

### 1. ✅ Favicon.ico 404 错误
**问题**：浏览器找不到网站图标
**原因**：`index.html` 未配置 favicon 链接
**解决方案**：
- 在 `index.html` 的 `<head>` 标签中添加 favicon 链接
- 创建 `src/assets/favicon.svg` 文件

### 2. ✅ WebSocket 连接失败
**问题**：`ws://localhost:8080/ws/websocket/login` 连接失败
**原因**：路径错误，后端的 WebSocket 端点是 `/api/websocket/login`，不是 `/ws/websocket/login`

**修复位置**：
- `src/web/pages/login/Login.vue` - 更正 WebSocket URL 路径
- `src/web/api/websocket.ts` - 更正通用 WebSocket 连接 URL 构建
- `vite.config.ts` - 更新 WebSocket 代理配置

### 3. ✅ 环境变量缺失
**问题**：`VITE_WS_BASE_URL` 未定义
**原因**：`.env` 文件中未配置 WebSocket 基础 URL

**修复位置**：
- `.env` - 添加 `VITE_WS_BASE_URL=ws://localhost:8080`
- `.env.docker` - 添加 `VITE_WS_BASE_URL=ws://campus-security-backend:8080`

## 当前配置说明

### 开发环境（本地）
```env
# .env 文件
VITE_API_BASE_URL=http://localhost:8080/api
VITE_WS_BASE_URL=ws://localhost:8080
```

**访问地址**：
- 前端：http://localhost:5173
- 后端 API：http://localhost:8080/api
- WebSocket：ws://localhost:8080/api/websocket/...

### Docker 环境
```env
# .env.docker 文件
VITE_API_BASE_URL=/api
VITE_WS_BASE_URL=ws://campus-security-backend:8080
```

**访问地址**：
- 前端：http://localhost:5173
- 后端 API：http://localhost:8080/api
- WebSocket：ws://campus-security-backend:8080/api/websocket/...

## WebSocket 连接路径规则

### 前端发起的 WebSocket 连接
1. **登录页面**：
   ```javascript
   ws://localhost:8080/api/websocket/login
   ```

2. **用户页面（登录后）**：
   ```javascript
   ws://localhost:8080/api/websocket/{userId}
   ```

### 后端端点配置
- `@ServerEndpoint("/websocket/login")` - 登录页面连接
- `@ServerEndpoint("/websocket/{userId}")` - 用户连接

### Vite 代理配置
```typescript
proxy: {
  '/api/websocket': {
    target: 'ws://localhost:8080',  // 开发环境
    ws: true,
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/api/, '')  // 移除 /api 前缀
  }
}
```

## 测试验证步骤

### 1. 启动后端
```bash
cd campus-security-backend
mvn spring-boot:run
```

### 2. 启动前端
```bash
cd campus-security-frontend
npm install
npm run dev
```

### 3. 检查浏览器控制台
打开浏览器开发者工具（F12），查看：
- Network 标签：确认 WebSocket 连接状态为 `101 Switching Protocols`
- Console 标签：查看日志信息
  ```
  ✅ 登录页面WebSocket连接已建立
  ✅ 收到消息: {...}
  ✅ 连接已建立: ws://localhost:8080/api/websocket/login
  ```

### 4. 验证可访问的资源
- Favicon：浏览器标签页左上角显示图标
- API 请求：Network 标签中显示 `/api/*` 请求状态为 200
- WebSocket：Network 标签中显示 `websocket` 协议连接状态为 101

## 常见问题排查

### Q: WebSocket 仍然连接失败？
**检查清单**：
1. 确认后端服务已启动（http://localhost:8080）
2. 确认 `.env` 文件配置正确
3. 清除浏览器缓存：按 Ctrl+Shift+Delete
4. 重新加载前端：按 F5 或 Ctrl+R
5. 查看浏览器 Network 标签中 WebSocket 连接错误信息

### Q: API 请求返回 404？
**检查清单**：
1. 确认后端路由是否配置了 `/api` 前缀
2. 检查 `application.yml` 中的 `context-path: /api` 配置
3. 验证请求 URL 是否正确

### Q: Docker 中前后端无法通信？
**检查清单**：
1. 确认容器在同一网络中（`campus-security-network`）
2. 使用容器名称而非 `localhost`：`campus-security-backend:8080`
3. 查看 Docker 日志：`docker logs <container_name>`

## 相关文件

- [.env](./.env) - 开发环境变量
- [.env.docker](./.env.docker) - Docker 环境变量
- [vite.config.ts](./vite.config.ts) - Vite 代理配置
- [src/web/pages/login/Login.vue](./src/web/pages/login/Login.vue) - 登录页 WebSocket
- [src/web/api/websocket.ts](./src/web/api/websocket.ts) - WebSocket 服务
