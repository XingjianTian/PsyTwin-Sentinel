# PsyTwin Sentinel 技术规范文档

> **项目名称**：PsyTwin Sentinel（心理孪生·哨兵）
> **版本**：v2.4（已对齐项目现状）
> **更新日期**：2026-03-16

---

## 1. 项目概览与目标

本项目旨在构建一个连接 VR 体验端、移动应用端与管理决策端的全链路心理健康生态系统。通过 **Next.js 16** 全栈架构实现前后端一体化开发，利用 **React 19** 构建专业级决策看板，并集成 **Qwen (通义千问)** 大模型提供精准的 RAG（检索增强生成）干预建议。

### 核心特性

- 全域心理健康态势实时监测与可视化
- VR 多模态数据采集与风险预警
- 学生心理数字档案全生命周期管理
- AI 驱动的智能干预建议与 RAG 知识库
- **OpenClaw 智能体集群编排与实时监控**

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
| **缓存** | Redis 7.x + ioredis | 分布式缓存层 |
| **AI 集成** | Qwen API (通义千问) | 大模型对话与 RAG |
| **智能体编排** | OpenClaw Gateway | 多智能体协作与监控 |
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
│   │   ├── rag/              # RAG 知识库 API
│   │   └── openclaw/         # OpenClaw 编排 API
│   ├── layout.tsx            # 根布局
│   └── globals.css           # 全局样式
├── components/
│   ├── ui/                   # shadcn/ui 基础组件
│   ├── views/                # 业务视图组件
│   ├── ai-config/            # AI 配置相关组件
│   │   ├── openclaw-orchestration-view.tsx  # OpenClaw 编排中心
│   │   ├── agent-grid-office.tsx            # 智能体网格
│   │   ├── agent-grid-label.tsx             # 智能体标签
│   │   ├── live-panel.tsx                   # 活动日志面板
│   │   ├── stats-cards.tsx                  # 统计卡片
│   │   ├── agent-chat-panel.tsx             # 智能体对话面板
│   │   └── ...
│   └── ...
├── lib/
│   ├── openclaw/             # OpenClaw 相关逻辑
│   │   ├── bridge.ts         # WebSocket 桥接
│   │   ├── agents.config.ts  # 智能体配置
│   │   ├── agent-chat.ts     # HTTP 对话工具
│   │   ├── grid-paths.ts     # 网格路径计算
│   │   └── use-workflow-stream.ts # 工作流数据流
│   ├── db.ts                 # Prisma 客户端
│   ├── redis.ts              # Redis 客户端
│   ├── cache.ts              # 缓存封装
│   └── ...
├── hooks/                    # 自定义 React Hooks
├── types/                    # TypeScript 类型定义
└── prisma/
    └── schema.prisma         # 数据库模型
```

### 2.3 OpenClaw 智能体架构

**智能体配置** (`lib/openclaw/agents.config.ts`):
```typescript
AGENTS = {
  main:       { name: "首席数据官", emoji: "🎯", color: "#ff006e", role: "总览全局" },
  Collector:  { name: "采集员", emoji: "📡", color: "#374151", role: "数据采集" },
  Therapist:  { name: "咨询师", emoji: "🧠", color: "#9d4edd", role: "干预策略" },
  Relayer:    { name: "中继工程师", emoji: "🔌", color: "#ffbe0b", role: "边缘处理" },
  DBA:        { name: "数据哨兵", emoji: "🛡️", color: "#1e40af", role: "数据管理" },
  Analyst:    { name: "分析师", emoji: "📊", color: "#15803d", role: "特征提取" }
}
```

**HTTP 直接对话功能**:
- 用户可通过点击智能体网格中的小人，直接在右侧对话框发送任务
- 使用 `user: "psytwin"` 保持稳定 session
- API 端点: `/api/openclaw/agent-chat` (代理转发到 Gateway)

---

## 3. 核心页面功能设计

### 3.5 OpenClaw 编排中心 (OpenClaw Orchestration)

**定位**：AI 智能体集群的可视化编排与监控中心，实现多智能体协作任务的实时监控、成本分析和安全审计。

#### F5.1 智能体集群可视化

- **田字格 3×3 网格布局**：6 个智能体节点在网格中实时移动
- **智能体标识**：每个智能体拥有独特的颜色主题（红/深灰/紫/橙/深蓝/深绿）
- **路径动画**：基于网格坐标系的平滑移动动画，模拟智能体协作流程
- **点击交互**：点击智能体小人可在右侧对话框直接发送任务
- **组件架构**：
  - `AgentGridOffice`：网格容器，管理坐标系统和动画循环
  - `AgentGridLabel`：可移动智能体卡片，支持点击选择
  - `AgentChatPanel`：智能体对话面板，支持 HTTP 直接请求

#### F5.2 实时数据流 (WebSocket → 桥接)

- **数据识别**：基于 `sessionKey` 提取 Agent ID，使用 Map 存储并发映射
- **文本检测**：从响应文本中检测 `[采集员]`、`[DBA]` 等标记识别子 Agent
- **活动日志**：显示最近 5 条请求记录，头像 + 彩色名字 + 时间戳 + 消息内容
- **消息处理**：
  - Web UI 子代理隐藏过程消息，仅显示完成结果
  - 从累积文本检测真实 Agent 名称

#### F5.3 交互统计仪表盘

**布局设计**:
```
┌─────────────────┬─────────────────┐
│   概览卡片      │   成本统计卡片   │
│  (今日/本月/本年)│  (4个方块+进度条)│
│  可切换 Tab     │                 │
├─────────────────┴─────────────────┤
│        Agents 排行榜              │
│        (完整宽度表格)              │
└───────────────────────────────────┘
```

- **概览统计**：时间线条形图展示消息数量趋势（今日按小时/本月按日期/本年按月）
- **成本统计**：AI成本、服务器成本、人力成本、总节省 四个彩色方块 + 成本对比进度条
- **排行榜**：按节省金额排序，显示中文名称、emoji、任务数、事件数、用时、节省金额

#### F5.4 安全审计中心

- **系统健康度**：实时健康评分仪表盘（0-100%）
- **端口扫描状态**：关键端口监控
- **安全事件日志**：异常访问、错误请求记录

#### F5.5 数据库浏览看板

- **表结构浏览**：openclaw_agents、openclaw_requests 等表
- **数据预览**：分页查看表数据（默认选中 openclaw_agents）

---

## 4. API 接口规范

### 4.6 OpenClaw 编排接口

#### A18. HTTP 直接对话接口

```
POST /api/openclaw/agent-chat

Body:
{
  "agentId": string,        // 智能体 ID: main | Collector | Therapist | ...
  "message": string,        // 用户输入的任务描述
  "token": string           // 可选，默认 "123456"
}

Response:
{
  "id": string,
  "object": "response",
  "created_at": number,
  "status": "completed",
  "model": "openclaw:{agentId}",
  "output": [{
    "type": "message",
    "role": "assistant",
    "content": [{ "type": "output_text", "text": string }]
  }],
  "usage": {
    "input_tokens": number,
    "output_tokens": number,
    "total_tokens": number
  }
}

Logic:
1. 代理转发到 OpenClaw Gateway (localhost:18789/v1/responses)
2. 添加 user: "psytwin" 保持稳定 session
3. 返回响应数据
```

---

## 5. 数据库模型

### 5.1 OpenClaw 相关模型

```prisma
// OpenClaw 智能体
model OpenClawAgent {
  id            String               @id @default(uuid())
  name          String               @unique
  role          String
  description   String?
  color         String               // 主题色 (hex)
  emoji         String?              // emoji 标识
  avatar        String?              // 头像 URL
  status        OpenClawAgentStatus  @default(IDLE)
  capabilities  String[]             // 能力标签
  config        Json?                // 配置参数
  createdAt     DateTime             @default(now())
  updatedAt     DateTime             @updatedAt
  
  requests      OpenClawRequest[]
  events        OpenClawEvent[]
  costLogs      OpenClawCost[]
}

// OpenClaw 请求记录
model OpenClawRequest {
  id            String                   @id @default(uuid())
  runId         String                   @unique
  agentId       String
  type          String                   // 请求类型
  status        OpenClawRequestStatus    @default(PENDING)
  state         String?                  // analyzing | in_progress | completed
  content       String?                  // 输入内容
  result        String?                  // 输出内容
  assignedAgentId String?                // 分配的智能体
  source        String                   // 来源: gateway | http
  createdAt     DateTime                 @default(now())
  completedAt   DateTime?
  
  agent         OpenClawAgent            @relation(fields: [agentId], references: [id])
  events        OpenClawEvent[]
  task          OpenClawTask?
}

// OpenClaw 工作流事件
model OpenClawEvent {
  id            String   @id @default(uuid())
  requestId     String
  taskId        String?
  agentId       String
  type          String   // lifecycle.start | lifecycle.end | stream.assistant | ...
  state         String
  message       String
  payload       Json?    // 附加数据
  eventTime     DateTime @default(now())
  
  request       OpenClawRequest @relation(fields: [requestId], references: [id])
  agent         OpenClawAgent   @relation(fields: [agentId], references: [id])
}

// OpenClaw 任务记录
model OpenClawTask {
  id            String   @id @default(uuid())
  requestId     String   @unique
  title         String
  detail        String?
  assignedAgentId String
  status        String   // ASSIGNED | IN_PROGRESS | COMPLETED
  createdAt     DateTime @default(now())
  startedAt     DateTime?
  completedAt   DateTime?
  
  request       OpenClawRequest @relation(fields: [requestId], references: [id])
}
```

---

## 6. 导航结构

```
├── 态势分析 ▼
│   ├── 全域态势
│   ├── 风险溯源
│   └── VR感知干预
│
├── 资源管理 ▼
│   ├── 多模态数据流
│   ├── 疗愈空间管理
│   └── 硬件设备管理
│
├── 学生管理 ▼
│   ├── 学生档案
│   └── 干预记录
│
├── AI配置 ▼
│   ├── OpenClaw 编排
│   ├── RAG 向量知识库
│   └── 模型与策略中心
│
└── 系统设置 ▶
    ├── 基础设置
    ├── 用户管理
    ├── 数据同步
    ├── 安全策略
    └── 通知管理
```

**说明**：所有一级导航统一为可展开形式，前四个默认展开，系统设置默认收起。

---

## 7. 版本历史

| 版本 | 日期 | 说明 |
|------|------|------|
| **v2.4** | **2026-03-16** | **OpenClaw 编排中心增强**：HTTP 直接对话功能、时间线统计图表、统一导航栏设计、配色优化 |
| v2.3 | 2026-03-14 | 新增 OpenClaw 编排中心：智能体网格可视化、实时数据流、成本分析、安全审计、数据库看板 |
| v2.2 | 2026-03-09 | 新增 Pocket 小程序 API 文档，Redis 缓存架构，数据库模型扩展 |
| v2.1 | 2026-03-07 | 对齐项目现状：更新数据库模型、删除重复内容、修正枚举值 |
| v2.0 | 2026-03-06 | 同步 PRD，新增小程序数据库字段，完善用户流程 |
| v1.0 | 2026-03-03 | 初始版本，基于前端原型整理 |

---

**文档说明**：本技术规范文档基于实际 Next.js 16 + shadcn/ui 实现编写，与代码库保持一致。可直接作为技术方案书的核心系统架构部分。
