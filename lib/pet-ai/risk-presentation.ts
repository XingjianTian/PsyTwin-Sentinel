export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"

const riskRank: Record<RiskLevel, number> = { LOW: 0, MEDIUM: 1, HIGH: 2, CRITICAL: 3 }

const highRiskPatterns = [/不想活/, /结束这一切/, /自杀/, /伤害自己/, /活着没意思/, /死了算了/, /永远消失/]
const mediumRiskPatterns = [
  /心情不好/,
  /不想吃饭|没胃口/,
  /很难受|很难过|很焦虑|有些焦虑/,
  /睡不着|睡不好|失眠|很晚才睡|脑子.{0,4}乱/,
  /复习任务.{0,6}(多|重)|有点跟不上|学习压力/,
  /不知道怎么.{0,10}(说|沟通|表达)/,
  /不想说话|不想见人|不想社交/,
  /计划.{0,6}打乱|有些烦/,
]

const riskPresentation = {
  LOW: {
    label: "低风险",
    badgeClassName: "border-border bg-background text-muted-foreground",
    studentMessageClassName: "border border-border bg-muted text-foreground",
    petMessageClassName: "border border-primary/15 bg-primary/10 text-foreground",
    eventClassName: "border-border bg-muted/50",
    iconClassName: "bg-primary/10 text-primary",
  },
  MEDIUM: {
    label: "中风险",
    badgeClassName: "border-amber-400 bg-amber-50 text-amber-900",
    studentMessageClassName: "border border-amber-400 bg-amber-100 text-amber-950",
    petMessageClassName: "border border-amber-300 bg-amber-50 text-amber-950",
    eventClassName: "border-amber-300 bg-amber-50 text-amber-950",
    iconClassName: "bg-amber-200 text-amber-900",
  },
  HIGH: {
    label: "高风险",
    badgeClassName: "border-red-400 bg-red-50 text-red-800",
    studentMessageClassName: "border border-red-400 bg-red-100 text-red-950",
    petMessageClassName: "border border-red-300 bg-red-50 text-red-950",
    eventClassName: "border-red-300 bg-red-50 text-red-950",
    iconClassName: "bg-red-200 text-red-900",
  },
  CRITICAL: {
    label: "危机",
    badgeClassName: "border-red-600 bg-red-100 text-red-950",
    studentMessageClassName: "border border-red-600 bg-red-200 text-red-950",
    petMessageClassName: "border border-red-500 bg-red-100 text-red-950",
    eventClassName: "border-red-500 bg-red-100 text-red-950",
    iconClassName: "bg-red-700 text-white",
  },
} satisfies Record<RiskLevel, {
  label: string
  badgeClassName: string
  studentMessageClassName: string
  petMessageClassName: string
  eventClassName: string
  iconClassName: string
}>

export function normalizeRiskLevel(level?: string | null): RiskLevel {
  return level && level in riskRank ? level as RiskLevel : "LOW"
}

export function classifyMessageRisk(message: string): RiskLevel {
  if (highRiskPatterns.some((pattern) => pattern.test(message))) return "HIGH"
  if (mediumRiskPatterns.some((pattern) => pattern.test(message))) return "MEDIUM"
  return "LOW"
}

export function highestRiskLevel(first?: string | null, second?: string | null): RiskLevel {
  const left = normalizeRiskLevel(first)
  const right = normalizeRiskLevel(second)
  return riskRank[right] > riskRank[left] ? right : left
}

export function getRiskPresentation(level?: string | null) {
  return riskPresentation[normalizeRiskLevel(level)]
}
