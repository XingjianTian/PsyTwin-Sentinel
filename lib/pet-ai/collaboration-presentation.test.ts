import assert from "node:assert/strict"
import test from "node:test"

import { getCollaborationEventPresentation } from "./collaboration-presentation"

test("legacy Xiaoxin events are presented as counselor agent events", () => {
  assert.deepEqual(getCollaborationEventPresentation("handoff", "转交小芯 AI"), {
    title: "转交咨询师智能体",
    avatarSrc: null,
  })
  assert.deepEqual(getCollaborationEventPresentation("professional", "小芯专业建议"), {
    title: "咨询师智能体专业建议",
    avatarSrc: "/agents-icons/Therapist.png",
  })
})

test("unrelated collaboration event titles remain unchanged", () => {
  assert.deepEqual(getCollaborationEventPresentation("tts", "百度 TTS 已就绪"), {
    title: "百度 TTS 已就绪",
    avatarSrc: null,
  })
})
