# PsyTwin Sentinel 技术规范文档

> **项目名称**：PsyTwin Sentinel（心理孪生·哨兵）
> **版本**：v2.0（Next.js 全栈重构版）
> **更新日期**：2026-03-03

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

### 3.5 VR 端数据 (VR Dashboard)

**定位**：展示 VR 设备采集的多模态数据。

#### F5.1 设备状态监控

- 在线/离线设备列表
- 连接状态实时更新

#### F5.2 会话数据流

- 实时展示当前 VR 会话数据
- 心率、微表情、语音等指标

---

### 3.6 干预记录 (Intervention Records)

**定位**：心理咨询师的工作记录区。

#### F6.1 咨询记录管理

- 创建/编辑/删除干预记录
- 关联学生档案
- 记录干预方案与效果评估

#### F6.2 统计报表

- 咨询量统计
- 干预效果分析

---

### 3.7 系统设置 (System Settings)

**定位**：系统管理员的配置区。

#### F7.1 用户管理

- 添加/编辑/删除用户
- 角色权限配置（管理员/咨询师/辅导员）

#### F7.2 系统参数配置

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

## 5. 数据库模型 (Prisma Schema)

### 5.1 核心模型

```prisma
model Student {
  id            String    @id @default(cuid())
  studentId     String    @unique
  name          String
  anonymousName String    @default("")
  department    String
  grade         String
  mbti          String?
  riskLevel     RiskLevel @default(GREEN)
  
  alerts        Alert[]
  interventions Intervention[]
  vrSessions    VRSession[]
  
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model Alert {
  id            String    @id @default(cuid())
  studentId     String
  student       Student   @relation(fields: [studentId], references: [id])
  
  riskLevel     RiskLevel
  triggerType   String
  triggerValue  Float
  evidence      Json
  
  status        AlertStatus @default(PENDING)
  handlerId     String?
  handlerNotes  String?
  
  createdAt     DateTime  @default(now())
  resolvedAt    DateTime?
}

model Intervention {
  id            String    @id @default(cuid())
  studentId     String
  student       Student   @relation(fields: [studentId], references: [id])
  
  handlerId     String
  type          InterventionType
  content       String    @db.Text
  outcome       String    @db.Text
  nextSteps     String?   @db.Text
  
  createdAt     DateTime  @default(now())
}

model VRSession {
  id            String    @id @default(cuid())
  studentId     String
  student       Student   @relation(fields: [studentId], references: [id])
  
  sceneId       String
  startTime     DateTime
  endTime       DateTime?
  
  metrics       Json
}

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String
  role          UserRole
  
  createdAt     DateTime  @default(now())
}

enum RiskLevel {
  RED
  ORANGE
  YELLOW
  GREEN
}

enum AlertStatus {
  PENDING
  PROCESSING
  RESOLVED
}

enum InterventionType {
  COUNSELING
  REFERRAL
  MEDICATION
  OTHER
}

enum UserRole {
  ADMIN
  COUNSELOR
  COUNSELOR_ASSISTANT
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

### Phase 3: AI 集成 🚧 进行中 *(UI已完成，待接入真实API)*

- [ ] Qwen API 对接 *(需实现 lib/ai.ts 封装 Dashscope API)*
- [ ] RAG 向量存储集成 *(向量数据库待选型: Pinecone/Milvus/Supabase pgvector)*
- [x] AI 风险评估页面 UI *(已实现，components/views/risk-trace-view.tsx)*
- [x] AI 配置页面 UI *(已实现，components/views/ai-config-view.tsx)*

### Phase 4: 部署与优化

- [ ] 生产环境构建
- [ ] 性能优化
- [ ] 安全加固

---

## 10. 当前实现页面

### 已完成的页面

| 页面 | 路径 | 功能 |
|------|------|------|
| 全域态势 | `/` | 心理热力分布图、预警雷达、干预转化漏斗 |
| 风险溯源 | `/risk-trace` | 高危预警工单列表、AI风险评估结论、推荐策略 |
| VR端数据 | `/vr-dashboard` | 设备状态监控、会话数据流 |
| 学生档案 | `/student-profile` | 心理画像雷达、全生命周期追踪 |
| 干预记录 | `/intervention-records` | 咨询记录管理、统计报表 |
| AI配置 | `/ai-config` | 模型参数配置、Prompt模板管理 |
| 系统设置 | `/system-settings` | 用户管理、系统参数配置 |
| 心理咨询室 | `/consultation-room` | 预约管理、咨询记录 |
| 设备管理 | `/device-management` | VR设备状态监控 |
| 多模态数据流 | `/multimodal` | 实时生理/语音/视觉/脑电数据流 |

---

**文档说明**：本技术规范文档基于实际 Next.js 16 + shadcn/ui 实现编写，与代码库保持一致。可直接作为技术方案书的核心系统架构部分。

### Phase 1: 完善前端 Mock 数据

- [ ] 完善各页面 Mock 数据
- [ ] 实现页面间数据流转
- [ ] 添加加载状态与错误处理

### Phase 2: 后端 API 开发

- [ ] Prisma 数据库配置
- [ ] 学生档案 CRUD API
- [ ] 风险预警 API
- [ ] 干预记录 API

### Phase 3: AI 集成

- [ ] Qwen API 对接
- [ ] RAG 知识库基础功能
- [ ] 智能干预建议

### Phase 4: 部署与优化

- [ ] 生产环境构建
- [ ] 性能优化
- [ ] 安全加固

---

**文档说明**：本技术规范文档基于实际 Next.js 16 + shadcn/ui 实现编写，与代码库保持一致。可直接作为技术方案书的核心系统架构部分。
