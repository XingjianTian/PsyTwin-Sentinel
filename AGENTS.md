# PROJECT KNOWLEDGE BASE

**Generated:** 2026-03-02
**Project:** PsyTwin-Sentinel (校园心理健康数字孪生管理平台)

## OVERVIEW
Next.js 16 + React 19 校园心理健康监测预警系统，使用 shadcn/ui + Tailwind CSS 4。

## STRUCTURE
```
./
├── app/                 # Next.js App Router
│   ├── layout.tsx       # 根布局
│   └── page.tsx        # 主仪表盘
├── components/
│   ├── ui/             # 57个shadcn/ui组件
│   └── views/          # 7个业务视图页面
├── hooks/              # 自定义Hooks
├── lib/                # 工具函数
└── public/             # 静态资源
```

## WHERE TO LOOK
| Task | Location | Notes |
|------|----------|-------|
| 业务视图开发 | components/views/ | 7个页面组件 |
| UI组件修改 | components/ui/ | Radix UI组件库 |
| 样式调整 | app/globals.css | Tailwind CSS变量 |
| 工具函数 | lib/utils.ts | cn()合并类名 |

## CODE MAP
| Symbol | Type | Location | Role |
|--------|------|----------|------|
| cn | function | lib/utils.ts | 类名合并 |
| DashboardSidebar | component | components/ | 侧边栏导航 |
| StatCards | component | components/ | 统计卡片 |

## CONVENTIONS
- 客户端组件: 文件首行 `"use client"`
- 路径别名: `@/` 指向对应目录
- 组件导出: `export function` 声明
- 样式合并: 使用 `cn()` 工具
- UI组件: @radix-ui/react-* + lucide-react

## ANTI-PATTERNS (THIS PROJECT)
1. **重复文件**: hooks/use-toast.ts 与 components/ui/use-toast.ts 完全相同
2. **重复文件**: hooks/use-mobile.ts 与 components/ui/use-mobile.tsx 完全相同
3. **未使用解构**: risk-trace-view.tsx:48 `const [selectedDefault] = workOrders`
4. **忽略TS错误**: next.config.mjs 配置 `ignoreBuildErrors: true`

## UNIQUE STYLES
- Tailwind CSS v4 (无需tailwind.config.js)
- shadcn/ui 风格: new-york
- 基础色: neutral
- 中文支持: Noto Sans SC 字体

## COMMANDS
```bash
npm run dev      # 开发服务器
npm run build    # 生产构建
npm run start    # 生产启动
npm run lint     # ESLint检查
```

## FRONTEND VERIFICATION WORKFLOW

### 修改前端后的标准验证流程

每次修改前端内容后，必须执行以下验证步骤：

#### 1. 构建验证
```bash
npm run build
```
- 确保无编译错误
- 检查 TypeScript 类型错误

#### 2. 视觉效果验证（使用 Playwright）

**启动开发服务器**（如果未运行）：
```bash
npm run dev
```

**使用 Playwright 验证**：

```typescript
// 1. 导航到页面
skill_mcp(mcp_name="playwright", tool_name="browser_navigate", arguments={url: "http://localhost:3000"})

// 2. 截图保存到 screenshots 目录
skill_mcp(mcp_name="playwright", tool_name="browser_take_screenshot", arguments={
  filename: "screenshots/页面名-日期.png",
  type: "png"
})

// 3. 分析截图
look_at(file_path: "screenshots/xxx.png", goal: "描述/分析视觉效果")
```

**截图命名规范**：
- 格式: `{功能描述}-{YYYY-MM-DD}.png`
- 示例: `homepage-color-update-2026-03-04.png`
- 目录: `screenshots/`

#### 3. 检查清单
- [ ] 构建成功（无错误）
- [ ] 页面正常加载
- [ ] 配色符合预期
- [ ] 组件渲染正确
- [ ] 无控制台关键错误

### 常用 Playwright 操作

| 操作 | 命令 |
|------|------|
| 导航 | browser_navigate |
| 截图 | browser_take_screenshot |
| 快照 | browser_snapshot |
| 点击 | browser_click |
| 输入 | browser_type |
| 等待 | browser_wait_for |
| 控制台 | browser_console_messages |

### 注意事项
- 不弹出浏览器窗口（CLI 模式）
- 截图自动保存到 screenshots 目录
- 分析后及时清理临时截图

## NOTES
- 无测试配置 (建议添加 Vitest)
- 无CI/CD流水线
- next.config.mjs 忽略TS错误需修复

---

## GIT 操作规则

**重要**：所有 Git 操作（commit / push）必须得到用户明确确认后才能执行。

| 操作 | 规则 |
|------|------|
| commit | 工作完成后询问用户是否提交 |
| push | **必须** 用户手动确认，不自动执行 |
| branch | 如需创建分支，先询问用户 |

### 正确流程
```
1. 完成代码修改
2. 询问用户："是否提交？"（提供提交信息摘要）
3. 用户确认后执行 commit
4. 询问用户："是否推送到远程？"
5. 用户确认后执行 push
```

### 错误流程（禁止）
- ❌ 自动 commit
- ❌ 自动 push
- ❌ 在完成任务后自动执行 git push
- 无测试配置 (建议添加 Vitest)
- 无CI/CD流水线
- next.config.mjs 忽略TS错误需修复
