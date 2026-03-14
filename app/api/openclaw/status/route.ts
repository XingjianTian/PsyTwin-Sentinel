import { NextResponse } from "next/server"

import { prisma } from "@/lib/prisma"
import { ensureOpenClawBridge } from "@/lib/openclaw/bridge"

const db = prisma as any

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET() {
  ensureOpenClawBridge()

  const [connection, activeRequests, activeTasks, onlineAgents, totalEvents] = await Promise.all([
    db.openClawConnection.findUnique({ where: { id: "default" } }),
    db.openClawRequest.count({
      where: {
        state: {
          in: ["RECEIVED", "ANALYZING", "TASK_CREATED", "ASSIGNED", "IN_PROGRESS", "REVIEWING"],
        },
      },
    }),
    db.openClawTask.count({
      where: {
        status: {
          in: ["PENDING", "ASSIGNED", "IN_PROGRESS"],
        },
      },
    }),
    db.openClawAgent.count({ where: { isOnline: true } }),
    db.openClawEvent.count(),
  ])

  return NextResponse.json({
    connection: {
      connected: connection?.connected ?? false,
      gatewayUrl: connection?.gatewayUrl ?? null,
      lastConnectedAt: connection?.lastConnectedAt ?? null,
      lastDisconnectedAt: connection?.lastDisconnectedAt ?? null,
      lastError: connection?.lastError ?? null,
    },
    summary: {
      activeRequests,
      activeTasks,
      onlineAgents,
      totalEvents,
    },
  })
}
