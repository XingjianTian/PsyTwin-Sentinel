# 后端基础设施搭建：Docker PostgreSQL + Prisma ORM + Schema 设计

## TL;DR

> **Quick Summary**: 为纯前端 Next.js 16 项目搭建完整的后端数据层基础设施——本地 Docker PostgreSQL 数据库 + Prisma ORM 初始化 + 覆盖全部业务模块的数据库 Schema 设计 + 种子数据填充。
> 
> **Deliverables**:
> - `docker-compose.dev.yml` — 本地 PostgreSQL 15 开发容器
> - `.env` + `.env.example` — 环境变量配置
> - `prisma/schema.prisma` — 完整数据库模型（~17 个实体）
> - `lib/prisma.ts` — PrismaClient 单例
> - `prisma/seed.ts` — 基于前端 mock 数据的种子脚本
> - 成功运行的数据库迁移 + 种子数据
> 
> **Estimated Effort**: Medium
> **Parallel Execution**: YES - 3 waves
> **Critical Path**: Task 1 (env) → Task 3 (Docker) → Task 5 (Prisma init) → Task 6 (Schema) → Task 7 (Seed)

---

## Context

### Original Request
田老师确认使用 Prisma + PostgreSQL 技术选型，要求：
1. 创建 Docker Compose 文件运行本地 PostgreSQL
2. 创建 .env 环境变量
3. 根据现有页面数据设计数据库表
4. 先做好这几步的规划和实施，后续再说 API 路由和前端替换

### Interview Summary
**Key Discussions**:
- 技术选型：Prisma ORM + PostgreSQL 15（田老师确认）
- 范围：仅基础设施搭建，不做 API 路由和前端 mock 替换
- Gemini 方案需调整：用户名改 psytwin，密码不硬编码

**Research Findings**:
- 项目当前为纯前端，零后端代码
- 从 9 个业务视图提取了 24 个数据实体，经 Metis 筛选后真正需要入库的约 17 个
- PrismaClient 推荐 globalThis 单例模式
- 项目同时存在 package-lock.json 和 pnpm-lock.yaml（需统一）
- .gitignore 缺少 .env 条目

### Metis Review
**Identified Gaps** (addressed):
- **包管理器混乱**：统一为 npm（项目 README 和 AGENTS.md 全部使用 npm 命令）→ 删除 pnpm-lock.yaml
- **WorkOrder 接口不一致**：risk-trace-view 和 intervention-records-view 中字段不同 → Schema 统一合并两套字段
- **Device 接口不一致**：device-management-view 和 system-settings-view 中定义不同 → 统一为一个 Device 模型
- **多模态数据存储策略**：vitals/voice/expression/behavior/eeg 5 类传感器数据 → 设计为独立表（支持时序查询和趋势分析）
- **UI 渲染数据误入 Schema**：KPI 统计、图表数据、颜色映射等不建表 → 仅为领域实体建表
- **seed.ts 执行器缺失**：需安装 tsx 作为 devDependency
- **端口冲突风险**：Docker 容器端口通过 .env 变量配置，默认 5432
- **.env 安全**：开发密码使用随机字符串，创建 .env.example 模板

---

## Work Objectives

### Core Objective
为 PsyTwin-Sentinel 搭建完整的后端数据层基础设施，使项目具备连接真实数据库的能力，为后续 API 开发和前端数据替换奠定基础。

### Concrete Deliverables
- `docker-compose.dev.yml` — PostgreSQL 15 Alpine 容器配置（含 healthcheck）
- `.env` — 开发环境变量（DATABASE_URL + Postgres 凭据）
- `.env.example` — 环境变量模板（提交到 Git）
- `.gitignore` — 更新，添加 .env
- `prisma/schema.prisma` — 17 个数据模型的完整 Schema
- `prisma/seed.ts` — 幂等种子数据脚本
- `prisma/migrations/` — 初始迁移文件
- `lib/prisma.ts` — PrismaClient 单例模块
- `package.json` — 新增 prisma、@prisma/client、tsx 依赖 + seed 脚本配置

### Definition of Done
- [ ] `docker compose -f docker-compose.dev.yml ps` 显示 postgres 容器 healthy
- [ ] `npx prisma migrate status` 显示 "Database schema is up to date"
- [ ] `npx prisma db seed` 运行成功，数据填充完毕
- [ ] `npm run build` 构建成功（现有前端不受影响）

### Must Have
- PostgreSQL 15 Alpine Docker 容器，named volume 持久化
- Prisma 6.x 最新稳定版
- PrismaClient globalThis 单例模式
- 覆盖全部 9 个业务视图的数据模型
- 种子数据支持幂等执行（upsert）
- .env.example 模板文件

### Must NOT Have (Guardrails)
- ❌ 不创建 API 路由（app/api/）或 Server Actions
- ❌ 不修改 components/views/ 中的任何文件
- ❌ 不为 UI 渲染辅助数据建表（KPI 统计、图表坐标、颜色映射、过滤器选项）
- ❌ 不在 .env 中使用弱密码（password、123456 等）
- ❌ 不使用 root 作为 PostgreSQL 用户名
- ❌ 不修改 next.config.mjs（ignoreBuildErrors 修复是另一个任务）
- ❌ 不引入 Redis、向量数据库等额外基础设施
- ❌ Schema 模型不超过 20 个

---

## Verification Strategy (MANDATORY)

> **ZERO HUMAN INTERVENTION** — ALL verification is agent-executed. No exceptions.

### Test Decision
- **Infrastructure exists**: NO
- **Automated tests**: None（纯基础设施搭建，无业务逻辑代码）
- **Framework**: N/A
- **QA 方式**: 命令行验证 + Docker 容器状态检查

### QA Policy
Every task MUST include agent-executed QA scenarios.
Evidence saved to `.sisyphus/evidence/task-{N}-{scenario-slug}.{ext}`.

- **Docker**: Use Bash — `docker compose ps`, `docker compose logs`
- **Prisma**: Use Bash — `npx prisma migrate status`, `npx prisma db execute`
- **Build**: Use Bash — `npm run build`

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Start Immediately — 环境准备，最大并行):
├── Task 1: .env + .env.example + .gitignore 更新 [quick]
├── Task 2: 统一包管理器（删除 pnpm-lock.yaml）[quick]
├── Task 3: docker-compose.dev.yml 创建 + PostgreSQL 启动 [quick]
└── Task 4: 安装 Prisma 依赖 + 初始化 [quick]

Wave 2 (After Wave 1 — 核心实现):
├── Task 5: lib/prisma.ts 单例模块 [quick]
├── Task 6: prisma/schema.prisma 完整 Schema 设计 [deep]
└── Task 7: Prisma 迁移执行 [quick]

Wave 3 (After Wave 2 — 数据填充 + 验证):
├── Task 8: prisma/seed.ts 种子数据脚本 [unspecified-high]
└── Task 9: 执行种子 + 最终验证 [quick]

Wave FINAL (After ALL tasks — 独立审查):
├── Task F1: Plan compliance audit (oracle)
├── Task F2: Code quality review (unspecified-high)
├── Task F3: Real manual QA (unspecified-high)
└── Task F4: Scope fidelity check (deep)

Critical Path: Task 1 → Task 3 → Task 4 → Task 6 → Task 7 → Task 8 → Task 9 → F1-F4
Max Concurrent: 4 (Wave 1)
```

### Dependency Matrix

| Task | Depends On | Blocks |
|------|-----------|--------|
| 1 (.env) | — | 3, 4 |
| 2 (包管理器) | — | 4 |
| 3 (Docker) | 1 | 7 |
| 4 (Prisma install) | 1, 2 | 5, 6 |
| 5 (单例) | 4 | F2 |
| 6 (Schema) | 4 | 7 |
| 7 (迁移) | 3, 6 | 8 |
| 8 (Seed) | 7 | 9 |
| 9 (验证) | 8 | F1-F4 |

### Agent Dispatch Summary

- **Wave 1**: **4 tasks** — T1 → `quick`, T2 → `quick`, T3 → `quick`, T4 → `quick`
- **Wave 2**: **3 tasks** — T5 → `quick`, T6 → `deep`, T7 → `quick`
- **Wave 3**: **2 tasks** — T8 → `unspecified-high`, T9 → `quick`
- **FINAL**: **4 tasks** — F1 → `oracle`, F2 → `unspecified-high`, F3 → `unspecified-high`, F4 → `deep`

---

## TODOs

- [ ] 1. 创建 .env + .env.example + 更新 .gitignore

  **What to do**:
  - 在项目根目录创建 `.env` 文件，包含以下内容：
    ```
    # PostgreSQL Docker 开发环境配置
    POSTGRES_USER=psytwin
    POSTGRES_PASSWORD=Pt5xK9mR2wQ7vN3j
    POSTGRES_DB=psytwin_sentinel
    POSTGRES_PORT=5432
    
    # Prisma 数据库连接 URL
    DATABASE_URL="postgresql://psytwin:Pt5xK9mR2wQ7vN3j@localhost:5432/psytwin_sentinel?schema=public"
    ```
  - 创建 `.env.example`，内容与 `.env` 相同但密码替换为占位符：
    ```
    POSTGRES_USER=psytwin
    POSTGRES_PASSWORD=your_password_here
    POSTGRES_DB=psytwin_sentinel
    POSTGRES_PORT=5432
    DATABASE_URL="postgresql://psytwin:your_password_here@localhost:5432/psytwin_sentinel?schema=public"
    ```
  - 编辑 `.gitignore`，在 `.env*.local` 行之后添加 `.env`（确保 `.env.example` 不被忽略）

  **Must NOT do**:
  - 不使用 root 作为用户名
  - 不使用 password/123456 等弱密码
  - 不把 .env.example 加入 .gitignore

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 纯文件创建，无复杂逻辑
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 2, 3, 4)
  - **Blocks**: Tasks 3, 4
  - **Blocked By**: None

  **References**:

  **Pattern References**:
  - `.gitignore` (项目根目录) — 当前有 `.env*.local` 但缺少 `.env`，需在该行之后添加

  **External References**:
  - Prisma 官方文档: DATABASE_URL 格式为 `postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public`

  **Acceptance Criteria**:
  - [ ] `.env` 文件存在且包含 DATABASE_URL
  - [ ] `.env.example` 文件存在且密码为占位符
  - [ ] `.gitignore` 包含 `.env` 条目
  - [ ] `.env.example` 不被 .gitignore 忽略

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: .env 文件内容正确
    Tool: Bash
    Steps:
      1. type .env — 验证文件存在且内容包含 DATABASE_URL
      2. type .env.example — 验证文件存在且密码为 your_password_here
    Expected Result: 两个文件都存在，.env 有真实密码，.env.example 有占位符
    Evidence: .sisyphus/evidence/task-1-env-files.txt

  Scenario: .gitignore 正确配置
    Tool: Bash
    Steps:
      1. findstr ".env" .gitignore — 验证 .env 在忽略列表中
      2. findstr ".env.example" .gitignore — 验证 .env.example 不在忽略列表中（或有排除规则）
    Expected Result: .env 被忽略，.env.example 不被忽略
    Evidence: .sisyphus/evidence/task-1-gitignore.txt
  ```

  **Commit**: YES (groups with Task 2, 3)
  - Message: `chore(infra): add Docker Compose for local PostgreSQL dev environment`
  - Files: `.env.example`, `.gitignore`, `docker-compose.dev.yml`

- [ ] 2. 统一包管理器（清理 pnpm-lock.yaml）

  **What to do**:
  - 删除项目根目录下的 `pnpm-lock.yaml` 文件
  - 项目统一使用 npm（README 和 AGENTS.md 全部使用 npm 命令，package-lock.json 已存在）

  **Must NOT do**:
  - 不删除 package-lock.json
  - 不删除 node_modules
  - 不修改 package.json

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 单文件删除操作
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 3, 4)
  - **Blocks**: Task 4
  - **Blocked By**: None

  **References**:

  **Pattern References**:
  - `package-lock.json` (项目根目录) — 确认存在，是 npm 的 lock 文件
  - `pnpm-lock.yaml` (项目根目录) — 需要删除的冗余文件
  - `README.md` — 所有命令使用 npm
  - `AGENTS.md` — 所有命令使用 npm

  **Acceptance Criteria**:
  - [ ] `pnpm-lock.yaml` 不存在
  - [ ] `package-lock.json` 仍存在

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: pnpm-lock.yaml 已删除
    Tool: Bash
    Steps:
      1. dir pnpm-lock.yaml — 应报错文件不存在
      2. dir package-lock.json — 应显示文件存在
    Expected Result: pnpm-lock.yaml 不存在，package-lock.json 存在
    Evidence: .sisyphus/evidence/task-2-package-manager.txt
  ```

  **Commit**: NO (包含在 Task 1 的提交中)

- [ ] 3. 创建 docker-compose.dev.yml + 启动 PostgreSQL

  **What to do**:
  - 在项目根目录创建 `docker-compose.dev.yml`：
    ```yaml
    services:
      postgres:
        image: postgres:15-alpine
        container_name: psytwin-postgres-dev
        restart: unless-stopped
        ports:
          - "${POSTGRES_PORT:-5432}:5432"
        environment:
          POSTGRES_USER: ${POSTGRES_USER}
          POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
          POSTGRES_DB: ${POSTGRES_DB}
        volumes:
          - pgdata:/var/lib/postgresql/data
        healthcheck:
          test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB}"]
          interval: 10s
          timeout: 5s
          retries: 5
    
    volumes:
      pgdata:
    ```
  - 注意：不使用 `version` 字段（Docker Compose V2 已废弃）
  - 环境变量从 `.env` 文件读取（Docker Compose 自动加载同目录 .env）
  - 包含 healthcheck 配置确保容器就绪后才能执行后续操作
  - 启动容器：`docker compose -f docker-compose.dev.yml up -d`
  - 等待健康检查通过：`docker compose -f docker-compose.dev.yml ps` 确认状态为 healthy

  **Must NOT do**:
  - 不使用 `version: '3.8'` 字段（已废弃）
  - 不硬编码用户名密码（从 .env 读取）
  - 不使用 bind mount（Windows 路径问题）

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 单文件创建 + Docker 命令执行
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (文件创建可并行，启动需等 .env)
  - **Parallel Group**: Wave 1 (with Tasks 1, 2, 4)
  - **Blocks**: Task 7
  - **Blocked By**: Task 1 (.env 必须先存在)

  **References**:

  **External References**:
  - Docker Compose 官方文档: healthcheck 配置
  - PostgreSQL Docker Hub: `postgres:15-alpine` 镜像说明

  **Acceptance Criteria**:
  - [ ] `docker-compose.dev.yml` 文件存在
  - [ ] `docker compose -f docker-compose.dev.yml ps` 显示容器 healthy
  - [ ] PostgreSQL 接受连接

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: PostgreSQL 容器正常运行
    Tool: Bash
    Steps:
      1. docker compose -f docker-compose.dev.yml up -d
      2. 等待 30 秒让容器完全启动
      3. docker compose -f docker-compose.dev.yml ps — 检查状态
    Expected Result: psytwin-postgres-dev 状态显示 healthy 或 running(healthy)
    Failure Indicators: 状态为 unhealthy、restarting 或不存在
    Evidence: .sisyphus/evidence/task-3-docker-status.txt

  Scenario: 数据库连接可用
    Tool: Bash
    Steps:
      1. docker compose -f docker-compose.dev.yml exec postgres pg_isready -U psytwin -d psytwin_sentinel
    Expected Result: 输出包含 "accepting connections"
    Failure Indicators: connection refused 或 timeout
    Evidence: .sisyphus/evidence/task-3-db-connection.txt

  Scenario: 端口冲突检查（前置）
    Tool: Bash
    Preconditions: 在启动 Docker 之前执行
    Steps:
      1. netstat -ano | findstr :5432 — 检查端口占用
    Expected Result: 无输出（端口空闲）或仅有 Docker 进程占用
    Failure Indicators: 其他进程占用 5432 端口
    Evidence: .sisyphus/evidence/task-3-port-check.txt
  ```

  **Commit**: YES (groups with Task 1, 2)
  - Message: `chore(infra): add Docker Compose for local PostgreSQL dev environment`
  - Files: `docker-compose.dev.yml`, `.env.example`, `.gitignore`

- [ ] 4. 安装 Prisma 依赖 + 初始化

  **What to do**:
  - 安装依赖：
    ```bash
    npm install @prisma/client
    npm install prisma tsx --save-dev
    ```
  - 初始化 Prisma（不使用 `npx prisma init`，因为我们手动创建更精确的配置）：
    - 创建 `prisma/` 目录
    - 创建 `prisma/schema.prisma` 基础骨架（仅 generator + datasource，模型在 Task 6 填充）：
      ```prisma
      generator client {
        provider = "prisma-client-js"
      }
      
      datasource db {
        provider = "postgresql"
        url      = env("DATABASE_URL")
      }
      ```
  - 在 `package.json` 中添加 prisma seed 配置：
    ```json
    "prisma": {
      "seed": "tsx prisma/seed.ts"
    }
    ```
  - 运行 `npx prisma generate` 验证基础配置正确

  **Must NOT do**:
  - 不使用 `npx prisma init`（它会自动创建 .env 和一个最小 schema，与我们的配置冲突）
  - 不在此任务中编写完整 Schema（Task 6 负责）
  - 不使用 ts-node（tsx 更轻量且无需额外 tsconfig 配置）

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 安装依赖 + 创建基础配置文件
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: PARTIAL (npm install 需等包管理器统一)
  - **Parallel Group**: Wave 1 (文件创建可并行，npm install 需等 Task 2)
  - **Blocks**: Tasks 5, 6
  - **Blocked By**: Tasks 1 (.env), 2 (包管理器统一)

  **References**:

  **Pattern References**:
  - `package.json` (项目根目录) — 需要添加 prisma.seed 配置
  - `lib/utils.ts` — 现有 lib 目录结构参考

  **External References**:
  - Prisma 官方: `npx prisma generate` 生成客户端类型
  - tsx: 零配置 TypeScript 执行器，替代 ts-node

  **Acceptance Criteria**:
  - [ ] `@prisma/client` 在 package.json dependencies 中
  - [ ] `prisma` 和 `tsx` 在 package.json devDependencies 中
  - [ ] `prisma/schema.prisma` 存在且包含 generator + datasource
  - [ ] `package.json` 包含 `prisma.seed` 配置
  - [ ] `npx prisma generate` 运行成功

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Prisma 依赖安装正确
    Tool: Bash
    Steps:
      1. npm list @prisma/client — 验证安装
      2. npm list prisma — 验证安装
      3. npm list tsx — 验证安装
    Expected Result: 三个包都显示版本号，无 ERR
    Evidence: .sisyphus/evidence/task-4-deps.txt

  Scenario: Prisma 基础配置正确
    Tool: Bash
    Steps:
      1. npx prisma generate — 应成功生成客户端
      2. 检查 node_modules/.prisma/client 目录存在
    Expected Result: generate 命令无错误，.prisma/client 目录存在
    Failure Indicators: Schema 解析错误、DATABASE_URL 未找到
    Evidence: .sisyphus/evidence/task-4-prisma-init.txt
  ```

  **Commit**: NO (包含在 Commit 2 中)

- [ ] 5. 创建 lib/prisma.ts PrismaClient 单例模块

  **What to do**:
  - 在 `lib/prisma.ts` 创建 PrismaClient 单例，使用 globalThis 模式避免 HMR 多实例：
    ```typescript
    import { PrismaClient } from '@prisma/client'
    
    const globalForPrisma = globalThis as unknown as {
      prisma: PrismaClient | undefined
    }
    
    export const prisma =
      globalForPrisma.prisma ??
      new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
      })
    
    if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
    ```
  - 注意：此文件仅在 Server Components / Server Actions / API Routes 中引用，绝不在 "use client" 组件中导入

  **Must NOT do**:
  - 不在文件中硬编码数据库连接字符串
  - 不在 "use client" 组件中导入
  - 不创建任何 API 路由或 Server Action

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 单文件创建，模式固定
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Task 6)
  - **Parallel Group**: Wave 2
  - **Blocks**: F2
  - **Blocked By**: Task 4 (Prisma 依赖必须已安装)

  **References**:

  **Pattern References**:
  - `lib/utils.ts` — 现有 lib 目录下的工具模块结构，确保命名风格一致

  **External References**:
  - Prisma 官方 Next.js 最佳实践: https://www.prisma.io/docs/orm/more/help-and-troubleshooting/help-articles/nextjs-prisma-client-dev-practices

  **Acceptance Criteria**:
  - [ ] `lib/prisma.ts` 存在且导出 `prisma` 实例
  - [ ] 使用 globalThis 单例模式
  - [ ] 开发环境日志级别为 ['query', 'error', 'warn']

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: PrismaClient 单例可导入
    Tool: Bash
    Steps:
      1. npx tsx -e "import { prisma } from './lib/prisma'; console.log(typeof prisma)" — 应输出 'object'
    Expected Result: 输出 "object"，无报错
    Failure Indicators: import 错误、模块未找到
    Evidence: .sisyphus/evidence/task-5-prisma-singleton.txt
  ```

  **Commit**: NO (包含在 Commit 2 中)

- [ ] 6. 设计完整 prisma/schema.prisma 数据库 Schema

  **What to do**:
  - 在 `prisma/schema.prisma` 中设计以下 17 个数据模型（基于前端业务视图的 mock 数据提取）：

  **核心实体（学生相关）:**
  1. `Student` — 学生基本信息（姓名、学号、班级、学院、性别、生日、MBTI、风险等级）
     - 来源: `student-profile-view.tsx` mock 数据
     - @@map("students")
  2. `PsychProfile` — 心理画像维度（8维度雷达图 + 综合评分）
     - 字段: adversityQuotient, emotionalStability, socialTendency, stressResistance, selfAwareness, empathy, willpower, adaptability, overallScore (0-100)
     - 来源: `student-profile-view.tsx` radarData
     - @@map("psych_profiles")
  3. `TimelineEvent` — 学生时间线事件
     - 字段: studentId, date, title, description, status (success/warning/active)
     - 来源: `student-profile-view.tsx` timelineEvents
     - @@map("timeline_events")
  4. `Faculty` — 院系信息
     - 字段: name, campusX, campusY, stressIndex, riskLevel
     - 来源: `vr-dashboard-view.tsx` faculties
     - @@map("faculties")

  **预警与工单:**
  5. `Alert` — 预警记录
     - 字段: studentId, type (AlertType enum), level (critical/warning), time, source, description
     - 来源: `vr-dashboard-view.tsx` alertData
     - @@map("alerts")
  6. `WorkOrder` — 干预工单（统一 risk-trace-view 和 intervention-records-view 两套字段）
     - 字段: studentId, className, trigger, riskLevel (RiskLevel enum), method, counselor, status (WorkOrderStatus enum), date, detail, summary
     - 来源: `risk-trace-view.tsx` workOrders + `intervention-records-view.tsx` workOrders
     - @@map("work_orders")
  7. `InterventionRecord` — 心理咨询记录（独立于工单的详细咨询记录）
     - 字段: studentId, date, type (InterventionType enum), counselor, duration, result, status
     - 来源: `student-profile-view.tsx` counselingRecords
     - @@map("intervention_records")

  **VR 相关:**
  8. `VRScene` — VR 场景
     - 字段: name, description, usageCount
     - 来源: `vr-dashboard-view.tsx` sceneData
     - @@map("vr_scenes")
  9. `VRSession` — VR 体验记录
     - 字段: studentId, sceneId, duration, emotionBefore, emotionAfter, result (positive/neutral/negative)
     - 来源: `vr-dashboard-view.tsx` vrRecords
     - @@map("vr_sessions")

  **设备管理:**
  10. `Device` — 设备（统一 device-management-view 和 system-settings-view 的字段）
      - 字段: name, serialNumber, type (DeviceType enum: VR/BRACELET/EEG), model, status (DeviceStatus enum), battery, room, location, lastActive, lastSync
      - 来源: `device-management-view.tsx` vrDevices/braceletDevices/eegDevices + `system-settings-view.tsx` devices
      - @@map("devices")
  11. `ConsultationRoom` — 心理咨询室
      - 字段: name, location, status (RoomStatus enum), capacity, currentStudentId
      - 来源: `consultation-room-view.tsx` rooms
      - @@map("consultation_rooms")
  12. `RoomDevice` — 房间设备关联（咨询室与设备的多对多关系）
      - 字段: roomId, deviceId
      - 来源: `consultation-room-view.tsx` rooms.devices 嵌套结构
      - @@map("room_devices")

  **多模态传感数据（独立表，支持时序查询）:**
  13. `VitalSign` — 生理数据（心率、HRV、皮电、压力指数、血氧）
      - 字段: studentId, timestamp, heartRate, hrv, gsr, stressIndex, bloodOxygen
      - 来源: `multimodal-dataflow-view.tsx` activeStudents[].vitals
      - @@map("vital_signs")
  14. `VoiceAnalysis` — 语音分析数据
      - 字段: studentId, timestamp, sentiment (Sentiment enum), tremorIndex, emotionLabel
      - 来源: `multimodal-dataflow-view.tsx` activeStudents[].voice
      - @@map("voice_analyses")
  15. `ExpressionData` — 表情数据
      - 字段: studentId, timestamp, primaryExpression, anxietyLevel, sadnessLevel, angerLevel
      - 来源: `multimodal-dataflow-view.tsx` activeStudents[].expression
      - @@map("expression_data")

  **AI 配置:**
  16. `AIDocument` — RAG 知识库文档
      - 字段: name, fileSize, uploadDate, status (DocStatus enum), vectorStatus
      - 来源: `ai-config-view.tsx` documents
      - @@map("ai_documents")
  17. `AIPromptPreset` — AI 提示词预设
      - 字段: label, value, promptText, isActive
      - 来源: `ai-config-view.tsx` rolePresets
      - @@map("ai_prompt_presets")

  **不建表的实体（明确排除）:**
  - KPI 统计数据（stats 数组）— 计算值，从实体表聚合得出
  - 图表时序数据（hrData, stressData）— 前端模拟动画
  - UI 开关设置（switchSettings）— 前端常量
  - 状态颜色映射（statusColor, riskColor）— 前端常量
  - 过滤器选项（gradeOptions, classOptions）— 前端常量
  - 漏斗数据（funnelData）— 计算值，从工单状态聚合得出
  - BehaviorData / EEGData — 当前前端 mock 数据量太少，且与 VitalSign/VoiceAnalysis/ExpressionData 结构类似，后续按需添加
  - User — 认证系统是另一个独立任务
  - SystemSetting / SwitchSetting — 系统配置是另一个独立任务

  **Enum 定义（在 schema.prisma 中）:**
  ```prisma
  enum RiskLevel {
    HIGH    // 高危
    MEDIUM  // 中危
    LOW     // 低危
  }
  
  enum AlertType {
    HEART_RATE_SURGE  // 心率激增
    VOICE_TREMOR      // 语音颤抖
    SLEEP_ANOMALY     // 睡眠异常
    EMOTION_SWING     // 情绪波动
    SOCIAL_WITHDRAWAL // 社交退缩
    GAIT_ANOMALY      // 步态异常
    EATING_ANOMALY    // 进食异常
  }
  
  enum AlertLevel {
    CRITICAL  // 紧急
    WARNING   // 一般
  }
  
  enum WorkOrderStatus {
    COMPLETED  // 已结案
    FOLLOWING  // 跟进中
    PENDING    // 待分配
    IN_PROGRESS // 干预中
  }
  
  enum InterventionType {
    REGULAR_INTERVIEW   // 定期访谈
    CBT_THERAPY         // CBT疗法
    GROUP_COUNSELING    // 团体辅导
    CRISIS_INTERVENTION // 危机干预
    INITIAL_ASSESSMENT  // 初次评估
  }
  
  enum DeviceType {
    VR        // VR头显
    BRACELET  // 生理手环
    EEG       // 脑电设备
  }
  
  enum DeviceStatus {
    ONLINE       // 在线
    OFFLINE      // 离线
    IN_USE       // 使用中
    MAINTENANCE  // 维护
  }
  
  enum RoomStatus {
    AVAILABLE    // 可用
    IN_USE       // 使用中
    MAINTENANCE  // 维护中
  }
  
  enum Sentiment {
    POSITIVE  // 积极
    NEGATIVE  // 消极
    NEUTRAL   // 中性
  }
  
  enum DocStatus {
    VECTORIZED  // 已向量化
    PROCESSING  // 处理中
    FAILED      // 失败
  }
  ```

  **命名规范:**
  - model: PascalCase (Student, WorkOrder)
  - field: camelCase (studentId, riskLevel)
  - @@map: snake_case (students, work_orders)
  - 所有表必须有 id (uuid)、createdAt、updatedAt
  - 外键字段使用 @relation 显式声明
  - 高频查询字段添加 @@index（studentId, timestamp, status, riskLevel）

  **Must NOT do**:
  - 不为 UI 渲染辅助数据建表
  - 不超过 20 个模型
  - 不使用中文列名
  - 不创建 User 表（认证系统是另一个任务）

  **Recommended Agent Profile**:
  - **Category**: `deep`
    - Reason: 复杂 Schema 设计，需要理解多个视图间的实体关系和字段统一
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES (with Task 5)
  - **Parallel Group**: Wave 2
  - **Blocks**: Task 7
  - **Blocked By**: Task 4 (Prisma 已初始化)

  **References (CRITICAL — 执行代理必须查看这些文件提取 mock 数据结构):**

  **Pattern References**:
  - `components/views/student-profile-view.tsx` — Student 基本信息、radarData (心理画像)、timelineEvents (时间线)、counselingRecords (咨询记录)
  - `components/views/vr-dashboard-view.tsx` — vrRecords (VR体验)、sceneData (VR场景)、alertData (预警)、faculties (院系)
  - `components/views/risk-trace-view.tsx` — workOrders (工单字段集 A: id/name/className/riskType/level/time/summary)
  - `components/views/intervention-records-view.tsx` — workOrders (工单字段集 B: id/name/cls/trigger/riskLevel/method/counselor/status/date/detail)
  - `components/views/device-management-view.tsx` — vrDevices/braceletDevices/eegDevices (设备字段集 A)
  - `components/views/consultation-room-view.tsx` — rooms (咨询室 + 嵌套 devices)
  - `components/views/multimodal-dataflow-view.tsx` — activeStudents (嵌套 vitals/voice/expression 多模态数据)
  - `components/views/ai-config-view.tsx` — documents (知识库文档)、rolePresets (提示词预设)
  - `components/views/system-settings-view.tsx` — devices (设备字段集 B: model/lastSync/location)

  **WHY Each Reference Matters**:
  - 每个视图文件包含当前前端使用的 mock 数据结构，Schema 必须能完全覆盖这些字段
  - WorkOrder 在两个视图中字段不同，需合并统一
  - Device 在两个视图中字段不同，需合并统一
  - ConsultationRoom 的 devices 是嵌套对象，需转为关联表

  **Acceptance Criteria**:
  - [ ] `prisma/schema.prisma` 包含 17 个 model + 9 个 enum
  - [ ] 每个 model 有 id (uuid)、createdAt、updatedAt
  - [ ] 所有外键关系使用 @relation 显式声明
  - [ ] 所有 model 使用 @@map("snake_case")
  - [ ] `npx prisma format` 运行无错误
  - [ ] `npx prisma validate` 运行无错误

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Schema 格式和验证通过
    Tool: Bash
    Steps:
      1. npx prisma format — 格式化 Schema
      2. npx prisma validate — 验证 Schema 正确性
    Expected Result: 两个命令均无错误输出
    Failure Indicators: 关系定义错误、类型不匹配、缺少必填字段
    Evidence: .sisyphus/evidence/task-6-schema-validate.txt

  Scenario: Schema 模型数量检查
    Tool: Bash
    Steps:
      1. findstr /C:"model " prisma/schema.prisma | find /C /V "" — 统计 model 行数
      2. findstr /C:"enum " prisma/schema.prisma | find /C /V "" — 统计 enum 行数
    Expected Result: model 数量 = 17，enum 数量 = 9
    Evidence: .sisyphus/evidence/task-6-model-count.txt
  ```

  **Commit**: NO (包含在 Commit 2 中)

- [ ] 7. 执行 Prisma 迁移

  **What to do**:
  - 确认 Docker PostgreSQL 容器正在运行且 healthy
  - 运行初始迁移：
    ```bash
    npx prisma migrate dev --name init
    ```
  - 验证迁移成功：
    ```bash
    npx prisma migrate status
    ```
  - 确认所有表已创建

  **Must NOT do**:
  - 不使用 `prisma db push`（不生成迁移文件，不适合生产环境）
  - 不手动编辑迁移文件

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 单命令执行
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential
  - **Blocks**: Task 8
  - **Blocked By**: Tasks 3 (Docker), 6 (Schema)

  **References**:

  **Pattern References**:
  - `prisma/schema.prisma` — Task 6 产出的完整 Schema
  - `docker-compose.dev.yml` — 确认容器运行状态

  **External References**:
  - Prisma 官方: `prisma migrate dev` 创建并应用迁移文件

  **Acceptance Criteria**:
  - [ ] `prisma/migrations/` 目录存在且包含 init 迁移文件
  - [ ] `npx prisma migrate status` 显示 "Database schema is up to date"
  - [ ] 数据库中包含所有模型对应的表

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: 迁移成功执行
    Tool: Bash
    Steps:
      1. npx prisma migrate dev --name init
      2. npx prisma migrate status
    Expected Result: 迁移成功，状态显示 "Database schema is up to date"
    Failure Indicators: 连接拒绝、SQL 错误、Schema 不匹配
    Evidence: .sisyphus/evidence/task-7-migration.txt

  Scenario: 数据库表存在
    Tool: Bash
    Steps:
      1. docker compose -f docker-compose.dev.yml exec postgres psql -U psytwin -d psytwin_sentinel -c "SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename;"
    Expected Result: 输出包含 students, work_orders, alerts, devices, vr_sessions, vital_signs 等 17 个表名
    Evidence: .sisyphus/evidence/task-7-tables.txt
  ```

  **Commit**: NO (包含在 Commit 2 中)

- [ ] 8. 创建 prisma/seed.ts 种子数据脚本

  **What to do**:
  - 在 `prisma/seed.ts` 中创建幂等种子脚本，基于前端视图中的 mock 数据创建真实数据库记录
  - **必须使用 `upsert` 而非 `create`**，确保多次运行不报错、不重复插入
  - 种子数据量适配前端当前展示需要：
    - 8-12 个学生（覆盖不同风险等级、不同学院）
    - 每个学生 1 个心理画像
    - 10+ 条工单（覆盖所有状态）
    - 5+ 条咨询记录（覆盖所有类型）
    - 4 个 VR 场景 + 10+ 条 VR 体验记录
    - 10+ 条预警记录（覆盖所有类型）
    - 5-8 个设备（覆盖 VR/手环/脑电三种类型）
    - 3-4 个咨询室 + 对应设备关联
    - 5-6 个院系
    - 多模态传感数据各 5-10 条样本
    - 3-5 个 AI 文档 + 3-5 个提示词预设
    - 每个学生 3-5 个时间线事件
  - **关联关系必须正确**：工单/预警/VR记录 的 studentId 必须引用真实的 Student 记录
  - 脚本结构：
    ```typescript
    import { PrismaClient } from '@prisma/client'
    const prisma = new PrismaClient()
    
    async function main() {
      // 1. 创建院系
      // 2. 创建学生（关联院系）
      // 3. 创建心理画像（关联学生）
      // 4. 创建时间线事件
      // 5. 创建预警和工单
      // 6. 创建 VR 场景和体验记录
      // 7. 创建设备和咨询室
      // 8. 创建多模态数据
      // 9. 创建 AI 文档和提示词
    }
    
    main()
      .then(() => prisma.$disconnect())
      .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
      })
    ```

  **Must NOT do**:
  - 不使用 `create` （使用 `upsert` 确保幂等）
  - 不生成超过 50 条学生记录（适配前端展示需要即可）
  - 不使用中文键名作为字段名
  - 不修改 components/views/ 中的任何文件

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: 需要理解全部 9 个视图的 mock 数据并转化为幂等 seed 脚本，数据量大且关联关系复杂
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential
  - **Blocks**: Task 9
  - **Blocked By**: Task 7 (迁移必须先完成)

  **References (CRITICAL — 执行代理必须查看这些文件提取 mock 数据值):**

  **Pattern References**:
  - `components/views/student-profile-view.tsx` — 学生 mock 数据值（姓名、学号、班级、学院、MBTI、心理画像分数、咨询记录、时间线事件）
  - `components/views/vr-dashboard-view.tsx` — VR 记录、场景数据、预警数据、院系数据的具体值
  - `components/views/risk-trace-view.tsx` — 工单 mock 数据值
  - `components/views/intervention-records-view.tsx` — 工单 mock 数据值（另一套字段）
  - `components/views/device-management-view.tsx` — 设备 mock 数据值
  - `components/views/consultation-room-view.tsx` — 咨询室 mock 数据值
  - `components/views/multimodal-dataflow-view.tsx` — 多模态传感数据值
  - `components/views/ai-config-view.tsx` — AI 文档和提示词 mock 数据值
  - `prisma/schema.prisma` — Task 6 产出的 Schema，确保 seed 数据符合模型定义

  **WHY Each Reference Matters**:
  - 种子数据必须基于前端已有的 mock 数据，确保将来替换时数据一致
  - 关联关系必须正确（工单引用真实学生）

  **Acceptance Criteria**:
  - [ ] `prisma/seed.ts` 存在且可执行
  - [ ] 使用 upsert 而非 create（幂等性）
  - [ ] 关联关系正确（外键引用真实记录）
  - [ ] 覆盖所有 17 个模型的数据填充

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: seed 脚本运行成功
    Tool: Bash
    Steps:
      1. npx prisma db seed
    Expected Result: 无错误输出，显示 seed 完成
    Failure Indicators: 外键约束失败、类型不匹配、必填字段缺失
    Evidence: .sisyphus/evidence/task-8-seed-run.txt

  Scenario: seed 幂等性验证
    Tool: Bash
    Steps:
      1. npx prisma db seed — 第二次运行
    Expected Result: 无错误输出，数据不重复
    Failure Indicators: unique constraint 违反、重复插入错误
    Evidence: .sisyphus/evidence/task-8-seed-idempotent.txt

  Scenario: 关联关系完整性
    Tool: Bash
    Steps:
      1. docker compose -f docker-compose.dev.yml exec postgres psql -U psytwin -d psytwin_sentinel -c "SELECT COUNT(*) FROM work_orders wo JOIN students s ON wo.student_id = s.id;"
    Expected Result: count > 0（工单与学生关联正确）
    Evidence: .sisyphus/evidence/task-8-relations.txt
  ```

  **Commit**: NO (包含在 Commit 2 中)

- [ ] 9. 执行种子数据 + 最终回归验证

  **What to do**:
  - 运行种子数据填充：`npx prisma db seed`
  - 运行第二次验证幂等性：`npx prisma db seed`
  - 验证数据完整性：
    ```bash
    docker compose -f docker-compose.dev.yml exec postgres psql -U psytwin -d psytwin_sentinel -c "
      SELECT 'students' AS table_name, COUNT(*) FROM students
      UNION ALL SELECT 'work_orders', COUNT(*) FROM work_orders
      UNION ALL SELECT 'alerts', COUNT(*) FROM alerts
      UNION ALL SELECT 'devices', COUNT(*) FROM devices
      UNION ALL SELECT 'vr_sessions', COUNT(*) FROM vr_sessions
      UNION ALL SELECT 'vital_signs', COUNT(*) FROM vital_signs;
    "
    ```
  - 运行前端构建回归验证：`npm run build`

  **Must NOT do**:
  - 不修改任何前端文件

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: 纯命令执行和验证
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Sequential
  - **Blocks**: F1-F4
  - **Blocked By**: Task 8

  **References**:

  **Pattern References**:
  - `prisma/seed.ts` — Task 8 产出的种子脚本

  **Acceptance Criteria**:
  - [ ] seed 运行成功（第一次 + 第二次幂等性）
  - [ ] 每个核心表 count > 0
  - [ ] `npm run build` 构建成功

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: 数据完整性验证
    Tool: Bash
    Steps:
      1. docker compose -f docker-compose.dev.yml exec postgres psql -U psytwin -d psytwin_sentinel -c "SELECT 'students' AS t, COUNT(*) FROM students UNION ALL SELECT 'work_orders', COUNT(*) FROM work_orders UNION ALL SELECT 'alerts', COUNT(*) FROM alerts UNION ALL SELECT 'devices', COUNT(*) FROM devices UNION ALL SELECT 'vr_sessions', COUNT(*) FROM vr_sessions;"
    Expected Result: 每个表 count > 0
    Evidence: .sisyphus/evidence/task-9-data-counts.txt

  Scenario: 前端构建不受影响
    Tool: Bash
    Steps:
      1. npm run build
    Expected Result: 构建成功，无新增错误
    Failure Indicators: 编译错误、模块解析失败
    Evidence: .sisyphus/evidence/task-9-build.txt
  ```

  **Commit**: YES
  - Message: `feat(db): initialize Prisma ORM with full schema and seed data`
  - Files: `prisma/schema.prisma`, `prisma/seed.ts`, `prisma/migrations/`, `lib/prisma.ts`, `package.json`, `package-lock.json`
  - Pre-commit: `npx prisma validate && npm run build`

---

## Final Verification Wave (MANDATORY — after ALL implementation tasks)

> 4 review agents run in PARALLEL. ALL must APPROVE. Rejection → fix → re-run.

- [ ] F1. **Plan Compliance Audit** — `oracle`
  Read the plan end-to-end. For each "Must Have": verify implementation exists (read file, run command). For each "Must NOT Have": search codebase for forbidden patterns — reject with file:line if found. Check evidence files exist in .sisyphus/evidence/. Compare deliverables against plan.
  Output: `Must Have [N/N] | Must NOT Have [N/N] | Tasks [N/N] | VERDICT: APPROVE/REJECT`

- [ ] F2. **Code Quality Review** — `unspecified-high`
  Review all new files for: TypeScript type safety, proper imports, no hardcoded secrets, Prisma schema conventions (@@map snake_case, proper indexes). Check prisma.ts singleton pattern matches official best practice. Verify seed.ts uses upsert for idempotency.
  Output: `Files [N clean/N issues] | VERDICT`

- [ ] F3. **Real Manual QA** — `unspecified-high`
  Start from clean state. Execute EVERY QA scenario from EVERY task — follow exact steps, capture evidence. Test: Docker container health, DB connection, migration status, seed data integrity, build success. Save to `.sisyphus/evidence/final-qa/`.
  Output: `Scenarios [N/N pass] | VERDICT`

- [ ] F4. **Scope Fidelity Check** — `deep`
  For each task: read "What to do", read actual diff (git log/diff). Verify: no API routes created, no views/ files modified, no extra infrastructure beyond PostgreSQL, Schema model count ≤ 20. Flag unaccounted changes.
  Output: `Tasks [N/N compliant] | VERDICT`

---

## Commit Strategy

| Commit # | Message | Files |
|----------|---------|-------|
| 1 | `chore(infra): add Docker Compose for local PostgreSQL dev environment` | docker-compose.dev.yml, .env.example, .gitignore |
| 2 | `feat(db): initialize Prisma ORM with full schema and seed data` | prisma/schema.prisma, prisma/seed.ts, lib/prisma.ts, package.json |

---

## Success Criteria

### Verification Commands
```bash
# Docker 容器健康
docker compose -f docker-compose.dev.yml ps
# Expected: psytwin-postgres-dev   healthy

# 数据库连接可用
docker compose -f docker-compose.dev.yml exec postgres pg_isready -U psytwin -d psytwin_sentinel
# Expected: accepting connections

# Prisma 迁移状态
npx prisma migrate status
# Expected: Database schema is up to date

# 种子数据存在
npx prisma db execute --stdin <<< "SELECT COUNT(*) FROM students;"
# Expected: count > 0

# 前端构建不受影响
npm run build
# Expected: 构建成功
```

### Final Checklist
- [ ] All "Must Have" present
- [ ] All "Must NOT Have" absent
- [ ] Docker container running and healthy
- [ ] All 17 database tables created
- [ ] Seed data populated with correct relationships
- [ ] `npm run build` passes
