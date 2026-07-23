import assert from "node:assert/strict"
import test from "node:test"

import {
  buildPocketPetWebSocketBaseUrl,
  buildPocketPetWebSocketUrl,
  DEFAULT_POCKET_SCENE_ID,
  getPocketScenePresentation,
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
      type: "scene_change",
      title: "前往野餐草坪",
      detail: "心宠的位置已同步到野餐草坪。",
      sceneId: "picnic_lawn",
      sceneName: "野餐草坪",
    },
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
