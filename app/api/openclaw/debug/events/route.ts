import { NextResponse } from "next/server"

// 简单的内存存储，用于查看最近的网关事件
const recentEvents: Array<{
  timestamp: string
  type: string
  event: string
  payload: any
}> = []

const MAX_EVENTS = 100

export function addGatewayEventLog(type: string, event: string, payload: any) {
  recentEvents.unshift({
    timestamp: new Date().toISOString(),
    type,
    event,
    payload,
  })
  
  // 只保留最近的事件
  if (recentEvents.length > MAX_EVENTS) {
    recentEvents.length = MAX_EVENTS
  }
}

export function getRecentEvents() {
  return recentEvents
}

export async function GET() {
  return NextResponse.json({
    events: recentEvents,
    count: recentEvents.length,
    timestamp: new Date().toISOString(),
  })
}

export async function DELETE() {
  recentEvents.length = 0
  return NextResponse.json({ message: "Event log cleared" })
}
