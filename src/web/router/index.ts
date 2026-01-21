// 1. 导入核心依赖（保留类型导入，优化注释）
import {
  createRouter,
  createWebHashHistory,
  RouteRecordRaw,
  NavigationGuardNext,
  RouteLocationNormalized
} from 'vue-router';
import { startAutoLogout, stopAutoLogout } from '@/utils/autoLogout';

// 2. 导入页面/布局组件（统一路径规范：文件夹小写、组件首字母大写，语义化命名）
// 注意：确保文件实际路径与导入路径一致：
// src/web/layouts/MainLayout.vue
// src/web/pages/login/login.vue
// src/web/pages/dashboard/Index.vue
// src/web/pages/alarm/List.vue | Detail.vue
// src/web/pages/setting/Index.vue（用户中心）
// src/web/pages/404/NotFound.vue
// src/web/pages/device/List.vue | Config.vue | Add.vue
const MainLayout = () => import('@/layouts/MainLayout.vue');
const Login = () => import('@/pages/login/Login.vue'); // 统一文件夹小写
const Dashboard = () => import('@/pages/dashboard/Index.vue');
const AlarmList = () => import('@/pages/alarm/List.vue');
const AlarmDetail = () => import('@/pages/alarm/Detail.vue');
const DeviceList = () => import('@/pages/device/List.vue');
const DeviceConfig = () => import('@/pages/device/Config.vue');
const DeviceAdd = () => import('@/pages/device/Add.vue'); // 新增：添加设备页面
const UserCenter = () => import('@/pages/setting/Index.vue'); // 语义化命名：替换root
const NotFound = () => import('@/pages/404/NotFound.vue');

// 3. 定义路由规则（核心修正：路径、命名、冗余配置）
const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/login' // 统一小写，符合路径规范
  },
  {
    path: '/login', // 统一小写
    name: 'Login',
    component: Login,
    meta: {
      title: '管理员登录',
      requiresAuth: false // 登录页无需认证
    }
  },
  {
    path: '/dashboard', // 修正：移除多余的.ts后缀
    name: 'MainLayout', // 语义化命名：替换DashboardLayout
    component: MainLayout,
    meta: {
      title: '平台首页',
      requiresAuth: true // 首页及子路由均需认证
    },
    children: [
      {
        path: '', // 空路径 → /dashboard 匹配首页
        name: 'Dashboard',
        component: Dashboard,
        meta: { title: '平台首页', requiresAuth: true }
      },
      {
        path: 'alarm/list',
        name: 'AlarmList',
        component: AlarmList,
        meta: { title: '报警列表', requiresAuth: true }
      },
      {
        path: 'alarm/detail/:id',
        name: 'AlarmDetail',
        component: AlarmDetail,
        meta: { title: '报警详情', requiresAuth: true },
        props: true // 合理：需要接收id参数
      },
      {
        path: 'device/list',
        name: 'DeviceList',
        component: DeviceList,
        meta: { title: '设备列表', requiresAuth: true }
      },
      {
        path: 'device/add', // 新增：添加设备页面
        name: 'DeviceAdd',
        component: DeviceAdd,
        meta: { title: '添加设备', requiresAuth: true }
      },
      {
        path: 'device/config/:deviceId',
        name: 'DeviceConfig',
        component: DeviceConfig,
        meta: { title: '设备配置', requiresAuth: true },
        props: true // 合理：需要接收deviceId参数
      },
      {
        path: 'setting', // 修正：简化用户中心路径 → /dashboard/setting
        name: 'UserCenter', // 语义化命名：替换root
        component: UserCenter,
        meta: { title: '用户中心', requiresAuth: true }
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFound,
    meta: { title: '页面不存在' }
  }
];

// 4. 创建路由实例（保留hash模式，优化注释）
const router = createRouter({
  history: createWebHashHistory(), // hash模式：开发环境避免404，生产可改为createWebHistory
  routes,
  scrollBehavior: () => ({ top: 0 }) // 路由切换时回到顶部
});

// 5. 路由守卫（优化日志、简化逻辑、增强容错）
router.beforeEach(
  (
    to: RouteLocationNormalized,
    from: RouteLocationNormalized,
    next: NavigationGuardNext
  ) => {
    // 开发环境日志（生产可注释）
    if (import.meta.env.DEV) {
      console.group('🔄 路由跳转信息');
      console.log('目标路由：', to.fullPath);
      console.log('需要登录授权：', to.meta.requiresAuth);
      console.log('当前Token：', localStorage.getItem('token'));
      console.groupEnd();
    }

    // 设置页面标题（兼容meta.title为空的情况）
    document.title = (to.meta.title as string) || '校园智能安防平台';

    // 登录态校验（增强容错：避免token为'undefined'/'null'）
    const token = localStorage.getItem('token');
    const isLogin = !!token && token.trim() && token !== 'undefined' && token !== 'null';

    // 核心权限逻辑
    if (to.meta.requiresAuth) {
      // 需要授权但未登录 → 跳登录页
      if (!isLogin) {
        import.meta.env.DEV && console.warn('❌ 未登录，重定向到登录页');
        stopAutoLogout(); // 停止自动登出监听
        next('/login');
      } else {
        // 已登录 → 正常跳转
        startAutoLogout(); // 启动自动登出监听
        next();
      }
    } else {
      // 无需授权的路由（如登录页）
      if (to.path === '/login' && isLogin) {
        // 已登录访问登录页 → 跳首页
        import.meta.env.DEV && console.log('✅ 已登录，重定向到首页');
        startAutoLogout(); // 启动自动登出监听
        next('/dashboard');
      } else {
        // 未登录访问登录页 → 停止自动登出监听
        stopAutoLogout();
        next();
      }
    }
  }
);

export default router;