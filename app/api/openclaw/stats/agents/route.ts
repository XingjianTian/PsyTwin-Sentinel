import { NextResponse } from "next/server"

import { prisma } from "@/lib/prisma"

const db = prisma as any

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

function estimateOutputTokensFromText(text: string | null | undefined) {
  if (!text) return 0
  return Math.ceil(text.length / 4)
}

function calculateCostUsd(totalTokens: number) {
  return totalTokens * 0.08 / 1000
}

function roundCurrency(value: number) {
  return Math.round(value * 100) / 100
}

function calculateTaskTimeMs(requests: Array<{ startedAt: Date | null; completedAt: Date | null }>) {
  return requests.reduce((sum, item) => {
    if (!item.startedAt || !item.completedAt) return sum
    const duration = item.completedAt.getTime() - item.startedAt.getTime()
    return duration > 0 ? sum + duration : sum
  }, 0)
}

export async function GET() {
  const grouped = await db.openClawRequest.groupBy({
    by: ["assignedAgentId"],
    where: {
      assignedAgentId: {
        not: null,
      },
    },
    _count: {
      _all: true,
    },
    orderBy: {
      _count: {
        id: "desc",
      },
    },
  })

  const stats = await Promise.all(
    grouped.map(async (item: { assignedAgentId: string | null; _count: { _all: number } }) => {
      const agentId = item.assignedAgentId as string

      const [requests, events] = await Promise.all([
        db.openClawRequest.findMany({
          where: { assignedAgentId: agentId },
          select: {
            state: true,
            startedAt: true,
            completedAt: true,
            result: true,
          },
        }),
        db.openClawEvent.count({ where: { agentId } }),
      ])

      const outputTokens = requests.reduce(
        (sum: number, req: { result: string | null }) => sum + estimateOutputTokensFromText(req.result),
        0,
      )
      const inputTokens = outputTokens * 3
      const totalTokens = inputTokens + outputTokens
      const costUsd = calculateCostUsd(totalTokens)

      return {
        id: agentId,
        total_tasks: item._count._all,
        tasks_completed: requests.filter((req: { state: string }) => req.state === "COMPLETED").length,
        events,
        total_task_time_ms: calculateTaskTimeMs(requests),
        savings_usd: roundCurrency(costUsd * 2.5),
      }
    }),
  )

  stats.sort((a, b) => b.total_tasks - a.total_tasks)

  return NextResponse.json({ agents: stats })
}
