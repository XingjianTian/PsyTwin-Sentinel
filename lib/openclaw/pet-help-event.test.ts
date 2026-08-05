import assert from "node:assert/strict"
import test from "node:test"
import { getPetSyncUrl, sendPetHelpEvent } from "./pet-help-event"

test("reuses the public pet sync host when no HTTP override is configured", () => {
  assert.equal(
    getPetSyncUrl({ NEXT_PUBLIC_PET_SYNC_HOST: "192.168.0.102" } as NodeJS.ProcessEnv),
    "http://192.168.0.102:13002",
  )
  assert.equal(
    getPetSyncUrl({
      NEXT_PUBLIC_PET_SYNC_HOST: "192.168.0.102",
      PET_SYNC_URL: "https://pet-sync.example.com/",
    } as NodeJS.ProcessEnv),
    "https://pet-sync.example.com",
  )
})

test("sends an idempotent help event to the shared demo pet", async () => {
  let capturedUrl = ""
  let capturedInit: RequestInit | undefined
  const request = async (url: string | URL | Request, init?: RequestInit) => {
    capturedUrl = String(url)
    capturedInit = init
    return new Response(JSON.stringify({
      code: 0,
      data: { event: { id: "sentinel_req-1" }, created: true },
    }))
  }

  const result = await sendPetHelpEvent({
    sourceId: "req-1",
    severity: "low",
    title: "最近有点担心你",
    description: "如果感到焦虑或疲惫，可以和咨询师聊聊天。",
  }, request as typeof fetch)

  assert.match(capturedUrl, /\/api\/pet\/events\/notify$/)
  assert.equal(capturedInit?.method, "POST")
  assert.deepEqual(JSON.parse(String(capturedInit?.body)), {
    userId: "demo_pet",
    event: {
      sourceId: "req-1",
      severity: "low",
      title: "最近有点担心你",
      description: "如果感到焦虑或疲惫，可以和咨询师聊聊天。",
    },
  })
  assert.deepEqual(result, { id: "sentinel_req-1", created: true })
})

test("reports an upstream rejection without hiding its message", async () => {
  const request = async () => new Response(
    JSON.stringify({ code: 401, message: "无权写入心宠事件" }),
    { status: 401 },
  )

  await assert.rejects(
    sendPetHelpEvent({ sourceId: "req-2", title: "提醒", description: "内容" }, request as typeof fetch),
    /无权写入心宠事件/,
  )
})
