import { petAiProfileInputSchema, type PetAiProfileInput } from "@/lib/pet-ai/profile"

const FIELD_ALIASES = {
  tone: ["表达语气", "语气", "tone"],
  responseStyle: ["回复风格", "响应风格", "responseStyle", "response style"],
  initiative: ["主动程度", "主动性", "initiative"],
  systemPrompt: ["身份与行为约束", "身份行为约束", "系统提示词", "systemPrompt", "system prompt"],
  knowledgeScope: ["知识范围", "知识领域", "knowledgeScope", "knowledge scope"],
} as const

const FIELD_LABELS: Record<keyof typeof FIELD_ALIASES, string> = {
  tone: "表达语气",
  responseStyle: "回复风格",
  initiative: "主动程度",
  systemPrompt: "身份与行为约束",
  knowledgeScope: "知识范围",
}

function escapePattern(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

function aliasPattern(aliases: readonly string[]) {
  return aliases.map(escapePattern).join("|")
}

function cleanInlineValue(value: string) {
  return value.trim().replace(/^`|`$/g, "").replace(/^\*\*|\*\*$/g, "").trim()
}

function readInlineValue(markdown: string, aliases: readonly string[]) {
  const pattern = new RegExp(
    `^\\s*(?:[-*+]\\s+)?(?:#{1,6}\\s+)?(?:\\*\\*|__)?(?:${aliasPattern(aliases)})(?:\\*\\*|__)?\\s*[：:]\\s*(.+?)\\s*$`,
    "im",
  )
  const match = markdown.match(pattern)
  return match ? cleanInlineValue(match[1]) : ""
}

function readSectionValue(markdown: string, aliases: readonly string[]) {
  const lines = markdown.split("\n")
  const sectionHeading = new RegExp(
    `^\\s*#{1,6}\\s+(?:\\*\\*|__)?(?:${aliasPattern(aliases)})(?:\\*\\*|__)?\\s*$`,
    "i",
  )
  const emptyKey = new RegExp(
    `^\\s*(?:[-*+]\\s+)?(?:\\*\\*|__)?(?:${aliasPattern(aliases)})(?:\\*\\*|__)?\\s*[：:]\\s*$`,
    "i",
  )
  const anyKnownKey = new RegExp(
    `^\\s*(?:[-*+]\\s+)?(?:#{1,6}\\s+)?(?:\\*\\*|__)?(?:${Object.values(FIELD_ALIASES).flat().map(escapePattern).join("|")})(?:\\*\\*|__)?\\s*[：:]`,
    "i",
  )

  const start = lines.findIndex((line) => sectionHeading.test(line) || emptyKey.test(line))
  if (start < 0) return ""

  const content: string[] = []
  for (const line of lines.slice(start + 1)) {
    if (/^\s*#{1,6}\s+/.test(line) || anyKnownKey.test(line)) break
    content.push(line)
  }
  return content.join("\n").trim()
}

function readValue(markdown: string, aliases: readonly string[]) {
  return readInlineValue(markdown, aliases) || readSectionValue(markdown, aliases)
}

function parseKnowledgeScope(value: string) {
  return value
    .split(/[、,，;；\n]/)
    .map((item) => item.replace(/^\s*[-*+]\s+/, "").trim())
    .filter(Boolean)
}

export function parsePetAiProfileMarkdown(source: string): PetAiProfileInput {
  const markdown = source.replace(/^\uFEFF/, "").replace(/\r\n?/g, "\n").trim()
  if (!markdown) throw new Error("Markdown 文件为空")

  const rawValues = {
    tone: readValue(markdown, FIELD_ALIASES.tone),
    responseStyle: readValue(markdown, FIELD_ALIASES.responseStyle),
    initiative: readValue(markdown, FIELD_ALIASES.initiative),
    systemPrompt: readValue(markdown, FIELD_ALIASES.systemPrompt),
    knowledgeScope: readValue(markdown, FIELD_ALIASES.knowledgeScope),
  }
  const missing = (Object.keys(rawValues) as Array<keyof typeof rawValues>)
    .filter((key) => !rawValues[key])
    .map((key) => FIELD_LABELS[key])
  if (missing.length > 0) throw new Error(`缺少必填项：${missing.join("、")}`)

  const initiativeMatch = rawValues.initiative.match(/-?\d+/)
  if (!initiativeMatch) throw new Error("主动程度必须是 0–100 的整数")

  const parsed = petAiProfileInputSchema.safeParse({
    tone: rawValues.tone,
    responseStyle: rawValues.responseStyle,
    initiative: Number(initiativeMatch[0]),
    systemPrompt: rawValues.systemPrompt,
    knowledgeScope: parseKnowledgeScope(rawValues.knowledgeScope),
  })
  if (!parsed.success) {
    const invalidFields = Object.keys(parsed.error.flatten().fieldErrors)
      .map((key) => FIELD_LABELS[key as keyof typeof FIELD_LABELS] ?? key)
    throw new Error(`性格配置格式不正确：${invalidFields.join("、")}`)
  }

  return parsed.data
}
