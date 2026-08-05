import assert from "node:assert/strict"
import test from "node:test"

import {
  MAX_LOG_ITEMS,
  clampPose,
  clampVolume,
  isDeviceActionAvailable,
  isMotorControlAvailable,
  mergeReachyLogs,
  sanitizePetFacingDeviceSnapshot,
  toPetFacingText,
  scheduleSafePoseCommand,
  type ReachyPose,
} from "./reachy-ready-console-state"

test("removes hardware brand names from every user-facing device field", () => {
  assert.equal(toPetFacingText("Reachy Mini Lite is ready"), "心宠 is ready")
  assert.equal(toPetFacingText("reachy_mini.media connected"), "心宠.media connected")
  assert.equal(toPetFacingText("Reachy camera"), "心宠 camera")

  const safe = sanitizePetFacingDeviceSnapshot({
    phase: "error",
    operation_id: null,
    devices: [{ port: "COM5", label: "Reachy Mini Lite (COM5)", vid: "1A86", pid: "55D3" }],
    serial_port: null,
    daemon_owned: false,
    daemon_pid: null,
    daemon_version: null,
    daemon_state: "error",
    motor_mode: null,
    media: { camera: "unknown", microphone: "unknown", speaker: "unknown", input_volume: null, output_volume: null },
    clawbody_reachable: false,
    session: { running: false, state: "idle" },
    error: { code: "DEVICE_ERROR", phase: "error", message: "Reachy device failed", detail: "reachy_mini detail" },
    logs: { cursor: 1, items: [{ id: 1, level: "error", message: "reachymini_webrtc stopped", created_at: "2026-07-23T00:00:00Z" }] },
  })

  assert.equal(safe.devices[0].label, "心宠 (COM5)")
  assert.equal(safe.error?.message, "心宠 device failed")
  assert.equal(safe.error?.detail, "心宠 detail")
  assert.equal(safe.logs.items[0].message, "心宠_webrtc stopped")
})

const neutralPose: ReachyPose = {
  headPitch: 0,
  headRoll: 0,
  headYaw: 0,
  bodyYaw: 0,
  leftAntenna: 0,
  rightAntenna: 0,
}

test("pose and volume inputs are clamped to the Host Bridge contract", () => {
  assert.deepEqual(
    clampPose({
      headPitch: 80,
      headRoll: -80,
      headYaw: 100,
      bodyYaw: -300,
      leftAntenna: 4,
      rightAntenna: -4,
    }),
    {
      headPitch: 40,
      headRoll: -40,
      headYaw: 65,
      bodyYaw: -180,
      leftAntenna: 3.1416,
      rightAntenna: -3.1416,
    },
  )
  assert.deepEqual(clampPose(neutralPose), neutralPose)
  assert.equal(clampVolume(43.7), 44)
  assert.equal(clampVolume(-1), 0)
  assert.equal(clampVolume(101), 100)
})

test("movement is available only for a ready device with enabled motors", () => {
  assert.equal(isMotorControlAvailable("ready", "enabled"), true)
  assert.equal(isMotorControlAvailable("ready", "ENABLED"), true)
  assert.equal(isMotorControlAvailable("ready", "disabled"), false)
  assert.equal(isMotorControlAvailable("healthchecking", "enabled"), false)
  assert.equal(isMotorControlAvailable("ready", null), false)
})

test("wake remains available for a ready sleeping device while movement stays gated", () => {
  assert.equal(isDeviceActionAvailable("wake_up", "ready", "disabled"), true)
  assert.equal(isDeviceActionAvailable("center", "ready", "disabled"), false)
  assert.equal(isDeviceActionAvailable("goto_sleep", "ready", "enabled"), true)
  assert.equal(isDeviceActionAvailable("wake_up", "healthchecking", "disabled"), false)
})

test("delayed pose rechecks the latest device safety state before sending", (context) => {
  context.mock.timers.enable({ apis: ["setTimeout"] })
  let latest = { phase: "ready" as const, motor_mode: "enabled" as string | null }
  const sent: unknown[] = []

  scheduleSafePoseCommand(neutralPose, () => latest, (command) => {
    sent.push(command)
  }, 100)
  latest = { phase: "ready", motor_mode: "disabled" }
  context.mock.timers.tick(100)

  assert.deepEqual(sent, [])
})

test("delayed pose sends the bounded command when the latest state stays safe", (context) => {
  context.mock.timers.enable({ apis: ["setTimeout"] })
  const sent: unknown[] = []

  scheduleSafePoseCommand(
    { ...neutralPose, headYaw: 100 },
    () => ({ phase: "ready", motor_mode: "enabled" }),
    (command) => {
      sent.push(command)
    },
    100,
  )
  context.mock.timers.tick(100)

  assert.deepEqual(sent, [{
    action: "pose",
    ...neutralPose,
    headYaw: 65,
    duration: 0.3,
  }])
})

test("incremental logs append newer ids only and retain the newest 300 entries", () => {
  const existing = {
    cursor: 2,
    items: [
      { id: 1, level: "info", message: "one", created_at: "2026-07-21T00:00:01Z" },
      { id: 2, level: "info", message: "two", created_at: "2026-07-21T00:00:02Z" },
    ],
  }
  const merged = mergeReachyLogs(existing, {
    cursor: 4,
    items: [
      { id: 2, level: "warning", message: "duplicate", created_at: "2026-07-21T00:00:02Z" },
      { id: 4, level: "error", message: "four", created_at: "2026-07-21T00:00:04Z" },
      { id: 3, level: "debug", message: "three", created_at: "2026-07-21T00:00:03Z" },
    ],
  })

  assert.deepEqual(merged.items.map((entry) => entry.id), [1, 2, 3, 4])
  assert.equal(merged.cursor, 4)

  const many = mergeReachyLogs(
    { cursor: 0, items: [] },
    {
      cursor: MAX_LOG_ITEMS + 5,
      items: Array.from({ length: MAX_LOG_ITEMS + 5 }, (_, index) => ({
        id: index + 1,
        level: "info",
        message: `line ${index + 1}`,
        created_at: "2026-07-21T00:00:00Z",
      })),
    },
  )
  assert.equal(many.items.length, MAX_LOG_ITEMS)
  assert.equal(many.items[0].id, 6)
  assert.equal(many.items.at(-1)?.id, MAX_LOG_ITEMS + 5)
})
