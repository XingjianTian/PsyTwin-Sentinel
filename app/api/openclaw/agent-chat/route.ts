import { NextRequest, NextResponse } from "next/server"
import { getOpenClawGatewayConfig } from "@/lib/openclaw/config"
import { openClawEventBus, OPENCLAW_EVENTS } from "@/lib/openclaw/event-bus"
import { prisma } from "@/lib/prisma"
import { AGENTS } from "@/lib/openclaw/agents.config"

const db = prisma as any

function nowTime() {
  return new Date().toLocaleTimeString("zh-CN", { hour12: false })
}

function detectSubAgentFromText(text?: string): string | null {
  if (!text) return null
  const agentKeywords: Record<string, string[]> = {
    Collector: ["采集员", "采集"],
    Therapist: ["咨询师", "咨询"],
    Relayer: ["中继工程师", "中继"],
    DBA: ["数据哨兵", "哨兵", "DBA"],
    Analyst: ["分析师", "分析"],
  }
  for (const [id, keywords] of Object.entries(agentKeywords)) {
    for (const keyword of keywords) {
      if (text.includes(keyword)) return id
    }
  }
  return null
}

async function emitSubAgentEvents(requestId: string, responseText: string) {
  const agentKeywords: Record<string, string[]> = {
    Collector: ["采集员", "采集"],
    Therapist: ["咨询师", "咨询"],
    Relayer: ["中继工程师", "中继"],
    DBA: ["数据哨兵", "哨兵", "DBA"],
    Analyst: ["分析师", "分析"],
  }

  function extractChinesePreview(text: string): string {
    const chineseOnly = text.replace(/[^\u4e00-\u9fa5]/g, " ")
    const words = chineseOnly.split(/\s+/).filter(w => w.length >= 2)
    const seen = new Set<string>()
    const deduped: string[] = []
    for (const word of words) {
      if (!seen.has(word)) {
        seen.add(word)
        deduped.push(word)
      }
    }
    return deduped.slice(0, 10).join(" ")
  }

  for (const [subAgent, keywords] of Object.entries(agentKeywords)) {
    let keywordLineIndex = -1
    for (const keyword of keywords) {
      const idx = responseText.indexOf(keyword)
      if (idx !== -1) {
        const lineIdx = responseText.substring(0, idx).split("\n").length - 1
        keywordLineIndex = lineIdx
        break
      }
    }
    if (keywordLineIndex === -1) continue

    const agentMeta = AGENTS[subAgent as keyof typeof AGENTS]

    let subAgentText = ""
    const lines = responseText.split("\n")
    for (let i = keywordLineIndex + 1; i < Math.min(keywordLineIndex + 12, lines.length); i++) {
      const line = lines[i]
      if (line.trim().startsWith("**") && line.trim().endsWith("**")) continue
      if (line.trim().startsWith("```")) continue
      if (line.trim().startsWith("首席")) continue
      subAgentText += line + "\n"
      if (subAgentText.length > 500) break
    }

    const message = subAgentText.trim() || "已处理"

    await openClawEventBus.emit(OPENCLAW_EVENTS.WORKFLOW_EVENT, {
      id: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      requestId,
      agentId: subAgent,
      agentName: agentMeta?.name || subAgent,
      agentColor: agentMeta?.color || "#64748b",
      state: "completed",
      message,
      time: nowTime(),
      timestamp: Date.now(),
      type: "subagent.response",
    })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { agentId, message } = body

    const { url: gatewayUrl, token } = getOpenClawGatewayConfig()
    const targetUrl = gatewayUrl || "http://localhost:18789"

    const runId = `sse-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

    const dbRequest = await db.openClawRequest.create({
      data: {
        runId,
        source: "sse_stream",
        content: message,
        state: "RECEIVED",
        assignedAgentId: agentId,
      },
    })

    await openClawEventBus.emit(OPENCLAW_EVENTS.REQUEST_UPDATE, {
      id: dbRequest.id,
      runId: dbRequest.runId,
      content: dbRequest.content,
      state: "received",
      assignedTo: dbRequest.assignedAgentId,
      agentName: agentId,
      agentColor: "#64748b",
      createdAt: dbRequest.createdAt.getTime(),
      completedAt: null,
    })

    await openClawEventBus.emit(OPENCLAW_EVENTS.WORKFLOW_EVENT, {
      id: `evt-${Date.now()}`,
      requestId: dbRequest.id,
      agentId: agentId,
      agentName: agentId,
      agentColor: "#64748b",
      state: "in_progress",
      message: "开始处理请求",
      time: nowTime(),
      timestamp: Date.now(),
      type: "request.start",
    })

    const response = await fetch(`${targetUrl}/v1/responses`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "x-openclaw-agent-id": agentId,
      },
      body: JSON.stringify({
        model: "openclaw",
        input: message,
        user: "psytwin",
        stream: true,
      }),
    })

    if (!response.ok) {
      throw new Error(`Gateway error: ${response.status}`)
    }

    const reader = response.body?.getReader()
    if (!reader) {
      throw new Error("No response body")
    }

    const decoder = new TextDecoder()
    let buffer = ""
    let finalResponse = ""
    let eventType = ""
    let eventData = ""

    // main 是编排者，会自动委派给子代理。SSE 事件不包含子代理 ID，
    // 为避免活动日志过于嘈杂，当目标是 main 时过滤掉中间 delta 事件
    const isMainOrchestrator = agentId === "main"

    const processEvent = async (type: string, data: string) => {
      try {
        const json = JSON.parse(data)

        if (type === "response.in_progress") {
          eventType = "in_progress"
          await db.openClawRequest.update({
            where: { id: dbRequest.id },
            data: { state: "ANALYZING" },
          })
          await openClawEventBus.emit(OPENCLAW_EVENTS.REQUEST_UPDATE, {
            id: dbRequest.id,
            runId: dbRequest.runId,
            content: dbRequest.content,
            state: "analyzing",
            assignedTo: dbRequest.assignedAgentId,
            agentName: agentId,
            agentColor: "#64748b",
            createdAt: dbRequest.createdAt.getTime(),
            completedAt: null,
          })
        } else if (type === "response.output_text.delta" || type === "response.content_part.added") {
          const text = json.delta || json.part?.content?.[0]?.text || ""
          if (text) {
            finalResponse += text
            if (isMainOrchestrator) return
          }
        } else if (type === "response.completed") {
          await db.openClawRequest.update({
            where: { id: dbRequest.id },
            data: {
              state: "COMPLETED",
              completedAt: new Date(),
              result: finalResponse.slice(0, 200),
            },
          })

          await openClawEventBus.emit(OPENCLAW_EVENTS.REQUEST_UPDATE, {
            id: dbRequest.id,
            runId: dbRequest.runId,
            content: dbRequest.content,
            state: "completed",
            assignedTo: dbRequest.assignedAgentId,
            agentName: agentId,
            agentColor: "#64748b",
            createdAt: dbRequest.createdAt.getTime(),
            completedAt: Date.now(),
          })

          if (isMainOrchestrator) {
            await emitSubAgentEvents(dbRequest.id, finalResponse)
          }

          await openClawEventBus.emit(OPENCLAW_EVENTS.WORKFLOW_EVENT, {
            id: `evt-${Date.now()}`,
            requestId: dbRequest.id,
            agentId: agentId,
            agentName: agentId,
            agentColor: "#64748b",
            state: "completed",
            message: finalResponse.slice(0, 100) || "处理完成",
            time: nowTime(),
            timestamp: Date.now(),
            type: "response.completed",
          })
        } else if (type === "response.failed") {
          await db.openClawRequest.update({
            where: { id: dbRequest.id },
            data: {
              state: "FAILED",
              completedAt: new Date(),
            },
          })

          await openClawEventBus.emit(OPENCLAW_EVENTS.REQUEST_UPDATE, {
            id: dbRequest.id,
            runId: dbRequest.runId,
            content: dbRequest.content,
            state: "failed",
            assignedTo: dbRequest.assignedAgentId,
            agentName: agentId,
            agentColor: "#64748b",
            createdAt: dbRequest.createdAt.getTime(),
            completedAt: Date.now(),
          })
        }
      } catch {}
    }

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split("\n")
        buffer = lines.pop() || ""

        for (const line of lines) {
          if (line.startsWith("event:")) {
            eventType = line.slice(6).trim()
          } else if (line.startsWith("data:")) {
            eventData = line.slice(5).trim()
            if (eventType && eventData) {
              await processEvent(eventType, eventData)
            }
          }
        }
      }
    } finally {
      reader.releaseLock()
    }

    return NextResponse.json({ 
      success: true, 
      response: finalResponse || "处理完成",
      runId,
    })
  } catch (error) {
    console.error("SSE chat error:", error)
    return NextResponse.json(
      { error: { message: error instanceof Error ? error.message : "请求失败" } },
      { status: 500 }
    )
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, x-openclaw-agent-id",
      "Access-Control-Max-Age": "86400",
    },
  })
}
