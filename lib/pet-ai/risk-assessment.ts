export const ACTIVE_CARE_SUGGESTION = "近期开展一次主动关怀。"

const INTERVENTION_MARKER = "【建议干预方案】："

export function appendActiveCareSuggestion(text: string | null): string | null {
  if (!text || text.includes(ACTIVE_CARE_SUGGESTION)) return text

  const markerIndex = text.indexOf(INTERVENTION_MARKER)
  if (markerIndex === -1) return text

  const lineEnd = text.indexOf("\n", markerIndex)
  const end = lineEnd === -1 ? text.length : lineEnd
  const interventionLine = text.slice(markerIndex, end).trimEnd()
  const separator = /[。！？.!?]$/.test(interventionLine) ? "" : " "

  return `${text.slice(0, markerIndex)}${interventionLine}${separator}${ACTIVE_CARE_SUGGESTION}${text.slice(end)}`
}
