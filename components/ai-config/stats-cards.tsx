"use client"

import { useEffect, useMemo, useState } from "react"
import { DollarSign, MessageSquare, PiggyBank, Sigma } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type TokenStats = {
  input: number
  output: number
  total: number
}

type StatsBucket = {
  messages: number
  tasks_completed: number
  cost_usd: number
  savings_usd: number
  task_time_ms: number
  human_time_ms: number
  tokens: TokenStats
}

type OpenClawStats = {
  today: StatsBucket
  allTime: StatsBucket
}

type AnimatedMainStats = {
  todayMessages: number
  totalTokens: number
  apiCost: number
  savings: number
}

const EMPTY_BUCKET: StatsBucket = {
  messages: 0,
  tasks_completed: 0,
  cost_usd: 0,
  savings_usd: 0,
  task_time_ms: 0,
  human_time_ms: 0,
  tokens: {
    input: 0,
    output: 0,
    total: 0,
  },
}

function normalizeStats(raw: unknown): OpenClawStats {
  const data = (raw ?? {}) as Partial<OpenClawStats>

  return {
    today: {
      ...EMPTY_BUCKET,
      ...(data.today ?? {}),
      tokens: {
        ...EMPTY_BUCKET.tokens,
        ...(data.today?.tokens ?? {}),
      },
    },
    allTime: {
      ...EMPTY_BUCKET,
      ...(data.allTime ?? {}),
      tokens: {
        ...EMPTY_BUCKET.tokens,
        ...(data.allTime?.tokens ?? {}),
      },
    },
  }
}

function formatDuration(ms: number) {
  if (!ms) return "0s"

  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)

  if (hours > 0) return `${hours}h ${minutes % 60}m`
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`
  return `${seconds}s`
}

export function StatsCards() {
  const [stats, setStats] = useState<OpenClawStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [animated, setAnimated] = useState<AnimatedMainStats>({
    todayMessages: 0,
    totalTokens: 0,
    apiCost: 0,
    savings: 0,
  })

  useEffect(() => {
    let alive = true

    async function fetchStats() {
      try {
        const response = await fetch("/api/openclaw/stats")
        const json = await response.json()
        if (!alive) return
        setStats(normalizeStats(json))
      } catch {
        if (!alive) return
        setStats(normalizeStats(null))
      } finally {
        if (alive) setLoading(false)
      }
    }

    fetchStats()

    return () => {
      alive = false
    }
  }, [])

  useEffect(() => {
    if (!stats) return

    const target: AnimatedMainStats = {
      todayMessages: stats.today.messages,
      totalTokens: stats.allTime.tokens.total,
      apiCost: stats.allTime.cost_usd,
      savings: stats.allTime.savings_usd,
    }

    const duration = 1200
    const steps = 48
    let step = 0

    const timer = setInterval(() => {
      step += 1
      const progress = step / steps
      const easeOut = 1 - Math.pow(1 - progress, 3)

      setAnimated({
        todayMessages: Math.floor(target.todayMessages * easeOut),
        totalTokens: Math.floor(target.totalTokens * easeOut),
        apiCost: Number((target.apiCost * easeOut).toFixed(2)),
        savings: Number((target.savings * easeOut).toFixed(2)),
      })

      if (step >= steps) clearInterval(timer)
    }, duration / steps)

    return () => clearInterval(timer)
  }, [stats])

  const safeStats = useMemo(() => stats ?? normalizeStats(null), [stats])

  const cards = [
    {
      title: "今日消息",
      value: animated.todayMessages.toLocaleString(),
      sub: `${safeStats.today.tasks_completed} 个任务`,
      icon: MessageSquare,
      valueClass: "text-cyan-300",
      borderClass: "border-cyan-500/35",
      bgClass: "from-cyan-500/10 via-cyan-400/5 to-transparent",
      iconClass: "text-cyan-300",
    },
    {
      title: "总 Token",
      value: animated.totalTokens.toLocaleString(),
      sub: `In ${(safeStats.allTime.tokens.input / 1000).toFixed(0)}K / Out ${(safeStats.allTime.tokens.output / 1000).toFixed(0)}K`,
      icon: Sigma,
      valueClass: "text-violet-300",
      borderClass: "border-violet-500/35",
      bgClass: "from-violet-500/10 via-violet-400/5 to-transparent",
      iconClass: "text-violet-300",
    },
    {
      title: "API 成本",
      value: `$${animated.apiCost.toFixed(2)}`,
      sub: `今日 $${safeStats.today.cost_usd.toFixed(2)}`,
      icon: DollarSign,
      valueClass: "text-pink-300",
      borderClass: "border-pink-500/35",
      bgClass: "from-pink-500/10 via-pink-400/5 to-transparent",
      iconClass: "text-pink-300",
    },
    {
      title: "节省金额",
      value: `$${animated.savings.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
      sub: `今日 $${safeStats.today.savings_usd.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
      icon: PiggyBank,
      valueClass: "text-emerald-300",
      borderClass: "border-emerald-500/35",
      bgClass: "from-emerald-500/10 via-emerald-400/5 to-transparent",
      iconClass: "text-emerald-300",
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
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <Card
            key={card.title}
            className={`relative overflow-hidden border ${card.borderClass} bg-card/80`}
          >
            <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${card.bgClass}`} />
            <CardContent className="relative pt-6">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs text-muted-foreground">{card.title}</p>
                <card.icon className={`h-4 w-4 ${card.iconClass}`} />
              </div>
              <p className={`font-mono text-2xl font-bold ${card.valueClass}`}>{card.value}</p>
              <p className="mt-1 text-[11px] text-muted-foreground">{card.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <Card className="border-cyan-500/25 bg-card/75">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-cyan-300">今日活动</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-muted-foreground">消息数</p>
              <p className="font-semibold text-foreground">{safeStats.today.messages.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-muted-foreground">完成任务</p>
              <p className="font-semibold text-foreground">{safeStats.today.tasks_completed.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Token</p>
              <p className="font-semibold text-foreground">{safeStats.today.tokens.total.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-muted-foreground">AI 用时</p>
              <p className="font-semibold text-foreground">{formatDuration(safeStats.today.task_time_ms)}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-violet-500/25 bg-card/75">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-violet-300">全量统计</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-muted-foreground">累计消息</p>
              <p className="font-semibold text-foreground">{safeStats.allTime.messages.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-muted-foreground">累计任务</p>
              <p className="font-semibold text-foreground">{safeStats.allTime.tasks_completed.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-muted-foreground">总成本</p>
              <p className="font-semibold text-red-300">${safeStats.allTime.cost_usd.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">总节省</p>
              <p className="font-semibold text-emerald-300">
                ${safeStats.allTime.savings_usd.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
