import { NextRequest, NextResponse } from "next/server"

import { isClawBodyUnavailable, requestClawBody } from "@/lib/pet-ai/clawbody-client"

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
    return NextResponse.json({ data: { ...status, transcript, events } })
  } catch (error) {
    const status = isClawBodyUnavailable(error) ? 503 : ((error as Error & { status?: number }).status || 502)
    return NextResponse.json({ message: (error as Error).message }, { status })
  }
}
