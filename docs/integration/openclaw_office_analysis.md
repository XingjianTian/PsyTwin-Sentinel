# Openclaw-Office 集成分析报告

## 1. 项目背景
Openclaw-Office 是一个多智能体工作流可视化仪表盘，采用 Next.js 架构。其核心价值在于实时展示 Agent 之间的任务流转与状态。

## 2. 核心组件映射 (Mapping to PsyTwin-Sentinel)

| Openclaw-Office 组件 | 建议 PsyTwin-Sentinel 路径 | 功能描述 |
| :--- | :--- | :--- |
| `GridOffice.js` | `components/views/agent-monitor/AgentGrid.tsx` | 3x3 网格 Agent 实时位置展示 |
| `RequestPipeline.js` | `components/views/agent-monitor/WorkflowTracker.tsx` | 任务流转路径动画 |
| `TeamDashboard.js` | `components/views/agent-monitor/AgentStats.tsx` | Agent 思维与统计卡片 |
| `ActivityLog.js` | `components/views/agent-monitor/EventLog.tsx` | 实时系统事件滚动条 |

## 3. 视觉风格重构 (Style Redesign)
Openclaw-Office 原有的赛博朋克风格（Cyberpunk）需调整为 PsyTwin-Sentinel 的专业中性风格：

- **色彩**: 移除 `#00f5ff` (Cyan) 和 `#ff006e` (Pink)，统一使用 Tailwind CSS v4 的 `neutral` 变量及 `primary` 品牌色。
- **特效**: 禁用 `.scanlines`, `.cyber-rain`, `.glitch` 等装饰性特效。
- **字体**: 移除 `Orbitron`，统一使用 `Noto Sans SC`。
- **容器**: 将 `.glass-card` 替换为 shadcn/ui 的 `Card` 组件。

## 4. 技术集成要点
- **数据流**: 需在 `hooks/` 下新增 `useWorkflowSSE`，对接后端的 SSE 事件流。
- **状态管理**: 建议使用 `lucide-react` 图标替换原有的 Emoji，以符合 Sentinel 的严肃管理界面风格。
- **布局**: 建议将监控视图集成到主仪表盘的“实时监控”模块中。

## 5. 待办事项 (Next Steps)
- [ ] 提取 `GridOffice` 核心移动逻辑。
- [ ] 提取 `RequestPipeline` 的路径计算算法。
- [ ] 在 `PsyTwin-Sentinel` 中创建 `agent-monitor` 业务视图。
