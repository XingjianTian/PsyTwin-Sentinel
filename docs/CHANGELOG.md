# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added
- 初始化项目：Next.js 16 + React 19 校园心理健康数字孪生管理平台
- 7个业务视图页面：VR仪表盘、学生档案、预警记录、风险追踪、干预记录、AI配置、系统设置
- 57个shadcn/ui组件
- 项目规范文档：AGENTS.md
- 技术规范文档：docs/技术规范文档.md
- 产品需求文档：docs/PRD.md

### Changed
- 配色方案：从深色科技风转换为明亮温暖风格
- 背景色：#FAF8F5 (暖白色)
- 卡片背景：#FFFFFF (纯白)
- 主色调：#7C3AED (紫色)
- 辅助色：#10B981 (绿色)

### Features
- 心理健康热力图
- 预警雷达图
- 转化漏斗图
- 统计卡片
- 学生全生命周期追踪
- AI干预建议配置

---

## 项目技术栈

- **框架**: Next.js 16 (App Router)
- **UI库**: React 19 + shadcn/ui
- **样式**: Tailwind CSS 4
- **图表**: Recharts
- **字体**: Noto Sans SC (中文支持)

---

## 目录结构

```
├── app/                 # Next.js App Router
├── components/
│   ├── ui/             # shadcn/ui 组件
│   └── views/          # 业务视图页面
├── hooks/              # 自定义Hooks
├── lib/                # 工具函数
├── docs/               # 项目文档
│   ├── PRD.md          # 产品需求文档
│   ├── 技术规范文档.md  # 技术规范
│   └── CHANGELOG.md    # 变更日志
└── public/             # 静态资源
```
