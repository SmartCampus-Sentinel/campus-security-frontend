校园智能安防平台-前端

1. 项目介绍

- 所属项目：校园智能安防平台

- 模块职责：负责平台前端交互功能实现，包含管理员Web端控制台（数据监控、报警处理、设备管理）和学生端小程序（安全隐患上报、消息通知）

- 关联仓库：


- 依赖仓库：campus-security-backend（后端全量服务，提供接口支持）

2. 技术栈

- 核心框架：Vue3 ^3.4.21 + Vite ^5.1.6（Web端）、Uni-app（小程序端）

- 开发语言：TypeScript ^5.4.2 + JavaScript

- UI组件库：Element Plus ^2.6.3（Web端）、Uni UI（小程序端）

- 依赖工具/组件：


- 网络请求：Axios ^1.6.8

- 视频播放：Video.js ^8.12.0

- 状态管理：Pinia ^2.1.7

- 路由管理：Vue Router ^4.3.0

- 构建工具：Vite ^5.1.6、HBuilderX（小程序打包）

- 其他开发依赖：@vitejs/plugin-vue ^5.0.4、@types/node ^20.11.28、@types/video.js ^7.3.52、@typescript-eslint/eslint-plugin ^7.2.0、@typescript-eslint/parser ^7.2.0、eslint ^8.57.0、eslint-plugin-vue ^9.23.0、husky ^9.0.11、vue-tsc ^2.0.6

3. 目录结构

src/
├── web/（Web端管理员控制台代码）
│   ├── api/（接口请求封装）
│   ├── assets/（静态资源：图片、样式）
│   ├── components/（公共组件）
│   ├── layouts/（布局组件）
│   ├── pages/（页面组件：报警管理、设备监控、用户管理等）
│   ├── router/（路由配置）
│   ├── store/（Pinia状态管理）
│   ├── utils/（工具类：权限控制、请求拦截）
│   ├── App.vue
│   └── main.ts
├── miniprogram/（学生端小程序代码）
│   ├── api/（小程序接口请求）
│   ├── pages/（小程序页面：隐患上报、消息中心、我的）
│   ├── static/（小程序静态资源）
│   ├── utils/（小程序工具类）
│   ├── App.vue
│   └── main.js
├── config/（环境配置文件：开发/测试/生产）
└── test/（前端测试代码）
docs/（本地辅助文档）
.env.development（开发环境变量）
.env.production（生产环境变量）
.env.example（环境变量示例）
index.html（Web端入口）
package.json
README.md

4. 开发环境搭建

4.1 前置依赖

- 需安装：Node.js 18.0+、npm 9.0+、HBuilderX（小程序开发）、微信开发者工具（小程序调试）

- 需依赖：后端服务已启动（地址配置在.env.development中）

4.2 环境配置步骤

1. 克隆仓库：git clone https://github.com/SmartCampus-Sentinel/campus-security-frontend.git

2. 进入项目目录：cd campus-security-frontend

3. 安装依赖：npm install（安装Web端及公共依赖）

4. 配置环境变量：


- 复制.env.example为.env.development

- 修改核心配置：
  VITE_API_BASE_URL=http://localhost:8080/api  # 后端接口基础地址
  VITE_WS_BASE_URL=ws://localhost:8080/ws      # WebSocket连接地址（实时报警推送）

5. 启动方式

5.1 开发环境启动

- Web端管理员控制台启动：npm run dev:web

- 启动成功后访问：http://localhost:5173（默认端口，可在vite.config.ts中修改）

- 小程序端启动：


1. 打开HBuilderX，导入项目根目录下的src/miniprogram文件夹

2. 点击工具栏「运行」→「运行到小程序模拟器」→「微信开发者工具」

3. 微信开发者工具自动启动并加载项目

5.2 测试环境部署（简化）

1. Web端打包：npm run build:web，生成dist/web目录，部署到Nginx服务器

2. 小程序打包：在HBuilderX中右键src/miniprogram→「发行」→「小程序-微信」，生成dist/miniprogram目录，上传至微信公众平台审核

6. 分支管理规范

- master：稳定版本分支，仅用于发布，禁止直接提交

- dev：开发主分支，所有功能开发完成后合并至此

- feature/xxx：功能分支，从dev创建，命名格式：feature/模块名-功能名


- 示例：feature/web-alarm-list（Web端报警列表功能）、feature/mini-report（小程序隐患上报功能）

- bugfix/xxx：bug修复分支，从dev创建，命名格式：bugfix/问题描述


- 示例：bugfix/web-video-play-error（Web端视频播放异常）

7. 提交规范

提交信息格式：type(scope): description

- type：feat（新增功能）、fix（修复bug）、docs（文档修改）、style（代码格式调整）、refactor（重构）、test（测试相关）、chore（构建/依赖调整）

- scope：模块名称（web-xxx：Web端模块；mini-xxx：小程序模块）

- description：简要描述提交内容（中文）

- 示例：feat(mini-report): 新增隐患上报图片上传功能

- 示例：fix(web-device): 修复设备状态显示异常问题

8. 核心功能说明

8.1 Web端管理员控制台

- 数据监控：实时展示设备在线率、报警统计、隐患处理进度等核心数据

- 报警管理：接收后端推送的报警信息，展示报警详情（位置、类型、截图），支持处置状态更新

- 设备管理：查看摄像头、传感器设备列表及状态，支持设备远程控制（如重启摄像头）

- 用户管理：管理系统用户（管理员、安保人员），分配角色和权限

8.2 学生端小程序

- 隐患上报：支持文字描述+图片/视频上传，提交校园安全隐患

- 消息通知：接收隐患审核结果、校园安全预警等消息

- 个人中心：查看上报记录、消息历史，修改个人信息

9. 常见问题排查

- 问题1：npm install安装依赖失败
  解决方案：清除npm缓存（npm cache clean -f），切换npm源为淘宝源（npm config set registry https://registry.npm.taobao.org）后重新安装

- 问题2：Web端无法连接后端接口
  解决方案：检查.env.development中VITE_API_BASE_URL配置是否正确，确认后端服务已启动且端口未被占用

- 问题3：小程序模拟器无法加载
  解决方案：确认微信开发者工具已登录，且小程序AppID配置正确（在HBuilderX项目manifest.json中设置）

10. 维护人员

- 核心维护：GeminiMortal（姓名/GitHub账号）
