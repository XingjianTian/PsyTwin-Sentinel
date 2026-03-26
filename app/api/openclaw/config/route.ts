import { NextResponse } from "next/server"

import { prisma } from "@/lib/prisma"

const db = prisma as any

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

// Agent 默认样式映射
const AGENT_STYLES: Record<string, { name?: string; emoji: string; color: string; role: string }> = {
  main: { name: "小芯", emoji: "🧭", color: "#3b82f6", role: "协调中枢" },
  bingbu: { emoji: "🛠️", color: "#22c55e", role: "技术实现" },
  gongbu: { emoji: "⚙️", color: "#f59e0b", role: "工程部署" },
  hubu: { emoji: "💰", color: "#06b6d4", role: "资源管理" },
  libu: { emoji: "🪶", color: "#8b5cf6", role: "文档规范" },
  libu2: { emoji: "📘", color: "#6366f1", role: "人事行政" },
  xingbu: { emoji: "🛡️", color: "#ef4444", role: "安全合规" },
}

function enrichAgent(agent: any) {
  const style = AGENT_STYLES[agent.id]
  if (style) {
    return {
      ...agent,
      name: style.name || agent.name,
      emoji: agent.emoji || style.emoji,
      color: agent.color || style.color,
      role: agent.role || style.role,
    }
  }
  return agent
}

export async function GET() {

  const agents = await db.openClawAgent.findMany({
    orderBy: [{ isOnline: "desc" }, { updatedAt: "desc" }],
  })

  return NextResponse.json({
    office: {
      name: "PsyTwin OpenClaw 编排",
      style: "sentinel-admin",
    },
    agents: agents.map(enrichAgent),
  })
}
