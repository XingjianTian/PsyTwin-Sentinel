import assert from "node:assert/strict"
import test from "node:test"

import {
  acknowledgeRiskWorkOrderNotifications,
  reconcileRiskWorkOrderNotifications,
} from "./risk-work-order-notifications"

test("existing pending work orders become the baseline without creating an unread badge", () => {
  assert.deepEqual(
    reconcileRiskWorkOrderNotifications({ pendingTotal: 8, unseenCount: 0 }, 8, false),
    { pendingTotal: 8, unseenCount: 0 },
  )
})

test("each newly added work order increments the unseen badge", () => {
  assert.deepEqual(
    reconcileRiskWorkOrderNotifications({ pendingTotal: 8, unseenCount: 0 }, 9, false),
    { pendingTotal: 9, unseenCount: 1 },
  )
  assert.deepEqual(
    reconcileRiskWorkOrderNotifications({ pendingTotal: 9, unseenCount: 1 }, 11, false),
    { pendingTotal: 11, unseenCount: 3 },
  )
})

test("viewing the work-order page clears the unseen badge without changing pending data", () => {
  assert.deepEqual(
    reconcileRiskWorkOrderNotifications({ pendingTotal: 11, unseenCount: 3 }, 11, true),
    { pendingTotal: 11, unseenCount: 0 },
  )
  assert.deepEqual(
    acknowledgeRiskWorkOrderNotifications({ pendingTotal: 11, unseenCount: 3 }),
    { pendingTotal: 11, unseenCount: 0 },
  )
})

test("resolving work orders never creates a notification and caps stale unseen counts", () => {
  assert.deepEqual(
    reconcileRiskWorkOrderNotifications({ pendingTotal: 8, unseenCount: 3 }, 2, false),
    { pendingTotal: 2, unseenCount: 2 },
  )
})
