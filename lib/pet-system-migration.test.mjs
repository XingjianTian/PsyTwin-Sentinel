import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import test from "node:test"

const migrationPath = new URL(
  "../prisma/migrations/20260629000000_add_pet_system_tables/migration.sql",
  import.meta.url,
)

test("pet system migration creates all runtime pet tables", async () => {
  const migrationSql = await readFile(migrationPath, "utf8")

  for (const table of ["pets", "pet_events", "pet_items", "pet_diary_entries", "pet_alerts", "scene_items"]) {
    assert.match(migrationSql, new RegExp(`CREATE TABLE IF NOT EXISTS "${table}"`))
  }

  assert.match(migrationSql, /CREATE TYPE "PetSpecies"/)
  assert.match(migrationSql, /CREATE TYPE "ItemType"/)
  assert.match(migrationSql, /FOREIGN KEY \("owner_id"\) REFERENCES "students"\("id"\)/)
  assert.doesNotMatch(migrationSql, /\bDROP\b/i)
  assert.doesNotMatch(migrationSql, /\bTRUNCATE\b/i)
})
