import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  // 禁用oxc解析器，避免TS配置解析错误
  // 插件配置
  plugins: [vue()],
  // 路径别名配置（@指向src/web）
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src/web'),
    },
  },
  // 开发服务器配置
  server: {
    host: '0.0.0.0',   // 允许外部访问
    port: parseInt(process.env.VITE_PORT || '5173'), // 从环境变量获取端口，默认5173
    open: true,        // 启动后自动打开浏览器
    cors: true,        // 允许跨域
    strictPort: true, // 如果端口被占用，自动尝试下一个可用端口
    // 接口代理（解决跨域，匹配后端地址）
    proxy: {
      '/api': {
        target: process.env.VITE_API_TARGET || 'http://localhost:8080', // 从环境变量获取后端地址
        ws: true, // 支持 WebSocket
        changeOrigin: true
      }
    }
  },
  // 构建配置
  build: {
    outDir: 'dist/web', // 打包输出目录
    sourcemap: false    // 生产环境关闭sourcemap
  }
});