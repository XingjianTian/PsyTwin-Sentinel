import { ensureOpenClawBridge } from "@/lib/openclaw/bridge"
import { OPENCLAW_EVENTS, openClawEventBus } from "@/lib/openclaw/event-bus"
import { prisma } from "@/lib/prisma"

const db = prisma as any

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET() {
  ensureOpenClawBridge()

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
          id: event.id,
          requestId: event.requestId,
          taskId: event.taskId,
          agentId: event.agentId,
          agentName: event.agent?.name || event.agentId,
          agentColor: event.agent?.color || "#64748b",
          state: event.state?.toLowerCase() || "in_progress",
          message: event.message,
          time: event.eventTime.toLocaleTimeString("zh-CN", { hour12: false }),
          timestamp: event.eventTime.getTime(),
          type: event.type,
          payload: event.payload,
        })),
        requests: requests.map((item: any) => ({
          id: item.id,
          runId: item.runId,
          content: item.content,
          state: item.state.toLowerCase(),
          assignedTo: item.assignedAgentId,
          agentName: item.assignedAgent?.name || item.assignedAgentId,
          agentColor: item.assignedAgent?.color || "#64748b",
          createdAt: item.createdAt.getTime(),
          completedAt: item.completedAt?.getTime() || null,
          result: item.result,
        })),
        tasks: tasks.map((task: any) => ({
          id: task.id,
          requestId: task.requestId,
          title: task.title,
          detail: task.detail,
          status: task.status.toLowerCase(),
          assignedAgent: task.assignedAgentId,
          agentName: task.assignedAgent?.name || task.assignedAgentId,
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
