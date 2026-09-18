import { NextRequest, NextResponse } from "next/server"

import { isClawBodyUnavailable, requestClawBody } from "@/lib/pet-ai/clawbody-client"
import { syncReachyConversation } from "@/lib/pet-ai/reachy-conversation-sync"
import { syncReachyRiskWorkOrders } from "@/lib/pet-ai/reachy-risk-work-order-sync"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  const after = Math.max(0, Number(request.nextUrl.searchParams.get("after") || 0))
  const eventAfter = Math.max(0, Number(request.nextUrl.searchParams.get("eventAfter") || 0))
  try {
    const [status, transcript, events] = await Promise.all([
      requestClawBody<Record<string, unknown>>("/v1/status"),
      requestClawBody<Record<string, unknown>>(`/v1/transcript?after=${after}`),
      requestClawBody<Record<string, unknown>>(`/v1/events?after=${eventAfter}`),
    ])
    const studentId = typeof status.student_id === "string" ? status.student_id : ""
    const [workOrderSync, conversationSync] = studentId
      ? await Promise.all([
          syncReachyRiskWorkOrders({ studentId, transcript }).catch((syncError) => {
            console.error("[心宠] 风险工单同步失败:", syncError)
            return { created: 0 }
          }),
          syncReachyConversation({ studentId, transcript }).catch((syncError) => {
            console.error("[心宠] 对话记录同步失败:", syncError)
            return { created: 0, sessionId: null }
          }),
        ])
      : [{ created: 0 }, { created: 0, sessionId: null }]
    return NextResponse.json({ data: { ...status, transcript, events, workOrderSync, conversationSync } })
  } catch (error) {
    const status = isClawBodyUnavailable(error) ? 503 : ((error as Error & { status?: number }).status || 502)
    return NextResponse.json({ message: (error as Error).message }, { status })
  }
}
