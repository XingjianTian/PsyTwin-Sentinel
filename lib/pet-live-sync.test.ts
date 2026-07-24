import assert from "node:assert/strict"
import test from "node:test"

import {
  buildPocketPetWebSocketBaseUrl,
  buildPocketPetWebSocketUrl,
  DEFAULT_POCKET_SCENE_ID,
  getPocketScenePresentation,
  mergePocketPetLiveLogs,
  parsePocketPetStatusMessage,
  POCKET_PET_ANIMATION_FRAMES,
} from "./pet-live-sync"

test("builds the fixed LAN service URL from only a host IP", () => {
  assert.equal(
    buildPocketPetWebSocketBaseUrl("192.168.0.105"),
    "ws://192.168.0.105:13002/ws/pet",
  )
  assert.equal(
    buildPocketPetWebSocketBaseUrl("  "),
    "ws://127.0.0.1:13002/ws/pet",
  )
})

test("builds the Sentinel observer WebSocket URL without dropping existing query values", () => {
  assert.equal(
    buildPocketPetWebSocketUrl("ws://127.0.0.1:13002/ws/pet?source=dashboard", "demo_pet"),
    "ws://127.0.0.1:13002/ws/pet?source=dashboard&userId=demo_pet&clientType=sentinel",
  )
})

test("uses the same 45 sampled animation frames as Pocket", () => {
  assert.equal(POCKET_PET_ANIMATION_FRAMES.length, 45)
  assert.equal(
    POCKET_PET_ANIMATION_FRAMES[0],
    "/pet/pocket-live/frames/000_eef1e56dfae4dd8b436c47ebea8d33bc_0.png",
  )
  assert.equal(
    POCKET_PET_ANIMATION_FRAMES.at(-1),
    "/pet/pocket-live/frames/233_eef1e56dfae4dd8b436c47ebea8d33bc_308.png",
  )
})

test("parses Pocket pet_status and maps social to sociability", () => {
  const result = parsePocketPetStatusMessage(
    JSON.stringify({
      type: "pet_status",
      payload: {
        userId: "demo_pet",
        status: {
          mood: 72,
          energy: 64,
          social: 51,
          sceneId: "picnic_lawn",
          activity: "在草坪上野餐",
        },
        stateVersion: 12,
        updatedAt: 1_720_000_000_000,
      },
    }),
    11,
  )

  assert.deepEqual(result, {
    mood: 72,
    energy: 64,
    sociability: 51,
    sceneId: "picnic_lawn",
    sceneName: "野餐草坪",
    sceneBackgroundSrc: "/pet/pocket-live/scenes/picnic_lawn.png",
    activity: "在草坪上野餐",
    stateVersion: 12,
    updatedAt: 1_720_000_000_000,
  })
})

test("turns server activity logs into recent location-aware pet logs", () => {
  const result = parsePocketPetStatusMessage({
    type: "pet_status",
    payload: {
      status: {
        sceneId: "psychological_room",
        activityLog: {
          "2026-07-22": [
            { time: "10:00", type: "scene_change", scene: "picnic_lawn" },
            { time: "10:01", type: "event", desc: "发现了一些有趣的东西" },
            { time: "10:02", type: "status_change", mood: 68, energy: 72, social: 55 },
          ],
        },
      },
      stateVersion: 8,
    },
  })

  assert.deepEqual(result?.logs, [
    {
      id: "2026-07-22-10:02-2",
      date: "2026-07-22",
      time: "10:02",
      timestamp: Date.parse("2026-07-22T02:02:00Z"),
      type: "status_change",
      title: "状态更新",
      detail: "在野餐草坪活动，心情 68 · 能量 72 · 社交 55",
      sceneId: "picnic_lawn",
      sceneName: "野餐草坪",
      mood: 68,
      energy: 72,
      sociability: 55,
    },
    {
      id: "2026-07-22-10:01-1",
      date: "2026-07-22",
      time: "10:01",
      timestamp: Date.parse("2026-07-22T02:01:00Z"),
      type: "event",
      title: "发现了一些有趣的东西",
      detail: "发生地点：野餐草坪",
      sceneId: "picnic_lawn",
      sceneName: "野餐草坪",
    },
    {
      id: "2026-07-22-10:00-0",
      date: "2026-07-22",
      time: "10:00",
      timestamp: Date.parse("2026-07-22T02:00:00Z"),
      type: "scene_change",
      title: "前往野餐草坪",
      detail: "心宠的位置已同步到野餐草坪。",
      sceneId: "picnic_lawn",
      sceneName: "野餐草坪",
    },
  ])
})

test("uses the authoritative timestamp from a four-second server event", () => {
  const updatedAt = Date.parse("2026-07-24T08:00:04Z")
  const result = parsePocketPetStatusMessage({
    type: "pet_status",
    payload: {
      status: {
        mood: 64,
        energy: 70,
        social: 52,
        sceneId: "library",
        activityLog: {
          "2026-07-24": [
            { time: "16:00:04", timestamp: updatedAt, type: "event", desc: "遇到了小惊喜" },
          ],
        },
      },
      stateVersion: 21,
      updatedAt,
    },
  })

  assert.deepEqual(result?.logs?.[0], {
    id: `2026-07-24-16:00:04-${updatedAt}`,
    date: "2026-07-24",
    time: "16:00:04",
    timestamp: updatedAt,
    type: "event",
    title: "遇到了小惊喜",
    detail: "发生地点：图书馆",
    sceneId: "library",
    sceneName: "图书馆",
  })
})

test("does not invent a log when the server status contains no activity log", () => {
  const result = parsePocketPetStatusMessage({
    type: "pet_status",
    payload: {
      status: { mood: 64, energy: 70, social: 52, sceneId: "library" },
      stateVersion: 21,
      updatedAt: Date.parse("2026-07-24T08:00:04Z"),
    },
  })

  assert.equal(result?.logs, undefined)
})

test("corrects legacy activity logs that are eight hours ahead", () => {
  const updatedAt = Date.parse("2026-07-24T08:00:05Z")
  const result = parsePocketPetStatusMessage({
    type: "pet_status",
    payload: {
      status: {
        sceneId: "bedroom",
        activityLog: {
          "2026-07-24": [
            { time: "23:59", type: "event", desc: "感到有点孤单" },
          ],
        },
      },
      stateVersion: 22,
      updatedAt,
    },
  })

  assert.equal(result?.logs?.[0].time, "15:59:00")
  assert.equal(result?.logs?.[0].timestamp, Date.parse("2026-07-24T07:59:00Z"))
})

test("keeps new authoritative server events ahead of corrected legacy logs", () => {
  const updatedAt = Date.parse("2026-07-24T08:17:48Z")
  const result = parsePocketPetStatusMessage({
    type: "pet_status",
    payload: {
      status: {
        sceneId: "playground",
        activityLog: {
          "2026-07-24": [
            { time: "23:56", type: "event", desc: "旧日志" },
            { time: "16:17:48", timestamp: updatedAt, type: "event", desc: "感到有点孤单" },
          ],
        },
      },
      stateVersion: 23,
      updatedAt,
    },
  })

  assert.equal(result?.logs?.[0].title, "感到有点孤单")
  assert.equal(result?.logs?.[0].time, "16:17:48")
  assert.equal(result?.logs?.[0].timestamp, updatedAt)
  assert.equal(result?.logs?.[1].time, "15:56:00")
})

test("keeps the newest six live logs when four-second updates arrive", () => {
  const makeLog = (version: number) => ({
    id: `live-${version}`,
    date: "2026-07-24",
    time: `16:00:${String(version).padStart(2, "0")}`,
    timestamp: version * 1000,
    type: "status_change" as const,
    title: "状态更新",
    detail: "实时状态",
    sceneId: "library",
    sceneName: "图书馆",
  })

  const result = mergePocketPetLiveLogs(
    [1, 2, 3, 4, 5, 6].map(makeLog),
    [makeLog(7), makeLog(6)],
  )

  assert.deepEqual(result.map((log) => log.id), [
    "live-7",
    "live-6",
    "live-5",
    "live-4",
    "live-3",
    "live-2",
  ])
})

test("clamps numeric metrics and drops invalid optional fields", () => {
  const result = parsePocketPetStatusMessage({
    type: "pet_status",
    payload: {
      status: {
        mood: 130,
        energy: -8,
        social: "unknown",
        sceneId: 42,
        activity: "",
      },
      stateVersion: 3,
      updatedAt: 2_000,
    },
  })

  assert.deepEqual(result, {
    mood: 100,
    energy: 0,
    stateVersion: 3,
    updatedAt: 2_000,
  })
})

test("rejects stale versions, malformed JSON and unrelated messages", () => {
  assert.equal(
    parsePocketPetStatusMessage({
      type: "pet_status",
      payload: { status: { mood: 80 }, stateVersion: 4 },
    }, 5),
    null,
  )
  assert.equal(parsePocketPetStatusMessage("{bad-json"), null)
  assert.equal(parsePocketPetStatusMessage({ type: "heartbeat_ack", payload: {} }), null)
})

test("maps known scenes and falls back to the bedroom background", () => {
  assert.deepEqual(getPocketScenePresentation("psychological_room"), {
    sceneId: "psychological_room",
    sceneName: "心理咨询室",
    sceneBackgroundSrc: "/pet/pocket-live/scenes/psychological_room.png",
  })

  assert.deepEqual(getPocketScenePresentation("missing_scene"), {
    sceneId: "missing_scene",
    sceneName: "missing_scene",
    sceneBackgroundSrc: `/pet/pocket-live/scenes/${DEFAULT_POCKET_SCENE_ID}.png`,
  })
})
