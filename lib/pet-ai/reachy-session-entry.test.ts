import assert from "node:assert/strict"
import test from "node:test"

import { getReachySessionEntryPresentation } from "./reachy-session-entry"

const demoStudent = {
  isDemoStudent: true,
  running: false,
  serviceError: "",
}

test("session entry stays disabled while ClawBody status is being checked", () => {
  const result = getReachySessionEntryPresentation({
    ...demoStudent,
    availability: "checking",
    serviceState: "offline",
  })

  assert.equal(result.canStart, false)
  assert.match(result.reason, /正在检查 ClawBody/)
})

test("offline session entry is disabled and re-enabled after a healthy status", () => {
  const offline = getReachySessionEntryPresentation({
    ...demoStudent,
    availability: "unavailable",
    serviceState: "offline",
    serviceError: "心宠设备服务暂不可用",
  })
  const recovered = getReachySessionEntryPresentation({
    ...demoStudent,
    availability: "available",
    serviceState: "idle",
  })

  assert.equal(offline.canStart, false)
  assert.match(offline.reason, /ClawBody 未连接/)
  assert.equal(recovered.canStart, true)
  assert.equal(recovered.reason, "")
})

test("a successful offline status still blocks session entry", () => {
  const result = getReachySessionEntryPresentation({
    ...demoStudent,
    availability: "available",
    serviceState: "offline",
  })

  assert.equal(result.canStart, false)
  assert.match(result.reason, /ClawBody 未连接/)
})
