import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import test from "node:test"

test("student detail API returns the persisted OCEAN pet personality", async () => {
  const source = await readFile(new URL("../../app/api/pet-ai/students/[studentId]/route.ts", import.meta.url), "utf8")

  for (const field of ["openness", "conscientiousness", "extraversion", "agreeableness", "neuroticism"]) {
    assert.match(source, new RegExp(field))
  }
  assert.match(source, /personality/)
  assert.match(source, /buildStableOceanPersonality/)
  assert.match(source, /every\(\(value\) => value === 50\)/)
  assert.match(source, /\/pet\/pocket-main-pet\.png/)
})

test("Reachy defaults to the Pocket test student", async () => {
  const sessionSource = await readFile(new URL("../../app/api/pet-ai/reachy/session/route.ts", import.meta.url), "utf8")
  const listSource = await readFile(new URL("../../app/api/pet-ai/students/route.ts", import.meta.url), "utf8")

  assert.match(sessionSource, /stu-test/)
  assert.match(sessionSource, /测试学生/)
  assert.match(listSource, /stu-test/)
})

test("Pocket test student is pinned, renamed, and has no demo history", async () => {
  const listSource = await readFile(new URL("../../app/api/pet-ai/students/route.ts", import.meta.url), "utf8")
  const detailSource = await readFile(new URL("../../app/api/pet-ai/students/[studentId]/route.ts", import.meta.url), "utf8")
  const viewSource = await readFile(new URL("../../components/views/pet-ai-management-view.tsx", import.meta.url), "utf8")

  assert.match(listSource, /prioritizeDemoStudent/)
  assert.match(listSource, /DEMO_PET_NAME/)
  assert.match(detailSource, /DEMO_PET_NAME/)
  assert.match(detailSource, /isDemoStudent\s*\?\s*\[\]/)
  assert.match(viewSource, /测试心宠还没有历史对话/)
})

test("Reachy routes load the persisted profile instead of trusting browser identity", async () => {
  const sessionSource = await readFile(new URL("../../app/api/pet-ai/reachy/session/route.ts", import.meta.url), "utf8")
  const testSource = await readFile(new URL("../../app/api/pet-ai/reachy/test/route.ts", import.meta.url), "utf8")
  const viewSource = await readFile(new URL("../../components/views/pet-ai-management-view.tsx", import.meta.url), "utf8")

  assert.match(sessionSource, /buildPetRuntimeIdentity/)
  assert.match(sessionSource, /aiProfile/)
  assert.match(testSource, /buildPetRuntimeIdentity/)
  assert.doesNotMatch(sessionSource, /identity:\s*z\.string/)
  assert.doesNotMatch(viewSource, /identity:\s*profile\.systemPrompt/)
  assert.doesNotMatch(viewSource, /tone:\s*profile\.tone/)
})

test("Reachy status proxies the two-layer event cursor", async () => {
  const statusSource = await readFile(new URL("../../app/api/pet-ai/reachy/status/route.ts", import.meta.url), "utf8")
  assert.match(statusSource, /eventAfter/)
  assert.match(statusSource, /\/v1\/events\?after=/)
  assert.match(statusSource, /events/)
})
