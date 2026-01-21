# 校园智能安防平台-前端

[![Vue.js](https://img.shields.io/badge/Vue.js-3.x-green.svg)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![Element Plus](https://img.shields.io/badge/Element%20Plus-2.x-blue.svg)](https://element-plus.org/)
[![Vite](https://img.shields.io/badge/Vite-5.x-yellow.svg)](https://vitejs.dev/)

## 1. 项目概述

校园智能安防平台是一款基于物联网技术的校园安全管理系统，旨在通过智能化手段提升校园安全管理水平，保障师生人身财产安全。

### 1.1 项目目标
- 实现校园安全设备的集中监控与管理
- 提供实时报警响应与处理机制
- 建立校园安全数据可视化分析平台
- 支持学生端安全隐患上报与反馈
- 提升校园安全管理效率与应急响应能力

### 1.2 模块职责
- **管理员Web端控制台**：负责系统管理、设备监控、报警处理、数据统计分析等核心功能
- **学生端小程序**：提供安全隐患上报、消息通知、个人中心等便捷功能

### 1.3 关联仓库
- **后端服务**：[campus-security-backend](https://github.com/SmartCampus-Sentinel/campus-security-backend) - 提供完整的API接口支持

## 2. 技术栈

### 2.1 核心框架与语言
- **Web端**：Vue 3 ^3.4.21 + Vite ^5.1.6
  - 选择原因：Vue 3的Composition API提供了更好的代码组织方式和逻辑复用能力，Vite作为新一代构建工具提供了更快的开发体验
- **小程序端**：Uni-app
  - 选择原因：一次开发，多端运行，支持微信小程序、支付宝小程序等多个平台
- **开发语言**：TypeScript ^5.4.2 + JavaScript
  - 选择原因：TypeScript提供了类型安全，减少运行时错误，提升代码可维护性

### 2.2 UI组件库
- **Web端**：Element Plus ^2.6.3
  - 选择原因：与Vue 3完美兼容，提供了丰富的组件，支持按需引入，降低打包体积
- **小程序端**：Uni UI
  - 选择原因：专为Uni-app设计的组件库，提供了符合小程序设计规范的组件

### 2.3 核心依赖
- **网络请求**：Axios ^1.6.8
  - 功能：封装HTTP请求，支持拦截器、请求取消等高级特性
- **视频播放**：Video.js ^8.12.0
  - 功能：提供跨浏览器的视频播放解决方案，支持多种视频格式
- **状态管理**：Pinia ^2.1.7
  - 功能：Vue 3官方推荐的状态管理库，提供了更简洁的API和更好的TypeScript支持
- **路由管理**：Vue Router ^4.3.0
  - 功能：实现页面路由导航，支持路由守卫、路由懒加载等特性
- **图表库**：ECharts
  - 功能：提供丰富的数据可视化图表，支持动态数据更新
- **构建工具**：Vite ^5.1.6、HBuilderX
  - 功能：Vite用于Web端构建，HBuilderX用于小程序开发和打包

### 2.4 开发工具链
- ESLint：代码质量检查
- Prettier：代码格式化
- vue-tsc：TypeScript类型检查

### 2.5 代码规范
项目采用统一的代码规范，确保代码风格一致和质量良好：

#### 2.5.1 Prettier 配置
- 半角分号结尾
- 单引号字符串
- 自动添加尾随逗号
- 行宽限制100字符
- 2个空格缩进

#### 2.5.2 ESLint 配置
- 基于Vue 3和TypeScript推荐规则
- 与Prettier协同工作，避免规则冲突
- 代码质量检查，发现潜在问题
- 支持TypeScript类型检查

#### 2.5.3 Git 提交规范
- 提交前手动运行ESLint和Prettier进行代码检查和格式化

## 3. 登录功能

### 3.1 登录流程概述
- **登录页面**: `src/web/pages/login/Login.vue`
- **登录API**: `src/web/api/login.ts`
- **工作流程**:
  1. 用户在登录页输入用户名和密码
  2. 前端表单校验（用户名3-20字符、密码6-20字符）
  3. 提交到后端 `POST /api/auth/login` 接口
  4. 后端验证凭证并返回token、userId、username
  5. 前端存储凭证到localStorage
  6. 自动跳转到仪表板页面

### 3.2 API请求与响应
- **请求格式**:
  ```json
  {
    "username": "admin",
    "password": "123456",
    "type": 1
  }
  ```
- **响应拦截器** (`src/web/api/index.ts`):
  - 自动提取`response.data`字段
  - 自定义错误码处理（400、401、403、404、500等）
  - 401错误自动清除token并跳转登录页
- **响应格式**: 后端返回 `{ code: 200, data: { token, userId, username } }` 被拦截器提取为 `{ token, userId, username }`

### 3.3 登录状态与安全
- **Token存储**: `localStorage.token` - 后续API请求自动附加到Authorization header
- **用户信息**: `localStorage.username` 和 `localStorage.userId`
- **记住密码**: 可选存储凭据到localStorage（生产环境建议加密）
- **账户锁定**: 登录失败5次后锁定15分钟
- **事务管理**: 后端使用`@Transactional`注解确保登录查询的数据一致性

## 4. 目录结构

```
.
├── src/                    # 源代码目录
│   ├── web/                # Web端管理员控制台代码
│   │   ├── api/            # API接口封装
│   │   │   ├── index.ts    # axios实例配置
│   │   │   ├── login.ts    # 登录相关接口
│   │   │   ├── device.ts   # 设备相关接口
│   │   │   ├── alarm.ts    # 报警相关接口
│   │   │   ├── dashboard.ts # 仪表盘数据接口
│   │   │   ├── user.ts     # 用户相关接口
│   │   │   ├── userStats.ts # 用户统计接口
│   │   │   └── loginLog.ts # 登录日志接口
│   │   ├── assets/         # 静态资源（图片/样式）
│   │   │   ├── css/        # 自定义样式
│   │   │   └── images/     # 图片资源
│   │   ├── components/     # 通用组件
│   │   │   └── Sidebar.vue # 侧边栏组件
│   │   ├── layouts/        # 布局组件
│   │   │   └── MainLayout.vue # 主布局组件
│   │   ├── pages/          # 业务页面
│   │   │   ├── login/      # 登录页
│   │   │   ├── dashboard/  # 首页看板
│   │   │   ├── device/     # 设备管理
│   │   │   ├── alarm/      # 报警管理
│   │   │   ├── setting/    # 系统设置
│   │   │   └── 404/        # 404页面
│   │   ├── plugins/        # 插件配置
│   │   │   └── icons.ts    # 图标配置
│   │   ├── router/         # 路由配置
│   │   │   └── index.ts    # 路由定义与守卫
│   │   ├── store/          # Pinia状态管理
│   │   ├── utils/          # 工具函数
│   │   │   └── request.ts  # 请求工具封装
│   │   ├── App.vue         # 根组件
│   │   ├── main.ts         # 入口文件
│   │   ├── style.css       # 全局样式
│   │   └── env.d.ts        # 环境变量类型定义
│   └── miniprogram/        # 学生端小程序代码
│       ├── api/            # 小程序接口请求
│       ├── pages/          # 小程序页面
│       ├── static/         # 小程序静态资源
│       ├── utils/          # 小程序工具类
│       ├── App.vue         # 小程序根组件
│       └── main.js         # 小程序入口文件
├── config/                 # 环境配置文件
├── test/                   # 前端测试代码
├── docs/                   # 项目文档
├── public/                 # 公共静态资源
│   └── vite.svg            # Vite默认图标
├── .env.development        # 开发环境变量
├── .env.production         # 生产环境变量
├── .env.example            # 环境变量示例
├── index.html              # Web端入口HTML
├── package.json            # 项目依赖配置
├── tsconfig.json           # TypeScript配置
├── tsconfig.app.json       # TypeScript应用配置
├── tsconfig.node.json      # TypeScript Node配置
├── vite.config.ts          # Vite配置
├── .gitignore              # Git忽略文件配置
└── README.md               # 项目说明文档
```

## 3. 开发环境搭建

### 3.1 前置依赖
- Node.js 18.0+：用于运行前端开发环境
- npm 9.0+ 或 yarn：用于包管理
- HBuilderX：用于小程序开发和打包
- 微信开发者工具：用于小程序调试和预览
- Git：用于版本控制

### 3.2 环境配置步骤

1. **克隆仓库**
   ```bash
   git clone https://github.com/SmartCampus-Sentinel/campus-security-frontend.git
   ```

2. **进入项目目录**
   ```bash
   cd campus-security-frontend
   ```

3. **安装依赖**
   ```bash
   npm install
   ```

4. **配置环境变量**
   - 复制环境变量示例文件
     ```bash
     cp .env.example .env.development
     ```
   - 修改核心配置
     ```env
     # 本地开发端口（默认5173）
     VITE_PORT=5173
     # 后端接口基础地址
     VITE_API_BASE_URL=http://localhost:8080/api
     # 代理目标地址（用于解决跨域问题）
     VITE_API_TARGET=http://localhost:8080
     # WebSocket连接地址（实时报警推送）
     VITE_WS_BASE_URL=ws://localhost:8080/ws
     # WebSocket代理目标地址
     VITE_WS_TARGET=ws://localhost:8080
     ```

5. **启动后端服务**
   - 确保后端服务已启动，详细步骤请参考 [campus-security-backend](https://github.com/SmartCampus-Sentinel/campus-security-backend) 的README文档

## 4. 启动方式

### 4.1 开发环境启动

#### Web端管理员控制台
1. 启动开发服务器
   ```bash
   npm run dev:web
   ```

2. 访问应用
   - 默认访问地址：http://localhost:5173
   - 端口可通过 `.env.development` 中的 `VITE_PORT` 变量自定义
   - 如需允许外部访问，可在 `vite.config.ts` 中确认 `host: '0.0.0.0'` 配置

3. 端口配置说明
   - 前端开发服务器端口：由 `VITE_PORT` 环境变量控制，默认为 5173
   - 后端API代理：配置了 `/api` 和 `/ws` 路径代理到后端服务器
   - 自动端口切换：如果指定端口被占用，会自动尝试下一个可用端口

#### 小程序端
1. 打开HBuilderX，导入项目根目录下的 `src/miniprogram` 文件夹
2. 点击工具栏「运行」→「运行到小程序模拟器」→「微信开发者工具」
3. 微信开发者工具自动启动并加载项目

### 4.2 生产环境构建

#### Web端
1. 打包构建
   ```bash
   npm run build:web
   ```
2. 部署
   - 将生成的 `dist/web` 目录部署到Nginx、Apache等Web服务器
   - 配置服务器代理转发API请求到后端服务

#### 小程序端
1. 在HBuilderX中右键 `src/miniprogram` →「发行」→「小程序-微信」
2. 生成 `dist/miniprogram` 目录
3. 上传至微信公众平台审核发布

## 5. 分支管理规范

### 5.1 分支类型
- **master**：稳定版本分支，仅用于发布，禁止直接提交
- **dev**：开发主分支，所有功能开发完成后合并至此
- **feature/xxx**：功能分支，从dev创建，用于开发新功能
- **bugfix/xxx**：bug修复分支，从dev创建，用于修复bug
- **hotfix/xxx**：紧急修复分支，从master创建，用于修复线上紧急问题

### 5.2 分支命名规范
- 功能分支：`feature/模块名-功能名`
  - 示例：`feature/web-alarm-list`（Web端报警列表功能）
- Bug修复分支：`bugfix/问题描述`
  - 示例：`bugfix/web-video-play-error`（Web端视频播放异常）
- 紧急修复分支：`hotfix/问题描述`
  - 示例：`hotfix/security-vulnerability`（安全漏洞修复）

### 5.3 分支合并流程
1. 功能开发完成后，从feature分支发起Pull Request到dev分支
2. 经过代码审查后，合并到dev分支
3. 版本发布前，从dev分支发起Pull Request到master分支
4. 经过测试验证后，合并到master分支并打标签

## 6. 提交规范

### 6.1 提交信息格式
```
type(scope): description

[optional body]

[optional footer]
```

### 6.2 类型说明
- **feat**：新增功能
- **fix**：修复bug
- **docs**：文档修改
- **style**：代码格式调整（不影响代码逻辑）
- **refactor**：代码重构（不新增功能或修复bug）
- **test**：测试相关修改
- **chore**：构建/依赖调整
- **perf**：性能优化
- **ci**：CI/CD配置修改
- **revert**：回滚提交

### 6.3 作用域说明
- **web-xxx**：Web端模块
- **mini-xxx**：小程序端模块
- **common**：公共模块

### 6.4 示例
```
feat(web-dashboard): 新增设备在线率统计卡片

fix(mini-report): 修复隐患上报图片上传失败问题

docs: 更新项目README文档
```

## 7. 核心功能说明

### 7.1 管理员Web端控制台

#### 7.1.1 数据监控
- **功能描述**：实时展示校园安全核心数据，包括设备在线率、今日报警数、待处理报警数等
- **核心指标**：设备总数、在线设备数、今日报警数、待处理报警数
- **可视化图表**：今日报警趋势图、设备状态分布图
- **数据刷新**：支持手动刷新和自动刷新（默认5分钟）

#### 7.1.2 报警管理
- **功能描述**：集中管理所有校园安全报警信息
- **报警列表**：展示所有报警记录，支持按时间、类型、状态筛选
- **报警详情**：查看报警设备、位置、时间、类型、截图等详细信息
- **报警处理**：支持更新报警处理状态，添加处理备注
- **实时推送**：通过WebSocket接收实时报警信息

#### 7.1.3 设备管理
- **功能描述**：管理校园内所有安全设备
- **设备列表**：展示设备名称、类型、状态、位置等信息
- **设备添加**：支持新增设备，配置设备参数
- **设备配置**：修改设备参数，如IP地址、端口号等
- **设备控制**：支持远程控制设备，如重启摄像头、调整灵敏度等

#### 7.1.4 用户管理
- **功能描述**：管理系统用户账号
- **用户列表**：展示用户名称、角色、状态等信息
- **用户权限**：分配用户角色和权限
- **登录日志**：记录用户登录历史，包括登录时间、IP地址等

### 7.2 学生端小程序

#### 7.2.1 隐患上报
- **功能描述**：允许学生上报校园内发现的安全隐患
- **上报内容**：支持文字描述、图片/视频上传、位置选择
- **上报流程**：填写信息→提交→等待审核→查看结果

#### 7.2.2 消息通知
- **功能描述**：接收系统推送的消息
- **消息类型**：隐患审核结果、校园安全预警、系统公告等
- **消息状态**：未读/已读标记，支持批量已读

#### 7.2.3 个人中心
- **功能描述**：学生个人信息管理
- **个人资料**：查看和修改个人信息
- **上报记录**：查看历史上报记录和处理状态
- **消息历史**：查看所有收到的消息

## 8. 常见问题排查

### 8.1 依赖安装问题
**问题**：npm install安装依赖失败
**解决方案**：
1. 清除npm缓存
   ```bash
   npm cache clean -f
   ```
2. 切换npm源为淘宝源
   ```bash
   npm config set registry https://registry.npm.taobao.org
   ```
3. 重新安装依赖
   ```bash
   npm install
   ```

### 8.2 接口连接问题
**问题**：Web端无法连接后端接口
**解决方案**：
1. 检查 `.env.development` 中 `VITE_API_BASE_URL` 配置是否正确
2. 确认后端服务已启动且端口未被占用
3. 检查网络连接和防火墙设置
4. 查看浏览器控制台的网络请求和错误信息

### 8.3 小程序加载问题
**问题**：小程序模拟器无法加载
**解决方案**：
1. 确认微信开发者工具已登录
2. 检查小程序AppID配置是否正确（在HBuilderX项目manifest.json中设置）
3. 检查微信开发者工具的安全设置，确保允许局域网连接
4. 重新运行小程序项目

### 8.4 视频播放问题
**问题**：视频无法正常播放
**解决方案**：
1. 检查视频文件格式是否支持（推荐使用MP4格式）
2. 确认视频文件路径或URL是否正确
3. 检查浏览器是否支持Video.js
4. 查看控制台是否有相关错误信息

### 8.5 开发工具配置问题
**问题**：husky或lint-staged无法正常工作
**解决方案**：
1. 确保已安装依赖：`npm install`
2. 初始化husky：`npm run prepare`
3. 检查husky权限：`chmod +x .husky/pre-commit`
4. 详细配置说明请参考`HUSKY_SETUP.md`文件

## 9. 贡献指南

我们欢迎社区成员为项目做出贡献！以下是贡献指南：

### 9.1 贡献流程
1. Fork项目仓库
2. 创建功能分支（feature/xxx）或bug修复分支（bugfix/xxx）
3. 开发新功能或修复bug
4. 编写测试用例（如果需要）
5. 确保代码通过ESLint检查和TypeScript类型检查
6. 提交代码，遵循提交规范
7. 发起Pull Request到dev分支
8. 参与代码审查，根据反馈进行修改
9. 代码合并后，删除本地分支

### 9.2 开发规范
- 遵循项目的代码风格和命名规范
- 使用TypeScript编写新代码，确保类型安全
- 为组件和函数编写清晰的注释
- 编写单元测试和集成测试（如果需要）
- 确保代码性能和可维护性

### 9.3 代码审查标准
- 代码质量：可读性、可维护性、性能
- 功能完整性：是否实现了预期功能
- 类型安全：是否符合TypeScript类型规范
- 测试覆盖：是否有足够的测试用例
- 代码风格：是否符合项目的代码风格指南

## 10. 许可证

本项目采用MIT许可证：

```
MIT License

Copyright (c) 2024 SmartCampus-Sentinel

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## 11. 维护人员

- **核心维护**：GeminiMortal（GitHub: [GeminiMortal](https://github.com/GeminiMortal)）
- **联系邮箱**：gemini.mortal@example.com

## 12. 致谢

感谢所有为项目做出贡献的开发者和社区成员！

## 13. 更新日志

### v1.0.0 (2024-01-19)
- 初始版本发布
- 实现管理员Web端控制台核心功能
- 实现学生端小程序核心功能
- 支持设备管理、报警处理、数据监控等功能

## 14. 联系方式

- **项目官网**：[https://smartcampus-sentinel.example.com](https://smartcampus-sentinel.example.com)
- **GitHub仓库**：[https://github.com/SmartCampus-Sentinel/campus-security-frontend](https://github.com/SmartCampus-Sentinel/campus-security-frontend)
- **问题反馈**：[https://github.com/SmartCampus-Sentinel/campus-security-frontend/issues](https://github.com/SmartCampus-Sentinel/campus-security-frontend/issues)

---

**校园智能安防平台** - 让校园更安全，让家长更放心！
