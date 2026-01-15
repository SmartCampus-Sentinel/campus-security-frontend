// src/web/router/index.ts
import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';

// 定义路由规则
const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/login', // 默认跳转到登录页
  },
  {
    path: '/login',
    name: 'Login',
    // 懒加载登录页组件（后续创建，先占位）
    component: () => import('@/pages/login/Login.vue'),
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    // 懒加载首页布局组件（后续创建，先占位）
    component: () => import('@/layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        component: () => import('@/pages/dashboard/Index.vue'),
      },
    ],
  },
  // 404页面
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/pages/404/NotFound.vue'),
  },
];

// 创建路由实例
const router = createRouter({
  history: createWebHistory(), // HTML5 History模式
  routes,
});

// 路由守卫（可选，先占位）
router.beforeEach((to, from, next) => {
  // 后续可添加登录验证逻辑
  next();
});

export default router;