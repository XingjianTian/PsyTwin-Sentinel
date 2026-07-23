import { createHash } from "node:crypto"

import { isStudentReachyTranscriptRole } from "@/lib/pet-ai/transcript-role"

export type ReachyRiskLevel = "MEDIUM" | "HIGH"

export type ReachyRiskWorkOrderCandidate = {
  id: string
  riskLevel: ReachyRiskLevel
  sourceText: string
  occurredAt: Date
}

type UnknownRecord = Record<string, unknown>

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null
}

function normalizeRiskLevel(value: unknown): ReachyRiskLevel | null {
  const normalized = typeof value === "string" ? value.toUpperCase() : ""
  if (normalized === "MEDIUM") return "MEDIUM"
  if (normalized === "HIGH" || normalized === "CRITICAL") return "HIGH"
  return null
}

function parseDate(value: unknown, fallback: Date) {
  if (typeof value !== "string") return fallback
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? fallback : parsed
}

export function extractReachyRiskWorkOrderCandidates({
  studentId,
  transcript,
  now = new Date(),
}: {
  studentId: string
  transcript: unknown
  now?: Date
}): ReachyRiskWorkOrderCandidate[] {
  if (!studentId || !isRecord(transcript) || !Array.isArray(transcript.items)) return []

  return transcript.items.flatMap((item) => {
    if (!isRecord(item) || !isStudentReachyTranscriptRole(item.role)) return []
    const riskLevel = normalizeRiskLevel(item.risk_level)
    const sourceText = typeof item.content === "string" ? item.content.trim() : ""
    if (!riskLevel || !sourceText) return []

    const sourceKey = [studentId, String(item.id ?? ""), String(item.created_at ?? ""), sourceText].join("|")
    const digest = createHash("sha256").update(sourceKey).digest("hex").slice(0, 24)
    return [{
      id: `reachy-${digest}`,
      riskLevel,
      sourceText: sourceText.slice(0, 500),
      occurredAt: parseDate(item.created_at, now),
    }]
  })
}
