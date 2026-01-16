// 1. 导入核心依赖（Element Plus + Font Awesome）
import type { App } from 'vue';
import * as ElementPlusIconsVue from '@element-plus/icons-vue';

// Font Awesome 核心依赖
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

// 按需导入 Font Awesome 图标（安防项目常用）
import {
  faVideoCamera, // 摄像头（设备管理）
  faExclamationCircle, // 报警警告（报警管理）
  faCog, // 系统设置
  faSearch, // 搜索
  faDownload, // 导出
  faBell, // 提醒
  faSyncAlt // 刷新
} from '@fortawesome/free-solid-svg-icons';

// 可选：导入品牌图标（如需要）
// import { faWeixin, faGithub } from '@fortawesome/free-brands-svg-icons';

/**
 * 全局注册所有图标（Element Plus + Font Awesome）
 * @param app Vue实例
 * @param mode Element Plus 注册模式：all-全部，common-仅常用
 */
export function setupIcons(app: App, mode: 'all' | 'common' = 'common') {
  // ======================== 第一步：注册 Element Plus 图标 ========================
  if (mode === 'all') {
    // 注册所有 Element Plus 图标
    for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
      app.component(key, component);
    }
  } else if (mode === 'common') {
    // 仅注册 Element Plus 常用图标（校园安防场景）
    const commonIcons = {
      House: ElementPlusIconsVue.House,
      Monitor: ElementPlusIconsVue.Monitor,
      Warning: ElementPlusIconsVue.Warning,
      User: ElementPlusIconsVue.User,
      Setting: ElementPlusIconsVue.Setting,
      SwitchButton: ElementPlusIconsVue.SwitchButton, // 替代 Logout
      VideoCamera: ElementPlusIconsVue.VideoCamera,
      Bell: ElementPlusIconsVue.Bell,
      CircleClose: ElementPlusIconsVue.CircleClose,
      Refresh: ElementPlusIconsVue.Refresh,
      Search: ElementPlusIconsVue.Search
    };
    // 注册 Element Plus 常用图标
    for (const [key, component] of Object.entries(commonIcons)) {
      app.component(key, component);
    }
  }

  // ======================== 第二步：注册 Font Awesome 图标 ========================
  // 1. 将按需导入的 Font Awesome 图标添加到库中
  library.add(
    faVideoCamera,
    faExclamationCircle,
    faCog,
    faSearch,
    faDownload,
    faBell,
    faSyncAlt
    // 可选：添加品牌图标
    // faWeixin,
    // faGithub
  );

  // 2. 全局注册 FontAwesomeIcon 组件（所有组件可直接使用）
  app.component('FontAwesomeIcon', FontAwesomeIcon);
}