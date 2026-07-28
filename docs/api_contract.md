# 🤝 PsyTwin 跨端 API 契约 (OpenSpecs)

> **核心原则**：本文档是 Sentinel 后端与 Pocket 小程序端通信的**唯一事实真相**。两端的 AI 智能体在进行网络层开发时，必须严格以此文档为准。

---

## 1. 全局规范

### 1.1 基础信息
- **Base URL (开发环境)**: `http://localhost:3000`
- **API 前缀**: `/api/pocket`
- **完整示例**: `http://localhost:3000/api/pocket/student/home/feed`

### 1.2 认证方式
```
Authorization: Bearer <token>
```
- **演示模式**: token 直接作为用户 ID（如 `stu001`）
- **无 token**: 自动使用默认用户 `stu001`

### 1.3 统一响应格式
```json
{
  "code": 0,              // 0 表示成功，非 0 表示失败
  "message": "操作成功",  // 提示信息
  "data": {}              // 实际业务数据载荷
}
```

### 1.4 错误码规范
| 错误码 | 含义 |
|--------|------|
| 0 | 成功 |
| 1 | 通用错误 |
| 400 | 参数错误 |
| 401 | 未授权 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

---

## 2. 认证模块

### 2.1 登录
```http
POST /api/pocket/auth/login/password
```

**Request Body**:
```json
{
  "phone": "13800138001",
  "password": "123456"
}
```

**Response**:
```json
{
  "code": 0,
  "message": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "stu001",
      "name": "小明同学",
      "nickname": "小明",
      "avatar": "https://...",
      "studentNo": "2023001001",
      "badges": [...],
      "stats": {
        "counselingCount": 2,
        "vrSessionCount": 5,
        "assessmentCount": 3,
        "totalMinutes": 185
      }
    }
  }
}
```

### 2.2 获取当前用户信息
```http
GET /api/pocket/auth/me
```

---

## 3. 心墙动态模块

### 3.1 获取首页动态流
```http
GET /api/pocket/student/home/feed?page=1&limit=20
```

**Response**:
```json
{
  "code": 0,
  "data": {
    "follow": [...],    // 关注的人动态
    "square": [...],    // 广场动态
    "secret": [...]     // 匿名树洞
  }
}
```

**Post Item**:
```json
{
  "id": "post_001",
  "author": {
    "id": "u1",
    "nickname": "小晶",
    "avatar": "https://...",
    "role": "student",
    "department": "计算机学院"
  },
  "content": {
    "text": "期末复习第三天...",
    "images": ["https://..."],
    "location": "校园操场",
    "isAnonymous": false
  },
  "stats": {
    "likeCount": 38,
    "commentCount": 7,
    "shareCount": 0
  },
  "isLiked": false,
  "isCollected": true,
  "createdAt": "2026-03-07T10:30:00Z",
  "riskScore": 0.15
}
```

### 3.2 点赞/取消点赞
```http
POST /api/pocket/student/home/posts/:id/like
```

**Response**:
```json
{
  "code": 0,
  "data": { "liked": true },
  "message": "点赞成功"
}
```

### 3.3 收藏/取消收藏
```http
POST /api/pocket/student/home/posts/:id/collect
```

### 3.4 获取评论列表
```http
GET /api/pocket/student/home/posts/:id/comments
```

### 3.5 发表评论
```http
POST /api/pocket/student/home/posts/:id/comments
```

**Request Body**:
```json
{
  "content": "加油！",
  "parentId": null  // 回复某条评论的ID
}
```

---

## 4. 预约咨询模块

### 4.1 获取预约服务列表
```http
GET /api/pocket/student/appointment/services
```

**Response**:
```json
{
  "code": 0,
  "data": {
    "teachers": [
      {
        "id": "t001",
        "teacherId": "T2021001",
        "name": "李心理",
        "nickname": "心理老师李",
        "avatar": "https://...",
        "department": "心理健康中心",
        "title": "高级心理咨询师",
        "qualifications": ["国家二级心理咨询师"],
        "workStats": { "totalCounseling": 128, "satisfactionRate": 98 }
      }
    ],
    "rooms": [
      {
        "id": "room-001",
        "name": "心理咨询室 A01",
        "location": "学生活动中心3层",
        "capacity": 2,
        "status": "AVAILABLE",
        "currentStudentId": null
      }
    ]
  }
}
```

### 4.2 获取预约记录
```http
GET /api/pocket/student/appointment/records?status=PENDING&page=1&limit=20
```

### 4.3 创建预约
```http
POST /api/pocket/appointments
```

**Request Body**:
```json
{
  "teacherId": "t001",
  "type": "COUNSELING",
  "date": "2026-03-15",
  "startTime": "14:00",
  "endTime": "15:00",
  "reason": "焦虑情绪咨询",
  "roomId": "room-001"
}
```

### 4.4 获取预约列表
```http
GET /api/pocket/appointments
```

### 4.5 更新预约
```http
PATCH /api/pocket/appointments/:id
```

**Request Body**:
```json
{
  "status": "CANCELLED",
  "cancelReason": "临时有事"
}
```

---

## 5. 消息通知模块

### 5.1 获取消息会话列表
```http
GET /api/pocket/student/message/sessions
```

**Response**:
```json
{
  "code": 0,
  "data": {
    "sessions": [
      {
        "id": "session_001",
        "type": "AI",
        "title": "PsyTwin 树洞助手",
        "targetId": "ai-assistant",
        "targetName": "PsyTwin 树洞助手",
        "targetAvatar": "https://...",
        "lastMessage": "你好！有什么我可以帮你的吗？",
        "lastMessageAt": "2026-03-09T12:00:00Z",
        "unreadCount": 1,
        "status": "online"
      }
    ]
  }
}
```

### 5.2 获取通知列表
```http
GET /api/pocket/notifications?isRead=false&page=1&limit=20
```

### 5.3 标记通知为已读
```http
PATCH /api/pocket/notifications/:id
```

---

## 6. 用户中心模块

### 6.1 获取我的信息
```http
GET /api/pocket/student/my/info
```

**Response**:
```json
{
  "code": 0,
  "data": {
    "id": "stu001",
    "name": "小明同学",
    "nickname": "小明",
    "avatar": "https://...",
    "studentNo": "2023001001",
    "className": "软件工程 2301 班",
    "riskLevel": "LOW",
    "badges": [...],
    "stats": {
      "counselingCount": 2,
      "vrSessionCount": 5,
      "assessmentCount": 3,
      "totalMinutes": 185
    }
  }
}
```

### 6.2 获取我的帖子
```http
GET /api/pocket/user/posts?page=1&limit=20
```

### 6.3 获取我的收藏
```http
GET /api/pocket/user/collections?page=1&limit=20
```

---

## 7. 心宠日记模块

### 7.1 获取指定日期日记
```http
GET /api/pocket/pet/diary?date=2026-06-13
```

`GET` 默认只读取已有记录。传入 `ensure=true` 时，如果指定日期没有日记，服务端会从 `pet_diary_templates` 随机抽取 4—8 条，生成 08:00—23:59 之间的唯一时间点并持久化；已有记录不会重复生成。该批量生成不依赖心宠实时状态、场景、当前时间或触发概率。

**Response**:
```json
{
  "code": 0,
  "message": "操作成功",
  "data": {
    "dateKey": "2026-06-13",
    "entries": [
      {
        "id": "cuid",
        "time": "21:00",
        "type": "DB_DIARY",
        "title": "今天的小发现",
        "content": "今天我在角落里待了一会儿...",
        "sceneId": "dormitory",
        "dateKey": "2026-06-13",
        "mood": 60,
        "energy": 75,
        "source": "template_library",
        "templateSlug": "pet-diary-template-001",
        "createdAt": "2026-06-13T13:00:00.000Z"
      }
    ],
    "diaryDataMap": {
      "2026-06-13": []
    }
  }
}
```

### 7.2 按规则触发日记
```http
POST /api/pocket/pet/diary/trigger
```

**Request Body**:
```json
{
  "sceneId": "library",
  "date": "2026-06-13",
  "hour": 21
}
```

**规则**:
- [x] 只允许 `dormitory` 和 `library` 场景触发。*(已于 2026-06-13 落地到 Sentinel 规则与 Pocket 触发前置判断)*
- [x] 只在 20:00-23:59 时间段触发。*(已于 2026-06-13 落地到 Sentinel 规则)*
- [x] 同一天已有模板日记时不重复自动触发。*(已于 2026-06-13 落地到 Sentinel 查询判断)*
- [x] 满足条件后按 40% 概率生成。*(已于 2026-06-13 落地到 Sentinel 规则)*

**Response**:
```json
{
  "code": 0,
  "data": {
    "triggered": true,
    "entry": {},
    "entries": [],
    "diaryDataMap": {}
  }
}
```

### 7.3 测试读取日记
```http
POST /api/pocket/pet/diary/test
```

**Request Body**:
```json
{
  "sceneId": "dormitory",
  "date": "2026-06-13"
}
```

**说明**: 绕过时间和概率限制，直接从 `pet_diary_templates` 随机抽取一篇模板并写入 `pet_diary_entries`，用于小程序面板测试按钮。

### 7.4 离线补全日记
```http
POST /api/pocket/pet/diary/backfill
```

**Request Body**:
```json
{
  "lastOnlineAt": "2026-06-10T12:00:00.000Z",
  "maxDays": 7
}
```

**Response**:
```json
{
  "code": 0,
  "message": "离线心宠日记补全完成",
  "data": {
    "generatedDates": ["2026-06-11", "2026-06-12"],
    "entries": [],
    "diaryDataMap": {}
  }
}
```

**状态追踪**:
- [x] `pet_diary_templates` 模板库提供 200 篇通用日记。*(已于 2026-06-13 新增 Prisma 模型、迁移与种子脚本)*
- [x] 小程序上线后根据离线时间补齐今日之前缺失日期。*(已于 2026-06-13 接入 Pocket 同步链路)*
- [x] 小程序日记面板提供测试读取按钮。*(已于 2026-06-13 接入 Pocket 日记面板)*

---

## 8. 心宠权威状态同步

心宠服务是 `sceneId`、活动和三维状态的唯一事实源。Pocket 与 Unity 使用相同的 `userId` 消费状态，
不得根据客户端本地时间重新计算位置，也不得把玩家观察视角作为心宠所在地回写。

### 8.1 获取完整状态

```http
GET http://{pet-sync-host}:13002/api/pet/status?userId=demo_pet
```

```json
{
  "code": 0,
  "data": {
    "state": {
      "userId": "demo_pet",
      "mood": 60,
      "energy": 75,
      "social": 45,
      "sceneId": "teaching_building",
      "activity": "正在上课",
      "activityStartTime": 1710000000000,
      "activityDuration": 45,
      "stateVersion": 123,
      "updatedAt": 1710000005000
    },
    "serverTime": 1710000005000,
    "updatedAt": 1710000005000,
    "stateVersion": 123
  }
}
```

`state.sceneId` 是原始场景 ID。小程序将它写入 `petSceneId`，但不得覆盖表示玩家观察视角的
`currentSceneId`；Unity 当前只显示该原始字符串，不切换实际 Unity Scene。

部署迁移期间，Pocket 与 Unity 可以兼容旧版接口将状态字段直接放在 `data` 下的响应；服务端目标结构
仍必须升级为上述 `data.state`，并提供 `stateVersion`、`updatedAt` 与 `serverTime`。

### 8.2 WebSocket 实时状态

```text
ws://{pet-sync-host}:13002/ws/pet?userId=demo_pet&clientType=pocket
ws://{pet-sync-host}:13002/ws/pet?userId=demo_pet&clientType=unity
```

服务端通过 `pet_status` 下发完整状态：

```json
{
  "type": "pet_status",
  "payload": {
    "status": {
      "userId": "demo_pet",
      "sceneId": "teaching_building",
      "activity": "正在上课",
      "stateVersion": 123,
      "updatedAt": 1710000005000
    },
    "serverTime": 1710000005000,
    "updatedAt": 1710000005000,
    "stateVersion": 123
  }
}
```

客户端必须忽略 `stateVersion` 小于当前已显示版本的响应。WebSocket 断线时保留最后一次状态，
并使用 HTTP 状态接口完成首次加载和轮询兜底。

**状态追踪**:
- [x] Pocket 区分服务端权威 `petSceneId` 与玩家观察 `currentSceneId`。*(已于 2026-07-20 完成代码与自动化测试)*
- [x] Pocket HTTP 与 WebSocket 共用权威位置应用逻辑。*(已于 2026-07-20 完成代码与自动化测试)*
- [x] Unity HUD 消费并显示原始 `sceneId`。*(已于 2026-07-20 完成代码与 Unity EditMode 测试)*
- [x] Pocket 兼容旧版状态直接位于 `data` 下的响应。*(已于 2026-07-20 根据线上接口完成回归测试)*
- [x] Sentinel `stu-test` 心宠页固定观察 `demo_pet`，实时同步 mood、energy、social、sceneId 与 activity。*(已于 2026-07-22 通过本地 WebSocket 联调，三项状态值持续更新)*
- [x] Sentinel `demo_pet` 页面消费服务端 `activityLog`，展示最近的场景切换、行为事件与状态变化，并补充事件发生地点。*(已于 2026-07-22 完成本地联调与 8 项适配器自动化测试)*
- [x] Sentinel 心宠日志采用实时信息流展示：新日志从顶部进入，既有日志向下移动，并兼容系统减少动态效果设置。*(已于 2026-07-22 完成浏览器动效联调)*
- [ ] 线上心宠服务部署 `data.state`、`stateVersion`、`updatedAt` 与 `serverTime`。*(2026-07-20 核对线上接口仍为旧结构)*
- [ ] Pocket、Unity 与心宠服务完成同一 `userId` 的端到端运行联调。*(等待线上契约升级与运行环境联调)*

### 8.3 Pocket 触发心宠难过表情

```http
POST /api/pocket/pet/expression
Authorization: Bearer <token>
Content-Type: application/json
```

请求体仅接受固定语义化枚举，不允许 Pocket 提交底层动作名：

```json
{
  "expression": "sad"
}
```

成功响应（HTTP 200）：

```json
{
  "code": 0,
  "message": "心宠表情请求已发送",
  "data": {
    "expression": "sad"
  }
}
```

错误响应：未登录返回 HTTP 401；请求体非法返回 HTTP 400；设备服务不可用或动作执行失败返回 HTTP 502。
Sentinel 必须将 `sad` 固定映射到已登记的 `emotion/sad1` 动作，不得接受任意动作路径或命令。

**状态追踪**:
- [x] Sentinel 提供 Pocket 专用难过表情接口并固定映射安全动作白名单。*(已于 2026-07-27 完成接口、契约与自动化验证)*
- [x] Pocket 创建演示求助事件后调用难过表情接口。*(已于 2026-07-27 完成请求封装与交互接入)*
- [ ] 实体心宠执行 `sad1` 表情的连机验收。*(需要心宠设备与 Host Bridge 在线)*

---

## 9. 枚举定义

### RoomStatus
- `AVAILABLE` - 可用
- `IN_USE` - 使用中
- `MAINTENANCE` - 维护中

### AppointmentType
- `COUNSELING` - 心理咨询
- `VR` - VR体验
- `GROUP` - 团体辅导

### AppointmentStatus
- `PENDING` - 待确认
- `CONFIRMED` - 已确认
- `COMPLETED` - 已完成
- `CANCELLED` - 已取消

### NotificationType
- `SYSTEM` - 系统通知
- `APPOINTMENT` - 预约通知
- `CHAT` - 聊天消息
- `WARNING` - 预警提醒

---

## 10. 字段映射表

| API 字段 | 数据库字段 | 说明 |
|----------|-----------|------|
| `startTime` | `time_slot` (解析前半部分) | API 层转换 |
| `endTime` | `time_slot` (解析后半部分) | API 层转换 |
| `currentStudentId` | `current_student_id` | 直接映射 |
| `createdAt` | `created_at` | 驼峰命名转换 |

---

*文档版本: v2.2 | 更新日期: 2026-07-20*
# F9 心宠对话演示扩展（2026-07-27）

`pet_status.payload.status` 可选包含 `demoConversation`：`active`、`phase`、`speaker`、`text` 以及 `companion` (`id`、`name`、`avatar`)。`meeting` 阶段可省略说话者与台词；进入心理咨询室或演示结束时字段为 `null` 或不存在。该字段仅由本地心宠服务器权威下发，Pocket、Sentinel 与 Unity 只读消费。
