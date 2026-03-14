# PsyTwin Sentinel 技术规范文档

> **项目名称**：PsyTwin Sentinel（心理孪生·哨兵）
> **版本**：v2.3（已对齐项目现状）
> **更新日期**：2026-03-09
> **版本**：v2.1（已对齐项目现状）
> **更新日期**：2026-03-07
> **更新日期**：2026-03-06

---

## 1. 项目概览与目标

本项目旨在构建一个连接 VR 体验端、移动应用端与管理决策端的全链路心理健康生态系统。通过 **Next.js 16** 全栈架构实现前后端一体化开发，利用 **React 19** 构建专业级决策看板，并集成 **Qwen (通义千问)** 大模型提供精准的 RAG（检索增强生成）干预建议。

### 核心特性

- 全域心理健康态势实时监测与可视化
- VR 多模态数据采集与风险预警
- 学生心理数字档案全生命周期管理
- AI 驱动的智能干预建议与 RAG 知识库

---

## 2. 技术栈架构

### 2.1 技术选型

| 层级 | 技术方案 | 说明 |
|------|----------|------|
| **框架** | Next.js 16 (App Router) | React 全栈框架，支持 SSR/CSR/ISR |
| **语言** | TypeScript 5.x | 类型安全 |
| **UI 组件库** | shadcn/ui + Radix UI | 可定制化组件库 |
| **样式** | Tailwind CSS 4 | 原子化 CSS |
| **状态管理** | React Context + Zustand | 轻量级状态管理 |
| **数据可视化** | Recharts + Tailwind Charts | 图表组件 |
| **表单** | React Hook Form + Zod | 类型安全表单 |
| **数据库** | Prisma + PostgreSQL | ORM + 数据库 |
| **AI 集成** | Qwen API (通义千问) | 大模型对话与 RAG |
| **部署** | Vercel / 私有服务器 | 适配多种部署方案 |

### 2.2 项目结构

```
psy-twin-sentinel/
├── app/                      # Next.js App Router
│   ├── (dashboard)/          # 仪表盘路由组
│   │   ├── page.tsx          # 全域态势
│   │   ├── alerts/           # 风险预警
│   │   ├── students/         # 学生档案
│   │   ├── interventions/    # 干预记录
│   │   └── settings/         # 系统设置
│   ├── api/                  # API 路由
│   │   ├── alerts/           # 预警相关 API
│   │   ├── students/         # 学生档案 API
│   │   ├── ai/               # AI 对话 API
│   │   └── rag/              # RAG 知识库 API
│   ├── layout.tsx            # 根布局
│   └── globals.css           # 全局样式
├── components/
│   ├── ui/                   # shadcn/ui 基础组件 (57个)
│   ├── views/                # 业务视图组件
│   ├── charts/               # 图表组件
│   └── forms/                # 表单组件
├── lib/
│   ├── db.ts                 # Prisma 客户端
│   ├── auth.ts               # 认证逻辑
│   └── ai.ts                 # AI 调用封装
├── hooks/                    # 自定义 React Hooks
├── types/                    # TypeScript 类型定义
└── prisma/
    └── schema.prisma         # 数据库模型
```

### 2.3 通信协议

- **Server Actions**（主要）：Next.js 14+ 推荐的 Server Actions 模式，实现表单提交与数据变更
- **RESTful API**（辅助）：部分复杂接口通过 Next.js API Routes 实现
- **Server-Sent Events**（计划中）：风险预警实时推送
- **Server-Sent Events**（计划中）：风险预警实时推送

### 2.4 缓存架构

为提升系统性能与响应速度，系统采用 **Redis** 作为分布式缓存层，实现热点数据的高效存取。

#### 技术选型

| 组件 | 方案 | 说明 |
|------|------|------|
| **缓存服务器** | Redis 7.x | 内存数据库，支持持久化与集群 |
| **客户端库** | ioredis 5.x | 高性能 Node.js Redis 客户端 |
| **缓存模式** | Cache-Aside + Write-Through | 旁路缓存 + 写入时失效 |
| **部署方式** | Docker Compose | 开发环境容器化部署 |

#### 缓存策略

**TTL 配置：**

| 数据类型 | TTL | 说明 |
|----------|-----|------|
| 实时数据（VR记录、风险工单） | 2-3 分钟 | 保证数据新鲜度 |
| 列表查询（学生列表、干预记录） | 5 分钟 | 平衡性能与一致性 |
| 详情数据（学生详情、干预详情） | 10 分钟 | 变化频率较低 |

**缓存键命名规范：**
```
psytwin:students:list:{page}:{limit}:{search}:{className}:{facultyId}:{riskLevel}
psytwin:students:detail:{id}
psytwin:students:timeline:{studentId}:{limit}
psytwin:students:interventions:{studentId}:{page}:{limit}
psytwin:interventions:list:all
psytwin:interventions:detail:{recordId}
psytwin:risk:workorders:pending
psytwin:vr:dashboard:records
psytwin:dashboard:stats:overview
```

**缓存失效策略：**
- 所有写操作自动清除相关缓存
- 支持批量清除（按模式匹配）
- 提供缓存预热服务（应用启动时预加载热点数据）

#### 核心实现文件

| 文件 | 功能 |
|------|------|
| `lib/redis.ts` | Redis 客户端连接管理 |
| `lib/cache.ts` | 缓存模式封装（cacheAside、cacheSet、cacheDelete） |
| `lib/cache-monitor.ts` | 缓存性能监控与统计 |
| `app/actions/cache-warming.ts` | 缓存预热服务 |
| `app/actions/students.ts` | 学生数据查询（已集成缓存） |
| `app/actions/intervention-records.ts` | 干预记录查询（已集成缓存） |
| `app/actions/risk-trace.ts` | 风险工单查询（已集成缓存） |
| `app/actions/vr-dashboard.ts` | VR 数据查询（已集成缓存） |

#### 环境配置

```bash
# .env
REDIS_URL=redis://:Redis2026Secure!@localhost:6379/0
REDIS_PASSWORD=Redis2026Secure!
```

```yaml
# docker-compose.dev.yml
redis:
  image: redis:7-alpine
  ports:
    - "6379:6379"
  command: redis-server --requirepass Redis2026Secure! --maxmemory 256mb --maxmemory-policy allkeys-lru
```

---
---

## 3. 核心页面功能设计

### 3.1 全域态势指挥中心 (Global Decision Dashboard)

**定位**：学校层面的宏观决策看板，实现心理健康状态的「一屏通览」。

#### F1.1 实时预警雷达

- 展示当前高风险学生列表
- 按风险等级分类（红色/橙色/黄色）
- 支持点击查看详情
- **技术实现**：React 组件 + Server Action 获取数据

#### F1.2 心理热力分布图

- 展示各院系、年级、MBTI 类型学生的心理健康分布
- 识别高压力群体聚集点
- **技术实现**：Tailwind CSS Grid + 热力颜色映射

#### F1.3 干预转化率监控

- 实时追踪「发现风险—下达干预—康复闭环」的处理流程效率
- 漏斗图展示各阶段转化率
- **技术实现**：Recharts Funnel Chart 组件

---

### 3.2 风险预警与溯源中心 (Alert & Traceability)

**定位**：咨询师处理高风险个体的核心业务区。

#### F2.1 多模态证据链查看

- 查看 AI 判定的详细依据
- VR 交互中的语音情感曲线
- 微表情特征点分布
- 生理参数变化（心率/皮电）
- **技术实现**：图表组件 + 时间线组件

#### F2.2 风险自动降级逻辑

- 根据干预后的再次检测数据
- AI 自动建议是否取消红色预警
- 实现动态风险管控
- **技术实现**：AI API 调用 + 状态更新

---

### 3.3 学生「心理孪生」档案 (Digital Twin Profiles)

**定位**：为每位学生建立可追溯、可视化、全生命周期的心理健康数字档案。

#### F3.1 性格与能力雷达

- MBTI 结果展示
- 职业性格（Holland）分析
- VR 场景内表现（逆商、社交能力、抗压能力）
- **技术实现**：Radar Chart 组件

#### F3.2 匿名化隐私控制

- 一键脱敏预览
- 确保符合伦理规范
- **技术实现**：数据脱敏函数 + 权限控制

---

### 3.4 Qwen 智能配置与 RAG 知识库 (AI Orchestration)

**定位**：系统「大脑」的训练与规则设定区。

#### F4.1 RAG 向量库管理

- 支持上传 PDF/Markdown 格式的专业心理咨询手册
- 供 Qwen 模型在对话中检索引用
- **技术实现**：文件上传 + 向量存储（可选 Pinecone/Milvus）

#### F4.2 场景化对话策略

- 为不同的 VR 场景配置特定的 Prompt 模板
- AI 人格设定（职场面试、冥想等）
- **技术实现**：配置表单 + System Prompt 模板

---

### 3.5 OpenClaw 编排中心 (OpenClaw Orchestration)

**定位**：AI 智能体集群的可视化编排与监控中心，实现多智能体协作任务的实时监控、成本分析和安全审计。

#### F5.1 智能体集群可视化

- **田字格 3×3 网格布局**：7 个智能体节点在网格中实时移动
- **智能体标识**：每个智能体拥有独特的颜色主题（红/蓝/绿/紫/橙/青/粉）
- **路径动画**：基于网格坐标系的平滑移动动画，模拟智能体协作流程
- **组件架构**：
  - `AgentGridOffice`：网格容器，管理坐标系统和动画循环
  - `AgentGridLabel`：可移动智能体卡片，支持拖拽和自动路径
  - `lib/openclaw/grid-paths.ts`：网格路径计算工具

#### F5.2 实时数据流 (WebSocket → SSE 桥接)

- **SSE 实时推送**：Server-Sent Events 实现服务器到客户端的数据流
- **数据类型**：
  - 智能体状态更新（在线/忙碌/空闲）
  - 请求流转事件（创建/处理/完成）
  - 统计数据刷新（Token 消耗、响应时间）
- **API 端点**：`GET /api/openclaw/workflow` (EventSource)

#### F5.3 请求流转追踪

- **生命周期可视化**：进度条展示请求的完整生命周期
- **阶段追踪**：接收 → 分析 → 路由 → 执行 → 完成
- **实时日志**：最近 5 条请求记录，包含时间戳、状态、耗时
- **组件**：`LivePanel` 统一展示请求和活动日志

#### F5.4 成本分析仪表盘

- **Token 消耗统计**：输入 Token、输出 Token、总消耗实时展示
- **成本对比**：AI 处理成本 vs 传统人力成本对比图表
- **智能体排行榜**：按节省金额排序的 Agent 效率榜单
- **趋势分析**：日/周/月维度的成本趋势图表
- **API 端点**：`GET /api/openclaw/stats`

#### F5.5 安全审计中心

- **系统健康度**：实时健康评分仪表盘（0-100%）
- **端口扫描状态**：关键端口（3000, 5432, 6379, 8080）监控
- **安全事件日志**：异常访问、错误请求记录
- **趋势监控**：健康度历史趋势图表
- **组件**：`SecurityDashboard`

#### F5.6 数据库浏览看板

- **表结构浏览**：openclaw_agents、openclaw_requests、openclaw_costs 等表
- **数据预览**：分页查看表数据（每页 10 条）
- **字段信息**：数据类型、约束、默认值展示
- **API 端点**：`GET /api/openclaw/database`
- **组件**：`DatabaseDashboard`

#### F5.7 UI/UX 改进

- **侧边栏拓宽**：224px → 256px (`w-56` → `w-64`)
- **Tab 卡片样式**：OpenClaw 编排 Tab 按钮改为卡片式布局
- **右侧面板合并**：请求追踪和活动日志统一为 `LivePanel`
- **新增图标**：Brain、Workflow、Shield、Database、Coins、Activity

---

### 3.6 VR 端数据 (VR Dashboard)

**定位**：展示 VR 设备采集的多模态数据。

#### F6.1 设备状态监控

- 在线/离线设备列表
- 连接状态实时更新

#### F6.2 会话数据流

- 实时展示当前 VR 会话数据
- 心率、微表情、语音等指标

---

### 3.7 干预记录 (Intervention Records)

**定位**：心理咨询师的工作记录区。

#### F7.1 咨询记录管理

- 创建/编辑/删除干预记录
- 关联学生档案
- 记录干预方案与效果评估

#### F7.2 统计报表

- 咨询量统计
- 干预效果分析

---

### 3.8 系统设置 (System Settings)

**定位**：系统管理员的配置区。

#### F8.1 用户管理

- 添加/编辑/删除用户
- 角色权限配置（管理员/咨询师/辅导员）

#### F8.2 系统参数配置

- 风险阈值设置
- 预警规则配置
- 通知渠道设置

---

## 4. API 接口规范

### 4.1 学生档案接口


#### A1. 获取学生列表

```
GET /api/students

Query Parameters:
- page: number (默认: 1)
- limit: number (默认: 20)
- search?: string (姓名/学号搜索)
- riskLevel?: 'red' | 'orange' | 'yellow' | 'green'

Response:
{
  "data": Student[],
  "total": number,
  "page": number,
  "totalPages": number
}
```

#### A2. 获取学生详情

```
GET /api/students/[id]

Response:
{
  "id": string,
  "studentId": string,
  "name": string,
  "anonymousName": string,
  "department": string,
  "grade": string,
  "mbti": string,
  "riskLevel": "red" | "orange" | "yellow" | "green",
  "alerts": Alert[],
  "interventions": Intervention[],
  "createdAt": string,
  "updatedAt": string
}
```

#### A3. 创建学生档案

```
POST /api/students

Body:
{
  "studentId": string,
  "name": string,
  "department": string,
  "grade": string,
  "mbti": string
}

Response: Student
```

---

### 4.2 风险预警接口

#### A4. 获取预警列表

```
GET /api/alerts

Query Parameters:
- status?: 'pending' | 'processing' | 'resolved'
- riskLevel?: 'red' | 'orange' | 'yellow'
- page?: number
- limit?: number

Response:
{
  "data": Alert[],
  "total": number
}
```

#### A5. 更新预警状态

```
PATCH /api/alerts/[id]

Body:
{
  "status": "processing" | "resolved",
  "notes": string,
  "handlerId": string
}

Response: Alert
```

#### A6. VR 数据同步接口

```
POST /api/telemetry/multimodal

Body:
{
  "studentIdHash": string,
  "sceneId": string,
  "metrics": {
    "heartRate": number,
    "microExpression": string,
    "voiceTremorIndex": number,
    "actionIntensity": number
  },
  "timestamp": number
}

Logic: 
1. 接收 VR 端多模态数据
2. 计算风险分数
3. 若超过阈值，创建预警记录
4. 返回处理结果
```

---

### 4.3 AI 对话与干预接口

#### A7. AI 咨询接口

```
POST /api/ai/consultation

Body:
{
  "studentId": string,
  "scene": string,
  "message": string,
  "context": {
    "recentAlerts": Alert[],
    "interventionHistory": Intervention[]
  }
}

Response:
{
  "reply": string,
  "suggestions": string[],
  "references": {
    "documentId": string,
    "content": string
  }[]
}
```

#### A8. RAG 知识库查询

```
POST /api/rag/query

Body:
{
  "query": string,
  "topK": number (默认: 5)
}

Response:
{
  "results": {
    "content": string,
    "source": string,
    "score": number
  }[]
}
```

#### A9. RAG 文档上传

```
POST /api/rag/documents

Body: multipart/form-data
- file: File (PDF/Markdown)
- title: string
- category: string

Response:
{
  "id": string,
  "title": string,
  "status": "processing" | "ready"
}
```

---

### 4.4 干预记录接口

#### A10. 获取干预记录

```
GET /api/interventions

Query Parameters:
- studentId?: string
- handlerId?: string
- startDate?: string
- endDate?: string

Response:
{
  "data": Intervention[],
  "total": number
}
```

#### A11. 创建干预记录

```
POST /api/interventions

Body:
{
  "studentId": string,
  "handlerId": string,
  "type": "counseling" | "referral" | "medication" | "other",
  "content": string,
  "outcome": string,
  "nextSteps": string
}

Response: Intervention
```

---

### 4.5 OpenClaw 编排接口

#### A12. 获取 OpenClaw 智能体配置

```
GET /api/openclaw/config

Response:
{
  "agents": [
    {
      "id": string,
      "name": string,
      "role": string,
      "color": string,
      "position": { "x": number, "y": number },
      "status": "online" | "busy" | "idle"
    }
  ],
  "gridSize": { "cols": number, "rows": number }
}
```

#### A13. 获取 OpenClaw 统计数据

```
GET /api/openclaw/stats

Response:
{
  "overview": {
    "totalRequests": number,
    "activeAgents": number,
    "avgResponseTime": number,
    "tokenUsage": {
      "input": number,
      "output": number,
      "total": number
    }
  },
  "costAnalysis": {
    "aiCost": number,
    "humanCost": number,
    "savings": number,
    "savingsPercent": number
  },
  "timeRange": "24h" | "7d" | "30d"
}
```

#### A14. 获取智能体效率排行

```
GET /api/openclaw/stats/agents

Query Parameters:
- sortBy?: "savings" | "requests" | "efficiency" (默认: "savings")
- limit?: number (默认: 10)

Response:
{
  "ranking": [
    {
      "agentId": string,
      "agentName": string,
      "requestsHandled": number,
      "tokensConsumed": number,
      "costSaved": number,
      "efficiency": number
    }
  ],
  "totalAgents": number
}
```

#### A15. 浏览 OpenClaw 数据库

```
GET /api/openclaw/database

Query Parameters:
- table?: string (表名，默认返回表列表)
- page?: number (默认: 1)
- limit?: number (默认: 10)

Response (表列表):
{
  "tables": [
    {
      "name": string,
      "description": string,
      "recordCount": number
    }
  ]
}

Response (表数据):
{
  "table": string,
  "columns": [
    {
      "name": string,
      "type": string,
      "nullable": boolean,
      "default": any
    }
  ],
  "data": any[],
  "pagination": {
    "page": number,
    "limit": number,
    "total": number,
    "totalPages": number
  }
}
```

#### A16. 获取工作流实时数据流 (SSE)

```
GET /api/openclaw/workflow

EventSource Stream:
event: workflow-update
data: {
  "type": "request" | "agent" | "stats",
  "payload": {
    // 根据 type 不同而变化
    // request: { id, status, progress, agentId, timestamp }
    // agent: { id, status, position, currentTask }
    // stats: { tokenUsage, requestCount, avgResponseTime }
  },
  "timestamp": string
}

Connection: keep-alive
Content-Type: text/event-stream
```

#### A17. 获取系统安全状态

```
GET /api/openclaw/status

Response:
{
  "health": {
    "score": number,           // 0-100
    "status": "healthy" | "warning" | "critical",
    "checks": [
      {
        "name": string,
        "status": "pass" | "fail" | "warn",
        "message": string
      }
    ]
  },
  "ports": [
    {
      "port": number,
      "service": string,
      "status": "open" | "closed" | "filtered"
    }
  ],
  "lastScan": string
}
```

---

## 5. 数据库模型 (Prisma Schema)
```

---

## 5. 数据库模型 (Prisma Schema)

### 5.1 核心模型

详细 Schema 参见 `prisma/schema.prisma`，主要模型包括：

```prisma
// 学生档案（含小程序扩展字段）
model Student {
  id                  String    @id @default(uuid())
  name                String
  studentNo           String    @unique
  className           String
  facultyId           String?
  gender              String?
  birthDate           DateTime?
  mbti                String?
  riskLevel           RiskLevel @default(LOW)
  // 小程序扩展字段
  phone               String?   @unique
  passwordHash        String?
  avatar              String?
  nickname            String?
  role                String    @default("student")
  status              StudentStatus @default(ACTIVE)
  badges              Json?
  stats               Json?
  settings            Json?
  lastLoginAt         DateTime?
  createdAt           DateTime  @default(now())
  updatedAt           DateTime  @updatedAt
  
  faculty             Faculty?
  psychProfile        PsychProfile?
  timelineEvents      TimelineEvent[]
  alerts              Alert[]
  workOrders          WorkOrder[]
  interventionRecords InterventionRecord[]
  vrSessions          VRSession[]
  appointments        Appointment[]
}

// 心理画像
model PsychProfile {
  id                 String   @id @default(uuid())
  studentId          String   @unique
  adversityQuotient  Int
  emotionalStability Int
  socialTendency     Int
  stressResistance   Int
  selfAwareness      Int
  empathy            Int
  willpower          Int
  adaptability       Int
  overallScore       Int
  student            Student  @relation(fields: [studentId], references: [id], onDelete: Cascade)
}

// 院系/班级
model Faculty {
  id          String    @id @default(uuid())
  name        String    @unique
  campusX     Float?
  campusY     Float?
  stressIndex Float?
  riskLevel   RiskLevel @default(LOW)
  students    Student[]
}

// 预警工单
model WorkOrder {
  id        String          @id @default(uuid())
  studentId String
  className String
  trigger   String
  riskLevel RiskLevel
  method    String
  counselor String
  status    WorkOrderStatus
  date      DateTime
  detail    String?
  summary   String?
  student   Student         @relation(fields: [studentId], references: [id], onDelete: Cascade)
}

// 干预记录
model InterventionRecord {
  id        String           @id @default(uuid())
  studentId String
  date      DateTime
  type      InterventionType
  counselor String
  duration  String
  result    String
  status    String
  student   Student          @relation(fields: [studentId], references: [id], onDelete: Cascade)
}

// VR场景
model VRScene {
  id          String      @id @default(uuid())
  name        String      @unique
  description String?
  usageCount  Int         @default(0)
  sessions    VRSession[]
}

// VR会话
model VRSession {
  id            String    @id @default(uuid())
  studentId     String
  sceneId       String
  duration      String
  emotionBefore String
  emotionAfter  String
  result        Sentiment
  sessionAt     DateTime  @default(now())
  student       Student   @relation(fields: [studentId], references: [id], onDelete: Cascade)
  scene         VRScene   @relation(fields: [sceneId], references: [id], onDelete: Cascade)
}

// 设备管理
model Device {
  id           String       @id @default(uuid())
  name         String
  serialNumber String       @unique
  type         DeviceType
  model        String?
  status       DeviceStatus
  battery      Int?
  room         String?
  location     String?
  lastActive   String?
}

// 咨询室
model ConsultationRoom {
  id               String       @id @default(uuid())
  name             String
  location         String
  status           RoomStatus
  capacity         Int
  currentStudentId String?
  currentStudent   Student?     @relation(fields: [currentStudentId], references: [id])
}

// 教师/咨询师
model Teacher {
  id             String        @id @default(uuid())
  teacherId      String        @unique
  name           String
  phone          String        @unique
  passwordHash   String
  avatar         String?
  department     String
  title          String
  qualifications String[]
  workStats      Json?
  badges         Json?
  role           UserRole      @default(TEACHER)
  status         TeacherStatus @default(ACTIVE)
  lastLoginAt    DateTime?
  appointments   Appointment[]
}

// 心理咨询预约
model Appointment {
  id           String            @id @default(uuid())
  studentId    String
  teacherId    String?
  roomId       String?
  type         AppointmentType
  date         DateTime
  timeSlot     String
  status       AppointmentStatus @default(PENDING)
  reason       String?
  cancelReason String?
  feedbackScore Int?
  student      Student           @relation(fields: [studentId], references: [id])
  teacher      Teacher?          @relation(fields: [teacherId], references: [id])
}

// 系统用户
model User {
  id           String     @id @default(uuid())
  email        String     @unique
  name         String
  passwordHash String
  avatar       String?
  role         UserRole   @default(TEACHER)
  status       UserStatus @default(ACTIVE)
  lastLoginAt  DateTime?
}

// OpenClaw 智能体
model OpenClawAgent {
  id            String               @id @default(uuid())
  name          String               @unique
  role          String
  description   String?
  color         String               // 主题色 (hex)
  avatar        String?              // 头像 URL
  status        OpenClawAgentStatus  @default(IDLE)
  capabilities  String[]             // 能力标签
  config        Json?                // 配置参数
  positionX     Int                  @default(0)
  positionY     Int                  @default(0)
  createdAt     DateTime             @default(now())
  updatedAt     DateTime             @updatedAt
  
  requests      OpenClawRequest[]
  costLogs      OpenClawCost[]
}

// OpenClaw 请求记录
model OpenClawRequest {
  id            String                   @id @default(uuid())
  agentId       String
  type          String                   // 请求类型
  status        OpenClawRequestStatus    @default(PENDING)
  progress      Int                      @default(0)  // 0-100
  input         String?                  // 输入内容
  output        String?                  // 输出内容
  inputTokens   Int                      @default(0)
  outputTokens  Int                      @default(0)
  duration      Int?                     // 处理时长 (ms)
  metadata      Json?                    // 附加数据
  error         String?                  // 错误信息
  createdAt     DateTime                 @default(now())
  completedAt   DateTime?
  
  agent         OpenClawAgent            @relation(fields: [agentId], references: [id])
}

// OpenClaw 成本记录
model OpenClawCost {
  id            String   @id @default(uuid())
  agentId       String
  date          DateTime @default(now())
  inputTokens   Int      @default(0)
  outputTokens  Int      @default(0)
  totalTokens   Int      @default(0)
  cost          Float    @default(0)   // 成本 (元)
  savings       Float    @default(0)   // 节省金额 (元)
  
  agent         OpenClawAgent @relation(fields: [agentId], references: [id])
  
  @@index([date])
  @@index([agentId])
}

// OpenClaw 安全日志
model OpenClawSecurityLog {
  id          String   @id @default(uuid())
  type        String   // 事件类型: scan, access, error
  severity    String   // 严重程度: info, warning, critical
  message     String
  source      String?  // 来源 IP/服务
  metadata    Json?    // 附加数据
  createdAt   DateTime @default(now())
  
  @@index([createdAt])
}

// 枚举定义

// 枚举定义
enum RiskLevel {
  HIGH
  MEDIUM
  LOW
}

enum WorkOrderStatus {
  PENDING
  IN_PROGRESS
  COMPLETED
}

enum InterventionType {
  REGULAR_INTERVIEW
  CBT_THERAPY
  GROUP_COUNSELING
  CRISIS_INTERVENTION
  INITIAL_ASSESSMENT
}

enum DeviceType {
  VR
  BRACELET
  EEG
}

enum DeviceStatus {
  ONLINE
  OFFLINE
  IN_USE
  MAINTENANCE
}

enum RoomStatus {
  AVAILABLE
  IN_USE
  MAINTENANCE
}

enum UserRole {
  ADMIN
  COUNSELOR
  ASSISTANT
  TEACHER
}

enum AppointmentType {
  COUNSELING
  VR
  GROUP
}

enum AppointmentStatus {
  PENDING
  CONFIRMED
  COMPLETED
  CANCELLED
  NO_SHOW
}

enum OpenClawAgentStatus {
  ONLINE
  BUSY
  IDLE
  OFFLINE
}

enum OpenClawRequestStatus {
  PENDING
  ANALYZING
  ROUTING
  PROCESSING
  COMPLETED
  FAILED
}

enum OpenClawSecuritySeverity {
  INFO
  WARNING
  CRITICAL
}
}
```


---

## 6. 安全与隐私

### 6.1 数据脱敏

- Web 管理端默认展示匿名化标识（如：张**）
- 具备特定权限的咨询师可查看真实身份
- 实现方式：数据库字段隔离 + 权限中间件

### 6.2 审计日志

- 记录所有老师对学生档案的查看与编辑行为
- 日志内容：操作人、操作时间、操作类型、目标记录
- 存储方式：数据库 audit_logs 表

### 6.3 认证与授权

- NextAuth.js / 自定义 JWT 认证
- 角色-based 访问控制 (RBAC)
- API 路由级别权限校验

### 6.4 信创适配

- 全平台适配国产操作系统（麒麟、统信）
- 支持国产数据库（达梦、人大金仓）
- 符合 2026 世校赛 IT 自强要求

---

## 7. 系统独特创新点

### 7.1 非侵入式检测

- 摒弃传统问卷
- 通过 VR 交互实现「无感筛查」
- 多模态数据分析（心率、微表情、语音、行为）

### 7.2 闭环联动

- 小程序端的「日常监测」
- VR 端的「深度干预」
- Web 后台实现数据联通，打破信息孤岛

### 7.3 AI 增强决策

- Qwen 大模型提供个性化干预建议
- RAG 知识库引用专业心理文献
- 风险等级动态评估与调整

### 7.4 数据可视化

- 热力图识别群体风险聚集
- 雷达图展示个体心理特征
- 漏斗图监控干预转化效率

---

## 8. 部署方案

### 8.1 开发环境

```bash
npm run dev     # 开发服务器 localhost:3000
```

### 8.2 生产环境

```bash
npm run build   # 构建生产版本
npm run start   # 启动生产服务器
```

### 8.3 部署平台

- **Vercel**（推荐）：零配置部署，自动适配 Next.js
- **私有服务器**：Docker 容器化部署
- **Serverless**：Vercel Edge / Netlify Functions

---

## 9. 后续开发计划

### Phase 1: 完善前端 Mock 数据 ✅ 已完成

- [x] 完善各页面 Mock 数据（全域态势、风险溯源、学生档案、干预记录等）
- [x] 实现页面间数据流转
- [x] 添加加载状态与错误处理

### Phase 2: 后端 API 开发 ✅ 已完成 *(2026-03-06 联调通过本地数据库)*

- [x] Prisma 数据库配置 *(schema.prisma 已定义，seed.ts 数据初始化完成)*
- [x] 学生档案 CRUD API *(通过 Server Actions 实现: app/actions/* )*
- [x] 风险预警 API *(risk-trace.ts: getRiskWorkOrders, confirmIntervention, resolveWarning)*
- [x] 干预记录 API *(intervention-records.ts: getInterventionRecords)*

### Phase 3: AI 集成 ✅ 已完成 *(2026-03-06 实现 Qwen API + RAG 向量存储)*

- [x] Qwen API 对接 *(lib/ai.ts 已封装，支持 Dashscope)*
- [x] RAG 向量存储集成 *(pgvector + 文本搜索降级策略)*
- [x] AI 风险评估页面 UI + API *(components/views/risk-trace-view.tsx, app/actions/ai-services.ts)*
- [x] AI 配置页面 UI + API *(components/views/ai-config-view.tsx, app/api/documents)*

### Phase 4: 部署与优化 🚧 进行中 *(2026-03-09 Pocket API 已完成)*

| 任务 | 状态 | 说明 |
|------|------|------|
| Next.js App Router 路由架构重构 | ✅ 已完成 *(2026-03-06)* | 物理路由: /dashboard, /risk-trace, /students 等 |
| Redis 缓存层集成 | ✅ 已完成 *(2026-03-08)* | 热点数据缓存，API 响应时间优化至 < 200ms |
| **Pocket 小程序 API** | ✅ 已完成 *(2026-03-09)* | **25+ API 端点，完整支持学生端功能** |
| 性能优化 | 🚧 进行中 | 缓存监控、查询优化 |
| 安全加固 | ⏳ 待开始 | JWT 强化、RBAC 完善 |
| 移动端适配 | ⏳ 待开始 | 响应式布局优化 |

**Pocket API 开发详情：**
- **认证模块**: `/auth/login`, `/auth/register`, `/auth/me`
- **心墙动态**: `/student/home/feed`, `/posts`, `/comments`, `/like`, `/collect`
- **预约咨询**: `/student/appointment/services`, `/appointments`
- **消息通知**: `/student/message/sessions`, `/notifications`
- **用户中心**: `/student/my/info`, `/user/profile`, `/user/collections`

**技术实现：**
- 统一响应格式: `{ code: 0, message: "...", data: ... }`
- 认证方式: `Authorization: Bearer <token>` (演示模式)
- 数据库: 新增 PostLike, PostCollection, StudentNotification 表
- 缓存: Redis Cache-Aside 模式，TTL 分级策略

| 任务 | 状态 | 说明 |
|------|------|------|
| Next.js App Router 路由架构重构 | ✅ 已完成 *(2026-03-06)* | 物理路由: /dashboard, /risk-trace, /students 等 |
| Redis 缓存层集成 | ✅ 已完成 *(2026-03-08)* | 热点数据缓存，API 响应时间优化至 < 200ms |
| 性能优化 | 🚧 进行中 | 缓存监控、查询优化 |
| 安全加固 | ⏳ 待开始 | JWT 强化、RBAC 完善 |
| 移动端适配 | ⏳ 待开始 | 响应式布局优化 |

- [x] Next.js App Router 路由架构重构 *(物理路由: /dashboard, /risk-trace, /students 等)*
- [ ] 性能优化
- [ ] 安全加固
- [ ] 移动端适配

---

## 10. 当前实现页面

### 已完成的页面

| 页面 | 路径 | 功能 |
|------|------|------|
| 全域态势 | `/dashboard` | 心理热力分布图、预警雷达、干预转化漏斗 |
| 风险溯源 | `/risk-trace` | 高危预警工单列表、AI风险评估结论、推荐策略 |
| VR端数据 | `/vr-dashboard` | 设备状态监控、会话数据流 |
| 学生档案 | `/students` | 心理画像雷达、全生命周期追踪 |
| 干预记录 | `/interventions` | 咨询记录管理、统计报表 |
| AI配置 | `/ai-config` | 模型参数配置、Prompt模板管理 |
| 系统设置 | `/system-settings` | 用户管理、系统参数配置 |
| 疗愈空间 | `/consultation-room` | 预约管理、咨询记录、VR体验、减压舱 |
| 设备管理 | `/device-management` | VR设备状态监控 |
| 多模态数据流 | `/multimodal` | 实时生理/语音/视觉/脑电数据流 |

---

**文档说明**：本技术规范文档基于实际 Next.js 16 + shadcn/ui 实现编写，与代码库保持一致。可直接作为技术方案书的核心系统架构部分。

## 11. 用户交互与流程

### 11.1 典型用户流程

#### 流程一：风险预警处理

```
1. [系统] VR 设备/小程序采集多模态数据
       ↓
2. [AI] Qwen 模型计算风险分数，超过阈值则生成预警
       ↓
3. [全域态势] 预警雷达显示新预警，状态变为「待处理」
       ↓
4. [风险溯源] 咨询师查看预警详情、多模态证据
       ↓
5. [AI] 生成风险评估报告
       ↓
6. [咨询师] 确认干预 or 解除预警
       ↓
7. [干预记录] 创建干预工单 → 分配咨询师
       ↓
8. [咨询] 执行咨询干预，记录咨询内容
       ↓
9. [复查] 干预后再次检测，风险降级 → 工单结案
```

#### 流程二：学生档案查询

```
1. [全域态势] 点击热力图区域或学生数量
       ↓
2. [学生档案] 展示该院系/班级学生列表
       ↓
3. [点击学生] 查看学生心理画像、时间轴
       ↓
4. [干预记录] 查看历史干预记录
       ↓
5. [风险溯源] 如需处理当前预警，直接跳转
```

### 11.2 导航结构

```
├── 态势分析
│   ├── 全域态势
│   ├── 风险溯源
│   └── VR端数据
│
├── 资源管理
│   ├── 疗愈空间
│   ├── 设备管理
│   └── 多模态数据流
│
├── 学生管理
│   ├── 学生档案
│   └── 干预记录
│
└── 系统配置
    ├── AI配置
    └── 系统设置
```

---

## 12. 非功能性需求

### 12.1 性能需求

| 指标 | 要求 |
|------|------|
| 页面加载时间 | < 2s (首屏) |
| API 响应时间 | < 500ms |
| 并发用户数 | 支持 100+ 同时在线 |
| 数据更新延迟 | < 1s (实时数据) |

### 12.2 安全需求

| 需求 | 说明 |
|------|------|
| 身份认证 | 基于 JWT 的身份验证 |
| 权限控制 | RBAC 角色权限体系 |
| 数据脱敏 | 默认匿名化展示，权限解锁查看真实身份 |
| 审计日志 | 记录所有敏感操作 |

### 12.3 兼容性

| 平台 | 要求 |
|------|------|
| 浏览器 | Chrome 90+, Edge 90+, Firefox 90+ |
| 移动端 | 响应式布局，支持平板 |
| 信创适配 | 兼容国产操作系统 (麒麟、统信) |

---

## 13. 附录

### 13.1 术语表

| 术语 | 说明 |
|------|------|
| RAG | 检索增强生成 (Retrieval-Augmented Generation) |
| Qwen | 阿里通义千问大模型 |
| VR | 虚拟现实 |
| Digital Twin | 数字孪生 |
| 多模态 | 语音、生理、行为、微表情等多种数据模态 |

### 13.2 参考文档

- 产品需求文档：`docs/PRD.md`
- API 契约文档：`docs/api_contract.md`
- OpenSpecs 学生档案：`docs/OpenSpecs-StudentProfile.md`
- 项目代码：`/` (Next.js 16 项目根目录)

---

**文档版本历史**

| 版本 | 日期 | 说明 |
|------|------|------|
| v2.3 | 2026-03-14 | 新增 OpenClaw 编排中心：智能体网格可视化、实时数据流、成本分析、安全审计、数据库看板 |
| v2.2 | 2026-03-09 | 新增 Pocket 小程序 API 文档，Redis 缓存架构，数据库模型扩展 |
|------|------|------|
| v2.2 | 2026-03-09 | 新增 Pocket 小程序 API 文档，Redis 缓存架构，数据库模型扩展 |
| v2.1 | 2026-03-07 | 对齐项目现状：更新数据库模型、删除重复内容、修正枚举值 |
| v2.0 | 2026-03-06 | 同步 PRD，新增小程序数据库字段，完善用户流程 |
| v1.0 | 2026-03-03 | 初始版本，基于前端原型整理 |
|------|------|------|
| v2.1 | 2026-03-07 | 对齐项目现状：更新数据库模型、删除重复内容、修正枚举值 |
| v2.0 | 2026-03-06 | 同步 PRD，新增小程序数据库字段，完善用户流程 |
| v1.0 | 2026-03-03 | 初始版本，基于前端原型整理 |
|------|------|------|
| v2.0 | 2026-03-06 | 同步 PRD，新增小程序数据库字段，完善用户流程 |
| v1.0 | 2026-03-03 | 初始版本，基于前端原型整理 |
