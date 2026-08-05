import assert from "node:assert/strict"
import test from "node:test"

import { buildGeminiLiveCollaborationEvents, type GeminiLiveMessage } from "./gemini-live"

function makeTurn(content: string, riskLevel: GeminiLiveMessage["riskLevel"] = "LOW"): GeminiLiveMessage[] {
  return [
    { id: "student-1", role: "student", content, riskLevel, createdAt: "2026-08-05T10:00:00.000Z", seq: 1 },
    { id: "pet-1", role: "pet", content: "我听见了，我们可以慢慢聊。", riskLevel, createdAt: "2026-08-05T10:00:01.000Z", seq: 2 },
  ]
}

test("Gemini Live collaboration records the full medium-risk handoff pipeline", () => {
  const events = buildGeminiLiveCollaborationEvents(makeTurn("我晚上总是睡不好，感觉很累。"))

  assert.deepEqual(events.map((event) => event.kind), ["emotion", "handoff", "professional", "relay", "tts"])
  assert.ok(events.every((event) => event.risk_level === "MEDIUM"))
  assert.equal(events.find((event) => event.kind === "handoff")?.title, "已进入咨询师关注队列")
  assert.equal(events.find((event) => event.kind === "professional")?.title, "咨询师智能体专业建议")
  assert.match(events.find((event) => event.kind === "tts")?.summary || "", /未播放 Reachy 动作库音效/)
})

test("low-risk Gemini Live turns still show reply and native audio stages without a handoff", () => {
  const events = buildGeminiLiveCollaborationEvents(makeTurn("今天在操场走了一圈，感觉轻松了一点。"))

  assert.deepEqual(events.map((event) => event.kind), ["emotion", "relay", "tts"])
  assert.ok(events.every((event) => event.risk_level === "LOW"))
})
