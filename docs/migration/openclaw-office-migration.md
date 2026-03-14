# OpenClaw Office 迁移至 PsyTwin-Sentinel 实施方案

## 1. 概述
本方案旨在将 `openclaw-office` 的核心功能（AI 协作可视化、效能统计、实时流水线）迁移至 `PsyTwin-Sentinel` 的“AI 配置”模块下，作为子导航功能。同时将原有的赛博朋克风格重构为符合校园管理平台的专业行政风格。

## 2. 导航与路由映射 (Chinese Localized)

迁移后的功能将作为 `AI 配置` 模块的子页面或 Tab 切换：

| 原始 Tab | 建议中文名称 | 路由路径 (建议) | 核心功能描述 |
| :--- | :--- | :--- | :--- |
| `office` | **AI 协作中心** | `/ai-config/office` | 3x3 网格展示 Agent 实时协作动态 |
| `stats` | **交互统计** | `/ai-config/stats` | 消息数、Token 消耗、成本实时统计 |
| `team` | **智能体动态** | `/ai-config/agents` | Agent 实时想法、状态与能力卡片 |
| `cost` | **效能分析** | `/ai-config/efficiency` | AI 替代人工的成本节省与 FTE 等效分析 |
| `security` | **安全审计** | `/ai-config/security` | 数据隐私、接口合规与系统健康度监控 |
| `database` | **数据浏览器** | `/ai-config/database` | 心理健康数据底层记录浏览 (限管理员) |

## 3. 视觉风格重构 (Style Redesign)

### 3.1 调色板转换
| 元素 | 赛博朋克风格 (原) | 专业行政风格 (新) |
| :--- | :--- | :--- |
| 背景 | 纯黑 (`#050508`) | 浅灰 (`#F9FAFB`) 或 深色模式 (`#0A0A0A`) |
| 边框 | 霓虹发光 (`Neon Glow`) | 细边框 (`border-slate-200`) |
| 字体 | `Orbitron` / `JetBrains Mono` | `Noto Sans SC` / `Inter` |
| 强调色 | 荧光青、粉、紫 | 品牌蓝 (`#3B82F6`)、成功绿、预警橙 |

### 3.2 移除的特效
- ❌ `cyber-rain`: 移除背景雨滴特效。
- ❌ `scanlines`: 移除屏幕扫描线效果。
- ❌ `glitch`: 移除所有故障动画。
- ❌ `glass-card`: 简化玻璃拟态，改用标准 shadcn/ui 卡片。

## 4. 核心组件迁移说明

### 4.1 GridOffice (AI 协作网格)
- **逻辑保留**: 保留 3x3 网格路径算法 (`lib/grid-paths.js`)。
- **视觉更新**: 将背景从赛博网格改为简洁的办公室平面示意图或抽象的逻辑网格。
- **中文化**: 标签从 `Agent` 改为 `智能体`，状态从 `online` 改为 `在线`。

### 4.2 RequestPipeline (请求流水线)
- **状态汉化**:
  - `received` -> `已接收`
  - `analyzing` -> `分析中`
  - `task_created` -> `任务创建`
  - `assigned` -> `已分配`
  - `in_progress` -> `处理中`
  - `completed` -> `已完成`
- **UI 调整**: 使用 `shadcn/ui` 的 `Progress` 组件替代自定义进度条。

### 4.3 StatsCards (统计卡片)
- **指标调整**: 增加“心理风险识别率”、“干预建议采纳率”等业务指标。
- **动画**: 保留数字滚动动画，增强数据实时感。

## 5. 技术集成路径
1. **依赖安装**: 引入 `framer-motion` (用于网格移动) 和 `lucide-react` (图标)。
2. **API 适配**: 在 `lib/api/ai-config.ts` 中封装对接后端 `openclaw` 接口的方法。
3. **组件重构**: 在 `components/views/ai-config/` 目录下创建对应的子组件。
4. **权限控制**: 针对 `Database` 视图增加 `Role-Based Access Control (RBAC)`。

## 6. 待办事项 (Next Steps)
- [ ] 提取 `openclaw-office` 的 `grid-paths.js` 算法逻辑。
- [ ] 设计符合 `PsyTwin` 风格的 3x3 协作中心背景。
- [ ] 编写中文化语言包 (`locales/zh/ai-config.json`)。
