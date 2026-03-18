# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- **多模态数据流实时监控** - 新增实时生理曲线展示（心率、血氧、HRV）
  - SSE endpoint: `GET /api/multimodal/sensors/stream` - 通过 Redis Pub/Sub 实时推送数据
  - 学生列表 API: `GET /api/multimodal/students` - 显示所有学生及最新生理数据
  - 前端图表支持历史数据从左到右展开动画
- **通知 API** - `POST /api/pocket/notifications` 发送通知给学生

### Fixed

- 修复 `POST /api/pocket/notifications` TypeScript 类型错误
- 修复学生列表显示 mock 数据问题，改为显示数据库真实数据
- 删除错误的测试学生数据（Default Student, 测试学生, stu001）
- 修复图表动画效果 - 实时数据添加无动画，历史数据加载有动画

### Changed

- `GET /api/multimodal/students` 改为直接读取所有学生数据，不再依赖 VR Session
- 学生列表现在显示数据库全部27个学生
- 生理数据包含 bloodOxygen（血氧）字段

## [v0.1.0](https://github.com/XingjianTian/PsyTwin-Sentinel/compare/v0.2.0...v0.1.0)

### Commits

- feat: 集成 OpenClaw 编排中心与文档更新 [`ba54674`](https://github.com/XingjianTian/PsyTwin-Sentinel/commit/ba546744484433a0f155e92cf87310d5f0fee86f)
- chore: 清理根目录临时文件，只保留完整数据库备份 [`e3b851d`](https://github.com/XingjianTian/PsyTwin-Sentinel/commit/e3b851d9a3fd9495b68f549241048efe0e2ceb69)
- feat: 完成 Pocket 小程序 API 开发与 Redis 缓存集成 [`b59b3f0`](https://github.com/XingjianTian/PsyTwin-Sentinel/commit/b59b3f05eeb0275dd4f9ce6dab09bb496f33fd92)

## v0.2.0 - 2026-03-08

### Commits

- feat: 初始化项目 - Next.js 校园心理健康数字孪生平台 [`30edbec`](https://github.com/XingjianTian/PsyTwin-Sentinel/commit/30edbecf2a01941e59ed6aa35f619d970ff4e157)
- chore: 初始化 PostgreSQL 与 Prisma 后端基础设施 [`4f0971f`](https://github.com/XingjianTian/PsyTwin-Sentinel/commit/4f0971fa9b3c7b77913fa0764c1d858d8e6a0011)
- feat: 重命名心理咨询室为疗愈空间，修复设备数据加载 [`a6a2a1d`](https://github.com/XingjianTian/PsyTwin-Sentinel/commit/a6a2a1d26535e2eb112b907c1ea274b8a2a67f89)
