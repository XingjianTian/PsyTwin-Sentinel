process.env.WS_NO_BUFFER_UTIL = "1"
process.env.WS_NO_UTF_8_VALIDATE = "1"

import { prisma } from "@/lib/prisma"
import { getOpenClawGatewayConfig, isOpenClawConfigured } from "@/lib/openclaw/config"
import { OPENCLAW_EVENTS, openClawEventBus } from "@/lib/openclaw/event-bus"
import { addGatewayEventLog } from "@/app/api/openclaw/debug/events/route"
import { logToFile } from "@/lib/openclaw/logger"
import { AGENTS, AgentId } from "@/lib/openclaw/agents.config"

function getAgentMeta(agentId: string) {
  const normalizedId = Object.keys(AGENTS).find(
    (key) => key.toLowerCase() === agentId.toLowerCase()
  ) as AgentId | undefined
  return normalizedId ? AGENTS[normalizedId] : undefined
}

function normalizeAgentId(agentId: string): string {
  const normalizedId = Object.keys(AGENTS).find(
    (key) => key.toLowerCase() === agentId.toLowerCase()
  )
  return normalizedId || agentId
}

type GatewayAgentPayload = {
  stream?: string
  runId?: string
  sessionKey?: string
  data?: {
    phase?: string
    text?: string
    content?: string
    delta?: string
    output?: string
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
  pendingOutgoing: Array<{ agentId: string; message: string; resolve: (v: unknown) => void; reject: (e: unknown) => void }>
}

const globalBridgeState = globalThis as unknown as {
  __psytwinOpenClawBridgeState?: BridgeState
  __psytwinOpenClawBridgeStarted?: boolean
  __psytwinRunAgentMap?: Map<string, string>
}

if (!globalBridgeState.__psytwinOpenClawBridgeState) {
  globalBridgeState.__psytwinOpenClawBridgeState = {
    ws: null,
    reconnectTimer: null,
    connected: false,
    connecting: false,
    lastError: null,
    pendingOutgoing: [],
  }
}

// 全局 runId -> agent 名称映射（支持并发子 agent）
if (!globalBridgeState.__psytwinRunAgentMap) {
  globalBridgeState.__psytwinRunAgentMap = new Map<string, string>()
}

if (!(globalThis as any).__psytwinResponseTextMap) {
  (globalThis as any).__psytwinResponseTextMap = new Map<string, string>()
}

function nowTime() {
  return new Date().toLocaleTimeString("zh-CN", { hour12: false })
}

function parseAgentIdFromSessionKey(sessionKey?: string) {
  if (!sessionKey) return "main"
  const match = sessionKey.match(/^agent:([^:]+)/)
  return match?.[1] || "main"
}

function parseAgentIdFromRunId(runId?: string): string | null {
  if (!runId) return null
  const parts = runId.split(":")
  if (parts.length >= 6 && parts[2] === "agent" && parts[4] === "subagent") {
    return parts[3] || null
  }
  return null
}

function detectAgentIdFromText(text?: string): string | null {
  if (!text) return null
  const agentEntries = Object.entries(AGENTS)
  for (const [id, meta] of agentEntries) {
    const chineseName = meta.name
    const emoji = meta.emoji
    if (text.includes(`[${chineseName}]`) || text.includes(`**[${chineseName}]**`)) {
      return id
    }
    if (emoji && (text.includes(`[${emoji}]`) || text.includes(emoji))) {
      return id
    }
  }
  return null
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
  // 只更新在线状态，不覆盖 name
  // name 应该由 upsertAgentsFromList 从网关获取并设置
  return db.openClawAgent.upsert({
    where: { id: agentId },
    update: {
      isOnline: true,
      lastSeenAt: new Date(),
    },
    create: {
      id: agentId,
      name: agentId, // 创建时默认使用 agentId
      role: agentId === "main" ? "Orchestrator" : "Agent",
      isOnline: true,
      lastSeenAt: new Date(),
    },
  })
}

async function upsertAgentsFromList(rawAgents: unknown) {
  const list = Array.isArray(rawAgents) ? rawAgents : []
  type ParsedAgent = {
    id: string
    name: string
    role: string
    emoji: string | null
    color: string | null
    metadata?: unknown
  }
  
  // 提取新的 agent IDs 和详细信息
  const newAgents: ParsedAgent[] = list
    .map((item: any): ParsedAgent | null => {
    if (typeof item === "string") {
      return { id: item, name: item, role: "Agent", emoji: null, color: null }
    }
    if (typeof item === "object" && item && "id" in item) {
      const identity = item.identity || {}
      return {
        id: item.id,
        name: identity.name || item.name || item.id,
        role: identity.role || item.role || "Agent",
        emoji: identity.emoji || item.emoji || null,
        color: identity.color || item.color || null,
        metadata: item,
      }
    }
    return null
  })
    .filter((item): item is ParsedAgent => item !== null)

  if (newAgents.length === 0) return

  // 获取当前数据库中的 agents
  const existingAgents = await db.openClawAgent.findMany({
    select: { id: true, name: true },
  })

  // 检查是否需要更新（比较 ID 列表是否一致）
  const existingIds = existingAgents.map((a: any) => a.id).sort()
  const newIds = newAgents.map((a: any) => a.id).sort()
  
  const hasChanged = JSON.stringify(existingIds) !== JSON.stringify(newIds)
  
  if (hasChanged) {
    logToFile("AGENTS", "Detected agent list change, replacing all agents", {
      oldCount: existingAgents.length,
      newCount: newAgents.length,
      oldIds: existingIds,
      newIds: newIds,
    })
    
    // 如果 agents 列表变化了，删除所有旧的，插入新的
    await db.openClawAgent.deleteMany({})
    
    for (const agent of newAgents) {
      await db.openClawAgent.create({
        data: {
          id: agent.id,
          name: agent.name,
          role: agent.role,
          emoji: agent.emoji,
          color: agent.color,
          metadata: agent.metadata || {},
          isOnline: true,
          lastSeenAt: new Date(),
        },
      })
    }
    
    // 触发 agents 更新事件，通知前端刷新
    openClawEventBus.emit(OPENCLAW_EVENTS.AGENTS_UPDATE, { agents: newAgents })
  } else {
    // 如果 agents 列表没变，只更新在线状态
    for (const agent of newAgents) {
      await db.openClawAgent.upsert({
        where: { id: agent.id },
        update: {
          name: agent.name,
          role: agent.role,
          emoji: agent.emoji,
          color: agent.color,
          metadata: agent.metadata || {},
          isOnline: true,
          lastSeenAt: new Date(),
        },
        create: {
          id: agent.id,
          name: agent.name,
          role: agent.role,
          emoji: agent.emoji,
          color: agent.color,
          metadata: agent.metadata || {},
          isOnline: true,
          lastSeenAt: new Date(),
        },
      })
    }
  }
}

async function ensureFallbackAgents() {
  const fallbackAgents = Object.entries(AGENTS).map(([id, meta]) => ({
    id,
    name: meta.name,
    role: meta.role,
    emoji: meta.emoji,
    color: meta.color,
  }))

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
  logToFile("EMIT", `Request update triggered`, { requestId })
  const request = await db.openClawRequest.findUnique({
    where: { id: requestId },
    include: { assignedAgent: true, task: true },
  })

  if (!request) {
    logToFile("EMIT", `Request not found`, { requestId })
    return
  }

  const payload = {
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
  }

  logToFile("EMIT", `Emitting REQUEST_UPDATE`, { requestId, state: payload.state })
  openClawEventBus.emit(OPENCLAW_EVENTS.REQUEST_UPDATE, payload)
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
    payload: event.payload,
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
  
  logToFile("AGENT", `EVENT | runId: ${runId} | stream: ${stream} | phase: ${phase}`)
  
  // 调试：打印完整的 payload 结构
  console.log(`[openclaw-debug] stream=${stream}, sessionKey=${sessionKey}, data=`, JSON.stringify(data, null, 2).slice(0, 500))
  if (!runId) {
    logToFile("WARN", "No runId, skipping")
    return
  }
  
  const runAgentMap = globalBridgeState.__psytwinRunAgentMap!
  
  // 优先从 runAgentMap 获取已记录的 agent
  let agentId = runAgentMap.get(runId)
  
  if (!agentId) {
    agentId = normalizeAgentId(parseAgentIdFromRunId(runId) || parseAgentIdFromSessionKey(sessionKey))
    runAgentMap.set(runId, agentId)
  } else {
    agentId = normalizeAgentId(agentId)
  }

  const agentMeta = getAgentMeta(agentId)
  const agentLabel = `${agentMeta?.emoji ? `${agentMeta.emoji} ` : ""}${agentMeta?.name || agentId}`
  
  await upsertAgent(agentId)

  const rawText = (data?.text || data?.content || data?.delta || data?.output || "").trim()
  const fallbackContent = rawText || "OpenClaw 网关事件处理中"

  const request = await getOrCreateRequest(runId, agentId, fallbackContent)

  if (stream === "lifecycle" && data?.phase === "start") {
    const updated = await updateRequestStateByRun(runId, "ANALYZING")
    await createWorkflowEvent({
      requestId: updated.id,
      agentId,
      type: "lifecycle.start",
      state: "ANALYZING",
      message: "开始分析请求",
      payload: { ...data, sessionKey, runId, stream },
    })
    await emitRequestUpdate(updated.id)
    return
  }

  if (stream === "lifecycle" && data?.phase === "end") {
    const updated = await updateRequestStateByRun(runId, "COMPLETED")
    const responseTextMap = (globalThis as any).__psytwinResponseTextMap as Map<string, string>
    const accumulatedText = responseTextMap.get(runId) || updated.content || rawText || "请求已处理完成"
    
    const isWebUiSubagent = sessionKey === "agent:main:main" && runId?.includes(":subagent:")
    if (isWebUiSubagent) {
      const detectedFromText = detectAgentIdFromText(accumulatedText)
      if (detectedFromText) {
        agentId = detectedFromText
        runAgentMap.set(runId, agentId)
      }
    }
    
    const contentSummary = truncateText(accumulatedText, 60)
    await createWorkflowEvent({
      requestId: updated.id,
      agentId,
      type: "lifecycle.end",
      state: "COMPLETED",
      message: contentSummary,
      payload: { ...data, sessionKey, runId, stream },
    })
    await emitRequestUpdate(updated.id)
    runAgentMap.delete(runId)
    responseTextMap.delete(runId)
    return
  }

  if (stream === "assistant" || stream === "user") {
    const detectedAgentId = detectAgentIdFromText(rawText)
    if (detectedAgentId && detectedAgentId !== agentId) {
      agentId = detectedAgentId
      runAgentMap.set(runId, agentId)
    }

    if (rawText) {
      const responseTextMap = (globalThis as any).__psytwinResponseTextMap as Map<string, string>
      responseTextMap.set(runId, rawText)
    }

    const updated = await updateRequestStateByRun(runId, "IN_PROGRESS")
    const task = await ensureTask(updated.id, agentId, truncateText(updated.content, 60), truncateText(rawText || updated.content, 200))
    await db.openClawTask.update({
      where: { id: task.id },
      data: { status: "IN_PROGRESS", startedAt: task.startedAt || new Date() },
    })

    const isWebUiSubagent = sessionKey === "agent:main:main" && runId?.includes(":subagent:")
    if (!isWebUiSubagent) {
      await createWorkflowEvent({
        requestId: updated.id,
        taskId: task.id,
        agentId,
        type: `stream.${stream}`,
        state: "IN_PROGRESS",
        message: truncateText(rawText || "正在处理响应", 200),
        payload: { ...data, sessionKey, runId, stream },
      })
    }
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
      message: truncateText(rawText || "输出结果", 200),
      payload: { ...data, sessionKey, runId, stream },
    })
    await emitRequestUpdate(updated.id)
    return
  }

  // 如果没有匹配到任何处理逻辑，输出警告
  logToFile("UNHANDLED", "Event not processed", { stream, phase: data?.phase, runId })
}

async function handleChatEvent(payload: { state?: string; runId?: string; result?: string }) {
  logToFile("CHAT", "Event received", { runId: payload.runId, state: payload.state, hasResult: !!payload.result })
  const runId = payload.runId
  if (!runId) return

  // 扩展处理的状态类型
  const terminalStates = ["delivered", "idle", "completed", "done", "success"]
  if (!terminalStates.includes(payload.state?.toLowerCase() || "")) {
  logToFile("CHAT", "Event ignored - not terminal state", { state: payload.state })
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
    message: "请求已完成",
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

function processOutgoingQueue(state: BridgeState) {
  if (!state.ws || state.ws.readyState !== 1 || state.pendingOutgoing.length === 0) return

  const item = state.pendingOutgoing.shift()
  if (!item) return

  const id = `bridge-req-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  
  state.ws.send(JSON.stringify({
    type: "req",
    id,
    method: "chat",
    params: {
      agentId: item.agentId,
      message: item.message,
      user: "psytwin",
    },
  }))
}

export function sendMessageViaBridge(agentId: string, message: string): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const state = globalBridgeState.__psytwinOpenClawBridgeState!
    state.pendingOutgoing.push({ agentId, message, resolve, reject })
    processOutgoingQueue(state)
  })
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
      processOutgoingQueue(state)
    })

    ws.on("message", async (raw: any) => {
      try {
        const text = typeof raw === "string" ? raw : raw?.toString?.() || ""
        const msg = JSON.parse(text)

        // 添加调试日志，查看所有收到的消息
        logToFile("WS", "WebSocket message received", { type: msg.type, event: msg.event, id: msg.id, method: msg.method, hasPayload: !!msg.payload })


        if (msg.type === "event" && msg.event === "connect.challenge") {
          ws.send(
            JSON.stringify({
              type: "req",
              id: "connect-1",
              method: "connect",
              params: {
                minProtocol: 3,
                maxProtocol: 3,
                client: { id: 'openclaw-control-ui', version: '1.0.0', platform: 'nodejs', mode: 'ui' },
                role: 'operator',
                scopes: ['operator.read'],
                caps: [], commands: [], permissions: {},
                auth: { token },
                locale: 'en-US',
                userAgent: 'openclaw-office/0.1.0',
              },
            }),
          )
          return
        }

        if (msg.id === "connect-1" || (msg.type === "res" && msg.method === "connect")) {
          console.log("[openclaw-debug] connect-1 response:", { ok: msg.ok, result: msg.result, error: msg.error, hasPayload: msg.hasPayload })
          const success = msg.ok || msg.result || (!msg.error)
          console.log("[openclaw-debug] connect success:", success)
          if (!success) {
            await onWsClosed(state, msg.error?.message || "OpenClaw 网关鉴权失败")
            return
          }

          console.log("[openclaw-debug] Connected, waiting for agent events...")
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

        // 处理响应对应的 bridge 请求
        if (msg.type === "res" && msg.id?.startsWith("bridge-req-")) {
          const pending = state.pendingOutgoing.shift()
          if (pending) {
            if (msg.error) {
              pending.reject(new Error(msg.error.message || "Gateway error"))
            } else {
              pending.resolve(msg.result || msg.response || msg)
            }
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
