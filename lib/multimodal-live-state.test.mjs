import test from "node:test"
import assert from "node:assert/strict"

const liveState = await import("./multimodal-live-state.ts")

test("creates an idle realtime student without fake sensor readings", () => {
  const student = liveState.createIdleRealtimeStudent()

  assert.equal(student.id, "stu-test")
  assert.deepEqual(student.vitals, {
    heartRate: 0,
    hrv: 0,
    bloodOxygen: 0,
    gsr: 0,
    stress: 0,
  })
  assert.deepEqual(student.voice, {
    sentiment: "neutral",
    tremorIndex: 0,
    emotionLabel: "未知",
  })
  assert.deepEqual(student.expression, {
    primary: "unknown",
    anxiety: 0,
    sadness: 0,
    anger: 0,
  })
  assert.deepEqual(student.behavior, {
    interactionFreq: 0,
    handTremor: 0,
    responseDelay: 0,
    avoidanceCount: 0,
  })
})
