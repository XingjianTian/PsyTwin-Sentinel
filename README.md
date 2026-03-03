# PsyTwin Sentinel

校园心理健康数字孪生管理平台

## 项目简介

基于 Next.js 16 + React 19 的校园心理健康监测预警系统，提供学生心理健康状态的实时监测、风险预警、干预追踪等全生命周期管理功能。

## 技术栈

- **框架**: Next.js 16 (App Router)
- **UI库**: React 19 + shadcn/ui
- **样式**: Tailwind CSS 4
- **图表**: Recharts
- **字体**: Noto Sans SC

## 功能模块

| 模块 | 描述 |
|------|------|
| VR仪表盘 | 心理健康热力图、预警雷达、转化漏斗 |
| 学生档案 | 学生基本信息、心理档案、全生命周期追踪 |
| 预警记录 | 心理健康预警事件管理 |
| 风险追踪 | 风险学生分级管控与追踪 |
| 干预记录 | 心理干预措施记录与效果评估 |
| AI配置 | AI干预建议模型配置 |
| 系统设置 | 系统参数配置 |

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

访问 http://localhost:3000

## 项目结构

```
├── app/                 # Next.js App Router
├── components/
│   ├── ui/             # shadcn/ui 组件
│   └── views/          # 业务视图页面
├── hooks/              # 自定义Hooks
├── lib/                # 工具函数
├── docs/               # 项目文档
│   ├── CHANGELOG.md    # 变更日志
│   ├── PRD.md          # 产品需求文档
│   └── 技术规范文档.md  # 技术规范
└── public/             # 静态资源
```

## 文档

- [产品需求文档](./docs/PRD.md)
- [技术规范文档](./docs/技术规范文档.md)
- [变更日志](./docs/CHANGELOG.md)

## License

MIT
