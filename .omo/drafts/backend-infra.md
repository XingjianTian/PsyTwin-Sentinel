# Draft: 后端基础设施搭建 (Docker + Prisma + PostgreSQL)

## Requirements (confirmed)
- Docker Compose 运行本地 PostgreSQL 15 开发环境
- Prisma ORM 作为数据库访问层
- .env 文件管理环境变量
- 根据现有页面 mock 数据设计数据库 Schema
- 田老师原话："整体技术选型就按你推荐的来，用 Prisma。.env 你来创建。数据库你根据目前各个页面展示出来的，你来设计表。先做好这几步的规划和实施，再说后面的。"

## Scope Boundaries
- INCLUDE: docker-compose.dev.yml、.env、Prisma 初始化、schema.prisma（完整表设计）、PrismaClient 单例、种子数据
- EXCLUDE: API 路由创建、前端 mock 数据替换、部署配置、Redis/向量数据库

## Technical Decisions
- **PostgreSQL 版本**: 15-alpine (轻量稳定)
- **ORM**: Prisma (Latest 6.x)
- **数据库用户**: psytwin (非 root)
- **连接方式**: DATABASE_URL 标准格式
- **PrismaClient**: globalThis 单例模式
- **Schema 命名**: model PascalCase, field camelCase, @@map snake_case

## Research Findings

### 项目现状
- 纯前端项目，无后端代码
- app/ 下仅有 layout.tsx, page.tsx, globals.css
- lib/ 仅有 utils.ts
- .gitignore 有 .env*.local 但缺少 .env
- next.config.mjs 设了 ignoreBuildErrors: true
- tsconfig.json 路径别名 @/* 已配置

### 数据实体（从页面提取，共 24 个）
1. Student (学生)
2. WorkOrder (干预工单)
3. Intervention (心理咨询记录)
4. PsychologicalProfile (心理画像)
5. Device (设备)
6. ConsultationRoom (心理咨询室)
7. RoomDevice (房间设备关联)
8. VRRecord (VR干预记录)
9. VRScene (VR场景)
10. Alert (预警)
11. AIAssessment (AI评估报告)
12. TimelineEvent (时间线事件)
13. Vitals (生理数据)
14. VoiceData (语音数据)
15. ExpressionData (表情数据)
16. BehaviorData (行为数据)
17. EEGData (脑电数据)
18. Document (知识库文档)
19. PromptPreset (AI提示词预设)
20. Faculty (院系)
21. User (用户)
22. SystemSetting (系统设置)
23. SwitchSetting (功能开关)
24. Funnel (漏斗统计 — 可计算，非实体)

### Prisma 最佳实践
- PrismaClient 单例: globalThis 模式
- 文件: lib/prisma.ts
- 目录: prisma/schema.prisma + prisma/seed.ts
- 命名: model PascalCase, @@map snake_case
- Server Components only（不在 "use client" 中导入）
- 开发日志: ['query', 'error', 'warn']

## Test Strategy Decision
- **Infrastructure exists**: NO (无测试框架)
- **Automated tests**: 本轮不涉及（纯基础设施搭建）
- **Agent-Executed QA**: 
  - docker compose up → 容器运行验证
  - npx prisma migrate dev → 迁移成功验证
  - npx prisma db seed → 种子数据验证

## Open Questions
- 无（田老师已明确范围和技术选型）
