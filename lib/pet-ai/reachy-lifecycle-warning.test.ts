import assert from "node:assert/strict"
import test from "node:test"

import { getReachyLifecycleWarningUpdate } from "./reachy-lifecycle-warning"

test("projects a ClawBody status warning without exposing response detail", () => {
  const update = getReachyLifecycleWarningUpdate({ action: "stop" }, {
    warnings: [{
      code: "clawbody_status_unavailable",
      message: "token=super-secret upstream detail",
    }],
  })

  assert.deepEqual(update, [{
    code: "clawbody_status_unavailable",
    message: "未能确认当前 ClawBody 会话状态；设备已继续停止。",
  }])
  assert.doesNotMatch(JSON.stringify(update), /super-secret/)
})

test("projects a session stop warning without exposing response detail", () => {
  const update = getReachyLifecycleWarningUpdate({ action: "stop" }, {
    warnings: [{
      code: "clawbody_session_stop_failed",
      message: "password=do-not-render raw failure",
    }],
  })

  assert.deepEqual(update, [{
    code: "clawbody_session_stop_failed",
    message: "学生会话停止请求失败；设备已继续停止。",
  }])
  assert.doesNotMatch(JSON.stringify(update), /do-not-render/)
})

test("a successful stop without warnings clears a persistent lifecycle warning", () => {
  assert.deepEqual(
    getReachyLifecycleWarningUpdate({ action: "stop" }, { warnings: [] }),
    [],
  )
})

test("prototype and unknown warning codes are ignored", () => {
  for (const code of ["toString", "constructor", "__proto__", "unknown_warning"]) {
    assert.deepEqual(
      getReachyLifecycleWarningUpdate({ action: "stop" }, {
        warnings: [{ code, message: "must not be rendered" }],
      }),
      [],
      code,
    )
  }
})

test("successful lifecycle commands clear warnings while unrelated commands preserve them", () => {
  assert.deepEqual(getReachyLifecycleWarningUpdate({ action: "start" }, {}), [])
  assert.deepEqual(getReachyLifecycleWarningUpdate({ action: "restart" }, {}), [])
  assert.equal(
    getReachyLifecycleWarningUpdate({ action: "device_action", deviceAction: "center" }, {}),
    null,
  )
})
