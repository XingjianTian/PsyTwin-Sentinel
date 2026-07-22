# Reachy Top Power Button Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the bottom Reachy lifecycle card with one confirmed “关机” button in the top Ready status bar.

**Architecture:** Keep the existing `stop` command and `AlertDialog` safety flow inside `ReachyReadyConsole`, but move its trigger and dialog beside the Ready summary. Remove only the visible restart/lifecycle controls; the backend command contract remains unchanged.

**Tech Stack:** Next.js 16, React, TypeScript, shadcn/ui `AlertDialog`, Tailwind CSS, Node test runner through `tsx`.

## Global Constraints

- The top Ready status bar must show one red “关机” button instead of “返回心宠管理”.
- The bottom “设备生命周期” card and visible “重启服务” action must be removed.
- The existing confirmation dialog, active-session warning, safe stop command, disabled state, and “返回实时联调” action must remain.
- Do not change Host Bridge, daemon, API routes, or command payloads.
- Do not stage `tsconfig.tsbuildinfo` or `.superpowers/`.

---

### Task 1: Move the confirmed power action to the Ready header

**Files:**
- Modify: `lib/pet-ai-management-navigation.test.ts:151-204`
- Modify: `components/views/pet-ai-management/reachy-ready-console.tsx:260-562`

**Interfaces:**
- Consumes: `runCommand({ action: "stop" })`, `commandPending`, `sessionRunning`, and `AlertDialog` components already provided by `ReachyReadyConsole`.
- Produces: one top-level visible “关机” trigger with the existing confirmed stop behavior; no new exported interface.

- [ ] **Step 1: Write the failing layout contract test**

Update the Ready console assertions so the source contract requires one power trigger, forbids the old lifecycle UI, and preserves the confirmation flow:

```ts
for (const label of [
  "Ready",
  "ClawBody",
  "表情与动作",
  "机器人控制器",
  "扬声器",
  "麦克风",
  "实时日志",
  "唤醒",
  "休眠",
  "头部归中",
  "天线测试",
  "关机",
]) {
  assert.match(readySource, new RegExp(label))
}

assert.equal(readySource.match(/>关机</g)?.length, 1)
assert.match(readySource, /确认关闭 Reachy 设备/)
assert.match(readySource, /action: "stop"/)
assert.doesNotMatch(readySource, /设备生命周期|重启服务|返回心宠管理/)
```

- [ ] **Step 2: Run the test and verify the intended failure**

Run:

```powershell
npx tsx --test lib/pet-ai-management-navigation.test.ts
```

Expected: FAIL because the source still contains “设备生命周期”“重启服务”“返回心宠管理” and does not contain a top “关机” trigger.

- [ ] **Step 3: Move the existing confirmation dialog to the Ready status bar**

Replace the top return button with the existing safe stop dialog. Keep the exact stop payload and pending-state protection:

```tsx
<AlertDialog>
  <AlertDialogTrigger asChild>
    <Button
      type="button"
      variant="destructive"
      className="bg-red-700 text-white hover:bg-red-800 focus-visible:border-red-800 focus-visible:ring-red-800 focus-visible:ring-offset-2"
      disabled={commandPending}
    >
      {commandPending ? (
        <LoaderCircle className="animate-spin motion-reduce:animate-none" aria-hidden="true" />
      ) : null}
      关机
    </Button>
  </AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>确认关闭 Reachy 设备？</AlertDialogTitle>
      <AlertDialogDescription>
        {sessionRunning
          ? "检测到当前学生会话，学生对话将先停止，随后机器人休眠并关闭 daemon。"
          : "机器人将先进入安全休眠，然后关闭 daemon。需要再次启动才能继续调试。"}
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>取消</AlertDialogCancel>
      <AlertDialogAction
        className="bg-red-700 text-white hover:bg-red-800 focus-visible:border-red-800 focus-visible:ring-red-800 focus-visible:ring-offset-2"
        onClick={() => void runCommand({ action: "stop" })}
      >
        确认关机
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

Delete the complete bottom lifecycle `Card`, including its restart button and old stop dialog. Remove `RefreshCw` only if no remaining use exists elsewhere in the component.

- [ ] **Step 4: Run focused tests and verify green**

Run:

```powershell
npx tsx --test lib/pet-ai-management-navigation.test.ts lib/pet-ai/reachy-lifecycle-warning.test.ts lib/pet-ai/pet-ai-api.test.ts
```

Expected: all tests PASS, including the stop-session safety and API contract tests.

- [ ] **Step 5: Run code and production verification**

Run:

```powershell
npx eslint components/views/pet-ai-management/reachy-ready-console.tsx lib/pet-ai-management-navigation.test.ts
npm run build
git diff --check
```

Expected: ESLint exits 0, Next.js production build exits 0, and `git diff --check` reports no whitespace errors.

- [ ] **Step 6: Commit only the implementation files**

```powershell
git add -- components/views/pet-ai-management/reachy-ready-console.tsx lib/pet-ai-management-navigation.test.ts
git commit -m "Move Reachy power control to status bar"
```

Expected: the commit contains only the Ready console and its layout contract test; `tsconfig.tsbuildinfo` and `.superpowers/` remain unstaged.
