import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import test from "node:test"

import {
  getReachyPhasePresentation,
  type ReachyDevicePhase,
} from "./reachy-device"

test("device phases have stable Chinese presentation", () => {
  assert.deepEqual(getReachyPhasePresentation("healthchecking"), {
    label: "健康检查",
    tone: "progress",
  })
  assert.equal(getReachyPhasePresentation("ready").label, "设备就绪")
})

test("every device phase has a browser-safe presentation", () => {
  const phases: ReachyDevicePhase[] = [
    "offline",
    "discovering",
    "starting",
    "connecting",
    "healthchecking",
    "loading_apps",
    "ready",
    "stopping",
    "error",
  ]

  for (const phase of phases) {
    const presentation = getReachyPhasePresentation(phase)
    assert.ok(presentation.label.length > 0)
    assert.ok(["neutral", "progress", "success", "danger"].includes(presentation.tone))
  }
})

test("Host Bridge stays server-only on loopback", async () => {
  const source = await readFile(new URL("./host-bridge-client.ts", import.meta.url), "utf8")
  assert.match(source, /http:\/\/127\.0\.0\.1:7861/)
  assert.match(source, /X-Host-Bridge-Key/)
  assert.doesNotMatch(source, /NEXT_PUBLIC_HOST_BRIDGE/)
})

test("Host Bridge only exposes its fixed device API surface", async () => {
  const source = await readFile(new URL("./host-bridge-client.ts", import.meta.url), "utf8")

  for (const path of [
    '"/v1/device/status"',
    '"/v1/device/discover"',
    '"/v1/device/logs"',
    '"/v1/device/start"',
    '"/v1/device/stop"',
    '"/v1/device/restart"',
    '"/v1/device/action"',
    '"/v1/device/pose"',
    '"/v1/device/volume"',
  ]) {
    assert.match(source, new RegExp(path.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")))
  }
})

test("Host Bridge rejects paths outside its fixed device API surface", async () => {
  const source = await readFile(new URL("./host-bridge-client.ts", import.meta.url), "utf8")

  assert.match(source, /function isHostBridgePath/)
  assert.match(source, /path\.startsWith\("\/v1\/device\/logs\?after="\)/)
})
