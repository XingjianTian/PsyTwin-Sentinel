# OpenSpecs: 学生心理孪生档案模块详细规范

> **文档类型**: 补充技术规范 (OpenSpecs)  
> **所属项目**: PsyTwin Sentinel  
> **模块**: M03 - 学生心理孪生档案  
> **版本**: v1.0  
> **更新日期**: 2026-03-06  
> **状态**: ✅ 已完成 *(2026-03-06 联调通过本地数据库)*

---

## 1. 模块概述

### 1.1 设计目标
将学生档案从静态 Mock 数据升级为动态数据库驱动的完整功能模块，实现：
- **真实数据流**: 从数据库读取学生信息、心理画像、生命周期事件
- **动态路由**: 每个学生有独立 URL (`/students/[id]`)
- **实时更新**: 支持干预记录实时更新和生命周期追踪
- **数据对齐**: 前端展示与数据库 Schema 完全一致

### 1.2 涉及数据库模型
```
Student (主表)
├── PsychProfile (1:1 心理画像)
├── TimelineEvent (1:N 生命周期事件)
├── InterventionRecord (1:N 干预记录)
├── Alert (1:N 预警记录)
├── VRSession (1:N VR体验记录)
├── VitalSign (1:N 生理指标)
├── VoiceAnalysis (1:N 语音分析)
└── ExpressionData (1:N 表情数据)
```

---

## 2. 页面架构设计

### 2.1 路由结构
```
/students                    → 学生列表页 (列表视图)
/students/[id]              → 学生详情页 (动态路由)
  ├── /profile              → 心理画像 (默认)
  ├── /timeline             → 生命周期
  ├── /interventions        → 干预记录
  ├── /alerts               → 预警历史
  └── /vr-records           → VR体验记录
```

### 2.2 页面组件结构
```
app/(dashboard)/students/
├── page.tsx                 # 学生列表页
├── [id]/
│   ├── page.tsx            # 学生详情主页面 (重定向到 profile)
│   ├── layout.tsx          # 详情页共享布局 (侧边导航)
│   ├── profile/
│   │   └── page.tsx        # 心理画像子页面
│   ├── timeline/
│   │   └── page.tsx        # 生命周期子页面
│   ├── interventions/
│   │   └── page.tsx        # 干预记录子页面
│   └── ...
└── components/
    ├── student-list.tsx     # 学生列表组件
    ├── student-filter.tsx   # 筛选组件
    ├── psych-radar.tsx      # 心理雷达图组件
    ├── timeline-view.tsx    # 时间轴组件
    └── intervention-table.tsx # 干预记录表格
```

---

## 3. 数据库 Schema 对齐

### 3.1 当前 Schema 分析

#### Student 模型 (已存在)
```prisma
model Student {
  id                  String               @id @default(uuid())
  name                String
  studentNo           String               @unique
  className           String
  facultyId           String?
  gender              String?
  birthDate           DateTime?
  mbti                String?
  riskLevel           RiskLevel            @default(LOW)
  createdAt           DateTime             @default(now())
  updatedAt           DateTime             @updatedAt
  
  // Relations
  faculty             Faculty?             @relation(fields: [facultyId], references: [id])
  psychProfile        PsychProfile?
  timelineEvents      TimelineEvent[]
  alerts              Alert[]
  workOrders          WorkOrder[]
  interventionRecords InterventionRecord[]
  vrSessions          VRSession[]
  vitalSigns          VitalSign[]
  voiceAnalyses       VoiceAnalysis[]
  expressionData      ExpressionData[]
}
```

#### PsychProfile 模型 (已存在)
```prisma
model PsychProfile {
  id                 String   @id @default(uuid())
  studentId          String   @unique
  adversityQuotient  Int      // 逆商
  emotionalStability Int      // 情绪稳定
  socialTendency     Int      // 社交倾向
  stressResistance   Int      // 抗压能力
  selfAwareness      Int      // 自我认知
  empathy            Int      // 共情能力
  willpower          Int      // 意志力
  adaptability       Int      // 适应性
  overallScore       Int      // 综合评分
  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt
  
  student            Student  @relation(fields: [studentId], references: [id], onDelete: Cascade)
}
```

#### TimelineEvent 模型 (已存在)
```prisma
model TimelineEvent {
  id          String   @id @default(uuid())
  studentId   String
  date        String   // YYYY-MM 格式
  title       String
  description String
  status      String   // success | warning | active
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  student     Student  @relation(fields: [studentId], references: [id], onDelete: Cascade)
}
```

#### InterventionRecord 模型 (已存在)
```prisma
model InterventionRecord {
  id        String           @id @default(uuid())
  studentId String
  date      DateTime
  type      InterventionType // REGULAR_INTERVIEW | CBT_THERAPY | GROUP_COUNSELING | CRISIS_INTERVENTION | INITIAL_ASSESSMENT
  counselor String
  duration  String           // "50分钟"
  result    String
  status    String           // completed | pending
  createdAt DateTime         @default(now())
  updatedAt DateTime         @updatedAt
  
  student   Student          @relation(fields: [studentId], references: [id], onDelete: Cascade)
}
```

### 3.2 数据映射关系

| UI 展示项 | 数据库字段 | 模型 | 说明 |
|-----------|-----------|------|------|
| 学生姓名 | `name` | Student | 直接映射 |
| 学号 | `studentNo` | Student | 直接映射 |
| 班级 | `className` | Student | 直接映射 |
| 学院 | `faculty.name` | Faculty | 关联查询 |
| 性别 | `gender` | Student | 直接映射 |
| 出生日期 | `birthDate` | Student | 格式化显示 |
| MBTI | `mbti` | Student | 直接映射 |
| 风险等级 | `riskLevel` | Student | 枚举转换 |
| 逆商评分 | `adversityQuotient` | PsychProfile | 1-100分 |
| 情绪稳定 | `emotionalStability` | PsychProfile | 1-100分 |
| 社交倾向 | `socialTendency` | PsychProfile | 1-100分 |
| 抗压能力 | `stressResistance` | PsychProfile | 1-100分 |
| 自我认知 | `selfAwareness` | PsychProfile | 1-100分 |
| 共情能力 | `empathy` | PsychProfile | 1-100分 |
| 意志力 | `willpower` | PsychProfile | 1-100分 |
| 适应性 | `adaptability` | PsychProfile | 1-100分 |
| 综合评分 | `overallScore` | PsychProfile | 计算值 |

---

## 4. API 接口设计

### 4.1 学生列表接口

#### GET /api/students
**功能**: 获取学生列表（支持分页、搜索、筛选）

**Query Parameters**:
```typescript
{
  page?: number;        // 页码，默认 1
  limit?: number;       // 每页数量，默认 20
  search?: string;      // 搜索关键字（姓名/学号）
  className?: string;   // 班级筛选
  facultyId?: string;   // 学院筛选
  riskLevel?: string;   // 风险等级筛选 (HIGH/MEDIUM/LOW)
}
```

**Response**:
```typescript
{
  data: Array<{
    id: string;
    name: string;
    studentNo: string;
    className: string;
    faculty: { name: string } | null;
    riskLevel: string;
    mbti: string | null;
    gender: string | null;
    psychProfile: {
      overallScore: number;
    } | null;
  }>;
  total: number;
  page: number;
  totalPages: number;
}
```

### 4.2 学生详情接口

#### GET /api/students/[id]
**功能**: 获取单个学生完整信息

**Response**:
```typescript
{
  id: string;
  name: string;
  studentNo: string;
  className: string;
  gender: string | null;
  birthDate: string | null;  // ISO 8601 格式
  mbti: string | null;
  riskLevel: string;
  faculty: {
    id: string;
    name: string;
  } | null;
  
  // 心理画像
  psychProfile: {
    adversityQuotient: number;
    emotionalStability: number;
    socialTendency: number;
    stressResistance: number;
    selfAwareness: number;
    empathy: number;
    willpower: number;
    adaptability: number;
    overallScore: number;
  } | null;
  
  // 统计信息
  stats: {
    totalAlerts: number;           // 预警总数
    totalInterventions: number;    // 干预总数
    totalVRSessions: number;       // VR体验次数
    lastActiveAt: string | null;   // 最后活跃时间
  };
}
```

### 4.3 生命周期事件接口

#### GET /api/students/[id]/timeline
**功能**: 获取学生生命周期事件

**Query Parameters**:
```typescript
{
  limit?: number;  // 返回数量，默认 50
}
```

**Response**:
```typescript
{
  events: Array<{
    id: string;
    date: string;        // YYYY-MM
    title: string;
    description: string;
    status: 'success' | 'warning' | 'active';
  }>;
}
```

### 4.4 干预记录接口

#### GET /api/students/[id]/interventions
**功能**: 获取学生干预记录

**Query Parameters**:
```typescript
{
  page?: number;
  limit?: number;
}
```

**Response**:
```typescript
{
  data: Array<{
    id: string;
    date: string;           // ISO 8601
    type: string;           // 干预类型
    counselor: string;
    duration: string;
    result: string;
    status: string;
  }>;
  total: number;
}
```

---

## 5. 页面详细设计

### 5.1 学生列表页 (`/students`)

#### 布局结构
```
┌─────────────────────────────────────────────────────────────┐
│  [筛选栏] 搜索 | 年级筛选 | 班级筛选 | 风险等级筛选          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  [学生卡片网格]                                             │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│  │ 头像         │ │ 头像         │ │ 头像         │          │
│  │ 姓名 学号    │ │ 姓名 学号    │ │ 姓名 学号    │          │
│  │ 班级 学院    │ │ 班级 学院    │ │ 班级 学院    │          │
│  │ [风险等级]   │ │ [风险等级]   │ │ [风险等级]   │          │
│  │ 综合评分     │ │ 综合评分     │ │ 综合评分     │          │
│  └─────────────┘ └─────────────┘ └─────────────┘          │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  [分页控件] < 1 2 3 ... 10 >                                │
└─────────────────────────────────────────────────────────────┘
```

#### 交互逻辑
1. **点击学生卡片** → 跳转到 `/students/[id]`
2. **搜索框输入** → 实时搜索（防抖 300ms）
3. **筛选条件变化** → 重置页码到第 1 页
4. **分页切换** → 滚动到顶部

### 5.2 学生详情页 (`/students/[id]`)

#### 布局结构
```
┌─────────────────────────────────────────────────────────────┐
│  [返回按钮] < 学生档案                                        │
├─────────────────────────────────────────────────────────────┤
│  [学生信息卡]                                                │
│  头像 | 姓名 学号 | 班级 学院 | [MBTI] [风险等级] [综合评分]   │
├─────────────────────────────────────────────────────────────┤
│  [子导航栏] 心理画像 | 生命周期 | 干预记录 | 预警历史 | VR记录 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  [内容区域] 根据子路由显示不同内容                            │
│                                                             │
│  === 心理画像 (默认) ===                                     │
│  ┌───────────────────────────────────────────────────────┐ │
│  │                 [雷达图]                               │ │
│  │              (8维度心理画像)                          │ │
│  └───────────────────────────────────────────────────────┘ │
│  [维度详情] 逆商: 82 | 情绪稳定: 68 | 社交倾向: 75 ...       │
│                                                             │
│  === 生命周期 ===                                           │
│  [时间轴视图]                                                │
│  ●────●────●────●────●                                      │
│  入学   VR   预警  咨询  复查                                │
│                                                             │
│  === 干预记录 ===                                           │
│  [表格] 日期 | 类型 | 咨询师 | 时长 | 结果 | 状态            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### 子导航设计
使用 Next.js 的嵌套路由和平行路由：
```typescript
// app/(dashboard)/students/[id]/layout.tsx
const tabs = [
  { label: '心理画像', href: '/profile', icon: Radar },
  { label: '生命周期', href: '/timeline', icon: Clock },
  { label: '干预记录', href: '/interventions', icon: FileText },
  { label: '预警历史', href: '/alerts', icon: AlertTriangle },
  { label: 'VR记录', href: '/vr-records', icon: Gamepad2 },
];
```

---

## 6. 组件详细规范

### 6.1 心理雷达图组件 (`PsychRadar`)

#### Props 接口
```typescript
interface PsychRadarProps {
  data: {
    adversityQuotient: number;   // 逆商
    emotionalStability: number;  // 情绪稳定
    socialTendency: number;      // 社交倾向
    stressResistance: number;    // 抗压能力
    selfAwareness: number;       // 自我认知
    empathy: number;             // 共情能力
    willpower: number;           // 意志力
    adaptability: number;        // 适应性
  };
  overallScore: number;          // 综合评分
}
```

#### 数据转换
```typescript
const radarData = [
  { dimension: "逆商", value: data.adversityQuotient },
  { dimension: "情绪稳定", value: data.emotionalStability },
  { dimension: "社交倾向", value: data.socialTendency },
  { dimension: "抗压能力", value: data.stressResistance },
  { dimension: "自我认知", value: data.selfAwareness },
  { dimension: "共情能力", value: data.empathy },
  { dimension: "意志力", value: data.willpower },
  { dimension: "适应性", value: data.adaptability },
];
```

### 6.2 生命周期时间轴 (`TimelineView`)

#### Props 接口
```typescript
interface TimelineViewProps {
  events: Array<{
    id: string;
    date: string;        // YYYY-MM
    title: string;
    description: string;
    status: 'success' | 'warning' | 'active';
  }>;
}
```

#### 状态图标映射
```typescript
const statusIcons = {
  success: Check,      // 绿色 ✓
  warning: AlertTriangle, // 黄色 ⚠
  active: Activity,    // 蓝色 脉冲
};

const statusColors = {
  success: 'border-success bg-success/20',
  warning: 'border-warning bg-warning/20',
  active: 'border-primary bg-primary/20',
};
```

---

## 7. Server Actions 设计

### 7.1 文件位置
```
app/actions/students.ts
```

### 7.2 核心函数

#### getStudents
```typescript
export async function getStudents(params: {
  page?: number;
  limit?: number;
  search?: string;
  className?: string;
  riskLevel?: RiskLevel;
}) {
  const { page = 1, limit = 20, search, className, riskLevel } = params;
  
  const where: Prisma.StudentWhereInput = {
    AND: [
      search ? {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { studentNo: { contains: search, mode: 'insensitive' } },
        ],
      } : {},
      className ? { className } : {},
      riskLevel ? { riskLevel } : {},
    ],
  };
  
  const [students, total] = await Promise.all([
    prisma.student.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        faculty: { select: { name: true } },
        psychProfile: { select: { overallScore: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.student.count({ where }),
  ]);
  
  return { students, total, page, totalPages: Math.ceil(total / limit) };
}
```

#### getStudentDetail
```typescript
export async function getStudentDetail(id: string) {
  const student = await prisma.student.findUnique({
    where: { id },
    include: {
      faculty: { select: { id: true, name: true } },
      psychProfile: true,
      _count: {
        select: {
          alerts: true,
          interventionRecords: true,
          vrSessions: true,
        },
      },
    },
  });
  
  if (!student) throw new Error('Student not found');
  
  return {
    ...student,
    stats: {
      totalAlerts: student._count.alerts,
      totalInterventions: student._count.interventionRecords,
      totalVRSessions: student._count.vrSessions,
    },
  };
}
```

#### getStudentTimeline
```typescript
export async function getStudentTimeline(studentId: string, limit = 50) {
  return prisma.timelineEvent.findMany({
    where: { studentId },
    orderBy: { date: 'desc' },
    take: limit,
  });
}
```

---

## 8. 实现步骤

### Step 1: 数据库数据填充 (30分钟)
- [x] 使用 `prisma/seed.ts` 为现有学生生成 `PsychProfile` 数据 *(已完成)*
- [x] 为每个学生生成 `TimelineEvent` 历史记录 *(已完成)*
- [x] 验证数据完整性 *(已完成)*

### Step 2: Server Actions 实现 (1小时)
- [x] 创建 `app/actions/students.ts` *(已完成)*
- [x] 实现 `getStudents` 列表查询 *(已完成)*
- [x] 实现 `getStudentDetail` 详情查询 *(已完成)*
- [x] 实现 `getStudentTimeline` 时间轴查询 *(已完成)*
- [x] 实现 `getStudentInterventions` 干预记录查询 *(已完成)*

### Step 3: API 路由实现 (30分钟)
- [x] 创建 `app/api/students/route.ts` (列表) *(已完成)*
- [x] 创建 `app/api/students/[id]/route.ts` (详情) *(已完成)*
- [x] 创建 `app/api/students/[id]/timeline/route.ts` *(已完成)*
- [x] 创建 `app/api/students/[id]/interventions/route.ts` *(已完成)*

### Step 4: 学生列表页重构 (1小时)
- [x] 重构 `/students/page.tsx` *(已完成)*
- [x] 创建学生卡片组件 *(已完成)*
- [x] 实现搜索和筛选功能 *(已完成)*
- [x] 实现分页 *(已完成)*

### Step 5: 学生详情页实现 (2小时)
- [x] 创建 `/students/[id]/layout.tsx` (详情页布局) *(已完成)*
- [x] 创建 `/students/[id]/page.tsx` (重定向到 profile) *(已完成)*
- [x] 创建 `/students/[id]/profile/page.tsx` *(已完成)*
- [x] 创建 `/students/[id]/timeline/page.tsx` *(已完成)*
- [x] 创建 `/students/[id]/interventions/page.tsx` *(已完成)*
- [x] 实现子导航栏 *(已完成)*

### Step 6: 组件提取和优化 (1小时)
- [x] 提取 `PsychRadar` 组件 *(已完成)*
- [x] 提取 `TimelineView` 组件 *(已完成)*
- [x] 提取 `InterventionTable` 组件 *(已完成)*
- [x] 提取 `StudentCard` 组件 *(已完成)*

### Step 7: 集成测试 (30分钟)
- [x] 验证列表页数据加载 *(已完成)*
- [x] 验证详情页跳转 *(已完成)*
- [x] 验证子路由切换 *(已完成)*
- [x] 验证数据一致性 *(已完成)*

---

## 9. 数据流示意图

```
┌─────────────────────────────────────────────────────────────┐
│                         数据库 (PostgreSQL)                  │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │   Student   │  │PsychProfile  │  │ TimelineEvent    │   │
│  └──────┬──────┘  └──────┬───────┘  └────────┬─────────┘   │
└─────────┼────────────────┼───────────────────┼─────────────┘
          │                │                   │
          ▼                ▼                   ▼
┌─────────────────────────────────────────────────────────────┐
│                    Prisma ORM 查询                           │
│         getStudents() | getStudentDetail() | etc.           │
└─────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────┐
│                    Server Actions                            │
│              app/actions/students.ts                         │
└─────────────────────────────────────────────────────────────┘
          │
    ┌─────┴─────┐
    ▼           ▼
┌─────────┐  ┌──────────────┐
│ 列表页   │  │   详情页      │
│/students│  │/students/[id] │
└─────────┘  └──────────────┘
```

---

## 10. 验收标准

### 功能验收
- [x] 学生列表页显示真实数据库数据（非 Mock） *(已完成)*
- [x] 点击学生卡片跳转到详情页 *(已完成)*
- [x] 详情页 URL 包含学生 ID (`/students/stu-xxxxx`) *(已完成)*
- [x] 心理雷达图显示 8 维度数据（来自 PsychProfile） *(已完成)*
- [x] 生命周期时间轴显示真实事件（来自 TimelineEvent） *(已完成)*
- [x] 干预记录表格显示真实数据（来自 InterventionRecord） *(已完成)*
- [x] 支持搜索、筛选、分页 *(已完成)*
- [x] 页面加载时间 < 2 秒 *(已完成)*

### 数据对齐验收
- [x] Student 模型所有字段都有对应 UI 展示 *(已完成)*
- [x] PsychProfile 8 个维度都参与雷达图绘制 *(已完成)*
- [x] TimelineEvent 按时间倒序排列 *(已完成)*
- [x] InterventionRecord 按日期倒序排列 *(已完成)*
- [x] 风险等级颜色与系统一致 (HIGH=红色, MEDIUM=橙色, LOW=绿色) *(已完成)*

### 代码质量验收
- [x] 使用 Server Actions 获取数据 *(已完成)*
- [x] 组件职责单一，可复用 *(已完成)*
- [x] TypeScript 类型完整 *(已完成)*
- [x] 错误处理完善（loading、error 状态） *(已完成)*

---

## 11. 附录

### 11.1 相关文件索引

| 文件路径 | 说明 |
|---------|------|
| `prisma/schema.prisma` | 数据库模型定义 |
| `prisma/seed.ts` | 种子数据 |
| `app/actions/students.ts` | Server Actions（待创建） |
| `app/api/students/*.ts` | API 路由（待创建） |
| `app/(dashboard)/students/page.tsx` | 列表页（需重构） |
| `app/(dashboard)/students/[id]/*.tsx` | 详情页（待创建） |
| `components/views/student-profile-view.tsx` | 当前实现（参考用） |

### 11.2 风险等级颜色映射

```typescript
const riskLevelColors = {
  HIGH: {
    border: 'border-destructive',
    bg: 'bg-destructive/10',
    text: 'text-destructive',
    label: '高危',
  },
  MEDIUM: {
    border: 'border-warning',
    bg: 'bg-warning/10',
    text: 'text-warning',
    label: '中危',
  },
  LOW: {
    border: 'border-success',
    bg: 'bg-success/10',
    text: 'text-success',
    label: '低危',
  },
};
```

### 11.3 干预类型中文映射

```typescript
const interventionTypeLabels = {
  REGULAR_INTERVIEW: '定期访谈',
  CBT_THERAPY: 'CBT疗法',
  GROUP_COUNSELING: '团体辅导',
  CRISIS_INTERVENTION: '危机干预',
  INITIAL_ASSESSMENT: '初次评估',
};
```

---

**文档结束**

*注：本文档为 PRD 的补充技术规范，详细定义了学生档案模块的数据库对齐方案和实现细节。*
