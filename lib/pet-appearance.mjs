export const petVariantAppearances = Array.from({ length: 20 }, (_, index) => ({
  src: `/pet/variants/pet-${String(index + 1).padStart(2, '0')}.png`,
  color: '雪白',
}))

export function getPetVariantAppearance(src) {
  const normalizedSrc = src.split('?')[0]
  return petVariantAppearances.find((item) => item.src === normalizedSrc) || {
    src: normalizedSrc,
    color: '雪白',
  }
}
