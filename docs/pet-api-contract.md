# 心宠API契约文档 (API Contract)

> **文档编号**: AC-001
> **状态**: 已批准 (Approved)
> **版本**: v1.0
> **生效日期**: 2026-04-25
> **影响范围**: Pocket小程序、Unity PC端、Pet服务端、Sentinel管理后台
> **替代旧决策**: pet-system-overview.md#L431, pet-feature-design.md#L585, unity-pc-game-design.md#L1688

---

## 1. 设计原则

1. **唯一来源**: 本文档是所有API的唯一规范，其他文档不得自行定义API
2. **版本控制**: API路径统一使用 `/api/v1/pet/` 前缀
3. **统一响应**: 所有响应遵循 `{ code, message, data }` 格式
4. **字段命名**: 使用 camelCase，与 Prisma schema 保持一致
5. **错误码**: 使用统一的错误码体系

---

## 2. 基础规范

### 2.1 请求规范

```
Base URL: https://api.psytwin.com/api/v1/pet

Headers:
  Authorization: Bearer <jwt_token>
  Content-Type: application/json
  X-Client-Type: pocket | unity
  X-Client-Version: 1.0.0
```

### 2.2 响应规范

```typescript
interface ApiResponse<T> {
  code: number;        // 业务状态码 (0=成功)
  message: string;     // 状态描述
  data: T;            // 响应数据
  timestamp: number;   // 服务器时间戳
  requestId: string;   // 请求唯一ID (用于追踪)
}
```

### 2.3 错误码体系

| 错误码 | 含义 | HTTP状态码 | 说明 |
|--------|------|-----------|------|
| 0 | 成功 | 200 | 请求成功 |
| 1001 | 参数错误 | 400 | 请求参数缺失或格式错误 |
| 1002 | 未授权 | 401 | Token无效或过期 |
| 1003 | 权限不足 | 403 | 无权访问该资源 |
| 1004 | 资源不存在 | 404 | 请求的资源不存在 |
| 1005 | 请求过于频繁 | 429 | 触发限流 |
| 2001 | 心宠不存在 | 404 | 用户还没有心宠 |
| 2002 | 场景不存在 | 404 | 请求的场景ID无效 |
| 2003 | 事件不存在 | 404 | 事件ID无效 |
| 2004 | 事件已过期 | 410 | 事件已超过处理时间 |
| 2005 | 事件已处理 | 409 | 事件已被处理过 |
| 2006 | Unity控制冲突 | 409 | 心宠正被Unity控制 |
| 2007 | 心宠已存在 | 409 | 用户已有心宠，重复创建 |
| 3001 | 数据库错误 | 500 | 数据库操作失败 |
| 3002 | AI引擎错误 | 500 | 心宠AI运算异常 |
| 3003 | 同步错误 | 500 | 状态同步失败 |
| 9999 | 未知错误 | 500 | 服务器内部错误 |

---

## 3. HTTP API 接口

### 3.1 心宠状态

#### 创建心宠（首次打开自动调用）

```
POST /create

Headers:
  Authorization: Bearer <token>

Response 200:
{
  "code": 0,
  "message": "success",
  "data": {
    "pet": {
      "id": "pet_abc123",
      "name": "小安",
      "species": "cat",
      // ... 完整宠物数据
    }
  },
  "timestamp": 1714035600000,
  "requestId": "req_create001"
}

Response 2007 (已存在心宠):
{
  "code": 2007,
  "message": "心宠已存在",
  "data": {
    "petId": "pet_abc123"
  }
}
```

#### 获取心宠完整状态

```
GET /status

Headers:
  Authorization: Bearer <token>

Response 200:
{
  "code": 0,
  "message": "success",
  "data": {
    "pet": {
      "id": "pet_abc123",
      "ownerId": "stu_xxx",
      "name": "小安",
      "species": "cat",
      "appearance": {
        "color": "orange",
        "accessories": ["bell"],
        "expression": "happy"
      },
      "personality": {
        "openness": 65,
        "conscientiousness": 55,
        "extraversion": 40,
        "agreeableness": 70,
        "neuroticism": 35
      },
      "status": {
        "mood": 75,
        "energy": 82,
        "sociability": 35
      },
      "location": {
        "sceneId": "fantasy_forest",
        "x": 320,
        "y": 240,
        "direction": "right"
      },
      "activity": {
        "type": "exploring",
        "name": "森林探险",
        "startTime": 1714032000000,
        "duration": 3600,
        "progress": 0.35
      },
      "isOnline": true,
      "isSleeping": false,
      "isInteracting": false,
      "controlState": "ai_auto",
      "lastUpdate": 1714035600000
    },
    "currentScene": {
      "id": "fantasy_forest",
      "name": "奇幻森林",
      "type": "exploration",
      "currentState": {
        "weather": "sunny",
        "timeOfDay": "afternoon",
        "crowdLevel": 45,
        "currentPets": 12
      }
    },
    "schedule": {
      "currentPeriod": "14:00-15:40",
      "activity": "free_time",
      "nextActivity": "attending_class",
      "nextTime": "15:40"
    },
    "pendingEvents": [
      {
        "id": "evt_xyz789",
        "type": "large",
        "title": "考试失利",
        "description": "今天数学考试没考好，心情很差...",
        "deadline": 1714122000000
      }
    ]
  },
  "timestamp": 1714035600000,
  "requestId": "req_abc123"
}

Response 2001 (心宠不存在):
{
  "code": 2001,
  "message": "宠物不存在，正在为您生成...",
  "data": null,
  "timestamp": 1714035600000,
  "requestId": "req_def456"
}
```

#### 保存心宠状态（Unity端使用）

```
POST /status

Headers:
  Authorization: Bearer <token>
  X-Client-Type: unity

Body:
{
  "location": {
    "sceneId": "fantasy_forest",
    "x": 350,
    "y": 260,
    "direction": "right"
  },
  "activity": {
    "type": "exploring",
    "name": "森林探险",
    "startTime": 1714032000000,
    "duration": 3600,
    "progress": 0.5
  }
}

Response 200:
{
  "code": 0,
  "message": "状态已保存",
  "data": {
    "pet": { ... },  // 返回更新后的完整状态
    "aiPaused": true  // AI是否已暂停
  },
  "timestamp": 1714035600000,
  "requestId": "req_ghi789"
}

Response 2006 (Unity控制冲突):
{
  "code": 2006,
  "message": "心宠正被其他Unity客户端控制",
  "data": {
    "controlledBy": "session_xxx",
    "since": 1714035000000
  },
  "timestamp": 1714035600000,
  "requestId": "req_jkl012"
}
```

---

### 3.2 场景管理

#### 获取场景列表

```
GET /scenes

Response 200:
{
  "code": 0,
  "message": "success",
  "data": {
    "scenes": [
      {
        "id": "fantasy_forest",
        "name": "奇幻森林",
        "type": "exploration",
        "description": "神秘的魔法森林，适合探索和放松",
        "openTime": { "start": "00:00", "end": "24:00" },
        "config": {
          "width": 800,
          "height": 600,
          "maxPets": 20,
          "background": "https://cdn.psytwin.com/scenes/fantasy_forest.png"
        },
        "currentState": {
          "weather": "sunny",
          "timeOfDay": "afternoon",
          "crowdLevel": 45,
          "currentPets": 12
        },
        "thumbnail": "https://cdn.psytwin.com/scenes/fantasy_forest_thumb.png"
      }
    ]
  }
}
```

#### 获取场景详情

```
GET /scenes/:sceneId

Response 200:
{
  "code": 0,
  "message": "success",
  "data": {
    "scene": { ... },
    "virtualPets": [
      {
        "id": "virtual_abc123",
        "name": "小花",
        "species": "rabbit",
        "location": { "x": 400, "y": 300, "direction": "left" },
        "activity": { "type": "idle", "name": "发呆" },
        "expression": "happy"
      }
    ],
    "items": [
      {
        "id": "item_abc123",
        "name": "幸运四叶草",
        "type": "collectible",
        "x": 500,
        "y": 350
      }
    ]
  }
}
```

#### 切换场景

```
POST /scenes/:sceneId/enter

Body:
{
  "petId": "pet_abc123"
}

Response 200:
{
  "code": 0,
  "message": "场景切换成功",
  "data": {
    "newScene": { ... },
    "transition": "fade",  // 过渡动画类型
    "virtualPets": [ ... ]
  }
}
```

---

### 3.3 事件系统

#### 获取待处理事件

```
GET /events/pending

Response 200:
{
  "code": 0,
  "message": "success",
  "data": {
    "events": [
      {
        "id": "evt_xyz789",
        "type": "large",
        "category": "emotion",
        "title": "考试失利",
        "description": "今天数学考试没考好，心情很差...",
        "status": "pending",
        "trigger": {
          "time": "14:30",
          "probability": 0.3
        },
        "options": [
          {
            "id": "opt_1",
            "text": "安慰鼓励",
            "hint": "温柔的鼓励能让心宠重拾信心",
            "impact": { "mood": 15, "energy": 5 }
          },
          {
            "id": "opt_2",
            "text": "分析原因",
            "hint": "帮助心宠找到问题所在",
            "impact": { "mood": 5, "energy": -5 }
          }
        ],
        "deadline": 1714122000000,
        "impactPreview": { "mood": -10, "energy": -5 }
      }
    ]
  }
}
```

#### 解决事件

```
POST /events/:eventId/resolve

Body:
{
  "optionId": "opt_1",
  "message": "加油，下次会更好！"
}

Response 200:
{
  "code": 0,
  "message": "事件已解决",
  "data": {
    "result": {
      "success": true,
      "message": "心宠感受到了你的鼓励，心情变好了！",
      "moodChange": 15,
      "energyChange": 5,
      "socialChange": 0,
      "itemsObtained": [
        { "itemId": "item_001", "name": "鼓励便签", "quantity": 1 }
      ]
    },
    "pet": { ... },  // 更新后的宠物状态
    "diaryEntry": {
      "id": "de_abc123",
      "time": "14:30",
      "content": "考试没考好，但在你的鼓励下恢复了心情",
      "moodChange": 15
    }
  }
}

Response 2004 (事件已过期):
{
  "code": 2004,
  "message": "事件已过期",
  "data": { "expiredAt": 1714122000000 }
}

Response 2005 (事件已处理):
{
  "code": 2005,
  "message": "事件已被处理",
  "data": { "resolvedAt": 1714035600000 }
}
```

---

### 3.4 日记系统

#### 获取日记

```
GET /diary?date=2026-04-23&page=1&limit=20

Response 200:
{
  "code": 0,
  "message": "success",
  "data": {
    "entries": [
      {
        "id": "de_001",
        "time": "08:00",
        "type": "activity",
        "content": "起床，在奇幻森林中苏醒",
        "sceneId": "fantasy_forest",
        "moodChange": 5,
        "activity": "wake_up"
      },
      {
        "id": "de_002",
        "time": "14:30",
        "type": "event",
        "content": "考试没考好，心情低落",
        "sceneId": "classroom",
        "moodChange": -20,
        "eventId": "evt_xyz789",
        "userResponse": "安慰鼓励",
        "resolved": true
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "hasMore": true
    }
  }
}
```

---

### 3.5 背包系统

#### 获取背包

```
GET /inventory

Response 200:
{
  "code": 0,
  "message": "success",
  "data": {
    "items": [
      {
        "itemId": "item_001",
        "name": "幸运饼干",
        "type": "food",
        "description": "吃下去会带来好运",
        "quantity": 3,
        "effect": { "mood": 10, "energy": 5 },
        "icon": "https://cdn.psytwin.com/items/fortune_cookie.png",
        "source": "在奇幻森林探索时发现"
      }
    ],
    "capacity": {
      "used": 15,
      "total": 50
    }
  }
}
```

---

### 3.6 管理后台API (Sentinel使用)

> **Base URL**: `https://api.psytwin.com/api/v1/admin`
> （注意：admin接口使用Sentinel的Base URL，非Pet服务）

#### 上报心宠状态提醒

```
POST /pet-alerts

Headers:
  Authorization: Bearer <sentinel_service_token>
  Content-Type: application/json

Body:
{
  "petId": "pet_abc123",
  "userId": "stu_xxx",
  "severity": "medium",
  "type": "mood_decline",
  "title": "心宠心情持续低落",
  "description": "心宠已连续3天心情低于30",
  "indicators": {
    "moodTrend": 25,
    "energyTrend": 40,
    "duration": 3
  },
  "suggestedAction": "建议查看心宠状态提醒；如用户主动表达风险，按平台安全流程处理"
}

Response 200:
{
  "code": 0,
  "message": "状态提醒已创建",
  "data": {
    "alertId": "alert_abc123",
    "status": "pending",
    "createdAt": 1714035600000
  }
}
```

#### 处理状态提醒

```
PUT /pet-alerts/:alertId

Headers:
  Authorization: Bearer <sentinel_service_token>
  Content-Type: application/json

Body:
{
  "status": "handled",
  "resolution": "已联系学生辅导员进行关怀",
  "notes": "学生近期学业压力较大，建议持续关注"
}

Response 200:
{
  "code": 0,
  "message": "状态提醒已处理",
  "data": {
    "alert": {
      "id": "alert_abc123",
      "status": "handled",
      "handledBy": "admin_xxx",
      "handledAt": 1714035600000,
      "resolution": "已联系学生辅导员进行关怀",
      "notes": "学生近期学业压力较大，建议持续关注"
    }
  }
}

Response 1004 (状态提醒不存在):
{
  "code": 1004,
  "message": "状态提醒不存在",
  "data": null
}
```

---

#### 获取状态提醒列表

```
GET /pet-alerts?severity=medium&page=1&limit=20

Response 200:
{
  "code": 0,
  "message": "success",
  "data": {
    "alerts": [
      {
        "id": "alert_abc123",
        "petId": "pet_abc123",
        "userId": "stu_xxx",
        "severity": "medium",
        "type": "mood_decline",
        "title": "心宠心情持续低落",
        "status": "pending",
        "createdAt": 1714035600000,
        "moodSnapshot": 25,
        "energySnapshot": 60,
        "sociabilitySnapshot": 30,
        "duration": 3
      }
    ],
    "pagination": { ... }
  }
}
```

---

## 4. WebSocket 消息协议

### 4.1 连接流程

```
1. 客户端连接: wss://api.psytwin.com/ws/pet
2. 发送认证消息
3. 服务器返回认证结果
4. 开始心跳
5. 接收状态推送
```

### 4.2 消息格式

```typescript
interface WebSocketMessage {
  type: MessageType;
  messageId: string;    // 客户端生成，用于ack
  timestamp: number;    // 发送时间戳
  payload: any;
}

type MessageType =
  // 连接管理
  | 'auth' | 'auth_success' | 'auth_failed'
  | 'heartbeat' | 'heartbeat_ack'
  // 状态同步
  | 'pet_status' | 'pet_status_req'
  | 'scene_sync' | 'scene_enter' | 'scene_leave'
  // 事件系统
  | 'event_trigger' | 'event_resolve' | 'event_list'
  // 用户交互
  | 'user_action' | 'action_result'
  // 系统
  | 'error' | 'notification' | 'control_state_change';
```

### 4.3 消息详情

#### 认证

```javascript
// 客户端 → 服务器
{
  type: 'auth',
  messageId: 'msg_001',
  timestamp: 1714035600000,
  payload: {
    token: 'jwt_token_here',
    deviceId: 'device_abc123',
    clientType: 'pocket',  // 'pocket' | 'unity'
    version: '1.0.0'
  }
}

// 服务器 → 客户端
{
  type: 'auth_success',
  messageId: 'msg_001',
  timestamp: 1714035600000,
  payload: {
    userId: 'stu_xxx',
    petId: 'pet_abc123',
    serverTime: 1714035600000,
    heartbeatInterval: 30000,
    controlState: 'ai_auto'  // 'ai_auto' | 'unity_control'
  }
}
```

#### 心跳

```javascript
// 客户端 → 服务器 (每30秒)
{
  type: 'heartbeat',
  messageId: 'msg_002',
  timestamp: 1714035600000,
  payload: { timestamp: 1714035600000 }
}

// 服务器 → 客户端
{
  type: 'heartbeat_ack',
  messageId: 'msg_002',
  timestamp: 1714035600100,
  payload: {
    serverTime: 1714035600100,
    latency: 100
  }
}
```

#### 心宠状态推送

```javascript
// 服务器 → 客户端 (状态变化时推送)
{
  type: 'pet_status',
  messageId: 'srv_001',
  timestamp: 1714035600000,
  payload: {
    petId: 'pet_abc123',
    timestamp: 1714035600000,
    status: {
      mood: 75,
      energy: 82,
      sociability: 35
    },
    location: {
      sceneId: 'fantasy_forest',
      x: 320,
      y: 240,
      direction: 'right'
    },
    activity: {
      type: 'exploring',
      name: '森林探险',
      progress: 0.35
    },
    expression: {
      type: 'happy',
      animation: 'jump'
    }
  }
}
```

#### 场景同步

```javascript
// 服务器 → 客户端 (10秒间隔广播)
{
  type: 'scene_sync',
  messageId: 'srv_002',
  timestamp: 1714035600000,
  payload: {
    sceneId: 'fantasy_forest',
    timestamp: 1714035600000,
    virtualPets: [
      {
        id: 'virtual_abc123',
        name: '小花',
        species: 'rabbit',
        x: 400,
        y: 300,
        direction: 'left',
        activity: 'idle',
        expression: 'happy'
      }
    ],
    sceneState: {
      weather: 'sunny',
      timeOfDay: 'afternoon',
      crowdLevel: 45
    }
  }
}
```

#### 事件触发

```javascript
// 服务器 → 客户端
{
  type: 'event_trigger',
  messageId: 'srv_003',
  timestamp: 1714035600000,
  payload: {
    eventId: 'evt_xyz789',
    eventType: 'large',
    category: 'emotion',
    title: '考试失利',
    description: '今天数学考试没考好，心情很差...',
    options: [
      { optionId: 'opt_1', text: '安慰鼓励', hint: '温柔的鼓励能让心宠重拾信心' },
      { optionId: 'opt_2', text: '分析原因', hint: '帮助心宠找到问题所在' }
    ],
    deadline: 1714122000000,
    impactPreview: { mood: -10, energy: -5 }
  }
}
```

#### 控制权变更通知

```javascript
// 服务器 → 客户端 (当Unity连接/断开时广播)
{
  type: 'control_state_change',
  messageId: 'srv_004',
  timestamp: 1714035600000,
  payload: {
    petId: 'pet_abc123',
    previousState: 'ai_auto',
    currentState: 'unity_control',
    controlledBy: 'unity_session_xxx',
    message: '心宠正在线下咨询中'
  }
}
```

---

## 5. SSE 场景广播协议（Phase 2）

> **MVP阶段**: 使用 WebSocket 统一承载场景广播（见4.3节 `scene_sync` 消息）
> **Phase 2**: 可迁移至 SSE 以降低 WebSocket 连接数

### 5.1 连接方式

```
GET /events/scene?sceneId=fantasy_forest

Headers:
  Authorization: Bearer <token>
  Accept: text/event-stream
```

### 5.2 消息格式

```
event: scene_sync
data: {"sceneId":"fantasy_forest","timestamp":1714035600000,"virtualPets":[...],"sceneState":{...}}

id: srv_002
retry: 5000
```

### 5.3 事件类型

| 事件名 | 说明 | 频率 |
|--------|------|------|
| `scene_sync` | 场景状态同步（虚拟宠物位置、天气、时间） | 10秒 |
| `pet_enter` | 有心宠进入场景 | 实时 |
| `pet_leave` | 有心宠离开场景 | 实时 |
| `item_spawn` | 场景中出现新物品 | 实时 |

### 5.4 与 WebSocket 的区别

| 特性 | WebSocket | SSE |
|------|-----------|-----|
| 方向 | 双向 | 单向（服务端→客户端） |
| 用途 | 状态推送、事件通知、心跳 | 场景广播 |
| 连接数 | 每用户1个 | 每场景1个（可被多用户共享） |
| 重连 | 客户端手动 | 浏览器自动（EventSource） |

---

## 6. 版本控制

### 6.1 API版本

- 当前版本: `v1`
- 版本前缀: `/api/v1/pet/`
- 未来升级: `/api/v2/pet/`

### 6.2 兼容性策略

- 新增字段: 兼容旧客户端（忽略未知字段）
- 删除字段: 必须等待所有客户端升级
- 修改字段: 必须发新版本

---

## 7. 文档引用规范

### 7.1 所有文档必须引用本文档

```
其他文档中的API引用格式:
"API 详见 [API契约文档](../api-contract.md)"

禁止:
├── 在业务文档中定义新的API路径
├── 在业务文档中定义新的消息类型
├── 在业务文档中定义新的错误码
└── 在业务文档中修改本文档已定义的字段

允许:
├── 在业务文档中引用本文档的API
├── 在业务文档中描述业务逻辑如何使用API
└── 在业务文档中补充UI/交互细节
```

### 7.2 文档更新流程

```
需要修改API时:
1. 修改本文档 (api-contract.md)
2. 标记变更日志 (版本号+日期)
3. 通知所有相关团队
4. 更新实现代码
5. 更新其他文档中的引用
```

---

## 8. 变更日志

| 版本 | 日期 | 变更内容 | 作者 |
|------|------|---------|------|
| v1.0 | 2026-04-25 | 初始版本，统一所有API | 技术团队 |

---

**文档版本**: v1.0
**最后更新**: 2026-04-25
**下次评审**: API实现前
