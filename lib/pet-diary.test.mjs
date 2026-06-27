import assert from 'node:assert/strict'
import { test } from 'node:test'

import {
  buildRandomDiaryCreatedAt,
  DIARY_WRITING_SCENES,
  getMissingDiaryDates,
  shouldTriggerDiary,
} from './pet-diary-core.mjs'
import { petDiaryTemplates } from '../prisma/pet-diary-templates.mjs'

test('diary templates contain exactly 200 reusable entries', () => {
  assert.equal(petDiaryTemplates.length, 200)
  assert.equal(new Set(petDiaryTemplates.map((item) => item.slug)).size, 200)
})

test('diary writing can only trigger in dormitory or library', () => {
  assert.deepEqual(DIARY_WRITING_SCENES, ['dormitory', 'library'])

  assert.equal(shouldTriggerDiary({ sceneId: 'dormitory', hour: 21, alreadyWritten: false, randomValue: 0.1 }), true)
  assert.equal(shouldTriggerDiary({ sceneId: 'library', hour: 21, alreadyWritten: false, randomValue: 0.1 }), true)
  assert.equal(shouldTriggerDiary({ sceneId: 'bedroom', hour: 21, alreadyWritten: false, randomValue: 0.1 }), false)
  assert.equal(shouldTriggerDiary({ sceneId: 'study_room', hour: 21, alreadyWritten: false, randomValue: 0.1 }), false)
})

test('diary writing respects evening window, existing entry, and probability', () => {
  assert.equal(shouldTriggerDiary({ sceneId: 'library', hour: 19, alreadyWritten: false, randomValue: 0.1 }), false)
  assert.equal(shouldTriggerDiary({ sceneId: 'library', hour: 21, alreadyWritten: true, randomValue: 0.1 }), false)
  assert.equal(shouldTriggerDiary({ sceneId: 'library', hour: 21, alreadyWritten: false, randomValue: 0.8 }), false)
  assert.equal(shouldTriggerDiary({ sceneId: 'library', hour: 21, alreadyWritten: false, randomValue: 0.39 }), true)
})

test('missing diary dates excludes today, existing entries, and respects max days', () => {
  const dates = getMissingDiaryDates({
    lastOnlineAt: '2026-06-09T12:00:00.000Z',
    now: new Date('2026-06-13T10:00:00.000Z'),
    existingDates: ['2026-06-10'],
    maxDays: 7,
  })

  assert.deepEqual(dates, ['2026-06-09', '2026-06-11', '2026-06-12'])
})

test('missing diary dates clamps long offline spans', () => {
  const dates = getMissingDiaryDates({
    lastOnlineAt: '2026-05-20T12:00:00.000Z',
    now: new Date('2026-06-13T10:00:00.000Z'),
    existingDates: [],
    maxDays: 3,
  })

  assert.deepEqual(dates, ['2026-06-10', '2026-06-11', '2026-06-12'])
})

test('generated diary timestamps use varied evening minutes instead of exact hours', () => {
  const earliest = buildRandomDiaryCreatedAt({
    dateKey: '2026-06-15',
    hourRandomValue: 0,
    minuteRandomValue: 0,
  })
  const latest = buildRandomDiaryCreatedAt({
    dateKey: '2026-06-15',
    hourRandomValue: 0.99,
    minuteRandomValue: 0.99,
  })

  assert.equal(earliest.toISOString(), '2026-06-15T12:07:00.000Z')
  assert.equal(latest.toISOString(), '2026-06-15T15:58:00.000Z')
  assert.notEqual(earliest.getUTCMinutes(), 0)
  assert.notEqual(latest.getUTCMinutes(), 0)
})
