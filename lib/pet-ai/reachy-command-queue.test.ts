import assert from "node:assert/strict"
import test from "node:test"

import { ReachyCommandQueue } from "./reachy-command-queue"
import type { ReachyDeviceCommand } from "./reachy-device"

function deferred() {
  let resolve!: () => void
  const promise = new Promise<void>((done) => {
    resolve = done
  })
  return { promise, resolve }
}

test("control queue coalesces latest values per key without dropping speaker or microphone", async () => {
  const first = deferred()
  const executed: ReachyDeviceCommand[] = []
  const queue = new ReachyCommandQueue(async (command) => {
    executed.push(command)
    if (executed.length === 1) await first.promise
  })

  const firstSpeaker = queue.enqueue({ action: "volume", target: "speaker", volume: 10 })
  await Promise.resolve()
  const staleSpeaker = queue.enqueue({ action: "volume", target: "speaker", volume: 20 })
  const latestSpeaker = queue.enqueue({ action: "volume", target: "speaker", volume: 30 })
  const microphone = queue.enqueue({ action: "volume", target: "microphone", volume: 40 })

  assert.equal(await staleSpeaker, "superseded")
  first.resolve()
  assert.deepEqual(await Promise.all([firstSpeaker, latestSpeaker, microphone]), [
    "executed",
    "executed",
    "executed",
  ])
  assert.deepEqual(executed, [
    { action: "volume", target: "speaker", volume: 10 },
    { action: "volume", target: "speaker", volume: 30 },
    { action: "volume", target: "microphone", volume: 40 },
  ])
})

test("lifecycle command remains exclusive while it is running", async () => {
  const restart = deferred()
  const executed: ReachyDeviceCommand[] = []
  const queue = new ReachyCommandQueue(async (command) => {
    executed.push(command)
    await restart.promise
  })

  const lifecycle = queue.enqueue({ action: "restart" })
  await Promise.resolve()
  const controlResult = await queue.enqueue({ action: "volume", target: "speaker", volume: 50 })

  assert.equal(controlResult, "rejected")
  assert.deepEqual(executed, [{ action: "restart" }])
  restart.resolve()
  assert.equal(await lifecycle, "executed")
})

test("queued pose rechecks motor safety immediately before network execution", async () => {
  const volume = deferred()
  const executed: ReachyDeviceCommand[] = []
  let motorsEnabled = true
  const queue = new ReachyCommandQueue(async (command) => {
    executed.push(command)
    if (command.action === "volume") await volume.promise
  })

  const volumeCommand = queue.enqueue({
    action: "volume",
    target: "speaker",
    volume: 20,
  })
  await Promise.resolve()
  const poseCommand = queue.enqueue({
    action: "pose",
    headPitch: 0,
    headRoll: 0,
    headYaw: 20,
    bodyYaw: 0,
    leftAntenna: 0,
    rightAntenna: 0,
    duration: 0.3,
  }, () => motorsEnabled)

  motorsEnabled = false
  volume.resolve()

  assert.equal(await volumeCommand, "executed")
  assert.equal(await poseCommand, "skipped")
  assert.deepEqual(executed, [{
    action: "volume",
    target: "speaker",
    volume: 20,
  }])
})
