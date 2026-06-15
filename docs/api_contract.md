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

## 8. 枚举定义

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

## 9. 字段映射表

| API 字段 | 数据库字段 | 说明 |
|----------|-----------|------|
| `startTime` | `time_slot` (解析前半部分) | API 层转换 |
| `endTime` | `time_slot` (解析后半部分) | API 层转换 |
| `currentStudentId` | `current_student_id` | 直接映射 |
| `createdAt` | `created_at` | 驼峰命名转换 |

---

*文档版本: v2.1 | 更新日期: 2026-06-13*
