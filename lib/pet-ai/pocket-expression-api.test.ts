import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import test from "node:test"

test("Pocket expression route maps sad to the fixed sad1 choreography", async () => {
  const routeSource = await readFile(
    new URL("../../app/api/pocket/pet/expression/route.ts", import.meta.url),
    "utf8",
  )

  assert.match(routeSource, /z\.literal\("sad"\)/)
  assert.match(routeSource, /kind: "emotion", move: "sad1"/)
  assert.doesNotMatch(routeSource, /move:\s*parsed\.data/)
})
