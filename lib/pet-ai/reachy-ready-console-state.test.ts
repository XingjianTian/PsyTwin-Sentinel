import assert from "node:assert/strict"
import test from "node:test"

import {
  MAX_LOG_ITEMS,
  clampPose,
  clampVolume,
  isMotorControlAvailable,
  mergeReachyLogs,
  type ReachyPose,
} from "./reachy-ready-console-state"

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
