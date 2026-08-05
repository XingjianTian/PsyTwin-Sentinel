import { classifyMessageRisk, getRiskPresentation, highestRiskLevel, type RiskLevel } from "@/lib/pet-ai/risk-presentation"

export type GeminiLiveMessage = {
  id: string
  role: "student" | "pet"
  content: string
  riskLevel: RiskLevel
  createdAt: string
  seq: number
}

export type GeminiLiveCollaborationEvent = {
  id: number
  kind: "emotion" | "handoff" | "professional" | "relay" | "tts"
  status: "complete" | "fallback" | "error"
  title: string
  summary: string
  risk_level: RiskLevel
  created_at: string
}

function eventId(createdAt: string, sequence: number) {
  const timestamp = Date.parse(createdAt)
  const base = Number.isFinite(timestamp) ? timestamp * 10 : sequence * 10
  return base + sequence
}

function safeCreatedAt(value: string) {
  return Number.isNaN(Date.parse(value)) ? new Date().toISOString() : value
}

export function buildGeminiLiveCollaborationEvents(messages: ReadonlyArray<GeminiLiveMessage>) {
  const events: GeminiLiveCollaborationEvent[] = []
  let sequence = 0

  messages.forEach((message, index) => {
    if (message.role !== "student") return

    const riskLevel = highestRiskLevel(message.riskLevel, classifyMessageRisk(message.content))
    const risk = getRiskPresentation(riskLevel)
    const createdAt = safeCreatedAt(message.createdAt)
    events.push({
      id: eventId(createdAt, sequence++),
      kind: "emotion",
      status: "complete",
      title: riskLevel === "LOW" ? "学生表达已识别" : `识别到${risk.label}表达`,
      summary: riskLevel === "LOW"
        ? `已收到学生原话：“${message.content.slice(0, 120)}”`
        : `学生原话：“${message.content.slice(0, 120)}”，已按统一风险规则标记为${risk.label}。`,
      risk_level: riskLevel,
      created_at: createdAt,
    })

    if (riskLevel !== "LOW") {
      events.push({
        id: eventId(createdAt, sequence++),
        kind: "handoff",
        status: "complete",
        title: "已进入咨询师关注队列",
        summary: "已创建待处理风险工单，等待咨询师进一步关注；这里不展示模型原始思维链。",
        risk_level: riskLevel,
        created_at: createdAt,
      })
      events.push({
        id: eventId(createdAt, sequence++),
        kind: "professional",
        status: "complete",
        title: "咨询师智能体专业建议",
        summary: riskLevel === "HIGH" || riskLevel === "CRITICAL"
          ? "已生成关注建议：立即联系学生，完成安全确认和危机风险评估，必要时启动校内危机干预流程。"
          : "已生成关注建议：尽快关注学生，并安排心理咨询或持续跟进。",
        risk_level: riskLevel,
        created_at: createdAt,
      })
    }

    const reply = messages.slice(index + 1).find((candidate) => candidate.role === "pet")
    if (!reply) return

    const replyCreatedAt = safeCreatedAt(reply.createdAt)
    events.push({
      id: eventId(replyCreatedAt, sequence++),
      kind: "relay",
      status: "complete",
      title: "心宠回应已生成",
      summary: `已依据当前心宠性格配置生成回复：“${reply.content.slice(0, 120)}”`,
      risk_level: riskLevel,
      created_at: replyCreatedAt,
    })
    events.push({
      id: eventId(replyCreatedAt, sequence++),
      kind: "tts",
      status: "complete",
      title: "Gemini Live 语音已播放",
      summary: "原生语音已发送到实体心宠扬声器，未播放 Reachy 动作库音效。",
      risk_level: riskLevel,
      created_at: replyCreatedAt,
    })
  })

  return events
}
