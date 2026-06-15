# PsyTwin-Sentinel 文档索引

> **项目**: PsyTwin-Sentinel (Next.js 管理后台)
> **用途**: 心宠状态提醒接收与管理、学生/教师管理、数据看板

## 本文档目录

本文档目录包含管理后台开发所需的所有技术文档。**根目录下的四个主文档是 Source of Truth**，本文档目录中的文件是副本，用于项目内快速查阅。

---

## 文档清单

### 本项目原有文档

| 文档 | 文件 | 说明 |
|------|------|------|
| **产品需求** | [`PRD.md`](./PRD.md) | Sentinel 管理后台产品需求文档 |
| **API契约** | [`api_contract.md`](./api_contract.md) | Sentinel 内部 API 契约 |
| **云部署** | [`CLOUD_DEPLOYMENT.md`](./CLOUD_DEPLOYMENT.md) | 云部署指南 |

### 从根目录复制的文档

| 文档 | 文件 | 说明 | 必读章节 |
|------|------|------|---------|
| **API契约** | [`pet-api-contract.md`](./pet-api-contract.md) | 心宠状态提醒相关 API（Sentinel 是消费方） | 第3.6节、第2章 |
| **系统架构** | [`pet-system-architecture.md`](./pet-system-architecture.md) | 系统架构总览、服务关系、部署架构 | 第1章、第3章、第7章 |
| **项目分析** | [`project-analysis-2026-06-15.md`](./project-analysis-2026-06-15.md) | Sentinel 当前结构、Pocket 联动关系、双向文件链接约定 | 全文 |

---

## 与 PsyTwin-Pocket 的双向文件链接

Sentinel 是跨端 API 契约的生产方，Pocket 是消费方。为了避免文档复制后漂移，两端通过文件级链接互相指向关键文档。当前 Windows 会话没有创建符号软链接的权限，本机实际使用同卷 `HardLink`，编辑任一端都会同步到同一份文件数据。

| 本项目链接 | 指向 | 用途 |
|------|------|------|
| [`pocket_api_guide.md`](./pocket_api_guide.md) | `PsyTwin-Pocket/docs/API_GUIDE.md` | 查看 Pocket 请求层、Base URL 与 API 模块写法 |
| [`pocket_project_overview.md`](./pocket_project_overview.md) | `PsyTwin-Pocket/docs/PROJECT_OVERVIEW.md` | 查看 Pocket 项目定位、页面结构和生态角色 |

Pocket 侧同时通过以下链接回指 Sentinel：

| Pocket 链接 | 指向 | 用途 |
|------|------|------|
| `../PsyTwin-Pocket/docs/api_contract.md` | `../PsyTwin-Sentinel/docs/api_contract.md` | Pocket 网络开发唯一 API 契约入口 |
| `../PsyTwin-Pocket/docs/sentinel_project_analysis.md` | `../PsyTwin-Sentinel/docs/project-analysis-2026-06-15.md` | Pocket 侧查看 Sentinel 分析与联动状态 |

**使用规则**：
- 修改跨端 API 前，优先更新 [`api_contract.md`](./api_contract.md)。
- Pocket 侧不要复制契约内容，直接读取 `docs/api_contract.md` 文件链接。
- Sentinel 侧需要理解 Pocket 消费方式时，读取上方两个 Pocket 文档链接。

## 跨项目参考文档

以下文档位于其他项目目录，Sentinel 开发者可能需要查阅：

| 文档 | 位置 | 说明 |
|------|------|------|
| **产品设计** | `../pet-product-design.md` (根目录) | 了解心宠功能设计、状态提醒升级流程、虚拟状态风险控制 |
| **数据模型** | `../pet-data-model.md` (根目录) | 了解 PetAlert 模型结构、Prisma Schema |

---

## Sentinel 管理后台关注重点

### 从 `pet-api-contract.md`
> Sentinel 是心宠状态提醒 API 的消费方

- **第2章** — 基础规范（响应格式、错误码体系）
- **第3.6节** — 管理后台 API（Sentinel 使用）：
  - `POST /api/v1/admin/pet-alerts` — 接收心宠状态提醒上报（由 Pet 服务调用）
  - `PUT /api/v1/admin/pet-alerts/:alertId` — 处理状态提醒（Sentinel 后台操作）
  - `GET /api/v1/admin/pet-alerts` — 获取状态提醒列表（Sentinel 后台查询）

### 从 `pet-system-architecture.md`
- **第1章** — 系统架构总览（服务关系图：Sentinel 作为状态提醒接收端）
- **第3章** — 数据库架构（共享 PostgreSQL 策略、pet_alerts 表归属）
  - Pet 服务写入 pet_alerts
  - Sentinel 读取 pet_alerts
- **第7章** — 部署架构（Docker Compose、Nginx 反向代理、环境变量）

### 从 `pet-product-design.md`（根目录）
- **第3.5节** — 事件系统（了解大型事件类型和流程）
- **第5章** — 虚拟状态风险控制（Sentinel 核心关注）：
  - `5.1` 数据使用边界（禁止将虚拟属性映射到真实心理疾病）
  - `5.2` 状态提醒升级流程（Level 1/2/3 的定义和触发条件）
  - `5.3` 平台安全事件（与心宠状态提醒的区别）
  - `5.3` 用户同意与退出（免责声明、数据保留政策）

### 从 `pet-data-model.md`（根目录）
- **第2章** — Prisma Schema 中的 `PetAlert` 模型（状态提醒表结构）
- **第3章** — TypeScript DTO 中的 `PetAlertResponse`（API 响应结构）

---

## Sentinel 核心职责

```
┌─────────────────────────────────────────────┐
│              PsyTwin-Sentinel                │
│  ┌─────────────────────────────────────┐   │
│  │  状态提醒接收端                          │   │
│  │  ├── POST /api/v1/admin/pet-alerts  │   │  ← Pet 服务上报
│  │  ├── GET  /api/v1/admin/pet-alerts  │   │  ← 后台查询
│  │  └── PUT  /api/v1/admin/pet-alerts  │   │  ← 后台处理
│  └─────────────────────────────────────┘   │
│  ┌─────────────────────────────────────┐   │
│  │  管理后台                              │   │
│  │  ├── 心宠状态提醒列表/筛选/搜索            │   │
│  │  ├── 状态提醒详情（心宠快照、持续时间）       │   │
│  │  └── 状态提醒处理（标记已处理、记录备注）      │   │
│  └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

**关键约束**：
- Sentinel **不**维护心宠表、事件表、日记表
- Sentinel **只**读写 `pet_alerts` 表
- Sentinel **不**运行 AI 引擎或 WebSocket 服务
- Sentinel **必须**区分"心宠状态提醒"与"平台安全事件"

---

## 文档更新流程

如需修改文档：
1. **优先修改根目录下的 Source of Truth 文档**
2. 然后同步更新本项目目录中的副本
3. 通知相关项目团队

---

**最后更新**: 2026-04-27
**维护者**: PsyTwin 技术团队
