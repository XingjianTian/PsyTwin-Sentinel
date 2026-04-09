import { NextRequest, NextResponse } from "next/server"

import { prisma } from "@/lib/prisma"
import { AGENTS } from "@/lib/openclaw/agents.config"

const db = prisma as any

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

function toRequestState(state: string) {
  return state.toLowerCase()
}

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

export async function GET(request: NextRequest) {

  const { searchParams } = new URL(request.url)
  const type = searchParams.get("type")

  if (type === "events") {
    const limit = Number(searchParams.get("limit") || "50")
    const offset = Number(searchParams.get("offset") || "0")

    const [events, total] = await Promise.all([
      db.openClawEvent.findMany({
        skip: offset,
        take: limit,
        orderBy: { eventTime: "desc" },
        include: { agent: true },
      }),
      db.openClawEvent.count(),
    ])

    return NextResponse.json({
      total,
      events: events.map((event: any) => ({
        ...(resolveAgentDisplay(event.agentId, event.agent?.name, event.agent?.color)),
        id: event.id,
        requestId: event.requestId,
        taskId: event.taskId,
        agentId: event.agentId,
        agentName: resolveAgentDisplay(event.agentId, event.agent?.name, event.agent?.color).name,
        agentColor: resolveAgentDisplay(event.agentId, event.agent?.name, event.agent?.color).color,
        type: event.type,
        state: event.state?.toLowerCase() || "in_progress",
        message: event.message,
        time: event.eventTime.toLocaleTimeString("zh-CN", { hour12: false }),
        timestamp: event.eventTime.getTime(),
        payload: event.payload,
      })),
    })
  }

  const [requests, tasks] = await Promise.all([
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
  ])

  return NextResponse.json({
    requests: requests.map((item: any) => ({
      ...(resolveAgentDisplay(item.assignedAgentId, item.assignedAgent?.name, item.assignedAgent?.color)),
      id: item.id,
      runId: item.runId,
      content: item.content,
      state: toRequestState(item.state),
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
  })
}
