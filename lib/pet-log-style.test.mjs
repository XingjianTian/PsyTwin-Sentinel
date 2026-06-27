import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

const studentPetPage = readFileSync(
  new URL('../app/(dashboard)/students/[id]/pet/page.tsx', import.meta.url),
  'utf8',
)

test('student pet diary logs do not use risk-colored badge styles', () => {
  const diaryToneMatch = studentPetPage.match(
    /if \(tone === "diary"\) return "([^"]+)"/,
  )

  assert.ok(diaryToneMatch, 'diary log tone style should be defined')
  assert.doesNotMatch(diaryToneMatch[1], /\b(?:rose|red|destructive)\b/)
})
