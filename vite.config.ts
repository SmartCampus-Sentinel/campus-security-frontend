import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  // 禁用oxc解析器，避免TS配置解析错误
  oxc: false,
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
    port: 5173,        // 启动端口
    open: true,        // 启动后自动打开浏览器
    cors: true,        // 允许跨域
    // 接口代理（解决跨域，匹配后端地址）
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/api')
      },
      '/ws': {
        target: 'ws://localhost:8080',
        ws: true,
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