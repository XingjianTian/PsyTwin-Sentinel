import assert from 'node:assert/strict'
import { test } from 'node:test'

import { getPetVariantAppearance } from './pet-appearance.mjs'

test('pet variant appearance supplies the visible coat color', () => {
  assert.equal(getPetVariantAppearance('/pet/variants/pet-14.png').color, '雪白')
})
