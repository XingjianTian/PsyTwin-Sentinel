import assert from "node:assert/strict"
import test from "node:test"

import { classifyMessageRisk, getRiskPresentation, highestConversationRisk, highestRiskLevel } from "./risk-presentation"

test("risk presentation gives medium and high risk distinct accessible semantics", () => {
  const medium = getRiskPresentation("MEDIUM")
  const high = getRiskPresentation("HIGH")

  assert.equal(medium.label, "中风险")
  assert.match(medium.studentMessageClassName, /amber/)
  assert.match(medium.petMessageClassName, /amber/)
  assert.equal(high.label, "高风险")
  assert.match(high.studentMessageClassName, /red/)
  assert.match(high.petMessageClassName, /red/)
  assert.notEqual(medium.studentMessageClassName, high.studentMessageClassName)
})

test("session risk keeps the highest observed level", () => {
  assert.equal(highestRiskLevel("LOW", "MEDIUM"), "MEDIUM")
  assert.equal(highestRiskLevel("HIGH", "LOW"), "HIGH")
  assert.equal(highestRiskLevel("MEDIUM", "HIGH"), "HIGH")
})

test("message risk classifier distinguishes pressure from immediate danger", () => {
  assert.equal(classifyMessageRisk("今天在操场走了一圈，感觉轻松了一点。"), "LOW")
  assert.equal(classifyMessageRisk("最近复习任务好多，我有点跟不上。"), "MEDIUM")
  assert.equal(classifyMessageRisk("我不知道怎么和室友说自己的感受。"), "MEDIUM")
  assert.equal(classifyMessageRisk("我不想活了，想结束这一切。"), "HIGH")
})

test("conversation risk keeps the highest student-message risk after a live session stops", () => {
  assert.equal(highestConversationRisk([
    { role: "student", content: "今天还不错", riskLevel: "LOW" },
    { role: "student", content: "最近复习任务好多，我有点跟不上。", riskLevel: "LOW" },
    { role: "pet", content: "我会陪着你", riskLevel: "HIGH" },
  ]), "MEDIUM")
})
