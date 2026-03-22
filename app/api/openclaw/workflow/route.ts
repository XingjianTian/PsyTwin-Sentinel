import { NextRequest, NextResponse } from "next/server"

import { prisma } from "@/lib/prisma"

const db = prisma as any

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

function toRequestState(state: string) {
  return state.toLowerCase()
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
        id: event.id,
        requestId: event.requestId,
        taskId: event.taskId,
        agentId: event.agentId,
        agentName: event.agent?.name || event.agentId,
        agentColor: event.agent?.color || "#64748b",
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
      id: item.id,
      runId: item.runId,
      content: item.content,
      state: toRequestState(item.state),
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
  })
}
