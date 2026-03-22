import { NextRequest, NextResponse } from "next/server"
import { getOpenClawGatewayConfig } from "@/lib/openclaw/config"
import { openClawEventBus, OPENCLAW_EVENTS } from "@/lib/openclaw/event-bus"
import { prisma } from "@/lib/prisma"
import { AGENTS } from "@/lib/openclaw/agents.config"
import { verifyToken } from "@/lib/auth"

const db = prisma as any

function nowTime() {
  return new Date().toLocaleTimeString("zh-CN", { hour12: false })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { agentId, message, token } = body

    if (!agentId || !message) {
      return NextResponse.json(
        { error: { message: "缺少必要参数 agentId 或 message" } },
        { status: 400 }
      )
    }

    let studentName = "匿名用户"
    const authHeader = request.headers.get("authorization")
    if (authHeader?.startsWith("Bearer ")) {
      const authToken = authHeader.substring(7)
      const decoded = verifyToken(authToken)
      if (decoded?.userId) {
        const student = await db.student.findFirst({
          where: { id: decoded.userId },
          select: { name: true },
        })
        if (student) {
          studentName = student.name
        }
      }
    }

    const { url: gatewayUrl, token: configToken } = getOpenClawGatewayConfig()
    const targetUrl = gatewayUrl || "http://localhost:18789"
    const authToken = token || configToken

    if (!authToken) {
      return NextResponse.json(
        { error: { message: "未配置 OpenClaw 令牌" } },
        { status: 500 }
      )
    }

    const runId = `pocket-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

    console.log(`[POCKET] New request: agentId=${agentId}, message=${message?.slice(0, 20)}`)

    const recentRequest = await db.openClawRequest.findFirst({
      where: {
        assignedAgentId: agentId,
        content: message,
        source: "pocket_chat",
        createdAt: {
          gte: new Date(Date.now() - 3000),
        },
      },
      orderBy: { createdAt: "desc" },
    })

    if (recentRequest && recentRequest.state !== "FAILED") {
      return NextResponse.json({
        success: true,
        response: recentRequest.result || "处理完成",
        runId: recentRequest.runId,
        duplicate: true,
      })
    }

    const dbRequest = await db.openClawRequest.create({
      data: {
        runId,
        source: "pocket_chat",
        content: message,
        state: "RECEIVED",
        assignedAgentId: agentId,
      },
    })

    console.log(`[POCKET] Created request: ${dbRequest.id}, runId: ${runId}`)

    await openClawEventBus.emit(OPENCLAW_EVENTS.WORKFLOW_EVENT, {
      id: `evt-${Date.now()}`,
      requestId: dbRequest.id,
      agentId: agentId,
      agentName: agentId,
      agentColor: "#64748b",
      state: "in_progress",
      message: `【Pocket小程序】收到${studentName}的咨询`,
      time: nowTime(),
      timestamp: Date.now(),
      type: "pocket.chat",
    })

    console.log(`[POCKET] Emitted pocket.chat event with requestId: ${dbRequest.id}`)

    const response = await fetch(`${targetUrl}/v1/responses`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
        "x-openclaw-agent-id": agentId,
      },
      body: JSON.stringify({
        model: "openclaw",
        input: message,
        user: "pocket_user",
        stream: false,
      }),
    })

    if (!response.ok) {
      throw new Error(`Gateway error: ${response.status}`)
    }

    const data = await response.json()
    const aiResponse = data.output?.[0]?.content?.[0]?.text || data.output || "处理完成"

    await db.openClawRequest.update({
      where: { id: dbRequest.id },
      data: {
        state: "COMPLETED",
        completedAt: new Date(),
        result: aiResponse.slice(0, 2000),
      },
    })

    await openClawEventBus.emit(OPENCLAW_EVENTS.WORKFLOW_EVENT, {
      id: `evt-${Date.now()}`,
      requestId: dbRequest.id,
      agentId: agentId,
      agentName: agentId,
      agentColor: "#64748b",
      state: "completed",
      message: aiResponse.slice(0, 2000),
      time: nowTime(),
      timestamp: Date.now(),
      type: "pocket.completed",
    })

    console.log(`[POCKET] Emitted pocket.completed event with requestId: ${dbRequest.id}`)

    return NextResponse.json({
      success: true,
      response: aiResponse,
      runId,
    })
  } catch (error) {
    console.error("Pocket chat error:", error)
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
