# API 请求层使用指南

> 文档类型: 开发手册
> 适用对象: 前端开发者
> 最后更新: 2026-05-19

---

## 目录

1. [设计原则](#1-设计原则)
2. [快速开始](#2-快速开始)
3. [核心请求模块 (`api/request.js`)](#3-核心请求模块-apirequestjs)
4. [AI 接口模块 (`api/ai.js`)](#4-ai-接口模块-apiaijs)
5. [帖子接口模块 (`api/post.js`)](#5-帖子接口模块-apipostjs)
6. [通知接口模块 (`api/notification.js`)](#6-通知接口模块-apinotificationjs)
7. [Mock 模式](#7-mock-模式)
8. [错误处理](#8-错误处理)
9. [最佳实践](#9-最佳实践)

---

## 1. 设计原则

```
┌─────────────────────────────────────────────────────────┐
│                    API 层设计原则                        │
├─────────────────────────────────────────────────────────┤
│ 1. 严禁直接调用 wx.request                              │
│ 2. 所有函数必须返回 Promise                              │
│ 3. 统一处理 Token 管理和错误拦截                         │
│ 4. Mock/真实环境无缝切换                                 │
│ 5. 导入顺序: 内置 → 外部库 → 内部工具 → 同模块           │
└─────────────────────────────────────────────────────────┘
```

---

## 2. 快速开始

### 2.1 导入方式

```javascript
// ✅ 推荐: 按需导入
import { fetch, post } from '../../api/request';
import { sendToTherapist } from '../../api/ai';

// ❌ 禁止: 直接调用 wx.request
wx.request({
  url: 'http://localhost:3000/api/pocket/posts',
  // ...
});
```

### 2.2 基本调用示例

```javascript
// GET 请求
const getPosts = async () => {
  try {
    const { data } = await fetch('/posts');
    return data;
  } catch (error) {
    console.error('获取帖子失败:', error);
  }
};

// POST 请求
const createPost = async (content) => {
  try {
    const result = await post('/posts', { content });
    return result;
  } catch (error) {
    console.error('发布帖子失败:', error);
  }
};
```

---

## 3. 核心请求模块 (`api/request.js`)

### 3.1 导出方法

| 方法 | HTTP 方法 | 用途 |
|------|-----------|------|
| `fetch(url, params)` | GET | 获取数据 |
| `get(url, params)` | GET | 获取数据（同 fetch） |
| `post(url, data)` | POST | 创建资源 |
| `update(url, data)` | PUT/PATCH | 更新资源 |
| `delete(url)` | DELETE | 删除资源 |
| `remove(url)` | DELETE | 删除资源（同 delete） |

### 3.2 请求配置

```javascript
// 请求自动处理以下配置:
{
  // 基础 URL 自动拼接
  url: `${baseUrl}${path}`,
  
  // 自动附加 Token
  header: {
    'Authorization': 'Bearer <access_token>'
  },
  
  // Mock 模式拦截
  // isMock=true 时直接返回本地数据，延迟 300ms
}
```

### 3.3 基础 URL 配置

```javascript
// config/index.js
const config = {
  // Sentinel 后端地址
  baseUrl: 'http://localhost:3000/api/pocket',
  
  // 可选环境:
  // - 本地开发: 'http://localhost:3000/api/pocket'
  // - 局域网测试: 'http://192.168.x.x:3000/api/pocket'
  // - 生产环境: 'https://api.psytwin.com/api/pocket'
};
```

---

## 4. AI 接口模块 (`api/ai.js`)

### 4.1 接口列表

| 函数 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `sendToTherapist(params)` | `{ message, sessionId, userId }` | Promise<AIResponse> | 发送消息给 AI 咨询师 |
| `extractResponseText(data)` | `AIResponse` | String | 提取 AI 响应文本 |
| `getChatMessages()` | - | Promise<Message[]> | 获取聊天历史 |
| `getEmotionTags()` | - | Promise<Tag[]> | 获取情绪标签 |

### 4.2 使用示例

```javascript
import { sendToTherapist, extractResponseText } from '../../api/ai';

// 发送消息给 AI
const sendMessage = async (message) => {
  try {
    const response = await sendToTherapist({
      message,
      sessionId: this.data.sessionId,
      userId: getApp().globalData.userInfo.id,
    });
    
    const text = extractResponseText(response);
    return text;
  } catch (error) {
    console.error('AI 请求失败:', error);
    return '抱歉，我暂时无法回应。';
  }
};
```

---

## 5. 帖子接口模块 (`api/post.js`)

### 5.1 接口列表

| 函数 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `getPostDetail(postId)` | `String` | Promise<Post> | 获取帖子详情 |
| `toggleLike(postId)` | `String` | Promise<{ liked: boolean }> | 切换点赞状态 |
| `postComment(postId, content)` | `String, String` | Promise<Comment> | 发表评论 |
| `getComments(postId)` | `String` | Promise<Comment[]> | 获取评论列表 |

### 5.2 使用示例

```javascript
import { getPostDetail, toggleLike, postComment } from '../../api/post';

Page({
  data: {
    post: null,
    comments: [],
  },
  
  async onLoad(options) {
    const { id } = options;
    const post = await getPostDetail(id);
    const comments = await getComments(id);
    this.setData({ post, comments });
  },
  
  async handleLike() {
    const { id } = this.data.post;
    const result = await toggleLike(id);
    this.setData({
      'post.isLiked': result.liked,
    });
  },
  
  async handleComment(content) {
    const { id } = this.data.post;
    const comment = await postComment(id, content);
    this.setData({
      comments: [...this.data.comments, comment],
    });
  },
});
```

---

## 6. 通知接口模块 (`api/notification.js`)

### 6.1 接口列表

| 函数 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `getNotifications()` | - | Promise<Notification[]> | 获取通知列表 |
| `markAsRead(notificationId)` | `String` | Promise<void> | 标记通知为已读 |
| `getUnreadCount()` | - | Promise<number> | 获取未读通知数量 |

### 6.2 使用示例

```javascript
import { getNotifications, markAsRead, getUnreadCount } from '../../api/notification';

// 获取通知列表
const notifications = await getNotifications();

// 标记已读
await markAsRead('notification_123');

// 获取未读数
const count = await getUnreadCount();
getApp().setUnreadNum(count);
```

---

## 7. Mock 模式

### 7.1 启用 Mock

```javascript
// config/index.js
const config = {
  isMock: true,  // 启用 Mock
};
```

### 7.2 Mock 数据格式

```javascript
// mock/xxx/xxx.js
module.exports = {
  // 必须返回标准格式
  code: 200,
  data: {
    // ... 业务数据
  },
  message: 'ok',
};
```

### 7.3 Mock 延迟

Mock 请求会模拟真实网络环境，带有 200-500ms 的随机延迟。

---

## 8. 错误处理

### 8.1 统一错误码

| 状态码 | 含义 | 处理方式 |
|--------|------|----------|
| 200 | 成功 | 正常处理 |
| 401 | 未授权 | 跳转登录页 |
| 403 | 禁止访问 | 提示权限不足 |
| 404 | 资源不存在 | 提示用户 |
| 500 | 服务器错误 | 提示稍后重试 |

### 8.2 错误处理示例

```javascript
import { fetch } from '../../api/request';

const safeFetch = async (url) => {
  try {
    const result = await fetch(url);
    return result;
  } catch (error) {
    if (error.statusCode === 401) {
      wx.showToast({
        title: '登录已过期，请重新登录',
        icon: 'none',
      });
      wx.reLaunch({ url: '/pages/login/login' });
    } else {
      wx.showToast({
        title: error.message || '请求失败',
        icon: 'none',
      });
    }
    throw error;
  }
};
```

---

## 9. 最佳实践

### 9.1 页面中使用 API

```javascript
// pages/example/index.js
import { fetch } from '../../api/request';
import { getPostDetail } from '../../api/post';

Page({
  data: {
    list: [],
    loading: false,
    page: 1,
    hasMore: true,
  },
  
  async onLoad() {
    await this.loadData();
  },
  
  async loadData() {
    if (this.data.loading || !this.data.hasMore) return;
    
    this.setData({ loading: true });
    
    try {
      const { data, total } = await fetch('/posts', {
        page: this.data.page,
        size: 20,
      });
      
      this.setData({
        list: [...this.data.list, ...data],
        page: this.data.page + 1,
        hasMore: this.data.list.length + data.length < total,
      });
    } catch (error) {
      console.error('加载失败:', error);
    } finally {
      this.setData({ loading: false });
    }
  },
  
  onReachBottom() {
    this.loadData();
  },
});
```

### 9.2 新增 API 模块

当需要对接新功能时，建议创建新的 API 模块文件：

```javascript
// api/appointment.js
import { fetch, post, update, remove } from './request';

/**
 * 获取预约列表
 * @param {Object} params - 查询参数
 * @returns {Promise}
 */
export const getAppointments = (params) => fetch('/appointments', params);

/**
 * 创建预约
 * @param {Object} data - 预约数据
 * @returns {Promise}
 */
export const createAppointment = (data) => post('/appointments', data);

/**
 * 取消预约
 * @param {string} id - 预约 ID
 * @returns {Promise}
 */
export const cancelAppointment = (id) => remove(`/appointments/${id}`);
```

### 9.3 注意事项

| ✅ 应该 | ❌ 不应该 |
|---------|----------|
| 使用 async/await | 使用回调函数 |
| 按需导入 API 函数 | 一次性导入整个模块 |
| 在 try/catch 中处理错误 | 忽略错误处理 |
| 使用语义化方法名 | 使用模糊的方法名 |
| 添加 JSDoc 注释 | 不写注释 |

---

> **相关文档**
> - [PROJECT_OVERVIEW.md](./PROJECT_OVERVIEW.md) - 项目全景文档
> - [组件开发指南](./COMPONENT_GUIDE.md) - 组件开发手册
