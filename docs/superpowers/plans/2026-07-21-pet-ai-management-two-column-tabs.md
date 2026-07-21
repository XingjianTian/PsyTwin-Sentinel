# 心宠 AI 管理中心双栏页签整合 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将心宠 AI 管理中心改为 50/50 双栏布局，并把心宠详情、对话、实时联调和性格配置整合为右侧四页签。

**Architecture:** 保留现有数据加载、Reachy 轮询和保存 API，只重组 `PetAiManagementView` 的展示结构。左栏继续管理学生选择，右栏用一个受控 Radix Tabs 容器承载四个功能面板；心宠信息使用只读 profile 摘要，编辑控件与保存操作仅存在于性格配置页签。

**Tech Stack:** Next.js 16、React 19、TypeScript、Tailwind CSS 4、Radix Tabs、node:test。

## Global Constraints

- 不修改 Pocket 小程序、数据库结构或 API 协议。
- 桌面端两栏等宽，窄屏上下排列，各区域内部滚动。
- 删除独立“风险演示”页签，但保留实时联调内双层 AI 协作流程。
- 不重置正在运行的 Reachy 会话和轮询游标。
- 所有 Git commit 与 push 必须再次获得用户确认。

---

### Task 1: 锁定双栏与四页签结构契约

**Files:**
- Modify: `lib/pet-ai-management-navigation.test.ts`
- Test: `lib/pet-ai-management-navigation.test.ts`

**Interfaces:**
- Consumes: `components/views/pet-ai-management-view.tsx` 源码。
- Produces: 对等宽双栏、四页签、只读信息页和无独立风险页签的回归约束。

- [x] **Step 1: 更新源码契约测试并让它先失败** *(已于 2026-07-21 完成)*

在管理页测试中断言：

```ts
assert.match(viewSource, /lg:grid-cols-2/)
assert.match(viewSource, /value="info"/)
assert.match(viewSource, />心宠信息</)
assert.match(viewSource, /grid-cols-4/)
assert.doesNotMatch(viewSource, /value="risk"/)
assert.doesNotMatch(viewSource, />风险演示</)
assert.match(viewSource, /当前性格配置/)
assert.match(viewSource, /保存后用于下一次 Reachy 会话/)
```

保留现有“协作过程、检测到负面情绪、小芯专业建议、百度 TTS”断言，证明风险流程仍属于实时联调。

- [x] **Step 2: 运行测试确认 RED** *(已于 2026-07-21 完成)*

Run: `npx tsx --test lib/pet-ai-management-navigation.test.ts`

Expected: FAIL，原因是组件仍为三栏、仍存在 `value="risk"`，且没有 `value="info"`。

---

### Task 2: 重构为双栏四页签管理台

**Files:**
- Modify: `components/views/pet-ai-management-view.tsx`
- Test: `lib/pet-ai-management-navigation.test.ts`

**Interfaces:**
- Consumes: `Detail`、`AiProfile`、`saveProfile()`、`pollReachy()`、`controlSession()` 和现有对话/事件状态。
- Produces: `activeTab` 值域为 `info | records | live | profile` 的统一右侧面板。

- [x] **Step 1: 清理不再需要的风险测试状态和图标** *(已于 2026-07-21 完成)*

删除 `CheckCircle2`、`ShieldAlert`、`RiskStage`、`testMessage`、`testReply`、`riskStages`、`testing` 和 `runTextTest()`。学生详情加载时不再清空这些已删除状态。保留实时联调的 `ReachyEvent` 协作时间线。

- [x] **Step 2: 把主体布局改为等宽双栏** *(已于 2026-07-21 完成)*

将三栏容器替换为：

```tsx
<section className="grid min-h-0 flex-1 grid-cols-1 gap-3 lg:grid-cols-2">
  <aside className="flex min-h-[320px] min-w-0 flex-col overflow-hidden rounded-xl border bg-card">
    {/* 学生筛选和列表 */}
  </aside>
  <section className="min-h-[520px] min-w-0 overflow-hidden rounded-xl border bg-card">
    {/* 四页签 */}
  </section>
</section>
```

左栏筛选区和列表逻辑保持不变，列表使用 `min-h-0 flex-1 overflow-y-auto`。

- [x] **Step 3: 建立四页签导航** *(已于 2026-07-21 完成)*

默认页签改为 `info`，页签头使用等宽四列：

```tsx
<TabsList className="m-3 mb-0 grid w-[calc(100%-1.5rem)] grid-cols-4">
  <TabsTrigger value="info"><PawPrint />心宠信息</TabsTrigger>
  <TabsTrigger value="records"><MessageSquareText />对话记录</TabsTrigger>
  <TabsTrigger value="live"><Activity />实时联调</TabsTrigger>
  <TabsTrigger value="profile"><Settings2 />性格配置</TabsTrigger>
</TabsList>
```

四个 `TabsContent` 都使用 `min-h-0 overflow-y-auto p-4`，保证面板内部滚动。

- [x] **Step 4: 将心宠资料迁入只读信息页签** *(已于 2026-07-21 完成)*

在 `value="info"` 中迁移现有外观、学生资料、场景、活动、OCEAN 和心理画像，并新增只读摘要：

```tsx
<section className="border-t pt-4">
  <h3 className="text-sm font-semibold">当前性格配置</h3>
  <dl className="mt-3 grid gap-3 sm:grid-cols-2">
    <div><dt>表达语气</dt><dd>{profile.tone}</dd></div>
    <div><dt>回复风格</dt><dd>{profile.responseStyle}</dd></div>
    <div><dt>主动程度</dt><dd>{profile.initiative}</dd></div>
    <div><dt>知识范围</dt><dd>{profile.knowledgeScope.join("、") || "未配置"}</dd></div>
  </dl>
  <div><span>身份与行为约束</span><p>{profile.systemPrompt}</p></div>
</section>
```

此页签不得渲染 `Input`、`Textarea`、`Slider` 或“保存配置”按钮。

- [x] **Step 5: 将编辑表单迁入性格配置页签** *(已于 2026-07-21 完成)*

在 `value="profile"` 中渲染现有编辑控件，并将保存按钮放在表单底部的操作栏：

```tsx
<div className="flex items-center justify-between border-t pt-4">
  <p className="text-xs text-muted-foreground">保存后用于下一次 Reachy 会话</p>
  <Button onClick={saveProfile} disabled={saving}>
    <Save />{saving ? "保存中" : "保存配置"}
  </Button>
</div>
```

保存 API、校验和 toast 行为保持不变。

- [x] **Step 6: 保留对话记录与实时联调内容** *(已于 2026-07-21 完成)*

把现有 `records` 和 `live` 内容原样迁入统一右栏。删除 `value="risk"` 的内容；双层 AI 的 `协作过程`、负面情绪说明、小芯建议、心宠转述和 TTS 状态继续位于 `live`。

- [x] **Step 7: 运行测试确认 GREEN** *(已于 2026-07-21 完成)*

Run: `npx tsx --test lib/pet-ai-management-navigation.test.ts`

Expected: 3 tests pass，且不再匹配独立风险页签。

---

### Task 3: 视觉、构建与 OpenSpecs 验收

**Files:**
- Modify: `docs/superpowers/specs/2026-07-21-pet-ai-management-two-column-tabs-design.md`
- Verify: `components/views/pet-ai-management-view.tsx`

**Interfaces:**
- Consumes: 完成后的双栏页面。
- Produces: 已验证的构建结果、浏览器截图和同步后的 OpenSpecs 状态。

- [x] **Step 1: 执行相关测试和生产构建** *(已于 2026-07-21 完成)*

```powershell
npx tsx --test lib/pet-ai-management-navigation.test.ts lib/pet-ai/pet-ai-api.test.ts
npm run build
```

Expected: 全部测试通过，Next.js 构建退出码为 0。

- [x] **Step 2: 在浏览器验证布局与交互** *(已于 2026-07-21 完成)*

打开 `http://localhost:3000/pet-ai-management`，验证：

- 桌面宽度下左右各占约一半。
- 四页签文字完整且切换正常。
- 心宠信息没有输入框和保存按钮。
- 性格配置包含全部编辑控件和唯一保存按钮。
- 实时联调仍展示设备控制、实时对话和双层 AI 协作过程。
- 学生列表与右侧内容分别滚动，控制台无新增关键错误。

- [x] **Step 3: 回写 OpenSpecs** *(已于 2026-07-21 完成)*

将设计文档的 7 个验收条目改为 `- [x]`，并追加：

```md
*(已于 2026-07-21 完成并通过浏览器验收)*
```

- [x] **Step 4: 检查变更范围** *(已于 2026-07-21 完成)*

```powershell
git diff --check
git status --short
```

Expected: 无空白错误；仅包含本功能、此前未提交的 7860 迁移及其文档，不包含 `.env` 或密钥。

- [x] **Step 5: 等待用户确认 Git 操作** *(已于 2026-07-21 进入等待确认状态)*

汇报使用方法和验证结果，然后询问是否提交并推送；未确认前不执行 `git add`、`git commit` 或 `git push`。
