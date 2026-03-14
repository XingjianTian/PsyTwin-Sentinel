import { NextResponse } from "next/server"

import { prisma } from "@/lib/prisma"

const db = prisma as any

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

function estimateOutputTokensFromText(text: string | null | undefined) {
  if (!text) return 0
  return Math.ceil(text.length / 4)
}

function calculateTokenStats(requests: Array<{ result: string | null }>, events: Array<{ message: string }>) {
  const outputFromRequests = requests.reduce((sum, item) => sum + estimateOutputTokensFromText(item.result), 0)
  const outputFromEvents = events.reduce((sum, item) => sum + estimateOutputTokensFromText(item.message), 0)

  const output = outputFromRequests + outputFromEvents
  const input = output * 3
  const total = input + output

  return { input, output, total }
}

function calculateTaskTimeMs(requests: Array<{ startedAt: Date | null; completedAt: Date | null }>) {
  return requests.reduce((sum, item) => {
    if (!item.startedAt || !item.completedAt) return sum
    const duration = item.completedAt.getTime() - item.startedAt.getTime()
    return duration > 0 ? sum + duration : sum
  }, 0)
}

function calculateCostUsd(totalTokens: number) {
  return totalTokens * 0.08 / 1000
}

function roundCurrency(value: number) {
  return Math.round(value * 100) / 100
}

export async function GET() {
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  const [todayRequests, allRequests, todayEvents, allEvents] = await Promise.all([
    db.openClawRequest.findMany({
      where: { createdAt: { gte: todayStart } },
      select: {
        state: true,
        startedAt: true,
        completedAt: true,
        result: true,
      },
    }),
    db.openClawRequest.findMany({
      select: {
        state: true,
        startedAt: true,
        completedAt: true,
        result: true,
      },
    }),
    db.openClawEvent.findMany({
      where: { eventTime: { gte: todayStart } },
      select: { message: true },
    }),
    db.openClawEvent.findMany({
      select: { message: true },
    }),
  ])

  const todayTokens = calculateTokenStats(todayRequests, todayEvents)
  const allTimeTokens = calculateTokenStats(allRequests, allEvents)

  const todayTaskTimeMs = calculateTaskTimeMs(todayRequests)
  const allTimeTaskTimeMs = calculateTaskTimeMs(allRequests)

  const todayCostUsd = calculateCostUsd(todayTokens.total)
  const allTimeCostUsd = calculateCostUsd(allTimeTokens.total)

  return NextResponse.json({
    today: {
      messages: todayRequests.length,
      tasks_completed: todayRequests.filter((item: { state: string }) => item.state === "COMPLETED").length,
      tokens: todayTokens,
      cost_usd: roundCurrency(todayCostUsd),
      savings_usd: roundCurrency(todayCostUsd * 2.5),
      task_time_ms: todayTaskTimeMs,
      human_time_ms: todayTaskTimeMs * 10,
    },
    allTime: {
      messages: allRequests.length,
      tasks_completed: allRequests.filter((item: { state: string }) => item.state === "COMPLETED").length,
      tokens: allTimeTokens,
      cost_usd: roundCurrency(allTimeCostUsd),
      savings_usd: roundCurrency(allTimeCostUsd * 2.5),
      task_time_ms: allTimeTaskTimeMs,
      human_time_ms: allTimeTaskTimeMs * 10,
    },
    source: "openclaw",
  })
}
