# 项目检查草稿

## 项目基本信息
- **名称**: PsyTwin Sentinel (校园心理健康数字孪生管理平台)
- **技术栈**: Next.js 16 + React 19 + TypeScript + PostgreSQL + Redis
- **定位**: 核心中台，为 PsyTwin-Pocket (小程序) 和 PsyTwin-Companion (VR终端) 提供 API

## 项目结构概览
- `app/` - Next.js App Router
- `components/` - UI组件 (ui/ + views/)
- `lib/` - 工具函数
- `prisma/` - 数据库模型
- `scripts/` - 运维脚本 (约30个)
- `docs/` - 文档

## 已识别的潜在问题
- package.json 中未发现测试框架 (jest/vitest)
- tsconfig.json 需要检查配置
- 大量 .ts 脚本文件在 scripts/ 目录

## 待确认：用户检查目的
1. 代码质量审查
2. 项目结构分析
3. 依赖和配置检查
4. 安全漏洞扫描
5. 文档完整性
6. 全面综合检查
