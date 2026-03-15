# PsyTwin OpenClaw Agent 识别实现指南

## 问题背景

OpenClaw Gateway 不会通过 WebSocket 发送 `stream: "tool"` 类型的事件，因此无法直接通过 `sessions_spawn` 事件检测子代理委派。

**解决方案：从 `sessionKey` 提取 agent ID，使用 Map 存储 runId -> agentId 映射。**

---

## 核心实现

### 1. Agent 配置表

创建文件 `lib/openclaw/agents.config.ts`：

```typescript
export const AGENTS = {
  'main': { 
    name: '首席数据官', 
    emoji: '🎯', 
    color: '#ff006e',
    role: 'Orchestrator'
  },
  'Collector': { 
    name: '采集员', 
    emoji: '📡', 
    color: '#00f5ff',
    role: '数据采集'
  },
  'Therapist': { 
    name: '咨询师', 
    emoji: '🧠', 
    color: '#9d4edd',
    role: '干预策略'
  },
  'Relayer': { 
    name: '中继工程师', 
    emoji: '🔌', 
    color: '#ffbe0b',
    role: '边缘处理'
  },
  'DBA': { 
    name: '数据哨兵', 
    emoji: '🛡️', 
    color: '#39ff14',
    role: '数据管理'
  },
  'Analyst': { 
    name: '分析师', 
    emoji: '📊', 
    color: '#00d9a5',
    role: '特征提取'
  }
} as const

export type AgentId = keyof typeof AGENTS
```

---

### 2. Bridge 核心逻辑

修改 `lib/openclaw/bridge.ts`：

```typescript
import { AGENTS, AgentId } from './agents.config'

// ============ 全局状态 ============
const runAgentMap = new Map<string, AgentId>()

// ============ 核心处理函数 ============
export async function handleAgentEvent(payload: {
  stream?: string
  runId?: string
  sessionKey?: string
  data?: { phase?: string; text?: string; content?: string }
}) {
  if (!payload) return
  
  const { stream, runId, data, sessionKey } = payload
  
  // 🔥 关键：从 sessionKey 提取 agent ID
  // sessionKey 格式: "agent:main:main" 或 "agent:Collector:subagent:uuid"
  const match = sessionKey?.match(/agent:([^:]+)/)
  const agentId: AgentId = (match?.[1] as AgentId) || 'main'
  
  // 🔥 关键：存入映射表，支持并发
  if (runId) {
    runAgentMap.set(runId, agentId)
  }
  
  console.log(`[openclaw] Event: stream=${stream} agent=${agentId} runId=${runId?.slice(0, 8)}`)
  
  // ============ Lifecycle Start ============
  if (stream === 'lifecycle' && data?.phase === 'start') {
    const agent = AGENTS[agentId]
    const requestId = `req_${runId}`
    
    // 创建请求记录
    const request = await prisma.openClawRequest.create({
      data: {
        id: requestId,
        runId: runId!,
        agentId,
        content: '处理中...',
        state: 'ANALYZING',
        source: 'gateway',
        createdAt: new Date()
      }
    })
    
    // 创建任务记录
    const task = await prisma.openClawTask.create({
      data: {
        requestId: request.id,
        title: `${agent.emoji} ${agent.name} 处理中`,
        detail: 'OpenClaw Gateway 事件处理中',
        assignedAgentId: agentId,
        status: 'ASSIGNED',
        createdAt: new Date()
      }
    })
    
    // 创建工作流事件
    await createWorkflowEvent({
      requestId: request.id,
      taskId: task.id,
      agentId,
      type: 'lifecycle.start',
      state: 'ANALYZING',
      message: `🔍 ${agent.emoji} ${agent.name} 开始分析请求`,
      payload: { runId, sessionKey, stream }
    })
    
    // 通知前端
    emitRequestUpdate(request.id)
    return
  }
  
  // ============ Lifecycle End ============
  if (stream === 'lifecycle' && data?.phase === 'end') {
    // 🔥 关键：从 Map 读取对应的 agent
    const agentIdFromMap = runId ? runAgentMap.get(runId) || 'main' : 'main'
    const agent = AGENTS[agentIdFromMap]
    
    const request = await prisma.openClawRequest.findUnique({
      where: { runId: runId! }
    })
    
    if (request) {
      // 更新请求状态
      await prisma.openClawRequest.update({
        where: { id: request.id },
        data: { 
          state: 'COMPLETED', 
          completedAt: new Date() 
        }
      })
      
      // 更新任务状态
      await prisma.openClawTask.updateMany({
        where: { requestId: request.id },
        data: { 
          status: 'COMPLETED', 
          completedAt: new Date() 
        }
      })
      
      // 创建完成事件
      await createWorkflowEvent({
        requestId: request.id,
        agentId: agentIdFromMap,
        type: 'lifecycle.end',
        state: 'COMPLETED',
        message: `✅ ${agent.emoji} ${agent.name} 完成请求`,
        payload: { runId, sessionKey }
      })
      
      emitRequestUpdate(request.id)
    }
    
    // 🔥 关键：清理 Map
    if (runId) {
      runAgentMap.delete(runId)
    }
    return
  }
  
  // ============ Assistant 流 ============
  if (stream === 'assistant') {
    const request = await prisma.openClawRequest.findUnique({
      where: { runId: runId! }
    })
    
    if (request && request.state === 'ANALYZING') {
      await prisma.openClawRequest.update({
        where: { id: request.id },
        data: { state: 'IN_PROGRESS' }
      })
      
      await prisma.openClawTask.updateMany({
        where: { requestId: request.id },
        data: { status: 'IN_PROGRESS', startedAt: new Date() }
      })
      
      const agent = AGENTS[agentId]
      await createWorkflowEvent({
        requestId: request.id,
        agentId,
        type: 'stream.assistant',
        state: 'IN_PROGRESS',
        message: `✍️ ${agent.name} 正在生成响应...`,
        payload: { text: data?.text }
      })
      
      emitRequestUpdate(request.id)
    }
    return
  }
  
  // ============ Chat 完成事件 ============
  if (stream === 'chat') {
    const { state } = data || {}
    if (state === 'completed' || state === 'delivered' || state === 'idle') {
      const request = await prisma.openClawRequest.findUnique({
        where: { runId: runId! }
      })
      
      if (request && request.state !== 'COMPLETED') {
        const agentIdFromMap = runAgentMap.get(runId!) || 'main'
        const agent = AGENTS[agentIdFromMap]
        
        await prisma.openClawRequest.update({
          where: { id: request.id },
          data: { 
            state: 'COMPLETED', 
            completedAt: new Date() 
          }
        })
        
        await createWorkflowEvent({
          requestId: request.id,
          agentId: agentIdFromMap,
          type: 'chat.completed',
          state: 'COMPLETED',
          message: `✅ ${agent.name} 已完成`,
          payload: { runId }
        })
        
        emitRequestUpdate(request.id)
        runAgentMap.delete(runId!)
      }
    }
  }
}

// ============ 辅助函数 ============

async function createWorkflowEvent(data: {
  requestId: string
  taskId?: string
  agentId: string
  type: string
  state: string
  message: string
  payload?: any
}) {
  const agent = AGENTS[data.agentId as AgentId]
  
  const event = await prisma.openClawEvent.create({
    data: {
      requestId: data.requestId,
      taskId: data.taskId || null,
      agentId: data.agentId,
      type: data.type,
      state: data.state,
      message: data.message,
      payload: data.payload || {},
      eventTime: new Date()
    }
  })
  
  // 通过 EventBus 通知前端
  openClawEventBus.emit(OPENCLAW_EVENTS.WORKFLOW_EVENT, {
    id: event.id,
    requestId: event.requestId,
    taskId: event.taskId,
    state: event.state.toLowerCase(),
    agentId: event.agentId,
    agentName: agent?.name || event.agentId,
    agentColor: agent?.color || '#64748b',
    message: event.message,
    time: new Date().toLocaleTimeString('zh-CN', { hour12: false }),
    timestamp: Date.now(),
    type: event.type,
    payload: event.payload
  })
  
  return event
}

async function emitRequestUpdate(requestId: string) {
  const request = await prisma.openClawRequest.findUnique({
    where: { id: requestId },
    include: { assignedAgent: true, task: true }
  })
  
  if (!request) return
  
  const agent = AGENTS[request.assignedAgentId as AgentId]
  
  openClawEventBus.emit(OPENCLAW_EVENTS.REQUEST_UPDATE, {
    id: request.id,
    runId: request.runId,
    content: request.content,
    state: request.state.toLowerCase(),
    assignedTo: request.assignedAgentId,
    agentName: agent?.name || request.assignedAgentId,
    agentColor: agent?.color || '#64748b',
    createdAt: request.createdAt.getTime(),
    completedAt: request.completedAt?.getTime() ?? null
  })
}
```

---

### 3. WebSocket 消息处理

在 `lib/openclaw/bridge.ts` 的 `connectOpenClawBridge()` 函数中：

```typescript
ws.on('message', async (raw: any) => {
  try {
    const text = typeof raw === 'string' ? raw : raw?.toString?.() || ''
    const msg = JSON.parse(text)
    
    // 处理连接挑战
    if (msg.type === 'event' && msg.event === 'connect.challenge') {
      ws.send(JSON.stringify({
        type: 'req',
        id: 'connect-1',
        method: 'connect',
        params: {
          minProtocol: 3,
          maxProtocol: 3,
          client: { 
            id: 'psytwin-dashboard', 
            version: '1.0.0', 
            platform: 'nodejs', 
            mode: 'ui' 
          },
          role: 'operator',
          scopes: ['operator.read'],
          caps: [], 
          commands: [], 
          permissions: {},
          auth: { token },
          locale: 'zh-CN',
          userAgent: 'psytwin/1.0.0'
        }
      }))
      return
    }
    
    // 处理连接响应
    if (msg.type === 'res' && msg.method === 'connect') {
      if (msg.ok || msg.result) {
        console.log('[openclaw] ✓ 已连接到 Gateway')
      } else {
        console.error('[openclaw] 连接失败:', msg.error)
      }
      return
    }
    
    // 🔥 关键：处理 agent 事件
    if (msg.type === 'event' && msg.event === 'agent') {
      await handleAgentEvent(msg.payload)
      return
    }
    
    // 处理 chat 事件
    if (msg.type === 'event' && msg.event === 'chat') {
      await handleAgentEvent({
        stream: 'chat',
        runId: msg.payload?.runId,
        data: { state: msg.payload?.state }
      })
      return
    }
    
  } catch (error) {
    console.error('[openclaw] 解析消息失败:', error)
  }
})
```

---

## 数据流向

```
┌─────────────────────────────────────────────────────────────┐
│                    OpenClaw Gateway                         │
│  1. lifecycle.start (sessionKey: agent:Collector:subagent:xxx) │
│  2. assistant stream                                        │
│  3. lifecycle.end                                           │
└────────────────────┬────────────────────────────────────────┘
                     │ WebSocket
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                    PsyTwin Bridge                           │
│  1. extract agentId from sessionKey → "Collector"           │
│  2. runAgentMap.set(runId, "Collector")                     │
│  3. createRequest(agentId="Collector")                      │
│  4. on lifecycle.end: runAgentMap.get(runId) → "Collector"  │
└────────────────────┬────────────────────────────────────────┘
                     │ EventBus
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                    Frontend Dashboard                       │
│  显示: "📡 采集员 开始分析"                                  │
│  显示: "📡 采集员 完成请求"                                  │
└─────────────────────────────────────────────────────────────┘
```

---

## 关键要点

### 1. SessionKey 解析
- 格式: `agent:{agentId}:{main|subagent:uuid}`
- 示例: `agent:Collector:subagent:a1b2c3d4`
- 提取: `sessionKey.match(/agent:([^:]+)/)[1]`

### 2. 并发支持
- 使用 `Map<string, AgentId>` 存储 runId -> agentId
- 每个 run 独立追踪，支持同时运行多个 agent

### 3. Agent 识别
- 主代理: `agent:main:...` → agentId = "main"
- 子代理: `agent:Collector:...` → agentId = "Collector"
- 无需 tool 事件，直接从 sessionKey 识别

### 4. 生命周期
- `lifecycle.start` → 创建请求，状态 analyzing
- `assistant` → 更新状态为 in_progress
- `lifecycle.end` 或 `chat.completed` → 完成请求

---

## 注意事项

1. **不要依赖 `stream: "tool"` 事件** - Gateway 不会发送
2. **不要尝试从消息内容推断** - 不可靠
3. **一定要清理 Map** - 在 lifecycle.end 时删除 runId
4. **Agent ID 区分大小写** - 配置里是 `Collector`，代码里也要用 `Collector`

---

## 调试建议

在 `handleAgentEvent` 开头加日志：

```typescript
console.log('[debug] Raw payload:', JSON.stringify(payload, null, 2))
console.log('[debug] Extracted agentId:', agentId)
console.log('[debug] runAgentMap size:', runAgentMap.size)
console.log('[debug] Current map:', Array.from(runAgentMap.entries()))
```

---

## 配置对应关系

| OpenClaw Config | AgentId | 显示名称 | Emoji |
|----------------|---------|----------|-------|
| `agents.list[0]` | main | 首席数据官 | 🎯 |
| `agents.list[1]` | Collector | 采集员 | 📡 |
| `agents.list[2]` | Therapist | 咨询师 | 🧠 |
| `agents.list[3]` | Relayer | 中继工程师 | 🔌 |
| `agents.list[4]` | DBA | 数据哨兵 | 🛡️ |
| `agents.list[5]` | Analyst | 分析师 | 📊 |

---

## 文件清单

1. `lib/openclaw/agents.config.ts` - Agent 配置表
2. `lib/openclaw/bridge.ts` - Bridge 核心逻辑（修改 handleAgentEvent）

完成这两个文件即可实现完整的 Agent 识别功能。

---

**实现日期**: 2026-03-15
**基于**: OpenClaw Gateway 2026.3.7
**适用**: PsyTwin Sentinel Dashboard
