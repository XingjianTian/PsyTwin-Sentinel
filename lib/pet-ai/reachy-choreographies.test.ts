import assert from "node:assert/strict"
import test from "node:test"

import {
  REACHY_CHOREOGRAPHY_NAMES,
  REACHY_DANCES,
  REACHY_EMOTIONS,
} from "./reachy-choreographies"

test("complete expression and dance libraries stay unique and mapped to fixed kinds", () => {
  assert.equal(REACHY_EMOTIONS.length, 81)
  assert.equal(REACHY_CHOREOGRAPHY_NAMES.dance.length, 20)
  assert.equal(REACHY_CHOREOGRAPHY_NAMES.music.length, 14)
  assert.equal(REACHY_DANCES.length, 34)

  assert.equal(new Set(REACHY_EMOTIONS.map((item) => item.name)).size, REACHY_EMOTIONS.length)
  assert.equal(new Set(REACHY_DANCES.map((item) => `${item.kind}:${item.name}`)).size, REACHY_DANCES.length)
  assert.ok(REACHY_EMOTIONS.every((item) => item.kind === "emotion" && item.label && item.emoji))
  assert.ok(REACHY_DANCES.every((item) => item.kind !== "emotion" && item.label && item.emoji))
})
