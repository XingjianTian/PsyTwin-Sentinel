# UI 组件库指南 (components/ui)

## OVERVIEW
57 个基于 Radix UI 的 shadcn/ui 核心原子组件库。

## WHERE TO LOOK
| 分类 | 核心组件 | 备注 |
|------|----------|------|
| **布局** | `card.tsx`, `separator.tsx`, `scroll-area.tsx`, `sidebar.tsx` | 基础容器与侧边栏 |
| **表单** | `button.tsx`, `input.tsx`, `select.tsx`, `form.tsx`, `checkbox.tsx` | 交互输入组件 |
| **反馈** | `alert.tsx`, `toast.tsx`, `skeleton.tsx`, `sonner.tsx` | 状态提示与加载 |
| **导航** | `breadcrumb.tsx`, `navigation-menu.tsx`, `tabs.tsx`, `pagination.tsx` | 路由与分页 |
| **弹出层** | `dialog.tsx`, `popover.tsx`, `sheet.tsx`, `tooltip.tsx` | 模态框与悬浮窗 |
| **数据展示** | `table.tsx`, `badge.tsx`, `avatar.tsx`, `chart.tsx` | 列表与统计展示 |
| **菜单** | `dropdown-menu.tsx`, `context-menu.tsx`, `menubar.tsx` | 各种层级的菜单 |

## CONVENTIONS
- **类名合并**: 必须使用 `@/lib/utils` 中的 `cn()` 函数处理 `className`。
- **客户端指令**: 包含交互逻辑的组件必须在首行添加 `"use client"`。
- **Radix 继承**: 优先透传 Radix UI 的 `Primitive` 属性，保持组件的可扩展性。
- **样式变量**: 颜色与圆角应引用 `app/globals.css` 中定义的 CSS 变量。
- **无障碍支持**: 确保所有组件符合 WAI-ARIA 标准，Radix UI 已内置大部分支持。

## ANTI-PATTERNS
1. **重复 Hook**: 严禁在 `components/ui/` 中维护 `use-toast.ts` 或 `use-mobile.tsx`。应统一引用 `hooks/` 目录下的版本。
2. **硬编码样式**: 避免使用 `style={{...}}`。所有样式调整应通过 Tailwind CSS 类完成。
3. **业务耦合**: UI 组件应保持纯粹。严禁在 `components/ui/` 中编写 API 调用或特定业务逻辑。
4. **手动 DOM 操作**: 严禁直接操作 DOM。应通过 React 状态或 Radix UI 提供的 API 控制组件行为。
5. **内联样式覆盖**: 避免在组件内部使用 `!important` 覆盖样式，应通过 Tailwind 优先级或 `cn()` 解决。

## MAINTENANCE
- **更新组件**: 使用 `npx shadcn@latest add [component]` 更新现有组件时，需手动检查是否覆盖了自定义修改。
- **新增组件**: 新增 UI 组件应放置在 `components/ui/` 根目录下，保持扁平结构。
- **样式同步**: 修改 `app/globals.css` 中的主题变量后，需验证所有 UI 组件的视觉一致性。
