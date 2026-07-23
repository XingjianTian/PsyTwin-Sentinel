import assert from "node:assert/strict"
import test from "node:test"

import { extractReachyRiskWorkOrderCandidates } from "./reachy-risk-work-order"

test("creates work-order candidates only for medium and high-risk student utterances", () => {
  const candidates = extractReachyRiskWorkOrderCandidates({
    studentId: "stu-test",
    transcript: {
      items: [
        { id: 1, role: "student", content: "今天还不错", risk_level: "LOW", created_at: "2026-07-23T10:00:00Z" },
        { id: 2, role: "user", content: "最近总是睡不着", risk_level: "MEDIUM", created_at: "2026-07-23T10:01:00Z" },
        { id: 3, role: "pet", content: "我会陪着你", risk_level: "MEDIUM", created_at: "2026-07-23T10:01:01Z" },
        { id: 4, role: "student", content: "我不想活了", risk_level: "CRITICAL", created_at: "2026-07-23T10:02:00Z" },
      ],
    },
  })

  assert.equal(candidates.length, 2)
  assert.deepEqual(candidates.map((candidate) => candidate.riskLevel), ["MEDIUM", "HIGH"])
  assert.deepEqual(candidates.map((candidate) => candidate.sourceText), ["最近总是睡不着", "我不想活了"])
})

test("accepts the user role emitted by the physical pet service and ignores assistant replies", () => {
  const candidates = extractReachyRiskWorkOrderCandidates({
    studentId: "stu-test",
    transcript: {
      items: [
        { id: 8, role: "user", content: "我最近压力很大", risk_level: "MEDIUM", created_at: "2026-07-23T10:04:00Z" },
        { id: 9, role: "assistant", content: "我陪你慢慢说", risk_level: "MEDIUM", created_at: "2026-07-23T10:04:01Z" },
      ],
    },
  })

  assert.equal(candidates.length, 1)
  assert.equal(candidates[0].sourceText, "我最近压力很大")
  assert.equal(candidates[0].riskLevel, "MEDIUM")
})

test("uses a stable candidate id so repeated polling cannot duplicate work orders", () => {
  const input = {
    studentId: "stu-test",
    transcript: { items: [{ id: 7, role: "student", content: "我很焦虑", risk_level: "MEDIUM", created_at: "2026-07-23T10:03:00Z" }] },
  }

  const first = extractReachyRiskWorkOrderCandidates(input)
  const second = extractReachyRiskWorkOrderCandidates(input)
  assert.equal(first[0].id, second[0].id)
  assert.match(first[0].id, /^reachy-[a-f0-9]{24}$/)
})
