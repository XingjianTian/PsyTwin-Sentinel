import { OPENCLAW_EVENTS, openClawEventBus } from "@/lib/openclaw/event-bus"
import { prisma } from "@/lib/prisma"
import { AGENTS } from "@/lib/openclaw/agents.config"

const db = prisma as any

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

function resolveAgentDisplay(agentId?: string | null, fallbackName?: string | null, fallbackColor?: string | null) {
  if (agentId && agentId in AGENTS) {
    const meta = AGENTS[agentId as keyof typeof AGENTS]
    return {
      name: meta.name,
      color: meta.color,
    }
  }

  return {
    name: fallbackName || agentId || "系统",
    color: fallbackColor || "#64748b",
  }
}

export async function GET() {

  const encoder = new TextEncoder()
  let alive = true

  const stream = new ReadableStream({
    async start(controller) {
      const send = (eventType: string, data: unknown) => {
        if (!alive) return
        try {
          controller.enqueue(encoder.encode(`event: ${eventType}\ndata: ${JSON.stringify(data)}\n\n`))
        } catch {
          cleanup()
        }
      }

      const [events, requests, tasks, connection] = await Promise.all([
        db.openClawEvent.findMany({
          take: 50,
          orderBy: { eventTime: "desc" },
          include: { agent: true },
        }),
        db.openClawRequest.findMany({
          take: 30,
          orderBy: { createdAt: "desc" },
          include: { assignedAgent: true },
        }),
        db.openClawTask.findMany({
          take: 30,
          orderBy: { createdAt: "desc" },
          include: { assignedAgent: true },
        }),
        db.openClawConnection.findUnique({ where: { id: "default" } }),
      ])

      send("snapshot", {
        events: events.map((event: any) => ({
          ...(resolveAgentDisplay(event.agentId, event.agent?.name, event.agent?.color)),
          id: event.id,
          requestId: event.requestId,
          taskId: event.taskId,
          agentId: event.agentId,
          agentName: resolveAgentDisplay(event.agentId, event.agent?.name, event.agent?.color).name,
          agentColor: resolveAgentDisplay(event.agentId, event.agent?.name, event.agent?.color).color,
          state: event.state?.toLowerCase() || "in_progress",
          message: event.message,
          time: event.eventTime.toLocaleTimeString("zh-CN", { hour12: false }),
          timestamp: event.eventTime.getTime(),
          type: event.type,
          payload: event.payload,
        })),
        requests: requests.map((item: any) => ({
          ...(resolveAgentDisplay(item.assignedAgentId, item.assignedAgent?.name, item.assignedAgent?.color)),
          id: item.id,
          runId: item.runId,
          content: item.content,
          state: item.state.toLowerCase(),
          assignedTo: item.assignedAgentId,
          agentName: resolveAgentDisplay(item.assignedAgentId, item.assignedAgent?.name, item.assignedAgent?.color).name,
          agentColor: resolveAgentDisplay(item.assignedAgentId, item.assignedAgent?.name, item.assignedAgent?.color).color,
          createdAt: item.createdAt.getTime(),
          completedAt: item.completedAt?.getTime() || null,
          result: item.result,
        })),
        tasks: tasks.map((task: any) => ({
          ...(resolveAgentDisplay(task.assignedAgentId, task.assignedAgent?.name, task.assignedAgent?.color)),
          id: task.id,
          requestId: task.requestId,
          title: task.title,
          detail: task.detail,
          status: task.status.toLowerCase(),
          assignedAgent: task.assignedAgentId,
          agentName: resolveAgentDisplay(task.assignedAgentId, task.assignedAgent?.name, task.assignedAgent?.color).name,
          createdAt: task.createdAt.getTime(),
          startedAt: task.startedAt?.getTime() || null,
          completedAt: task.completedAt?.getTime() || null,
          result: task.result,
        })),
        connection: {
          connected: connection?.connected ?? false,
          gatewayUrl: connection?.gatewayUrl ?? null,
          lastConnectedAt: connection?.lastConnectedAt ?? null,
          lastDisconnectedAt: connection?.lastDisconnectedAt ?? null,
          lastError: connection?.lastError ?? null,
        },
      })

      const onWorkflowEvent = (payload: unknown) => send("activity", payload)
      const onRequestUpdate = (payload: unknown) => send("request", payload)
      const onTaskUpdate = (payload: unknown) => send("task", payload)
      const onConnectionUpdate = (payload: unknown) => send("connection", payload)

      openClawEventBus.on(OPENCLAW_EVENTS.WORKFLOW_EVENT, onWorkflowEvent)
      openClawEventBus.on(OPENCLAW_EVENTS.REQUEST_UPDATE, onRequestUpdate)
      openClawEventBus.on(OPENCLAW_EVENTS.TASK_UPDATE, onTaskUpdate)
      openClawEventBus.on(OPENCLAW_EVENTS.CONNECTION_UPDATE, onConnectionUpdate)

      const heartbeat = setInterval(() => {
        if (!alive) return
        try {
          controller.enqueue(encoder.encode(`: heartbeat\n\n`))
        } catch {
          cleanup()
        }
      }, 15000)

      function cleanup() {
        if (!alive) return
        alive = false
        clearInterval(heartbeat)
        openClawEventBus.off(OPENCLAW_EVENTS.WORKFLOW_EVENT, onWorkflowEvent)
        openClawEventBus.off(OPENCLAW_EVENTS.REQUEST_UPDATE, onRequestUpdate)
        openClawEventBus.off(OPENCLAW_EVENTS.TASK_UPDATE, onTaskUpdate)
        openClawEventBus.off(OPENCLAW_EVENTS.CONNECTION_UPDATE, onConnectionUpdate)
      }
    },
    cancel() {
      alive = false
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  })
}
