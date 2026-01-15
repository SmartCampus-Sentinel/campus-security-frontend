import { createApp } from 'vue';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import { createPinia } from 'pinia';
// 导入路由实例
import router from '@/router';
// 根组件
import App from './App.vue';

// 创建Vue实例
const app = createApp(App);

// 挂载插件
app.use(ElementPlus);    // Element Plus组件库
app.use(createPinia());  // Pinia状态管理
app.use(router);         // 路由

// 挂载到DOM
app.mount('#app');