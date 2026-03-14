"use client"

import { useEffect, useMemo, useState } from "react"
import {
  BadgeDollarSign,
  Bot,
  Briefcase,
  CheckCircle2,
  Cpu,
  DollarSign,
  Sparkles,
  Trophy,
  Zap,
} from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

type TokenStats = {
  input: number
  output: number
  total: number
}

type StatsBucket = {
  tasks_completed: number
  savings_usd: number
  cost_usd: number
  human_time_ms: number
  tokens: TokenStats
}

type OpenClawStats = {
  allTime: StatsBucket
}

type AgentStats = {
  id: string
  name?: string
  role?: string
  emoji?: string
  color?: string
  tasks_completed?: number
  total_tasks?: number
  events?: number
  total_task_time_ms?: number
  estimated_human_time_ms?: number
  savings_usd?: number
  hourly_rate?: number
}

type AgentStatsResponse = {
  agents?: AgentStats[]
}

type AnimatedStats = {
  totalSavings: number
  fteEquivalent: number
  tasksCompleted: number
  tokensUsed: number
}

const EMPTY_STATS: OpenClawStats = {
  allTime: {
    tasks_completed: 0,
    savings_usd: 0,
    cost_usd: 0,
    human_time_ms: 0,
    tokens: {
      input: 0,
      output: 0,
      total: 0,
    },
  },
}

function normalizeStats(raw: unknown): OpenClawStats {
  const data = (raw ?? {}) as Partial<OpenClawStats>
  return {
    allTime: {
      ...EMPTY_STATS.allTime,
      ...(data.allTime ?? {}),
      tokens: {
        ...EMPTY_STATS.allTime.tokens,
        ...(data.allTime?.tokens ?? {}),
      },
    },
  }
}

function formatUSD(value: number) {
  if (value >= 1000) return `$${(value / 1000).toFixed(1)}k`
  return `$${value.toFixed(2)}`
}

function formatTokens(value: number) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`
  return `${Math.floor(value)}`
}

function formatDuration(ms: number) {
  if (!ms) return "—"
  const sec = Math.floor(ms / 1000)
  if (sec >= 3600) return `${(sec / 3600).toFixed(1)}h`
  if (sec >= 60) return `${(sec / 60).toFixed(1)}m`
  return `${sec}s`
}

export function CostDashboard() {
  const [stats, setStats] = useState<OpenClawStats>(EMPTY_STATS)
  const [agentStats, setAgentStats] = useState<AgentStats[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [animated, setAnimated] = useState<AnimatedStats>({
    totalSavings: 0,
    fteEquivalent: 0,
    tasksCompleted: 0,
    tokensUsed: 0,
  })

  useEffect(() => {
    let alive = true

    async function fetchData() {
      try {
        const [statsRes, agentsRes] = await Promise.all([
          fetch("/api/openclaw/stats"),
          fetch("/api/openclaw/stats/agents"),
        ])

        const statsJson = await statsRes.json().catch(() => null)
        const agentsJson = await agentsRes.json().catch(() => null)

        if (!alive) return

        if (!statsRes.ok) throw new Error("统计接口请求失败")
        if (!agentsRes.ok) throw new Error("Agent 统计接口请求失败")

        setStats(normalizeStats(statsJson))
        setAgentStats(((agentsJson as AgentStatsResponse)?.agents ?? []).map((a) => ({
          id: a.id,
          name: a.name ?? a.id,
          role: a.role ?? "Agent",
          emoji: a.emoji ?? "🤖",
          color: a.color ?? "text-foreground",
          tasks_completed: a.tasks_completed ?? 0,
          total_tasks: a.total_tasks ?? 0,
          events: a.events ?? 0,
          total_task_time_ms: a.total_task_time_ms ?? 0,
          estimated_human_time_ms: a.estimated_human_time_ms ?? 0,
          savings_usd: a.savings_usd ?? 0,
          hourly_rate: a.hourly_rate ?? 0,
        })))
      } catch (err) {
        if (!alive) return
        setError(err instanceof Error ? err.message : "数据加载失败")
        setStats(EMPTY_STATS)
        setAgentStats([])
      } finally {
        if (alive) setLoading(false)
      }
    }

    fetchData()

    return () => {
      alive = false
    }
  }, [])

  const totalSavings = stats.allTime.savings_usd
  const aiCost = stats.allTime.cost_usd
  const tasksCompleted = stats.allTime.tasks_completed
  const totalTokens = stats.allTime.tokens.total
  const humanTimeMs = stats.allTime.human_time_ms
  const fteEquivalent = humanTimeMs / (8 * 3600 * 1000 * 30)
  const humanEquivalentCost = totalSavings + aiCost

  useEffect(() => {
    const target: AnimatedStats = {
      totalSavings,
      fteEquivalent,
      tasksCompleted,
      tokensUsed: totalTokens,
    }

    const duration = 1400
    const steps = 56
    let step = 0

    const timer = setInterval(() => {
      step += 1
      const progress = step / steps
      const easeOut = 1 - Math.pow(1 - progress, 3)

      setAnimated({
        totalSavings: target.totalSavings * easeOut,
        fteEquivalent: target.fteEquivalent * easeOut,
        tasksCompleted: target.tasksCompleted * easeOut,
        tokensUsed: target.tokensUsed * easeOut,
      })

      if (step >= steps) clearInterval(timer)
    }, duration / steps)

    return () => clearInterval(timer)
  }, [totalSavings, fteEquivalent, tasksCompleted, totalTokens])

  const leaderboard = useMemo(() => {
    return [...agentStats].sort((a, b) => (b.savings_usd ?? 0) - (a.savings_usd ?? 0))
  }, [agentStats])

  const aiPercent = Math.min((aiCost / Math.max(humanEquivalentCost, 1)) * 100, 100)

  const cards = [
    {
      title: "总节省",
      value: formatUSD(animated.totalSavings),
      subtitle: `AI 成本 ${formatUSD(aiCost)}`,
      icon: DollarSign,
      valueClass: "text-emerald-300",
      iconClass: "text-emerald-300",
      borderClass: "border-emerald-500/30",
      glowClass: "from-emerald-500/10 via-emerald-400/5 to-transparent",
    },
    {
      title: "FTE 等效",
      value: animated.fteEquivalent.toFixed(2),
      subtitle: `${(humanTimeMs / 3600000).toFixed(1)}h 人力`,
      icon: Briefcase,
      valueClass: "text-cyan-300",
      iconClass: "text-cyan-300",
      borderClass: "border-cyan-500/30",
      glowClass: "from-cyan-500/10 via-cyan-400/5 to-transparent",
    },
    {
      title: "完成任务",
      value: Math.floor(animated.tasksCompleted).toLocaleString(),
      subtitle: "全量累计",
      icon: CheckCircle2,
      valueClass: "text-violet-300",
      iconClass: "text-violet-300",
      borderClass: "border-violet-500/30",
      glowClass: "from-violet-500/10 via-violet-400/5 to-transparent",
    },
    {
      title: "Token 使用",
      value: formatTokens(animated.tokensUsed),
      subtitle: `In ${formatTokens(stats.allTime.tokens.input)} / Out ${formatTokens(stats.allTime.tokens.output)}`,
      icon: Cpu,
      valueClass: "text-pink-300",
      iconClass: "text-pink-300",
      borderClass: "border-pink-500/30",
      glowClass: "from-pink-500/10 via-pink-400/5 to-transparent",
    },
  ]

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index} className="animate-pulse border-border/50 bg-card/70">
            <CardContent className="space-y-2 pt-6">
              <div className="h-4 w-16 rounded bg-muted" />
              <div className="h-8 w-24 rounded bg-muted" />
              <div className="h-3 w-20 rounded bg-muted" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {error && (
        <Card className="border-destructive/40 bg-destructive/5">
          <CardContent className="pt-6 text-sm text-destructive">
            数据获取失败：{error}
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.title} className={`relative overflow-hidden border ${card.borderClass} bg-card/80`}>
            <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${card.glowClass}`} />
            <CardContent className="relative pt-6">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs text-muted-foreground">{card.title}</p>
                <card.icon className={`h-4 w-4 ${card.iconClass}`} />
              </div>
              <p className={`font-mono text-2xl font-bold ${card.valueClass}`}>{card.value}</p>
              <p className="mt-1 text-[11px] text-muted-foreground">{card.subtitle}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card className="border-cyan-500/25 bg-card/80">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm text-cyan-300">
              <Zap className="h-4 w-4" />
              AI 成本 vs 人力成本
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-cyan-300">AI 成本</span>
                <span className="text-cyan-300">{formatUSD(aiCost)}</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-[width] duration-1000 ease-out"
                  style={{ width: `${aiPercent}%` }}
                />
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-emerald-300">人力等效成本</span>
                <span className="text-emerald-300">{formatUSD(humanEquivalentCost)}</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-muted">
                <div className="h-full w-full rounded-full bg-gradient-to-r from-emerald-400 to-green-500" />
              </div>
            </div>
            <p className="flex items-center justify-center gap-1 text-xs text-emerald-300">
              <Sparkles className="h-3.5 w-3.5" />
              净节省 {formatUSD(Math.max(totalSavings - aiCost, 0))}
            </p>
          </CardContent>
        </Card>

        <Card className="border-violet-500/25 bg-card/80">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm text-violet-300">
              <Trophy className="h-4 w-4 text-yellow-400" />
              Agent 排行榜（按节省金额）
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Agent</TableHead>
                  <TableHead className="text-center">任务</TableHead>
                  <TableHead className="text-center">事件</TableHead>
                  <TableHead className="text-center">用时</TableHead>
                  <TableHead className="text-right">节省</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaderboard.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                      暂无 Agent 统计数据
                    </TableCell>
                  </TableRow>
                ) : (
                  leaderboard.map((agent) => (
                    <TableRow key={agent.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span>{agent.emoji ?? "🤖"}</span>
                          <div>
                            <p className="text-sm font-medium text-foreground">{agent.name ?? agent.id}</p>
                            <p className="text-xs text-muted-foreground">{agent.role ?? "Agent"}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center text-muted-foreground">{(agent.tasks_completed ?? 0).toLocaleString()}</TableCell>
                      <TableCell className="text-center text-muted-foreground">{(agent.events ?? 0).toLocaleString()}</TableCell>
                      <TableCell className="text-center text-cyan-300">{formatDuration(agent.total_task_time_ms ?? 0)}</TableCell>
                      <TableCell className="text-right font-semibold text-emerald-300">{formatUSD(agent.savings_usd ?? 0)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Bot className="h-3.5 w-3.5" />
        <BadgeDollarSign className="h-3.5 w-3.5" />
        数据源：/api/openclaw/stats & /api/openclaw/stats/agents
      </div>
    </div>
  )
}
