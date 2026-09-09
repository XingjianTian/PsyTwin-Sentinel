import assert from "node:assert/strict"
import test from "node:test"

import { appendActiveCareSuggestion } from "./risk-assessment"

test("appends the active-care suggestion to an intervention line", () => {
  const assessment = "【风险等级评估】：中危（70/100）\n【建议干预方案】：建议辅导员尽快关注，并安排心理咨询或持续跟进。"

  assert.equal(
    appendActiveCareSuggestion(assessment),
    "【风险等级评估】：中危（70/100）\n【建议干预方案】：建议辅导员尽快关注，并安排心理咨询或持续跟进。近期开展一次主动关怀。",
  )
})

test("does not duplicate or alter assessments without an intervention line", () => {
  const assessment = "暂无风险溯源分析报告"

  assert.equal(appendActiveCareSuggestion(assessment), assessment)
  assert.equal(appendActiveCareSuggestion(`${assessment}\n近期开展一次主动关怀。`), `${assessment}\n近期开展一次主动关怀。`)
})
