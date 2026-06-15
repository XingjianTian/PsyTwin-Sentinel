# PsyTwin-Sentinel 项目分析

> 分析日期: 2026-06-15
> 范围: Sentinel 管理后台、Pocket 跨端契约、心宠日记联动

## 项目定位

PsyTwin-Sentinel 是 PsyTwin 生态中的 API Producer 和管理后台，基于 Next.js 16、React 19、Prisma 和 shadcn/ui 构建。它负责提供 `/api/pocket/*` 小程序接口、管理学生/教师/预约/通知/心墙数据，并承接心宠风险提醒、心宠日记等跨端数据能力。

PsyTwin-Pocket 是微信小程序 API Consumer。Pocket 只通过 `wx.request` 请求 Sentinel 暴露的接口，不在小程序项目中维护服务端逻辑、Prisma 或 Next.js 代码。

## 当前代码结构观察

| 区域 | 现状 |
|------|------|
| `app/api/pocket/` | 已覆盖认证、心墙、评论、收藏、预约、通知、个人中心、聊天会话、心宠日记等移动端接口 |
| `app/api/admin/pet-alerts/` | 已具备心宠状态提醒的后台列表、创建、详情和处理接口 |
| `components/views/` | 管理后台主要视图集中在此目录，适合继续承载业务页面 |
| `prisma/schema.prisma` | 已包含 Pocket 社交、通知、聊天、心宠、日记模板、日记条目和提醒相关模型 |
| `docs/api_contract.md` | 是 Sentinel 与 Pocket 网络层联调的唯一契约源 |

## 跨端契约状态

- [x] Sentinel 保留 `docs/api_contract.md` 作为唯一 API 契约源。*(已于 2026-06-15 确认为 Pocket 文件链接目标)*
- [x] Pocket 通过 `docs/api_contract.md` 文件链接读取 Sentinel 契约。*(已于 2026-06-15 建立双向文档链接)*
- [x] Pocket 心宠日记请求层已对接 `/pet/diary`、`/pet/diary/trigger`、`/pet/diary/test`、`/pet/diary/backfill`。*(已于 2026-06-15 核对 `api/pet-diary.js`)*
- [x] Sentinel 心宠日记接口已落在 `/api/pocket/pet/diary*`。*(已于 2026-06-15 核对 App Router 路由)*

## 双向文件链接约定

当前 Windows 会话未授予创建 `SymbolicLink` 的权限，因此本次采用同卷 `HardLink` 建立文件级双向链接。它不是目录副本，编辑任意一端都会写到同一个文件数据；如果后续启用开发者模式或管理员权限，可替换为真正的符号软链接。

| 所在项目 | 链接路径 | 指向 | 用途 |
|----------|----------|------|------|
| Sentinel | `docs/pocket_api_guide.md` | `PsyTwin-Pocket/docs/API_GUIDE.md` | 快速查看 Pocket 请求层约定 |
| Sentinel | `docs/pocket_project_overview.md` | `PsyTwin-Pocket/docs/PROJECT_OVERVIEW.md` | 快速查看 Pocket 项目全景 |
| Pocket | `docs/api_contract.md` | `PsyTwin-Sentinel/docs/api_contract.md` | Pocket 网络开发唯一契约入口 |
| Pocket | `docs/sentinel_project_analysis.md` | `PsyTwin-Sentinel/docs/project-analysis-2026-06-15.md` | Pocket 侧查看 Sentinel 分析与联动状态 |

## 后续维护原则

1. 修改跨端 API 前，先更新 Sentinel 的 `docs/api_contract.md`。
2. Pocket 侧不要复制契约内容，始终读取 `docs/api_contract.md` 文件链接。
3. Sentinel 侧若需要理解 Pocket 请求封装或页面消费方式，通过 `docs/pocket_api_guide.md` 和 `docs/pocket_project_overview.md` 查阅。
4. 新增跨端功能完成后，同步把 OpenSpecs 任务项从 `- [ ]` 更新为 `- [x]` 并追加完成备注。
