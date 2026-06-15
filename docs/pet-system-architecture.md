# 心宠系统架构文档 (Pet System Architecture)

> **文档编号**: ARCH-001
> **版本**: v2.0 (已收敛)
> **状态**: 已批准
> **生效日期**: 2026-04-25
> **覆盖范围**: 服务架构、技术栈、数据库、同步策略、部署

---

## 1. 系统架构总览

### 1.1 服务关系图

```
┌─────────────────────────────────────────────────────────────┐
│                        用户层                                │
│  ┌──────────────┐            ┌──────────────┐              │
│  │ 微信小程序    │            │  Unity PC    │              │
│  │ PsyTwin-Pocket│            │  PsyTwin-Unity│             │
│  └──────┬───────┘            └──────┬───────┘             │
│         │                           │                      │
│         │  WebSocket                │  HTTP API            │
│         │  (小程序)                 │  (Unity)             │
└─────────┼───────────────────────────┼──────────────────────┘
          │                           │
          ▼                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    PsyTwin-Pet (Node.js)                     │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  网络层                                              │   │
│  │  ├── WebSocket Server (小程序实时连接)              │   │
│  │  ├── HTTP REST API (Unity + 管理后台)               │   │
│  │  └── SSE Broadcast (场景广播)                       │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  业务层                                              │   │
│  │  ├── PetEngine (心宠AI引擎)                         │   │
│  │  ├── EventSystem (事件系统)                         │   │
│  │  ├── ScheduleSystem (时间系统)                      │   │
│  │  ├── SceneManager (场景管理)                        │   │
│  │  ├── VirtualPetAI (虚拟宠物AI)                      │   │
│  │  └── NotificationService (通知服务)                 │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  数据层                                              │   │
│  │  ├── Prisma Client (PostgreSQL)                     │   │
│  │  ├── Redis (缓存 + 消息队列)                        │   │
│  │  └── File Storage (场景资源)                        │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
          │
          │  HTTP API (状态提醒上报)
          ▼
┌─────────────────────────────────────────────────────────────┐
│              PsyTwin-Sentinel (Next.js)                      │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  状态提醒接收端                                          │   │
│  │  ├── POST /api/v1/admin/pet-alerts                  │   │
│  │  ├── GET  /api/v1/admin/pet-alerts                  │   │
│  │  └── PUT  /api/v1/admin/pet-alerts/{id}             │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  管理后台                                            │   │
│  │  ├── 心宠状态提醒列表                                    │   │
│  │  ├── 状态提醒详情                                        │   │
│  │  └── 状态提醒处理                                        │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 核心决策

| 决策项 | 结论 |
|--------|------|
| **服务归属** | 独立Node.js服务（PsyTwin-Pet），非Sentinel模块 |
| **数据库** | 共享PostgreSQL，Pet服务维护心宠表 |
| **通信方式** | WebSocket(小程序实时+场景广播) + HTTP(Unity) |
| **同步策略** | 分层同步（关键事件实时 + 状态定时 + 场景广播 + 按需拉取） |
| **AI运行位置** | 服务端（PetEngine），客户端只读 |
| **虚拟宠物** | 服务端生成，存储于Redis（非DB），可重建，Prisma模型仅作类型定义 |

---

## 2. 技术栈

### 2.1 PsyTwin-Pet 服务端

| 组件 | 选择 | 版本 |
|------|------|------|
| **运行时** | Node.js | 20.x LTS |
| **语言** | TypeScript | 5.x |
| **WebSocket** | ws | 8.x |
| **HTTP API** | Express | 4.x |
| **数据库** | PostgreSQL | 16.x |
| **ORM** | Prisma | 5.x |
| **缓存** | Redis | 7.x |
| **调度** | node-cron | 3.x |
| **日志** | winston | 3.x |

### 2.2 PsyTwin-Pocket 小程序

| 组件 | 选择 | 版本 |
|------|------|------|
| **框架** | 微信小程序 | 基础库 2.19+ |
| **UI组件** | TDesign Mini Program | 1.x |
| **样式** | LESS | - |
| **渲染** | Canvas 2D | - |

### 2.3 PsyTwin-Unity PC端（Phase 2）

| 组件 | 选择 | 版本 |
|------|------|------|
| **引擎** | Unity | 2022.3 LTS |
| **渲染管线** | Built-in RP | - |
| **脚本** | C# | .NET Standard 2.1 |
| **网络** | UnityWebRequest | - |

---

## 3. 数据库架构

### 3.1 共享数据库策略

```
PostgreSQL (psytwin)
├── students          ← Sentinel维护，Pet只读
├── teachers          ← Sentinel维护，Pet不访问
├── faculties         ← Sentinel维护，Pet不访问
├── pets              ← Pet维护
├── pet_events        ← Pet维护
├── pet_items         ← Pet维护
├── pet_diary_entries ← Pet维护
├── pet_alerts        ← Pet写入，Sentinel读取
└── ...               ← 其他Sentinel表

Redis / Runtime State
├── virtual_pets      ← 内存生成，不持久化，丢失后可重建
└── session_state     ← WebSocket连接状态、控制状态缓存
```

**访问规则**:
- Pet服务: 读写 pets/pet_events/pet_items/pet_diary_entries/pet_alerts，只读 students
- Sentinel: 读写 pet_alerts，不访问其他Pet表

**迁移管理**:
- 所有迁移放在 Sentinel `prisma/migrations/`
- Pet服务运行 `npx prisma migrate deploy` 同步

### 3.2 核心数据模型

详见独立文档: `pet-data-model.md`

---

## 4. 网络与同步

### 4.1 通信方式矩阵

| 通信方式 | 用途 | 频率 | 方向 | 客户端 |
|---------|------|------|------|--------|
| **WebSocket** | 状态推送、事件通知、场景广播 | 持续 | 双向 | 小程序 |
| **HTTP REST** | 初始加载、历史数据 | 按需 | 请求-响应 | 两端 |

### 4.2 同步分层策略

```
Layer 1 - 关键事件实时推送 (WebSocket)
├── 大型事件触发
├── 紧急状态变化（心情/能量 < 10）
├── 用户操作结果
├── 场景切换完成
└── 延迟要求: < 500ms

Layer 2 - 状态定时推送 (WebSocket)
├── 心情/能量/社交变化
├── 活动变化
├── 位置变化
└── 间隔: 5秒（有变化时）

Layer 3 - 场景同步 (WebSocket)
├── 虚拟宠物位置更新
├── 天气变化
├── 时间变化
└── 间隔: 10秒（广播给场景内所有用户）

Layer 4 - 按需拉取 (HTTP)
├── 打开背包
├── 打开日记
├── 打开地图
└── 方式: GET请求

Layer 5 - 断点同步 (HTTP)
├── Unity连接时
├── 小程序重连时
├── 手动刷新时
└── 方式: 全量数据GET
```

### 4.3 客户端状态仲裁

```typescript
enum PetControlState {
  AI_AUTO = 'ai_auto',           // AI自主运行（默认）
  POCKET_ONLINE = 'pocket_online', // 小程序在线（只读）
  UNITY_CONTROL = 'unity_control', // Unity控制（写权限）
  OFFLINE = 'offline'            // 所有客户端离线
}
```

**状态转换**:
- AI_AUTO → UNITY_CONTROL: Unity连接，AI暂停
- UNITY_CONTROL → AI_AUTO: Unity断开，保存状态，AI恢复
- POCKET对心宠状态只读（位置/活动/属性），但可提交事件决策命令

**写权限规则**:
- 同一时间只有一个状态写入者
- **Unity**: 直接状态写入者（修改位置、活动、属性）
- **Pocket**: 仅提交事件决策命令，不直接修改状态
- **AI**: 默认状态写入者（Unity断开时接管）
- 优先级: Unity > AI（Pocket不参与状态写入竞争）

---

## 5. API架构

### 5.1 基础规范

```
Base URL: https://api.psytwin.com/api/v1/pet
Headers:
  Authorization: Bearer <jwt_token>
  Content-Type: application/json
  X-Client-Type: pocket | unity
```

### 5.2 统一响应格式

```typescript
interface ApiResponse<T> {
  code: number;        // 0=成功
  message: string;
  data: T;
  timestamp: number;
  requestId: string;
}
```

### 5.3 核心API列表

| 方法 | 路径 | 用途 |
|------|------|------|
| GET | `/status` | 获取心宠完整状态 |
| POST | `/status` | 保存心宠状态（Unity） |
| POST | `/create` | 创建心宠（首次打开） |
| GET | `/scenes` | 获取场景列表 |
| GET | `/scenes/:id` | 获取场景详情 |
| POST | `/scenes/:id/enter` | 切换场景 |
| GET | `/events/pending` | 获取待处理事件 |
| POST | `/events/:id/resolve` | 解决事件 |
| GET | `/diary` | 获取日记（分页） |
| GET | `/inventory` | 获取背包 |
| POST | `/pet-alerts` | 上报状态提醒（Sentinel） |
| GET | `/pet-alerts` | 获取状态提醒列表（Sentinel） |
| PUT | `/pet-alerts/:id` | 处理状态提醒（Sentinel） |

详见独立文档: `pet-api-contract.md`

---

## 6. AI引擎架构

### 6.1 PetEngine核心循环

```
每秒执行一次 updateAllPets():
  ├── 1. 检查控制状态
  │   └── 如果是 unity_control，跳过此宠物
  ├── 2. 根据时间表更新活动
  │   └── 08:00-09:40 → attending_class
  ├── 3. 自然属性变化
  │   └── 心情/能量/社交 ±(0-2)
  ├── 4. 位置更新（行走时）
  │   └── x/y += speed * direction
  ├── 5. 检查事件触发
  │   └── 心情<30 → 30%概率触发情绪低落
  ├── 6. 检查社交交互
  │   └── 与虚拟宠物距离<50px → 打招呼
  └── 7. 推送状态变更
      └── 有变化时 WebSocket推送
```

### 6.2 行为树优先级

```
1. 必须执行（最高优先级）
   ├── 23:00-06:00 + 能量<50 → 睡觉
   ├── 07:00/12:00/18:00 → 吃饭
   └── 上课时间 → 上课

2. 状态驱动
   ├── 能量<30 → 休息/吃饭
   ├── 心情<30 → 寻找开心活动
   └── 社交<70 → 社交活动

3. 性格驱动
   ├── 外向性>70 → 探索/社交
   └── 开放性>70 → 探索/学习

4. 默认行为
   └── 空闲/行走/学习/玩耍（随机）
```

---

## 7. 部署架构

### 7.1 生产环境

```
┌─────────────────────────────────────────────┐
│                 Nginx (反向代理)               │
  │  ├── /ws/pet → Pet:3001 (WebSocket)         │
  │  ├── /api/v1/pet → Pet:3001 (HTTP API)      │
  │  └── / → Sentinel:3000 (Next.js)            │
└─────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────┐
│              Docker Compose                   │
│  ┌──────────────┐  ┌─────────────────────┐ │
│  │ Pet Service  │  │ Sentinel (Next.js)  │ │
│  │ Port: 3001   │  │ Port: 3000          │ │
│  │ Replicas: 2  │  │ Replicas: 2         │ │
│  └──────────────┘  └─────────────────────┘ │
│  ┌──────────────┐  ┌─────────────────────┐ │
│  │ PostgreSQL   │  │ Redis               │ │
│  │ Port: 5432   │  │ Port: 6379          │ │
│  └──────────────┘  └─────────────────────┘ │
└─────────────────────────────────────────────┘
```

### 7.2 环境变量

```bash
# Pet 服务
PET_PORT=3001
DATABASE_URL="postgresql://user:pass@localhost:5432/psytwin"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="xxx"
SENTINEL_API_URL="http://sentinel:3000"

# 同步配置
WS_HEARTBEAT_INTERVAL=30000
STATUS_PUSH_INTERVAL=5000
SCENE_SYNC_INTERVAL=10000
MAX_RECONNECT_ATTEMPTS=5
```

---

## 8. 安全设计

### 8.1 认证
- WebSocket连接时发送JWT Token
- HTTP API使用Bearer Token
- Token由Sentinel统一签发，Pet只验证

### 8.2 限流
| 接口类型 | 限流规则 |
|---------|---------|
| WebSocket连接 | 每用户最多1个连接 |
| HTTP API | 100 req/min per IP |
| 场景切换 | 5 req/min per user |
| 事件解决 | 10 req/min per user |

### 8.3 数据隔离
- 每个用户只能访问自己的心宠数据
- API层强制过滤（`where: { ownerId: userId }`）

---

## 9. 监控与日志

### 9.1 监控指标

| 指标 | 告警阈值 |
|------|---------|
| WebSocket连接数 | > 1000 |
| HTTP API响应时间 | > 500ms |
| AI引擎循环耗时 | > 100ms |
| 数据库连接池使用率 | > 80% |
| Redis内存使用率 | > 80% |

### 9.2 日志格式

```
[timestamp] [level] [module] [petId] [userId] [message] [data]

示例:
[2026-04-25T10:00:00Z] [INFO] [PetEngine] [pet_abc] [stu_xxx] 心情更新 60→65
[2026-04-25T10:00:01Z] [WARN] [EventSystem] [pet_abc] [stu_xxx] 大型事件触发
```

---

## 10. 实施计划概要

### 10.1 Wave分解

| Wave | 内容 | 周数 | 关键任务 |
|------|------|------|---------|
| **W1** | 基础架构 | Week 1 | 数据库迁移、服务脚手架、WebSocket、HTTP路由 |
| **W2** | 核心引擎 | Week 2-3 | AI引擎、虚拟宠物、小程序UI、网络层、状态提醒模型 |
| **W3** | 功能实现 | Week 3-5 | 事件系统、日记、背包、按钮面板、状态提醒上报 |
| **W4** | 集成打磨 | Week 5-6 | 状态同步、管理页面、集成测试、性能优化 |
| **FINAL** | 审查验收 | Week 6 | 合规审计、代码质量、QA执行、范围检查 |

### 10.2 关键路径

```
T1(数据库) → T2(脚手架) → T3(WebSocket) + T4(HTTP)
  → T5(AI引擎) → T9(状态提醒模型) → T10(事件) → T14(状态提醒上报)
  → T15(状态同步) → T17(集成测试) → F1-F4(审查)
```

详见完整计划: `../plans/pet-feature-implementation.md`

---

**文档版本**: v2.0
**最后更新**: 2026-04-25
**关联文档**:
- `pet-product-design.md` — 产品需求
- `pet-api-contract.md` — API契约
- `pet-data-model.md` — 数据模型
- `../plans/pet-feature-implementation.md` — 实施计划
