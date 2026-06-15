# PsyTwin-Pocket 项目全景文档

> 生成时间: 2026-05-19
> 项目版本: 0.0.2
> 文档类型: 架构全景 + 开发手册

---

## 目录

1. [项目概述](#1-项目概述)
2. [技术栈与依赖](#2-技术栈与依赖)
3. [目录结构总览](#3-目录结构总览)
4. [核心架构详解](#4-核心架构详解)
5. [页面路由地图](#5-页面路由地图)
6. [组件系统](#6-组件系统)
7. [API 请求层](#7-api-请求层)
8. [Mock 数据系统](#8-mock-数据系统)
9. [工具函数库](#9-工具函数库)
10. [静态资源管理](#10-静态资源管理)
11. [配置说明](#11-配置说明)
12. [开发规范](#12-开发规范)
13. [生态协作关系](#13-生态协作关系)
14. [常见问题排查](#14-常见问题排查)

---

## 1. 项目概述

**PsyTwin-Pocket** 是 PsyTwin 校园心理健康数字孪生解决方案的**移动端入口**，基于微信小程序平台开发，为学生和教师提供一体化心理健康服务。

### 1.1 产品定位

| 维度 | 说明 |
|------|------|
| **目标用户** | 高校学生、心理咨询教师、辅导员 |
| **核心场景** | 心理社交（心墙）、AI 心理咨询、虚拟心理伴侣（心宠）、心理预约、数据工作台 |
| **平台** | 微信小程序 |
| **架构角色** | API Consumer（仅消费 Sentinel 后端接口，禁止编写服务端逻辑） |

### 1.2 核心功能模块

```
┌─────────────────────────────────────────────────────────────┐
│                      PsyTwin-Pocket                         │
├──────────┬──────────┬──────────┬──────────┬─────────────────┤
│   心墙   │   心宠   │   AI 助手 │   工作台  │     预约        │
│  (社交)  │ (虚拟伴侣)│ (心理咨询)│ (数据看板)│  (咨询/VR/团体)  │
├──────────┴──────────┴──────────┴──────────┴─────────────────┤
│                     个人中心 / 教师端                         │
└─────────────────────────────────────────────────────────────┘
```

### 1.3 项目信息

| 属性 | 值 |
|------|-----|
| 名称 | tdesign-miniprogram-starter |
| 版本 | 0.0.2 |
| 小程序 AppID | `wx1ff989a54438596f` |
| 基础库版本 | 3.7.8 |
| 许可证 | MIT |

---

## 2. 技术栈与依赖

### 2.1 核心技术栈

| 层级 | 技术 | 版本 | 说明 |
|------|------|------|------|
| **框架** | 微信小程序原生框架 | 基础库 2.6.5+ | 原生开发，无第三方框架 |
| **UI 组件库** | TDesign Mini Program | ^1.11.2 | 腾讯设计体系小程序组件库 |
| **样式预处理器** | LESS | - | 通过 `useCompilerPlugins` 启用 |
| **语言** | JavaScript (ES6+) | - | 禁止使用 TypeScript |
| **代码规范** | ESLint + Prettier | ^8.49.0 / ^3.0.2 | airbnb-base 规则 |
| **Git Hooks** | Husky + lint-staged | ^8.0.3 / ^14.0.1 | 提交前自动格式化 |

### 2.2 完整依赖列表

**生产依赖:**

```json
{
  "tdesign-miniprogram": "^1.11.2"
}
```

**开发依赖:**

| 包名 | 版本 | 用途 |
|------|------|------|
| `eslint` | ^8.49.0 | JavaScript 代码检查 |
| `eslint-config-airbnb-base` | ^15.0.0 | Airbnb 基础规则集 |
| `eslint-config-prettier` | ^9.0.0 | 关闭与 Prettier 冲突的规则 |
| `eslint-plugin-import` | ^2.28.1 | ES Module 导入检查 |
| `eslint-plugin-prettier` | ^5.0.0 | Prettier 作为 ESLint 规则 |
| `husky` | ^8.0.3 | Git hooks 管理 |
| `lint-staged` | ^14.0.1 | 仅对暂存文件运行 linter |
| `prettier` | ^3.0.2 | 代码格式化 |

### 2.3 可用脚本

```bash
npm run lint              # 运行 ESLint 检查
npm run lint:fix          # 自动修复 ESLint + Prettier
npm run lint:fix-eslint   # 仅修复 ESLint
npm run lint:fix-prettier # 仅修复 Prettier
npm run changelog         # 生成 CHANGELOG
```

---

## 3. 目录结构总览

```
PsyTwin-Pocket/
│
├── 📁 api/                    # HTTP 请求层（4 个文件）
│   ├── request.js             # 核心请求封装
│   ├── ai.js                  # AI 对话接口
│   ├── post.js                # 帖子相关接口
│   └── notification.js        # 通知接口
│
├── 📁 behaviors/              # 微信小程序 mixins（1 个文件）
│   └── useToast.js            # Toast 提示共享逻辑
│
├── 📁 components/             # 可复用 UI 组件（2 个组件）
│   ├── card/                  # 心墙瀑布流卡片
│   └── nav/                   # 导航栏组件
│
├── 📁 config/                 # 运行时配置（1 个文件）
│   └── index.js               # 环境配置（Mock/API 地址）
│
├── 📁 custom-tab-bar/         # 自定义 TabBar（4 个文件）
│   ├── index.js               # TabBar 逻辑（角色区分）
│   ├── index.json             # 组件配置
│   ├── index.less             # 样式
│   └── index.wxml             # 模板
│
├── 📁 docs/                   # 项目文档
│   ├── pet_schedule_analysis.md          # 心宠调度系统分析
│   ├── 二级场景AI生图描述.md              # 场景 AI 绘画 Prompt
│   └── PROJECT_OVERVIEW.md    # 📄 本文档
│
├── 📁 mock/                   # 本地模拟数据系统（约 30 个文件）
│   ├── index.js               # Mock 注册入口
│   ├── WxMock.js              # Mock 引擎
│   ├── request.js             # 请求拦截器
│   ├── chat.js                # 聊天 Mock
│   ├── login/                 # 登录相关 Mock
│   ├── home/                  # 首页 Mock
│   ├── search/                # 搜索 Mock
│   ├── dataCenter/            # 数据中心 Mock
│   ├── my/                    # 个人中心 Mock
│   ├── student/               # 学生端 Mock
│   └── teacher/               # 教师端 Mock
│
├── 📁 miniprogram_npm/        # npm 构建产物
│   └── tdesign-miniprogram/   # TDesign 组件库（80+ 组件）
│
├── 📁 pages/                  # 页面目录（约 25 个页面）
│   ├── home/                  # 心墙首页
│   ├── pet/                   # 心宠系统（核心页面）
│   │   ├── index              # 心宠主页面
│   │   ├── map/index          # 地图页面（备用）
│   │   ├── events/index       # 事件页面
│   │   ├── bag/index          # 背包页面
│   │   └── diary/index        # 日记页面
│   ├── message/               # AI 入口页
│   ├── dataCenter/            # 工作台/数据中心
│   ├── appointment/           # 预约系统
│   ├── my/                    # 个人中心
│   │   └── info-edit/index    # 信息编辑（分包）
│   ├── search/                # 搜索（分包）
│   ├── chat/                  # AI 对话（分包）
│   ├── login/                 # 密码登录（分包）
│   ├── loginCode/             # 验证码登录（分包）
│   ├── setting/               # 设置（分包）
│   ├── release/               # 发布动态（分包）
│   ├── post-detail/           # 帖子详情（分包）
│   ├── assessment/            # 心理测评（分包）
│   ├── vr-record/             # VR 体验记录（分包）
│   ├── notification/          # 消息通知（分包）
│   └── teacher/               # 教师端（分包）
│       ├── warning-list/index     # 预警列表
│       ├── appointment-manage/index # 预约管理
│       └── student-list/index     # 学生管理
│
├── 📁 scripts/                # 脚本工具
│   └── remove_white_bg.py     # 去除图片白边脚本
│
├── 📁 static/                 # 静态资源（约 500+ 文件）
│   ├── agents-icons/          # AI 代理图标
│   ├── chat/                  # 聊天头像
│   ├── home/                  # 首页轮播图和卡片
│   ├── pet/                   # 心宠资源
│   │   └── ExportedSprites/   # 315 张动画帧
│   ├── scenes/                # 24 个场景背景图
│   ├── 世界地图/               # 世界地图背景
│   ├── 二级地图/               # 5 个二级地图
│   ├── 二级场景背景图/          # AI 生成场景背景
│   └── 头像/                  # 心宠可选头像
│
├── 📁 utils/                  # 工具函数（4 个文件）
│   ├── util.js                # 通用工具函数
│   ├── eventBus.js            # 全局事件总线
│   ├── petWebSocket.js        # 心宠 WebSocket 客户端
│   └── quizDatabase.js        # 心理答题题库（心宠视角包装的标准量表）
│
├── app.js                     # 应用入口
├── app.json                   # 全局配置
├── app.less                   # 全局样式
├── package.json               # 依赖管理
├── project.config.json        # 微信开发者工具配置
├── sitemap.json               # 搜索索引配置
└── variable.less              # LESS 共享变量
```

---

## 4. 核心架构详解

### 4.1 应用入口 (`app.js`)

```javascript
// 核心职责：
// 1. 动态导入 Mock（仅在 isMock=true 时）
// 2. onLaunch：检查 access_token，未登录跳转登录页
// 3. 初始化角色（student / teacher）
// 4. 全局事件总线 eventBus
// 5. WebSocket 连接管理
// 6. 未读消息数量管理
```

**全局数据 (`globalData`):**

| 字段 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `userInfo` | Object | `null` | 用户信息 |
| `unreadNum` | Number | `1` | 未读消息数量 |
| `socket` | Object | `null` | SocketTask 对象 |
| `role` | String | `''` | 用户角色：`student` 或 `teacher` |

### 4.2 全局配置 (`app.json`)

**主包页面 (12 个):**

```json
[
  "pages/home/index",
  "pages/pet/index",
  "pages/pet/map/index",
  "pages/pet/events/index",
  "pages/pet/bag/index",
  "pages/pet/diary/index",
  "pages/message/index",
  "pages/my/index",
  "pages/dataCenter/index",
  "pages/appointment/index"
]
```

**分包 (12 个):**

| 分包名 | 根目录 | 页面 | 功能 |
|--------|--------|------|------|
| search | `pages/search` | `index` | 搜索页 |
| edit | `pages/my/info-edit` | `index` | 信息编辑 |
| chat | `pages/chat` | `index` | AI 对话 |
| login | `pages/login` | `login` | 密码登录 |
| loginCode | `pages/loginCode` | `loginCode` | 验证码登录 |
| setting | `pages/setting` | `index` | 设置页 |
| release | `pages/release` | `index` | 发布动态 |
| postDetail | `pages/post-detail` | `index` | 帖子详情 |
| assessment | `pages/assessment` | `index` | 心理测评 |
| vrRecord | `pages/vr-record` | `index` | VR 体验记录 |
| notification | `pages/notification` | `index` | 消息通知 |
| teacher | `pages/teacher` | `warning-list/index`, `appointment-manage/index`, `student-list/index` | 教师端 |

**窗口配置:**

```json
{
  "backgroundTextStyle": "light",
  "navigationBarBackgroundColor": "#fff",
  "navigationBarTitleText": "PsyTwin",
  "navigationBarTextStyle": "black"
}
```

**TabBar 配置 (6 个 Tab):**

| 页面路径 | 文本 | 角色 |
|----------|------|------|
| `pages/home/index` | 心墙 | 学生/教师 |
| `pages/pet/index` | 心宠 | 学生 |
| `pages/message/index` | AI | 学生/教师 |
| `pages/dataCenter/index` | 工作台 | 学生/教师 |
| `pages/appointment/index` | 预约 | 学生 |
| `pages/my/index` | 我的 | 学生/教师 |

> 注：TabBar 为自定义组件 (`custom: true`)，根据角色动态显示不同 Tab。

### 4.3 全局样式 (`app.less` / `variable.less`)

**共享变量 (`variable.less`):**

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `@navbar-padding-top` | `20px` | 导航栏顶部内边距 |
| `@nav-bar-height` | `60px` | 导航栏高度 |
| `@tab-bar-height` | `112rpx` | TabBar 高度 |
| `@font-size-default` | `16px` | 默认字体大小 |
| `@bg-color` | `#f3f3f3` | 全局背景色 |
| `@brand7-normal` | `#0052d9` | 品牌主色 |

---

## 5. 页面路由地图

### 5.1 主 Tab 页面

#### 心墙首页 (`pages/home/index`)

| 属性 | 说明 |
|------|------|
| **功能** | 双列瀑布流社交 feed |
| **核心逻辑** | `distributeCards()` 贪心瀑布流算法 |
| **组件** | `nav` (搜索导航), `card` (瀑布流卡片), `t-tabs`, `t-pull-down-refresh` |
| **交互** | 下拉刷新、卡片点击跳转详情、底部悬浮发布按钮 |

#### 心宠系统 (`pages/pet/index`)

| 属性 | 说明 |
|------|------|
| **功能** | 虚拟心理伴侣，含五视图切换 |
| **代码量** | 3320 行（最复杂页面） |
| **五视图** | `game` / `map` / `bag` / `diary` / `help` |
| **核心功能** | 三维状态栏、45 帧精灵动画、24 个场景、WebSocket 实时同步 |

**五视图详情:**

| 视图 | 说明 |
|------|------|
| **game** | 主游戏视图：心情/能量/社交三维状态、场景背景、精灵动画、对话气泡 |
| **map** | 世界地图：5 个一级场景、24 个二级场景、心宠位置标记、编辑模式 |
| **bag** | 背包系统：物品网格、容量进度条 |
| **diary** | 日记系统：日历 + 时间线、活动记录、状态变化 |
| **help** | 帮助事件：事件卡片（红/橙/绿危机分级），点击触发分流响应 — 高危跳转预约、中危心理答题、低危纯提示 |

#### AI 入口页 (`pages/message/index`)

| 属性 | 说明 |
|------|------|
| **功能** | AI 心理咨询入口 |
| **界面** | 时段问候语 + 4 个快捷 Chip |
| **快捷 Chip** | 倾诉心情、焦虑、睡眠、人际关系 |
| **跳转** | 点击 Chip 或输入框 → `pages/chat/index` |

#### 工作台 (`pages/dataCenter/index`)

| 属性 | 说明 |
|------|------|
| **功能** | 数据中心/工作台 |
| **组件** | 数据看板、统计卡片 |

#### 预约系统 (`pages/appointment/index`)

| 属性 | 说明 |
|------|------|
| **功能** | 心理咨询/VR/团体活动预约 |

#### 个人中心 (`pages/my/index`)

| 属性 | 说明 |
|------|------|
| **功能** | 心理画像展示、个人信息、设置入口 |
| **角色区分** | 学生端 / 教师端显示不同内容 |

### 5.2 分包页面

| 页面路径 | 功能 | 入口 |
|----------|------|------|
| `pages/search/index` | 搜索页 | 首页导航栏搜索 |
| `pages/chat/index` | AI 对话窗口 | AI 入口页 |
| `pages/login/login` | 密码登录 | 未登录时自动跳转 |
| `pages/loginCode/loginCode` | 验证码登录 | 登录页切换 |
| `pages/setting/index` | 设置页 | 个人中心 |
| `pages/release/index` | 发布动态 | 心墙首页悬浮按钮 |
| `pages/post-detail/index` | 帖子详情 | 心墙卡片点击 |
| `pages/assessment/index` | 心理测评 | 个人中心 |
| `pages/vr-record/index` | VR 体验记录 | 个人中心 |
| `pages/notification/index` | 消息通知中心 | TabBar 红点 / 个人中心 |
| `pages/my/info-edit/index` | 个人信息编辑 | 个人中心 |
| `pages/teacher/warning-list/index` | 预警列表 | 教师端工作台 |
| `pages/teacher/appointment-manage/index` | 预约管理 | 教师端工作台 |
| `pages/teacher/student-list/index` | 学生管理 | 教师端工作台 |

---

## 6. 组件系统

### 6.1 全局注册组件

```json
// app.json
{
  "usingComponents": {
    "t-toast": "tdesign-miniprogram/toast/toast"
  }
}
```

### 6.2 自定义组件

#### Card 组件 (`components/card/`)

| 属性 | 说明 |
|------|------|
| **用途** | 心墙瀑布流卡片 |
| **文件** | `index.js`, `index.json`, `index.wxml`, `index.less` |
| **内部组件** | `t-image`, `t-tag`, `t-icon` |

**属性列表:**

| 属性名 | 类型 | 说明 |
|--------|------|------|
| `postId` | String | 帖子 ID |
| `url` | String | 图片地址 |
| `desc` | String | 描述文字 |
| `tags` | Array | 标签列表 |
| `nickname` | String | 用户昵称 |
| `avatar` | String | 用户头像 |
| `role` | String | 用户角色 |
| `department` | String | 院系 |
| `isAnonymous` | Boolean | 是否匿名 |
| `likeCount` | Number | 点赞数 |
| `createdAt` | String | 创建时间 |

#### Nav 组件 (`components/nav/`)

| 属性 | 说明 |
|------|------|
| **用途** | 导航栏组件 |
| **文件** | `index.js`, `index.json`, `index.wxml`, `index.less` |
| **内部组件** | `t-navbar`, `t-icon`, `t-drawer`, `t-search` |
| **类型** | `navType="title"` / `navType="search"` |
| **特性** | 左侧抽屉导航、搜索框、状态栏高度适配 |

### 6.3 TDesign 组件使用清单

**80+ 可用组件**（位于 `miniprogram_npm/tdesign-miniprogram/`）

| 类别 | 组件 |
|------|------|
| **基础** | button, icon, image, link, text |
| **布局** | row/col, grid, divider, sticky, scroll-view |
| **导航** | navbar, tab-bar, tabs, steps, side-bar, drawer |
| **表单** | input, textarea, checkbox, radio, switch, picker, rate, slider, stepper, upload, calendar, cascader, date-time-picker, color-picker, search |
| **数据展示** | avatar, badge, cell, collapse, countdown, empty, progress, skeleton, tag, tree-select, watermark, qrcode |
| **反馈** | action-sheet, dialog, loading, message, notice-bar, overlay, popup, toast, fab, result, swipe-cell, pull-down-refresh, image-viewer |
| **聊天** | chat-actionbar, chat-content, chat-list, chat-message, chat-sender |
| **导航** | swiper, dropdown-menu, popover, guide |

---

## 7. API 请求层

### 7.1 文件结构

| 文件 | 职责 | 主要导出 |
|------|------|----------|
| `api/request.js` | 核心请求封装 | `fetch`, `get`, `post`, `update`, `delete` |
| `api/ai.js` | AI 对话接口 | `sendToTherapist`, `getChatMessages`, `getEmotionTags` |
| `api/post.js` | 帖子相关接口 | `getPostDetail`, `toggleLike`, `postComment`, `getComments` |
| `api/notification.js` | 通知接口 | `getNotifications`, `markAsRead`, `getUnreadCount` |

### 7.2 请求规范

```javascript
// 严禁直接调用 wx.request，必须通过 API 服务模块

// ✅ 正确做法
import { fetch } from './api/request';
const data = await fetch('/posts');

// ❌ 错误做法
wx.request({ url: '...' });
```

**请求方法语义:**

| 方法 | 用途 |
|------|------|
| `fetch` / `get` | 获取数据 |
| `update` / `post` | 提交数据 |
| `delete` / `remove` | 删除数据 |

**请求特性:**

- 自动附加 `Authorization: Bearer <token>`
- Mock 模式：延迟 300ms 返回本地数据
- 401 未授权自动处理
- 基础 URL 拼接

### 7.3 AI 接口 (`api/ai.js`)

| 函数 | 说明 |
|------|------|
| `sendToTherapist(params)` | 调用 OpenClaw 的 Therapist 代理 |
| `extractResponseText(data)` | 解析 AI 响应文本 |
| `getChatMessages()` | 获取聊天历史 |
| `getEmotionTags()` | 获取情绪标签 |

---

## 8. Mock 数据系统

### 8.1 启用方式

```javascript
// config/index.js
const config = {
  isMock: true,  // 设置为 true 启用 Mock
};
```

### 8.2 文件结构

| 文件/目录 | 职责 |
|-----------|------|
| `mock/index.js` | Mock 注册入口，聚合所有模块 |
| `mock/WxMock.js` | Mock 引擎 |
| `mock/request.js` | 请求拦截器（200-500ms 随机延迟） |
| `mock/chat.js` | 聊天 WebSocket Mock |
| `mock/login/` | 密码登录、验证码登录、发送短信 |
| `mock/home/` | 轮播图、卡片数据 |
| `mock/search/` | 历史记录、热门搜索 |
| `mock/dataCenter/` | 区域数据、完成率、互动、成员 |
| `mock/my/` | 个人信息、服务列表 |
| `mock/student/` | Home feed、评论、帖子详情、消息会话、预约、我的信息 |
| `mock/teacher/` | 我的信息、设置、工作台统计、日程、预警 |

### 8.3 数据格式规范

```javascript
// 每个 mock 文件必须导出标准格式
{
  code: 200,      // 状态码
  data: {},       // 数据体
  message: 'ok'   // 消息
}
```

---

## 9. 工具函数库

### 9.1 `utils/util.js`

| 函数 | 说明 |
|------|------|
| `formatTime(date)` | 时间格式化 |
| `formatNotificationTime(date)` | 通知时间格式化 |
| `getLocalUrl()` | 获取本地 URL |

### 9.2 `utils/eventBus.js`

| 方法 | 说明 |
|------|------|
| `on(event, callback)` | 监听事件 |
| `off(event, callback)` | 移除监听 |
| `emit(event, data)` | 触发事件 |

**使用规范:**

- 仅用于全局状态变化（登录状态同步、未读数更新）
- 页面/组件销毁时必须在 `onUnload`/`detached` 中调用 `eventBus.off`
- 事件名称使用小驼峰命名，如 `userLoginSuccess`

### 9.3 `utils/petWebSocket.js`

| 属性 | 说明 |
|------|------|
| **用途** | 心宠 WebSocket 客户端 |
| **代码量** | 343 行 |
| **重连策略** | 指数退避：1s → 2s → 4s → 8s → 16s → 30s，最多 5 次 |
| **心跳间隔** | 30 秒 |
| **认证方式** | JWT Token |

**消息类型:**

| 类型 | 说明 |
|------|------|
| `pet_status` | 心宠状态更新 |
| `event_trigger` | 事件触发 |
| `scene_sync` | 场景同步 |
| `control_state_change` | 控制状态变更 |

### 9.4 `utils/quizDatabase.js`

| 属性 | 说明 |
|------|------|
| **用途** | 心理答题题库，将心宠帮助事件与标准心理量表关联 |
| **代码量** | ~170 行 |
| **量表数量** | 3 个精简量表（每量表 4 题） |

**量表清单:**

| 量表 ID | 对应事件分类 | 原始量表 | 心宠包装名 |
|---------|-------------|----------|-----------|
| `PHQ9` | `emotion` | PHQ-9 抑郁筛查（精简版） | 心宠情绪观察 |
| `GAD7` | `study` | GAD-7 焦虑筛查（精简版） | 心宠担忧观察 |
| `SOCIAL` | `social` | 社交回避量表（精简版） | 心宠社交观察 |

**核心 API:**

| 函数 | 说明 |
|------|------|
| `getScaleForCategory(category)` | 根据事件分类获取对应量表 |
| `calculateScore(scaleId, answers)` | 计算答题得分与结果档位 |
| `getScaleList()` | 获取所有量表元信息列表 |

**答题流程:**

1. 用户点击橙色中危事件 → 调用 `getScaleForCategory()` 获取量表
2. 逐题展示心宠视角场景描述，用户选择帮助方式
3. 完成全部题目后，调用 `calculateScore()` 计算总分
4. 返回 3 档结果（良好 / 轻度关注 / 需要关注）+ 有温度的建议文案

> 设计原则：用户感知不到标准量表的存在，所有题目均以"心宠最近怎么了"的视角呈现，用户通过"怎么帮助心宠"完成自评。

---

## 10. 静态资源管理

### 10.1 目录结构

| 目录 | 内容 | 数量 |
|------|------|------|
| `static/agents-icons/` | AI 代理图标 | 6 张 |
| `static/chat/` | 聊天头像 | 5 张 |
| `static/home/` | 首页轮播图和卡片 | 约 10 张 |
| `static/pet/ExportedSprites/` | 心宠动画帧 | **315 张** |
| `static/scenes/` | 场景背景图 | **24 张** |
| `static/世界地图/` | 世界地图背景 | 1 张 |
| `static/二级地图/` | 二级地图 | 5 张 |
| `static/二级场景背景图/` | AI 生成场景背景 | 约 25 张 |
| `static/头像/` | 心宠可选头像 | 5 张 |
| `static/` (根目录) | 按钮面板背景、导航栏背景等 | 若干 |

### 10.2 图片使用规范

**微信小程序背景图限制：** CSS 不支持 `background-image` 引用本地图片。

**正确做法：**

```xml
<!-- WXML -->
<view class="container">
  <image class="bg-image" src="/static/xxx.png" mode="scaleToFill"></image>
  <!-- 内容层 -->
</view>
```

```less
/* LESS */
.container {
  position: relative;
  overflow: hidden;
  border-radius: 20rpx;
}

.bg-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
}
```

**图片格式建议:**

| 场景 | 格式 |
|------|------|
| 需要透明背景 | PNG |
| 不需要透明 | JPG（体积更小） |
| 图标类 | PNG 或 SVG |

---

## 11. 配置说明

### 11.1 `config/index.js`

```javascript
const config = {
  /** 是否使用 mock 数据代替真实 API */
  isMock: false,

  /** API 基础地址 (Sentinel) */
  baseUrl: 'http://localhost:3000/api/pocket',
  // - Sentinel 本地: 'http://localhost:3000/api/pocket'
  // - 局域网测试: 'http://192.168.x.x:3000/api/pocket'
  // - 生产环境: 'https://api.psytwin.com/api/pocket'

  /** Pet 服务地址 (心宠专用) */
  petServiceUrl: 'http://localhost:3001',
  // - 本地: 'http://localhost:3001'
  // - 生产: 'https://pet.psytwin.com'
};
```

### 11.2 `project.config.json`

| 属性 | 值 |
|------|-----|
| `appid` | `wx1ff989a54438596f` |
| `libVersion` | `3.7.8` |
| `compileType` | `miniprogram` |
| `useCompilerPlugins` | `["less"]` |

### 11.3 `sitemap.json`

允许所有页面被搜索引擎索引：

```json
{
  "action": "allow",
  "page": "*"
}
```

---

## 12. 开发规范

### 12.1 代码风格

| 规范 | 配置 |
|------|------|
| **缩进** | 2 空格 |
| **引号** | 单引号 |
| **分号** | 必须 |
| **尾随逗号** | 所有项保留 |
| **行宽** | 120 字符 |
| **语言** | 仅 JavaScript，禁止 TypeScript |
| **样式** | LESS |

### 12.2 导入顺序

```javascript
// 1. 微信内置模块
// 2. 外部库
// 3. 内部工具
// 4. 同模块
```

### 12.3 页面文件规范

每个页面必须包含四个文件：

```
pages/xxx/
├── index.js      # 页面逻辑
├── index.wxml    # 页面模板
├── index.less    # 页面样式
└── index.json    # 页面配置
```

### 12.4 Git 提交规范

遵循 **Conventional Commits**：

| 标签 | 说明 | 示例 |
|------|------|------|
| `feat:` | 新功能 | `feat: 添加心墙点赞功能` |
| `fix:` | 修复 bug | `fix: 修复评论列表加载失败` |
| `docs:` | 文档更新 | `docs: 更新 API 接口文档` |
| `style:` | 代码格式 | `style: 格式化首页代码` |
| `refactor:` | 重构 | `refactor: 优化瀑布流算法` |
| `test:` | 测试 | `test: 添加登录单元测试` |
| `chore:` | 构建/工具 | `chore: 更新依赖版本` |

---

## 13. 生态协作关系

### 13.1 系统架构图

```
┌─────────────────────────────────────────────────────────────┐
│                        用户层                                │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │  微信小程序  │  │  VR 设备    │  │  Web 管理后台        │  │
│  │ (Pocket)    │  │ (Companion) │  │ (Sentinel Admin)    │  │
│  └──────┬──────┘  └──────┬──────┘  └──────────┬──────────┘  │
└─────────┼────────────────┼────────────────────┼─────────────┘
          │                │                    │
          ▼                ▼                    ▼
┌─────────────────────────────────────────────────────────────┐
│                      服务层 (Sentinel)                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │  Next.js    │  │  OpenClaw   │  │  心宠服务            │  │
│  │  API 网关   │  │  AI 编排    │  │  (WebSocket)        │  │
│  └──────┬──────┘  └──────┬──────┘  └──────────┬──────────┘  │
└─────────┼────────────────┼────────────────────┼─────────────┘
          │                │                    │
          ▼                ▼                    ▼
┌─────────────────────────────────────────────────────────────┐
│                      数据层                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │  PostgreSQL │  │  Redis      │  │  文件存储            │  │
│  │  (主数据库)  │  │  (缓存/会话) │  │  (图片/资源)        │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### 13.2 Pocket 的跨端角色

**边界隔离原则：**

- ✅ **允许**：使用 `wx.request` 消费 API
- ❌ **禁止**：编写任何 Node.js 服务端逻辑、Prisma 数据库连接或 Next.js 代码

**契约服从原则：**

- 必须且只能读取 `docs/api_contract.md` 软链接文件
- 严禁凭借经验"脑补"后端接口字段名
- 如缺少字段，必须报告而非自行伪造

### 13.3 核心交互流程

```
Pocket (微信小程序)
    │
    ├──→ Sentinel API (localhost:3000/api/pocket)
    │       ├── 登录/认证
    │       ├── 心墙帖子 CRUD
    │       ├── 预约管理
    │       └── 用户数据
    │
    ├──→ Pet Service (localhost:3001)
    │       ├── 心宠状态同步 (WebSocket)
    │       ├── 场景数据
    │       └── 事件系统
    │
    └──→ OpenClaw AI
            ├── Therapist 代理（心理咨询）
            ├── 情绪分析
            └── 对话历史
```

---

## 14. 常见问题排查

### 14.1 背景图不显示

| 问题 | 原因 | 解决方案 |
|------|------|----------|
| 背景图不显示 | 使用了 CSS `background-image` | 改用 `<image>` 标签 |
| 图片两侧有白边 | `mode="aspectFill"` 保留比例 | 改用 `mode="scaleToFill"` |
| 圆角外有图片溢出 | 容器缺少 `overflow: hidden` | 添加 `overflow: hidden` |
| 文字被背景图覆盖 | z-index 层级错误 | 背景图 `z-index: -1` |

### 14.2 开发环境问题

| 问题 | 原因 | 解决方案 |
|------|------|----------|
| API 请求失败 | Mock 未启用且后端未启动 | 设置 `isMock: true` 或启动 Sentinel |
| WebSocket 连接失败 | 心宠服务未启动 | 启动 Pet Service (localhost:3001) |
| 样式不生效 | 未使用 LESS 编译 | 确认 `useCompilerPlugins: ["less"]` |
| 组件找不到 | 未在 `usingComponents` 声明 | 检查页面 json 配置 |

### 14.3 心宠系统问题

| 问题 | 原因 | 解决方案 |
|------|------|----------|
| 精灵动画不播放 | 动画帧未正确加载 | 检查 `static/pet/ExportedSprites/` |
| 场景切换失败 | 场景 ID 不匹配 | 确认场景 ID 在 24 个有效范围内 |
| WebSocket 频繁断开 | 网络不稳定 | 检查重连策略和心跳机制 |

---

## 附录 A：心宠场景列表

### 一级场景 (5 个)

| ID | 名称 |
|----|------|
| 1 | 奇幻空间 |
| 2 | 梦境小屋 |
| 3 | 自由旷野 |
| 4 | 心灵港湾 |
| 5 | 学校 |

### 二级场景 (24 个)

| 一级场景 | 二级场景 |
|----------|----------|
| 奇幻空间 | 水晶洞穴、妖精之湖、森林深处、星空营地、迷雾沼泽 |
| 梦境小屋 | 壁炉客厅、阁楼书房、花园温室、厨房、卧室 |
| 自由旷野 | 草原、海滩、山顶、沙漠、冰原 |
| 心灵港湾 | 图书馆、咖啡厅、音乐室、画室、冥想室 |
| 学校 | 教室、食堂、操场、宿舍、天台 |

---

## 附录 B：文件数量统计

| 类别 | 数量 |
|------|------|
| 主包页面 | 10 个 |
| 分包页面 | 14 个 |
| 自定义组件 | 2 个 |
| API 模块 | 4 个 |
| 工具函数 | 3 个 |
| Mock 模块 | 约 30 个 |
| 静态资源 | 约 500+ 个 |
| TDesign 组件 | 80+ 个 |

---

> **文档维护**
> - 本文档为自动生成的全景文档，建议随项目迭代定期更新
> - 如发现文档与代码不一致，请以代码为准并更新本文档
> - 具体功能实现细节请参考各模块的源码注释
