import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import test from "node:test"

const readSource = async (relativePath: string) =>
  readFile(new URL(relativePath, import.meta.url), "utf8").catch(() => "")

test("sidebar nests pet AI management directly under the AI configuration group", async () => {
  const source = await readSource("../components/dashboard-sidebar.tsx")
  const aiConfigIndex = source.indexOf('label: "心图 · AI 配置"')
  const knowledgeBaseIndex = source.indexOf('href: "/ai-config?tab=rag"')
  const petAiIndex = source.indexOf('href: "/pet-ai-management"')
  const strategyCenterIndex = source.indexOf('href: "/ai-config?tab=strategy"')

  assert.ok(aiConfigIndex >= 0)
  assert.ok(aiConfigIndex < knowledgeBaseIndex)
  assert.ok(knowledgeBaseIndex < petAiIndex && petAiIndex < strategyCenterIndex)
  assert.match(source, /label: "心宠 AI 管理中心", href: "\/pet-ai-management"/)
  assert.match(source, /label: "后台智能体配置中心", href: "\/ai-config\?tab=strategy"/)
  assert.doesNotMatch(source, /模型与策略中心/)
  assert.match(source, /\/api\/risk-work-orders\/pending-count/)
  assert.match(source, /risk-work-orders:changed/)
  assert.match(source, /risk-work-orders:viewed/)
  assert.match(source, /reconcileRiskWorkOrderNotifications/)
  assert.match(source, /pathname === "\/risk-trace"/)
  assert.match(source, /pendingCount > 99 \? "99\+" : pendingCount/)
  assert.match(source, /条未查看预警/)
  assert.match(source, /nextState\.unseenCount > previousState\.unseenCount/)
  assert.match(source, /risk-badge-hop/)
  assert.match(source, /shadow-\[0_0_0_3px/)
})

test("pet AI management route renders the native management workspace", async () => {
  const viewSource = await readSource("../components/views/pet-ai-management-view.tsx")
  const pageSource = await readSource("../app/(dashboard)/pet-ai-management/page.tsx")
  const collaborationPresentationSource = await readSource("./pet-ai/collaboration-presentation.ts")

  assert.match(viewSource, />心宠AI管理中心</)
  assert.match(viewSource, /学生与心宠/)
  assert.match(viewSource, /性格配置/)
  assert.match(viewSource, />心宠信息</)
  assert.match(viewSource, /对话记录/)
  assert.match(viewSource, /实时联调/)
  assert.match(viewSource, /value="info"/)
  assert.match(viewSource, /value="profile"/)
  assert.match(viewSource, /grid-cols-4/)
  assert.doesNotMatch(viewSource, /value="risk"/)
  assert.doesNotMatch(viewSource, />风险演示</)
  assert.match(viewSource, /当前性格配置/)
  assert.match(viewSource, /保存后用于下一次实体心宠会话/)
  assert.match(viewSource, /liveSessionBaselineReadyRef/)
  assert.match(viewSource, /isBaselineRequest\s*\?\s*\[\]/)
  assert.match(viewSource, /risk_level: isBaselineRequest/)
  assert.doesNotMatch(viewSource, /Reachy Mini|Reachy 对话|实体 Reachy|Reachy 联调/)
  assert.match(viewSource, /导入性格/)
  assert.match(viewSource, /accept="\.md,text\/markdown"/)
  assert.match(viewSource, /parsePetAiProfileMarkdown/)
  assert.match(viewSource, /loading="eager"/)
  assert.match(viewSource, /w-fit/)
  assert.match(viewSource, /学生发送/)
  assert.match(viewSource, /Pocket 同款心宠/)
  assert.match(viewSource, /协作过程/)
  assert.match(viewSource, /风险识别/)
  assert.match(viewSource, /咨询师智能体专业建议/)
  assert.match(viewSource, /getCollaborationEventPresentation/)
  assert.match(collaborationPresentationSource, /Therapist\.png/)
  assert.match(viewSource, /alt="心宠头像" width=\{40\} height=\{40\} className="size-9/)
  assert.match(viewSource, /aria-label="学生头像"[^>]*className="flex size-10/)
  assert.match(viewSource, /alt="咨询师智能体头像" width=\{40\} height=\{40\} className="size-10/)
  assert.match(viewSource, /risk_level/)
  assert.match(viewSource, /实时风险/)
  assert.match(viewSource, /getRiskPresentation/)
  assert.match(viewSource, /sessionRiskLevel/)
  assert.match(viewSource, /message\.riskLevel/)
  assert.match(viewSource, /lg:grid-cols-2/)
  assert.match(viewSource, /GeminiLiveConsole/)
  assert.match(viewSource, /riskLabel/)
  assert.doesNotMatch(viewSource, /fetch\("\/api\/pet-ai\/reachy\/session"/)
  const geminiLiveSource = await readSource("../components/views/pet-ai-management/gemini-live-console.tsx")
  assert.match(geminiLiveSource, /api\/pet-ai\/gemini\/sync/)
  assert.match(geminiLiveSource, /requestMicrophone/)
  assert.match(geminiLiveSource, /GoogleGenAI[\s\S]*live\.connect/)
  assert.match(geminiLiveSource, /sendRealtimeInput/)
  assert.match(geminiLiveSource, /selectFixedPetEmotion/)
  assert.match(geminiLiveSource, /turnActionExecutedRef/)
  assert.match(geminiLiveSource, /turnComplete/)
  assert.match(geminiLiveSource, /hasModelAudio/)
  assert.match(geminiLiveSource, /api\/pet-ai\/reachy\/session/)
  assert.match(geminiLiveSource, /playSound: false/)
  assert.match(geminiLiveSource, /speechConfig/)
  assert.doesNotMatch(geminiLiveSource, /tools: petActionTools/)
  assert.doesNotMatch(geminiLiveSource, /response\.toolCall/)
  assert.match(geminiLiveSource, /personality/)
  assert.match(geminiLiveSource, /audiooutput[\s\S]*setSinkId/)
  assert.match(geminiLiveSource, /实体心宠扬声器/)
  assert.match(geminiLiveSource, /requestTimer|handshakeTimerRef/)
  assert.match(geminiLiveSource, /processing|antenna_test/)
  assert.match(geminiLiveSource, /classifyMessageRisk/)
  assert.match(geminiLiveSource, /event.code === 1000/)
  const geminiTokenSource = await readSource("../app/api/pet-ai/gemini/token/route.ts")
  assert.match(geminiTokenSource, /GEMINI_LIVE_VOICE/)
  assert.match(geminiTokenSource, /lockedSystemInstruction/)
  assert.match(geminiTokenSource, /lockAdditionalFields/)
  assert.match(
    viewSource,
    /onReturnToManagement=\{\(\) => \{\s*setWorkspaceMode\("management"\)\s*setActiveTab\("live"\)\s*\}\}/,
  )
  assert.doesNotMatch(viewSource, />功能规划中</)
  assert.match(pageSource, /<PetAiManagementView\s*\/>/)
})

test("README documents the complete pet debug to live-session workflow", async () => {
  const readme = await readSource("../README.md")

  assert.match(readme, /心宠调试[\s\S]*启动设备[\s\S]*返回实时联调[\s\S]*开始对话/)
  assert.match(readme, /首版仅允许测试学生启动实体心宠对话/)
  assert.doesNotMatch(readme, /打开摄像头预览|摄像头预览受阻/)
})

test("pet AI management exposes an accessible pet debug workspace", async () => {
  const viewSource = await readSource("../components/views/pet-ai-management-view.tsx")
  const consoleSource = await readSource(
    "../components/views/pet-ai-management/reachy-debug-console.tsx",
  )
  const connectionSource = await readSource(
    "../components/views/pet-ai-management/reachy-connection-panel.tsx",
  )

  assert.match(viewSource, /type WorkspaceMode = "management" \| "debug"/)
  assert.match(viewSource, />心宠管理</)
  assert.match(viewSource, />心宠调试</)
  assert.match(viewSource, /aria-pressed=\{workspaceMode === "management"\}/)
  assert.match(viewSource, /aria-pressed=\{workspaceMode === "debug"\}/)
  assert.match(viewSource, /workspaceMode === "management"/)
  assert.match(viewSource, /<ReachyDebugConsole/)
  assert.match(viewSource, /学生与心宠/)
  assert.match(viewSource, /实时联调/)

  assert.match(consoleSource, /\/api\/pet-ai\/reachy\/device/)
  assert.match(consoleSource, /ACTIVE_POLL_INTERVAL_MS = 1_000/)
  assert.match(consoleSource, /IDLE_POLL_INTERVAL_MS = 3_000/)
  assert.match(consoleSource, /runCommand/)
  assert.match(consoleSource, /commandPending/)
  assert.match(consoleSource, /requestGenerationRef/)
  assert.match(consoleSource, /getReachyLifecycleWarningUpdate/)
  assert.match(consoleSource, /setLifecycleWarnings\(warningUpdate\)/)
  assert.match(consoleSource, /role="alert"/)
  assert.match(consoleSource, /aria-label="关闭设备停止警告"/)
  assert.match(consoleSource, /generation !== requestGenerationRef\.current/)
  assert.ok(
    consoleSource.indexOf("generation !== requestGenerationRef.current")
      < consoleSource.indexOf("if (!response.ok || !payload.data)"),
  )
  assert.match(consoleSource, /正在读取设备状态/)
  assert.match(consoleSource, /心宠设备控制桥未运行/)
  assert.match(consoleSource, /message !== "心宠设备控制桥未运行"/)
  assert.doesNotMatch(consoleSource, /<main\b/)

  for (const stage of ["启动", "连接", "健康检查", "应用"]) {
    assert.match(connectionSource, new RegExp(`label: "${stage}"`))
  }
  assert.match(connectionSource, /"启动设备"/)
  assert.match(connectionSource, /重试/)
  assert.match(connectionSource, /复制诊断信息/)
  assert.match(connectionSource, /直播主机/)
  assert.match(connectionSource, /127\.0\.0\.1/)
  assert.match(connectionSource, /连接并检测/)
  assert.match(connectionSource, /onConnectWifi/)
  assert.match(consoleSource, /\/api\/pet-ai\/reachy\/network/)
  assert.match(connectionSource, /模拟器/)
  assert.match(connectionSource, /disabled/)
  assert.match(connectionSource, /aria-current/)
  assert.match(connectionSource, /state === "running" \|\| state === "error"/)
  assert.match(connectionSource, /snapshot\.phase === "discovering"/)
  assert.match(connectionSource, /snapshot\.phase === "stopping"/)
  assert.match(connectionSource, /rawPhase === "discovering" \? "starting"/)
  assert.match(connectionSource, /device\.port === selectedPortChoice/)
  assert.match(connectionSource, /commandError !== snapshot\.error\?\.message/)
  assert.match(connectionSource, /onRetry\(selectedPort \|\| snapshot\.serial_port/)
})

test("pet debug workspace omits the redundant introduction toolbar", async () => {
  const consoleSource = await readSource(
    "../components/views/pet-ai-management/reachy-debug-console.tsx",
  )

  assert.match(consoleSource, /aria-label="心宠设备调试"/)
  assert.doesNotMatch(consoleSource, /<h2 id="reachy-debug-heading"/)
  assert.doesNotMatch(consoleSource, /发现、启动并检查本机连接的 Reachy Mini Lite。/)
  assert.doesNotMatch(consoleSource, /<ArrowLeft \/>返回管理/)
})

test("pet ready console exposes lifecycle, media, controls, and diagnostics", async () => {
  const consoleSource = await readSource(
    "../components/views/pet-ai-management/reachy-debug-console.tsx",
  )
  const readySource = await readSource(
    "../components/views/pet-ai-management/reachy-ready-console.tsx",
  )
  const readyStateSource = await readSource("./pet-ai/reachy-ready-console-state.ts")

  assert.match(consoleSource, /<ReachyReadyConsole/)
  assert.match(consoleSource, /mergeReachyLogs/)
  assert.match(consoleSource, /ReachyCommandQueue/)
  assert.doesNotMatch(consoleSource, /if \(commandLockRef\.current\) return/)

  for (const label of [
    "Ready",
    "ClawBody",
    "表情与动作",
    "机器人控制器",
    "扬声器",
    "麦克风",
    "实时日志",
    "关机",
  ]) {
    assert.match(readySource, new RegExp(label))
  }

  assert.match(readySource, /action: "device_action"/)
  assert.match(readySource, /action: "choreography"/)
  assert.match(readySource, /动作列表/)
  assert.match(readySource, /<ScrollArea className="h-0 min-h-60 flex-1 pr-3"/)
  assert.doesNotMatch(readySource, /展开全部|收起动作库/)
  assert.doesNotMatch(readySource, /设备连接概览/)
  assert.doesNotMatch(readySource, /常规操控|唤醒、休眠与基础校准操作/)
  assert.match(readySource, /action: "volume"/)
  assert.match(readyStateSource, /action: "pose"/)
  assert.match(readySource, /VOLUME_DEBOUNCE_MS = 250/)
  assert.match(readySource, /POSE_THROTTLE_MS = 100/)
  assert.match(readySource, /navigator\.clipboard\.writeText/)
  assert.match(readySource, /AlertDialog/)
  assert.match(readySource, /学生对话将先停止/)
  assert.match(readySource, /data-action="reachy-power-off"/)
  assert.match(readySource, /确认关闭心宠设备/)
  assert.match(readySource, /action: "stop"/)
  assert.doesNotMatch(readySource, /设备生命周期|重启服务|返回心宠管理/)
  assert.match(readySource, /onReturnToManagement/)
  assert.match(readySource, /aria-live="polite"/)
  assert.match(readySource, /nearBottom/)
  assert.match(readySource, /snapshotRef\.current/)
  assert.doesNotMatch(readySource, /isDeviceActionAvailable/)
  assert.match(readySource, /text-red-700/)
  assert.doesNotMatch(readySource, /text-destructive/)
  assert.doesNotMatch(consoleSource, /text-destructive/)
  assert.equal(
    readySource.match(
      /bg-red-700 text-white hover:bg-red-800 focus-visible:border-red-800 focus-visible:ring-red-800 focus-visible:ring-offset-2/g,
    )?.length,
    2,
  )
  assert.doesNotMatch(readySource, /HOST_BRIDGE|127\.0\.0\.1:7861/)
})

test("Reachy ready console groups audio with the live-session return action", async () => {
  const readySource = await readSource(
    "../components/views/pet-ai-management/reachy-ready-console.tsx",
  )

  assert.match(readySource, /data-layout="reachy-compact-console"/)
  assert.match(readySource, /data-layout="reachy-audio-and-live-link"/)
  assert.match(readySource, /items-stretch/)
  assert.match(readySource, /lg:row-span-2/)
  assert.match(readySource, /flex h-full min-h-0 flex-col/)
  assert.doesNotMatch(readySource, /音频与联调|调整本机音频，或返回学生会话联调。/)
  assert.equal(readySource.match(/返回实时联调/g)?.length, 1)
  assert.doesNotMatch(readySource, /function ApplicationCard/)
  assert.doesNotMatch(readySource, /对话、语音与动作编排服务|<dt[^>]*>会话状态<\/dt>|<dt[^>]*>当前学生<\/dt>/)
  assert.doesNotMatch(readySource, /reachy-media-heading|data-layout="reachy-media-compact"/)
  assert.doesNotMatch(readySource, /打开摄像头预览|createReachyCameraPreviewController/)
  assert.doesNotMatch(readySource, /md:grid-cols-3/)
  assert.doesNotMatch(readySource, /min-h-64|sm:min-h-72/)
})

test("strategy configuration page uses the renamed title", async () => {
  const source = await readSource("../components/ai-config/strategy-center-view.tsx")

  assert.match(source, />后台智能体配置中心</)
  assert.doesNotMatch(source, />模型与策略中心</)
})
