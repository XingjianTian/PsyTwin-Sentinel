import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import test from "node:test"

const seedFilePath = new URL("../prisma/seed/incremental-core-data.ts", import.meta.url)
const packageJsonPath = new URL("../package.json", import.meta.url)
const prismaReadmePath = new URL("../prisma/README.md", import.meta.url)

test("incremental seed is documented and avoids destructive operations", async () => {
  const seedSource = await readFile(seedFilePath, "utf8")
  const packageJson = JSON.parse(await readFile(packageJsonPath, "utf8"))
  const prismaReadme = await readFile(prismaReadmePath, "utf8")

  assert.match(seedSource, /async function seedIncrementalCoreData/)
  assert.match(seedSource, /openClawAgents/)
  assert.match(seedSource, /petDiaryTemplates/)
  assert.doesNotMatch(seedSource, /\bdeleteMany\b/)
  assert.doesNotMatch(seedSource, /\bTRUNCATE\b/i)
  assert.doesNotMatch(seedSource, /\bDROP\b/i)

  assert.equal(packageJson.scripts["seed:incremental"], "tsx prisma/seed/incremental-core-data.ts")
  assert.match(prismaReadme, /npm run seed:incremental/)
  assert.match(prismaReadme, /does not clear existing data/)
})
