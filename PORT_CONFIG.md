# 前端端口配置说明

本文档详细说明了前端项目的端口配置选项。

## 环境变量配置

### 开发环境配置

在 `.env.development` 文件中可以配置以下变量：

| 变量名 | 默认值 | 说明 |
|--------|--------|------|
| VITE_PORT | 5173 | 前端开发服务器端口 |
| VITE_API_BASE_URL | http://localhost:8080/api | 前端请求API的基础URL |
| VITE_API_TARGET | http://localhost:8080 | 代理目标地址，用于解决跨域问题 |
| VITE_WS_BASE_URL | ws://localhost:8080/ws | WebSocket连接地址 |
| VITE_WS_TARGET | ws://localhost:8080 | WebSocket代理目标地址 |

## Vite配置说明

在 `vite.config.ts` 中配置了以下服务器选项：

- `host`: 设置为 '0.0.0.0' 允许外部访问
- `port`: 从环境变量 VITE_PORT 获取端口，默认为 5173
- `strictPort`: 设置为 false，如果端口被占用会自动尝试下一个可用端口
- `proxy`: 配置了 `/api` 和 `/ws` 的代理规则

## 使用方法

### 修改前端开发端口

编辑 `.env.development` 文件：
```bash
VITE_PORT=3000  # 将前端端口改为3000
```

### 修改后端API地址

当后端不在 localhost:8080 时，编辑 `.env.development` 文件：
```bash
VITE_API_TARGET=http://your-backend-server:8080
VITE_WS_TARGET=ws://your-backend-server:8080
```

## 启动命令

```bash
# 启动开发服务器
npm run dev:web
```