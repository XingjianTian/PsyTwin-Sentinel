process.env.WS_NO_BUFFER_UTIL = "1"
process.env.WS_NO_UTF_8_VALIDATE = "1"

import { prisma } from "@/lib/prisma"
import { getOpenClawGatewayConfig, isOpenClawConfigured } from "@/lib/openclaw/config"
import { OPENCLAW_EVENTS, openClawEventBus } from "@/lib/openclaw/event-bus"
import { addGatewayEventLog } from "@/app/api/openclaw/debug/events/route"

type GatewayAgentPayload = {
  stream?: string
  runId?: string
  sessionKey?: string
  data?: {
    phase?: string
    text?: string
    content?: string
    toolName?: string
    tool?: string
    args?: Record<string, unknown>
  }
}

const db = prisma as any

type BridgeState = {
  ws: any
  reconnectTimer: NodeJS.Timeout | null
  connected: boolean
  connecting: boolean
  lastError: string | null
}

const globalBridgeState = globalThis as unknown as {
  __psytwinOpenClawBridgeState?: BridgeState
  __psytwinOpenClawBridgeStarted?: boolean
}

if (!globalBridgeState.__psytwinOpenClawBridgeState) {
  globalBridgeState.__psytwinOpenClawBridgeState = {
    ws: null,
    reconnectTimer: null,
    connected: false,
    connecting: false,
    lastError: null,
  }
}

function nowTime() {
  return new Date().toLocaleTimeString("zh-CN", { hour12: false })
}

function parseAgentIdFromSessionKey(sessionKey?: string) {
  const match = sessionKey?.match(/agent:([^:]+)/)
  return match?.[1] || "main"
}

function truncateText(text: string, max = 120) {
  return text.length > max ? `${text.slice(0, max)}...` : text
}

function normalizeRequestState(state: string) {
  switch (state) {
    case "RECEIVED":
      return "received"
    case "ANALYZING":
      return "analyzing"
    case "TASK_CREATED":
      return "task_created"
    case "ASSIGNED":
      return "assigned"
    case "IN_PROGRESS":
      return "in_progress"
    case "REVIEWING":
      return "reviewing"
    case "COMPLETED":
      return "completed"
    case "FAILED":
      return "failed"
    default:
      return "received"
  }
}

async function updateConnection(partial: {
  connected?: boolean
  lastConnectedAt?: Date
  lastDisconnectedAt?: Date
  lastError?: string | null
}) {
  const { url } = getOpenClawGatewayConfig()
  const connection = await db.openClawConnection.upsert({
    where: { id: "default" },
    update: {
      gatewayUrl: url || null,
      connected: partial.connected,
      lastConnectedAt: partial.lastConnectedAt,
      lastDisconnectedAt: partial.lastDisconnectedAt,
      lastError: partial.lastError,
    },
    create: {
      id: "default",
      gatewayUrl: url || null,
      connected: partial.connected ?? false,
      lastConnectedAt: partial.lastConnectedAt,
      lastDisconnectedAt: partial.lastDisconnectedAt,
      lastError: partial.lastError ?? null,
    },
  })

  openClawEventBus.emit(OPENCLAW_EVENTS.CONNECTION_UPDATE, {
    id: connection.id,
    connected: connection.connected,
    gatewayUrl: connection.gatewayUrl,
    lastConnectedAt: connection.lastConnectedAt,
    lastDisconnectedAt: connection.lastDisconnectedAt,
    lastError: connection.lastError,
  })
}

async function upsertAgent(agentId: string) {
  return db.openClawAgent.upsert({
    where: { id: agentId },
    update: {
      isOnline: true,
      lastSeenAt: new Date(),
    },
    create: {
      id: agentId,
      name: agentId,
      role: agentId === "main" ? "Orchestrator" : "Agent",
      isOnline: true,
      lastSeenAt: new Date(),
    },
  })
}

async function upsertAgentsFromList(rawAgents: unknown) {
  const list = Array.isArray(rawAgents) ? rawAgents : []
  for (const item of list) {
    if (typeof item === "string") {
      await db.openClawAgent.upsert({
        where: { id: item },
        update: {
          isOnline: true,
          lastSeenAt: new Date(),
          name: item,
        },
        create: {
          id: item,
          name: item,
          role: "Agent",
          isOnline: true,
          lastSeenAt: new Date(),
        },
      })
      continue
    }

    if (typeof item === "object" && item && "id" in item) {
      const agent = item as {
        id: string
        name?: string
        role?: string
        emoji?: string
        color?: string
        identity?: { name?: string; role?: string; emoji?: string; color?: string }
      }

      const identity = agent.identity || {}
      const name = identity.name || agent.name || agent.id
      const role = identity.role || agent.role || "Agent"
      const emoji = identity.emoji || agent.emoji || null
      const color = identity.color || agent.color || null

      await db.openClawAgent.upsert({
        where: { id: agent.id },
        update: {
          name,
          role,
          emoji,
          color,
          metadata: agent,
          isOnline: true,
          lastSeenAt: new Date(),
        },
        create: {
          id: agent.id,
          name,
          role,
          emoji,
          color,
          metadata: agent,
          isOnline: true,
          lastSeenAt: new Date(),
        },
      })
    }
  }
}

async function ensureFallbackAgents() {
  const fallbackAgents = [
    { id: "main", name: "司礼监", role: "总调度", emoji: "🧭", color: "#3b82f6" },
    { id: "bingbu", name: "兵部", role: "研发执行", emoji: "🛠️", color: "#10b981" },
    { id: "gongbu", name: "工部", role: "运维部署", emoji: "⚙️", color: "#f59e0b" },
    { id: "hubu", name: "户部", role: "资源与成本", emoji: "💰", color: "#14b8a6" },
    { id: "libu", name: "礼部", role: "内容与呈现", emoji: "🪶", color: "#a855f7" },
    { id: "libu2", name: "礼部二号", role: "文档协同", emoji: "📘", color: "#8b5cf6" },
    { id: "xingbu", name: "刑部", role: "安全与合规", emoji: "🛡️", color: "#ef4444" },
  ]

  for (const agent of fallbackAgents) {
    await db.openClawAgent.upsert({
      where: { id: agent.id },
      update: {
        name: agent.name,
        role: agent.role,
        emoji: agent.emoji,
        color: agent.color,
        isOnline: true,
        lastSeenAt: new Date(),
      },
      create: {
        id: agent.id,
        name: agent.name,
        role: agent.role,
        emoji: agent.emoji,
        color: agent.color,
        isOnline: true,
        lastSeenAt: new Date(),
      },
    })
  }
}

async function getOrCreateRequest(runId: string, agentId: string, fallbackContent: string) {
  const existing = await db.openClawRequest.findUnique({ where: { runId } })
  if (existing) {
    return db.openClawRequest.update({
      where: { id: existing.id },
      data: {
        assignedAgentId: agentId,
        content: existing.content || fallbackContent,
      },
    })
  }

  return db.openClawRequest.create({
    data: {
      runId,
      source: "gateway",
      content: fallbackContent,
      state: "RECEIVED",
      assignedAgentId: agentId,
    },
  })
}

async function emitRequestUpdate(requestId: string) {
  const request = await db.openClawRequest.findUnique({
    where: { id: requestId },
    include: { assignedAgent: true, task: true },
  })

  if (!request) return

  openClawEventBus.emit(OPENCLAW_EVENTS.REQUEST_UPDATE, {
    id: request.id,
    runId: request.runId,
    content: request.content,
    state: normalizeRequestState(request.state),
    assignedTo: request.assignedAgentId,
    agentName: request.assignedAgent?.name || request.assignedAgentId,
    agentColor: request.assignedAgent?.color || "#64748b",
    createdAt: request.createdAt.getTime(),
    completedAt: request.completedAt?.getTime() ?? null,
    result: request.result,
  })
}

async function emitTaskUpdate(taskId: string) {
  const task = await db.openClawTask.findUnique({
    where: { id: taskId },
    include: { assignedAgent: true },
  })

  if (!task) return

  openClawEventBus.emit(OPENCLAW_EVENTS.TASK_UPDATE, {
    id: task.id,
    requestId: task.requestId,
    title: task.title,
    detail: task.detail,
    status: task.status.toLowerCase(),
    assignedAgent: task.assignedAgentId,
    agentName: task.assignedAgent?.name || task.assignedAgentId,
    createdAt: task.createdAt.getTime(),
    startedAt: task.startedAt?.getTime() ?? null,
    completedAt: task.completedAt?.getTime() ?? null,
    result: task.result,
  })
}

async function createWorkflowEvent(data: {
  requestId: string
  taskId?: string | null
  agentId: string
  type: string
  state?: string
  message: string
  payload?: Record<string, unknown>
}) {
  const event = await db.openClawEvent.create({
    data: {
      requestId: data.requestId,
      taskId: data.taskId || null,
      agentId: data.agentId,
      type: data.type,
      state: data.state,
      message: data.message,
      payload: data.payload,
      eventTime: new Date(),
    },
    include: {
      agent: true,
    },
  })

  openClawEventBus.emit(OPENCLAW_EVENTS.WORKFLOW_EVENT, {
    id: event.id,
    requestId: event.requestId,
    taskId: event.taskId,
    state: event.state?.toLowerCase() || "in_progress",
    agentId: event.agentId,
    agentName: event.agent?.name || event.agentId,
    agentColor: event.agent?.color || "#64748b",
    message: event.message,
    time: nowTime(),
    timestamp: event.eventTime.getTime(),
    type: event.type,
  })

  return event
}

async function ensureTask(requestId: string, agentId: string, title: string, detail?: string) {
  const existing = await db.openClawTask.findUnique({ where: { requestId } })
  if (existing) {
    return db.openClawTask.update({
      where: { id: existing.id },
      data: {
        assignedAgentId: agentId,
        title: existing.title || title,
        detail: existing.detail || detail,
      },
    })
  }

  return db.openClawTask.create({
    data: {
      requestId,
      title,
      detail,
      assignedAgentId: agentId,
      status: "ASSIGNED",
    },
  })
}

async function updateRequestStateByRun(runId: string, state: "ANALYZING" | "TASK_CREATED" | "IN_PROGRESS" | "COMPLETED" | "FAILED") {
  return db.openClawRequest.update({
    where: { runId },
    data: {
      state,
      startedAt: state === "IN_PROGRESS" ? new Date() : undefined,
      completedAt: state === "COMPLETED" || state === "FAILED" ? new Date() : undefined,
    },
  })
}

async function handleAgentEvent(payload: GatewayAgentPayload) {
  // 简化日志，只输出关键信息
  const { runId, stream, sessionKey, data } = payload
  const phase = data?.phase
  
  console.log(`[openclaw] AGENT EVENT | runId: ${runId} | stream: ${stream} | phase: ${phase}`)

  if (!runId) {
    console.log("[openclaw] No runId, skipping")
    return
  }
  const agentId = parseAgentIdFromSessionKey(sessionKey)
  await upsertAgent(agentId)

  const rawText = (data?.text || data?.content || "").trim()
  const fallbackContent = rawText || "OpenClaw 网关事件处理中"

  const request = await getOrCreateRequest(runId, agentId, fallbackContent)

  if (stream === "lifecycle" && data?.phase === "start") {
    const updated = await updateRequestStateByRun(runId, "ANALYZING")
    await createWorkflowEvent({
      requestId: updated.id,
      agentId,
      type: "lifecycle.start",
      state: "ANALYZING",
      message: `🔍 ${agentId} 开始分析请求`,
      payload: data,
    })
    await emitRequestUpdate(updated.id)
    return
  }

  if (stream === "lifecycle" && data?.phase === "end") {
    const updated = await updateRequestStateByRun(runId, "COMPLETED")
    await createWorkflowEvent({
      requestId: updated.id,
      agentId,
      type: "lifecycle.end",
      state: "COMPLETED",
      message: `✅ ${agentId} 完成请求分析`,
      payload: data,
    })
    await emitRequestUpdate(updated.id)
    return
  }

  if (stream === "tool" && data?.phase === "start") {
    const toolName = data?.toolName || data?.tool || "tool"
    const updated = await updateRequestStateByRun(runId, "TASK_CREATED")
    const task = await ensureTask(updated.id, agentId, truncateText(`工具调用：${toolName}`, 60), truncateText(rawText || "工具调用中", 200))

    await createWorkflowEvent({
      requestId: updated.id,
      taskId: task.id,
      agentId,
      type: "tool.start",
      state: "TASK_CREATED",
      message: `🛠️ ${agentId} 调用了 ${toolName}`,
      payload: data,
    })
    await emitRequestUpdate(updated.id)
    await emitTaskUpdate(task.id)
    return
  }

  // 添加 tool.end 事件处理
  if (stream === "tool" && data?.phase === "end") {
    const updated = await updateRequestStateByRun(runId, "COMPLETED")
    await createWorkflowEvent({
      requestId: updated.id,
      agentId,
      type: "tool.end",
      state: "COMPLETED",
      message: `✅ ${agentId} 完成工具调用`,
      payload: data,
    })
    await emitRequestUpdate(updated.id)
    return
  }

  if (stream === "assistant" || stream === "user") {
    const updated = await updateRequestStateByRun(runId, "IN_PROGRESS")
    const task = await ensureTask(updated.id, agentId, truncateText(updated.content, 60), truncateText(rawText || updated.content, 200))
    await db.openClawTask.update({
      where: { id: task.id },
      data: { status: "IN_PROGRESS", startedAt: task.startedAt || new Date() },
    })

    await createWorkflowEvent({
      requestId: updated.id,
      taskId: task.id,
      agentId,
      type: `stream.${stream}`,
      state: "IN_PROGRESS",
      message: truncateText(rawText || `✍️ ${agentId} 正在处理响应`, 200),
      payload: data,
    })
    await emitRequestUpdate(updated.id)
    await emitTaskUpdate(task.id)
    return
  }

  // 处理 result/output 流（可能是最终结果）
  if (stream === "result" || stream === "output") {
    console.log(`[openclaw] ${stream} stream received, marking as completed`)
    const updated = await updateRequestStateByRun(runId, "COMPLETED")
    await createWorkflowEvent({
      requestId: updated.id,
      agentId,
      type: `stream.${stream}`,
      state: "COMPLETED",
      message: truncateText(rawText || `✅ ${agentId} 输出结果`, 200),
      payload: data,
    })
    await emitRequestUpdate(updated.id)
    return
  }

  // 如果没有匹配到任何处理逻辑，输出警告
  console.log("[openclaw] Unhandled event:", { stream, phase: data?.phase, runId })
}

async function handleChatEvent(payload: { state?: string; runId?: string; result?: string }) {
  // 添加调试日志
  console.log("[openclaw] Chat event received:", {
    runId: payload.runId,
    state: payload.state,
    hasResult: !!payload.result,
    resultPreview: payload.result?.slice(0, 100),
  })

  const runId = payload.runId
  if (!runId) return

  // 扩展处理的状态类型
  const terminalStates = ["delivered", "idle", "completed", "done", "success"]
  if (!terminalStates.includes(payload.state?.toLowerCase() || "")) {
    console.log("[openclaw] Chat event ignored - not a terminal state:", payload.state)
    return
  }
  const request = await db.openClawRequest.findUnique({ where: { runId } })
  if (!request) return

  const updatedRequest = await db.openClawRequest.update({
    where: { id: request.id },
    data: {
      state: "COMPLETED",
      completedAt: new Date(),
      result: payload.result || null,
    },
  })

  const task = await db.openClawTask.findUnique({ where: { requestId: request.id } })
  if (task) {
    await db.openClawTask.update({
      where: { id: task.id },
      data: {
        status: "COMPLETED",
        completedAt: new Date(),
        result: payload.result || null,
      },
    })
    await emitTaskUpdate(task.id)
  }

  const agentId = updatedRequest.assignedAgentId || "main"
  await createWorkflowEvent({
    requestId: updatedRequest.id,
    taskId: task?.id,
    agentId,
    type: "chat.completed",
    state: "COMPLETED",
    message: `✅ ${agentId} 已完成该请求`,
    payload,
  })

  await emitRequestUpdate(updatedRequest.id)
}

function scheduleReconnect(state: BridgeState) {
  if (state.reconnectTimer) return
  state.reconnectTimer = setTimeout(() => {
    state.reconnectTimer = null
    void connectOpenClawBridge()
  }, 5000)
}

async function onWsClosed(state: BridgeState, reason: string) {
  state.connected = false
  state.connecting = false
  state.ws = null
  state.lastError = reason

  await updateConnection({
    connected: false,
    lastDisconnectedAt: new Date(),
    lastError: reason,
  })

  scheduleReconnect(state)
}

async function connectOpenClawBridge() {
  const state = globalBridgeState.__psytwinOpenClawBridgeState!
  if (state.connecting || state.connected) return

  if (!isOpenClawConfigured()) {
    state.connected = false
    state.connecting = false
    state.lastError = "OpenClaw 网关未配置"
    await updateConnection({
      connected: false,
      lastError: "OpenClaw 网关未配置",
    })
    return
  }

  const { url, token } = getOpenClawGatewayConfig()
  state.connecting = true

  try {
    const wsModule = await import("ws")
    const WebSocketCtor = wsModule.default

    const ws = new WebSocketCtor(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Origin: "http://localhost:4200",
      },
    })

    state.ws = ws

    ws.on("open", async () => {
      state.connecting = false
      state.connected = true
      state.lastError = null
      await updateConnection({
        connected: true,
        lastConnectedAt: new Date(),
        lastError: null,
      })
    })

    ws.on("message", async (raw: any) => {
      try {
        const text = typeof raw === "string" ? raw : raw?.toString?.() || ""
        const msg = JSON.parse(text)

        // 添加调试日志，查看所有收到的消息
        console.log("[openclaw] WebSocket message received:", {
          type: msg.type,
          event: msg.event,
          id: msg.id,
          method: msg.method,
          hasPayload: !!msg.payload,
          payloadKeys: msg.payload ? Object.keys(msg.payload) : [],
          rawPreview: text.slice(0, 300),
        })


        if (msg.type === "event" && msg.event === "connect.challenge") {
          ws.send(
            JSON.stringify({
              type: "req",
              id: "connect-1",
              method: "connect",
              params: {
                minProtocol: 3,
                maxProtocol: 3,
                client: { id: "openclaw-control-ui", version: "1.0.0", platform: "nodejs", mode: "ui" },
                role: "operator",
                scopes: ["operator.read"],
                caps: [],
                commands: [],
                permissions: {},
                auth: { token },
                locale: "en-US",
                userAgent: "openclaw-office-cli/0.1.0",
              },
            }),
          )
          return
        }

        if (msg.id === "connect-1" || (msg.type === "res" && msg.method === "connect")) {
          const success = msg.ok || msg.result || (!msg.error)
          if (!success) {
            await onWsClosed(state, msg.error?.message || "OpenClaw 网关鉴权失败")
            return
          }

          ws.send(
            JSON.stringify({
              type: "req",
              id: "agents-1",
              method: "agents.list",
              params: {},
            }),
          )
          return
        }

        if (msg.id === "agents-1" || (msg.type === "res" && msg.method === "agents.list")) {
          const rawAgents = msg.payload?.agents || msg.result || msg.agents || []
          await upsertAgentsFromList(rawAgents)
          return
        }

        if (msg.type === "event" && msg.event === "agent") {
          await handleAgentEvent(msg.payload as GatewayAgentPayload)
          return
        }

        if (msg.type === "event" && msg.event === "chat") {
          await handleChatEvent(msg.payload as { state?: string; runId?: string; result?: string })
          return
        }

        // 处理 delegate 事件（任务委派）
        if (msg.type === "event" && msg.event === "delegate") {
          console.log("[openclaw] Delegate event received:", msg.payload)
          // delegate 事件通常意味着任务转移，可能需要更新请求状态
          return
        }

        // 处理 taskcomplete 事件（任务完成）
        if (msg.type === "event" && msg.event === "taskcomplete") {
          console.log("[openclaw] Task complete event received:", msg.payload)
          const payload = msg.payload as { runId?: string; result?: string; agentId?: string }
          if (payload.runId) {
            await handleChatEvent({
              runId: payload.runId,
              state: "completed",
              result: payload.result,
            })
          }
          return
        }

        // 处理完成事件（通用完成信号）
        if (msg.type === "event" && (msg.event === "completed" || msg.event === "done" || msg.event === "finish")) {
          console.log("[openclaw] Completion event received:", msg.payload)
          const payload = msg.payload as { runId?: string; result?: string }
          if (payload.runId) {
            await handleChatEvent({
              runId: payload.runId,
              state: "completed",
              result: payload.result,
            })
          }
          return
        }

        // 记录未知事件类型
        if (msg.type === "event") {
          console.log("[openclaw] Unknown event type:", msg.event, "payload:", JSON.stringify(msg.payload).slice(0, 200))
        }
      } catch (error) {
        console.error("[openclaw] Failed to parse gateway message", error)
      }
    })

    ws.on("close", async (code: number, reason: Buffer) => {
      await onWsClosed(state, `连接关闭 (${code}) ${reason.toString()}`)
    })

    ws.on("error", async (err: Error) => {
      await onWsClosed(state, err.message)
    })

    setTimeout(async () => {
      if (!state.connected) return
      const count = await db.openClawAgent.count()
      if (count === 0) {
        await ensureFallbackAgents()
      }
    }, 3000)

    // 启动自动完成检测（每30秒检查一次卡住的请求）
    const autoCompleteInterval = setInterval(async () => {
      if (!state.connected) {
        clearInterval(autoCompleteInterval)
        return
      }
      
      try {
        // 查找卡在 ANALYZING 或 IN_PROGRESS 超过60秒的请求
        const stuckRequests = await db.openClawRequest.findMany({
          where: {
            state: { in: ["ANALYZING", "IN_PROGRESS", "TASK_CREATED"] },
            createdAt: { lt: new Date(Date.now() - 60000) },
            completedAt: null,
          },
          take: 10,
        })
        
        for (const request of stuckRequests) {
          console.log(`[openclaw] Auto-completing stuck request: ${request.id} (${request.state})`)
          
          await db.openClawRequest.update({
            where: { id: request.id },
            data: {
              state: "COMPLETED",
              completedAt: new Date(),
              result: request.result || "Auto-completed after timeout",
            },
          })
          
          // 同时更新关联的任务
          await db.openClawTask.updateMany({
            where: { requestId: request.id },
            data: {
              status: "COMPLETED",
              completedAt: new Date(),
            },
          })
          
          await emitRequestUpdate(request.id)
        }
      } catch (error) {
        console.error("[openclaw] Auto-complete error:", error)
      }
    }, 30000)

    // 清理函数
    ws.on("close", () => {
      clearInterval(autoCompleteInterval)
    })

  } catch (error) {
    state.connecting = false
    state.connected = false
    state.lastError = error instanceof Error ? error.message : "连接失败"
    await updateConnection({
      connected: false,
      lastError: state.lastError,
      lastDisconnectedAt: new Date(),
    })
    scheduleReconnect(state)
  }
}

export function ensureOpenClawBridge() {
  if (globalBridgeState.__psytwinOpenClawBridgeStarted) {
    return
  }

  globalBridgeState.__psytwinOpenClawBridgeStarted = true
  void connectOpenClawBridge()
}
