// 1. 导入核心依赖
import {
  createRouter,
  createWebHashHistory, // 【修改1】开发环境改用hash模式，避免404
  RouteRecordRaw,
  NavigationGuardNext,
  RouteLocationNormalized
} from 'vue-router';

// 2. 导入页面/布局组件（【修改2】确认@指向src/web，若未配置则改用相对路径）
// 注意：以下路径需确保文件存在：src/web/layouts/MainLayout.vue、src/web/pages/xxx/xxx.vue
const MainLayout = () => import('@/layouts/MainLayout.vue');
const Login = () => import('@/pages/login/Login.vue');
const Dashboard = () => import('@/pages/dashboard/Index.vue');
const AlarmList = () => import('@/pages/alarm/List.vue');
const AlarmDetail = () => import('@/pages/alarm/Detail.vue');
const DeviceList = () => import('@/pages/device/List.vue');
const DeviceConfig = () => import('@/pages/device/Config.vue');
const NotFound = () => import('@/pages/404/NotFound.vue');

// 3. 定义路由规则（无修改，404路由位置正确）
const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: {
      title: '管理员登录',
      requiresAuth: false
    }
  },
  {
    path: '/dashboard',
    name: 'DashboardLayout',
    component: MainLayout,
    meta: {
      title: '平台首页',
      requiresAuth: true
    },
    children: [
      {
        path: '',
        name: 'Dashboard',
        component: Dashboard,
        meta: { title: '平台首页' }
      },
      {
        path: 'alarm/list',
        name: 'AlarmList',
        component: AlarmList,
        meta: { title: '报警列表' }
      },
      {
        path: 'alarm/detail/:id',
        name: 'AlarmDetail',
        component: AlarmDetail,
        meta: { title: '报警详情' },
        props: true
      },
      {
        path: 'device/list',
        name: 'DeviceList',
        component: DeviceList,
        meta: { title: '设备列表' }
      },
      {
        path: 'device/config/:deviceId',
        name: 'DeviceConfig',
        component: DeviceConfig,
        meta: { title: '设备配置' },
        props: true
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

// 4. 创建路由实例
const router = createRouter({
  history: createWebHashHistory(), // 【修改1】hash模式（URL带#，开发环境无404）
  routes,
  scrollBehavior: () => ({ top: 0 })
});

// 5. 路由守卫（【修改3】添加日志+容错，便于排查404原因）
router.beforeEach(
  (
    to: RouteLocationNormalized,
    from: RouteLocationNormalized,
    next: NavigationGuardNext
  ) => {
    // 新增：打印路由信息，快速定位404原因
    console.log('👉 目标路由：', to.fullPath);
    console.log('👉 是否需要登录：', to.meta.requiresAuth);
    console.log('👉 当前登录态（token）：', localStorage.getItem('token'));

    // 设置页面标题
    if (to.meta.title) {
      document.title = to.meta.title as string;
    }

    // 登录校验（添加容错，避免token解析错误）
    const token = localStorage.getItem('token');
    const isLogin = !!token && token !== 'undefined' && token !== 'null';

    // 未登录访问需要授权的路由 → 跳登录页
    if (to.meta.requiresAuth && !isLogin) {
      console.warn('❌ 未登录，跳转到登录页');
      next('/login');
    }
    // 已登录访问登录页 → 跳首页（避免重复登录）
    else if (to.path === '/login' && isLogin) {
      console.log('✅ 已登录，跳转到首页');
      next('/dashboard');
    }
    // 正常跳转
    else {
      next();
    }
  }
);

export default router;