import assert from "node:assert/strict"
import test from "node:test"

import { buildPetLiveChatSessionId, extractReachyConversationCandidates } from "./reachy-conversation"

test("extracts student and pet messages from the physical pet transcript", () => {
  const candidates = extractReachyConversationCandidates({
    studentId: "stu-test",
    transcript: {
      items: [
        { id: 1, role: "user", content: "最近总是睡不着", risk_level: "MEDIUM", created_at: "2026-07-23T10:01:00Z" },
        { id: 2, role: "assistant", content: "我们可以先聊聊最近的作息。", risk_level: "MEDIUM", created_at: "2026-07-23T10:01:02Z" },
        { id: 3, role: "system", content: "internal", risk_level: "LOW", created_at: "2026-07-23T10:01:03Z" },
      ],
    },
  })

  assert.equal(candidates.length, 2)
  assert.deepEqual(candidates.map((item) => item.role), ["student", "pet"])
  assert.deepEqual(candidates.map((item) => item.riskLevel), ["MEDIUM", "MEDIUM"])
})

test("uses stable session and message ids so polling cannot duplicate saved records", () => {
  const input = {
    studentId: "stu-test",
    transcript: { items: [{ id: 1, role: "user", content: "你好", risk_level: "LOW", created_at: "2026-07-23T10:00:00Z" }] },
  }
  const first = extractReachyConversationCandidates(input)
  const second = extractReachyConversationCandidates(input)

  assert.equal(first[0].id, second[0].id)
  assert.equal(buildPetLiveChatSessionId("stu-test", "pet-test"), buildPetLiveChatSessionId("stu-test", "pet-test"))
})
