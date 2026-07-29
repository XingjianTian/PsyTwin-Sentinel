import { createHash } from "node:crypto"

import { isStudentReachyTranscriptRole } from "@/lib/pet-ai/transcript-role"
import { classifyMessageRisk, highestRiskLevel } from "@/lib/pet-ai/risk-presentation"

export type ReachyConversationRole = "student" | "pet"

export type ReachyConversationCandidate = {
  id: string
  role: ReachyConversationRole
  content: string
  riskLevel: string
  createdAt: Date
  seq: number
}

type UnknownRecord = Record<string, unknown>

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null
}

function parseDate(value: unknown, fallback: Date) {
  if (typeof value !== "string") return fallback
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? fallback : parsed
}

function normalizePetRole(value: unknown): ReachyConversationRole | null {
  if (isStudentReachyTranscriptRole(value)) return "student"
  const normalized = typeof value === "string" ? value.trim().toLowerCase() : ""
  return normalized === "assistant" || normalized === "pet" ? "pet" : null
}

function normalizeRiskLevel(value: unknown, content: string, role: ReachyConversationRole) {
  const declaredLevel = typeof value === "string" ? value.trim().toUpperCase() : "LOW"
  if (role === "student") return highestRiskLevel(declaredLevel, classifyMessageRisk(content))
  return ["LOW", "MEDIUM", "HIGH", "CRITICAL"].includes(declaredLevel) ? declaredLevel : "LOW"
}

export function buildPetLiveChatSessionId(studentId: string, petId: string) {
  const digest = createHash("sha256").update(`${studentId}|${petId}|physical-pet-live`).digest("hex").slice(0, 24)
  return `pet-live-${digest}`
}

export function extractReachyConversationCandidates({
  studentId,
  transcript,
  now = new Date(),
}: {
  studentId: string
  transcript: unknown
  now?: Date
}): ReachyConversationCandidate[] {
  if (!studentId || !isRecord(transcript) || !Array.isArray(transcript.items)) return []

  return transcript.items.flatMap((item) => {
    if (!isRecord(item)) return []
    const role = normalizePetRole(item.role)
    const content = typeof item.content === "string" ? item.content.trim() : ""
    if (!role || !content) return []

    const sourceKey = [studentId, String(item.id ?? ""), String(item.created_at ?? ""), role, content].join("|")
    const digest = createHash("sha256").update(sourceKey).digest("hex").slice(0, 24)
    const seq = Number.isFinite(Number(item.id)) ? Math.max(0, Math.trunc(Number(item.id))) : 0
    return [{
      id: `pet-live-msg-${digest}`,
      role,
      content: content.slice(0, 4000),
      riskLevel: normalizeRiskLevel(item.risk_level, content, role),
      createdAt: parseDate(item.created_at, now),
      seq,
    }]
  })
}
