import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

import { syncReachyConversation } from "@/lib/pet-ai/reachy-conversation-sync"
import { syncReachyRiskWorkOrders } from "@/lib/pet-ai/reachy-risk-work-order-sync"
import { extractReachyConversationCandidates } from "@/lib/pet-ai/reachy-conversation"
import { classifyMessageRisk, highestRiskLevel } from "@/lib/pet-ai/risk-presentation"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

const inputSchema = z.object({
  studentId: z.string().min(1).max(100),
  messages: z.array(z.object({
    id: z.string().min(1).max(200),
    role: z.enum(["student", "pet"]),
    content: z.string().trim().min(1).max(4_000),
    riskLevel: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).default("LOW"),
    createdAt: z.string().optional(),
    seq: z.number().int().nonnegative().optional(),
  }).strict()).min(1).max(40),
}).strict()

export async function POST(request: NextRequest) {
  const parsed = inputSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ message: "Gemini Live 对话同步参数无效" }, { status: 400 })

  const demoStudentId = process.env.PET_AI_DEMO_STUDENT_ID || "stu-test"
  if (parsed.data.studentId !== demoStudentId) {
    return NextResponse.json({ message: "仅测试学生可以同步 Gemini Live 实时对话" }, { status: 403 })
  }

  const transcript = {
    items: parsed.data.messages.map((message, index) => ({
      id: message.id,
      role: message.role,
      content: message.content,
      risk_level: message.riskLevel,
      created_at: message.createdAt && !Number.isNaN(Date.parse(message.createdAt))
        ? message.createdAt
        : new Date().toISOString(),
      seq: message.seq ?? index,
    })),
  }

  try {
    const [conversationSync, workOrderSync] = await Promise.all([
      syncReachyConversation({ studentId: parsed.data.studentId, transcript }),
      syncReachyRiskWorkOrders({ studentId: parsed.data.studentId, transcript }),
    ])
    const messageIds = extractReachyConversationCandidates({ studentId: parsed.data.studentId, transcript }).map((message) => message.id)
    if (messageIds.length > 0) {
      await prisma.chatMessage.updateMany({
        where: { id: { in: messageIds } },
        data: { cbtCard: { source: "gemini-live" } },
      })
    }
    const riskLevel = parsed.data.messages
      .filter((message) => message.role === "student")
      .reduce(
        (level, message) => highestRiskLevel(level, highestRiskLevel(message.riskLevel, classifyMessageRisk(message.content))),
        "LOW",
      )
    return NextResponse.json({ data: { conversationSync, workOrderSync, riskLevel } })
  } catch (error) {
    console.error("[Gemini Live] 对话同步失败:", error)
    return NextResponse.json({ message: "Gemini Live 对话保存失败，请停止后重试" }, { status: 500 })
  }
}
