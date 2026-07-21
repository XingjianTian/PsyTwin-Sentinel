import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import test from "node:test"

test("only the pet activity panel pauses rotation on hover", async () => {
  const source = await readFile(
    new URL("../components/views/pocket-records-view.tsx", import.meta.url),
    "utf8",
  )

  const pauseHandlers = source.match(/onMouseEnter=\{\(\) => setIsPaused\(true\)\}/g) ?? []
  const resumeHandlers = source.match(/onMouseLeave=\{\(\) => setIsPaused\(false\)\}/g) ?? []

  assert.equal(pauseHandlers.length, 1)
  assert.equal(resumeHandlers.length, 1)

  const petActivityHeading = source.indexOf(">心宠动态</CardTitle>")
  assert.notEqual(petActivityHeading, -1)
  assert.match(source.slice(petActivityHeading), /onMouseEnter=\{\(\) => setIsPaused\(true\)\}/)
})
