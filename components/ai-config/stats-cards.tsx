"use client"

import { useEffect, useMemo, useState } from "react"
import { DollarSign, Users } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { AGENTS } from "@/lib/openclaw/agents.config"

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
  server_cost_usd?: number
  tokens: TokenStats
}

type OpenClawStats = {
  today: StatsBucket
  allTime: StatsBucket
}

type AgentStats = {
  id: string
  name?: string
  role?: string
  emoji?: string
  tasks_completed?: number
  events?: number
  total_task_time_ms?: number
  savings_usd?: number
}

type AgentStatsResponse = {
  agents?: AgentStats[]
}

const EMPTY_BUCKET: StatsBucket = {
  messages: 0,
  tasks_completed: 0,
  cost_usd: 0,
  savings_usd: 0,
  task_time_ms: 0,
  human_time_ms: 0,
  server_cost_usd: 0,
  tokens: { input: 0, output: 0, total: 0 },
}

function normalizeStats(raw: unknown): OpenClawStats {
  const data = (raw ?? {}) as Partial<OpenClawStats>
  return {
    today: { ...EMPTY_BUCKET, ...(data.today ?? {}), tokens: { ...EMPTY_BUCKET.tokens, ...(data.today?.tokens ?? {}) } },
    allTime: { ...EMPTY_BUCKET, ...(data.allTime ?? {}), tokens: { ...EMPTY_BUCKET.tokens, ...(data.allTime?.tokens ?? {}) } },
  }
}

function formatTokens(value: number) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`
  return `${value}`
}

function formatDuration(ms: number) {
  if (!ms) return "—"
  const sec = Math.floor(ms / 1000)
  if (sec >= 3600) return `${(sec / 3600).toFixed(1)}h`
  if (sec >= 60) return `${(sec / 60).toFixed(0)}m`
  return `${sec}s`
}

function formatUSD(value: number) {
  if (value >= 1000) return `$${(value / 1000).toFixed(1)}k`
  return `$${value.toFixed(2)}`
}

function getAgentDisplayName(agentId: string): { name: string; emoji: string; role: string } {
  const agentEntry = Object.entries(AGENTS).find(([key]) => key.toLowerCase() === agentId.toLowerCase())
  if (agentEntry) {
    return { name: agentEntry[1].name, emoji: agentEntry[1].emoji, role: agentEntry[1].role }
  }
  return { name: agentId, emoji: "🤖", role: "Agent" }
}

function BarChart({ data, maxValue, color }: { data: number[]; maxValue: number; color: string }) {
  const height = 80
  
  return (
    <div className="w-full h-20 relative">
      <svg width="100%" height={height} preserveAspectRatio="none" className="overflow-visible">
        {data.map((value, i) => {
          const barHeight = maxValue > 0 ? (value / maxValue) * (height - 16) : 0
          const x = (i / data.length) * 100
          const width = 100 / data.length * 0.85
          const y = height - 12 - barHeight
          
          return (
            <g key={i}>
              <rect
                x={`${x}%`}
                y={y}
                width={`${width}%`}
                height={barHeight}
                rx={2}
                fill={color}
                opacity={0.85}
              />
            </g>
          )
        })}
      </svg>
      <div className="flex justify-between text-[8px] text-muted-foreground mt-1 px-1">
        {data.map((_, i) => (
          i % Math.ceil(data.length / 6) === 0 ? <span key={i}>{i}</span> : <span key={i} />
        ))}
      </div>
    </div>
  )
}

function generateHourlyData(): number[] {
  return [12, 8, 15, 22, 18, 25, 30, 28, 35, 42, 38, 45, 40, 48, 52, 45, 38, 32, 28, 22, 18, 15, 10, 8]
}

function generateDailyData(): number[] {
  return Array.from({ length: 30 }, () => Math.floor(Math.random() * 50) + 20)
}

function generateMonthlyData(): number[] {
  return Array.from({ length: 12 }, () => Math.floor(Math.random() * 800) + 400)
}

export function StatsCards() {
  const [stats, setStats] = useState<OpenClawStats>({ today: EMPTY_BUCKET, allTime: EMPTY_BUCKET })
  const [agentStats, setAgentStats] = useState<AgentStats[]>([])
  const [loading, setLoading] = useState(true)
  const [overviewTab, setOverviewTab] = useState("today")

  const hourlyData = useMemo(() => generateHourlyData(), [])
  const dailyData = useMemo(() => generateDailyData(), [])
  const monthlyData = useMemo(() => generateMonthlyData(), [])

  useEffect(() => {
    Promise.all([
      fetch("/api/openclaw/stats").then((r) => r.json().catch(() => null)),
      fetch("/api/openclaw/stats/agents").then((r) => r.json().catch(() => ({ agents: [] }))),
    ])
      .then(([statsJson, agentsJson]) => {
        setStats(normalizeStats(statsJson))
        const agents = (agentsJson as AgentStatsResponse)?.agents ?? []
        setAgentStats(agents.map(a => {
          const display = getAgentDisplayName(a.id)
          return { ...a, name: display.name, emoji: display.emoji, role: display.role }
        }))
      })
      .finally(() => setLoading(false))
  }, [])

  const leaderboard = useMemo(() => {
    return [...agentStats].sort((a, b) => (b.savings_usd ?? 0) - (a.savings_usd ?? 0))
  }, [agentStats])

  const humanCost = stats.allTime.savings_usd + stats.allTime.cost_usd
  const serverCost = stats.allTime.server_cost_usd ?? stats.allTime.cost_usd * 0.1
  const totalCost = stats.allTime.cost_usd + serverCost

  const getOverviewData = () => {
    switch (overviewTab) {
      case "today":
        return {
          messages: stats.today.messages,
          tasks: stats.today.tasks_completed,
          tokens: stats.today.tokens.total,
          chartData: hourlyData,
          maxValue: Math.max(...hourlyData, 1),
          label: "消息数量（0-23时）"
        }
      case "month":
        return {
          messages: stats.allTime.messages,
          tasks: stats.allTime.tasks_completed,
          tokens: stats.allTime.tokens.total,
          chartData: dailyData,
          maxValue: Math.max(...dailyData, 1),
          label: "消息数量（本月 1-30日）"
        }
      case "year":
        return {
          messages: stats.allTime.messages * 12,
          tasks: stats.allTime.tasks_completed * 12,
          tokens: stats.allTime.tokens.total * 12,
          chartData: monthlyData,
          maxValue: Math.max(...monthlyData, 1),
          label: "消息数量（本年 1-12月）"
        }
      default:
        return {
          messages: stats.today.messages,
          tasks: stats.today.tasks_completed,
          tokens: stats.today.tokens.total,
          chartData: hourlyData,
          maxValue: Math.max(...hourlyData, 1),
          label: "消息数量（0-23时）"
        }
    }
  }

  const overviewData = getOverviewData()

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          <Card className="animate-pulse border-border/50 bg-card/70 h-56" />
          <Card className="animate-pulse border-border/50 bg-card/70 h-56" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <Card className="border-sky-600/30 bg-card/80">
          <CardHeader className="pb-2">
            <Tabs value={overviewTab} onValueChange={setOverviewTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 h-8">
                <TabsTrigger value="today" className="text-xs">今日</TabsTrigger>
                <TabsTrigger value="month" className="text-xs">本月</TabsTrigger>
                <TabsTrigger value="year" className="text-xs">本年</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-end justify-between mb-3">
              <div>
                <p className="text-xs text-muted-foreground mb-1">消息数量</p>
                <p className="text-2xl font-bold text-sky-700">{overviewData.messages.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">{overviewData.tasks} 个任务 · Token {formatTokens(overviewData.tokens)}</p>
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-2">{overviewData.label}</p>
              <BarChart data={overviewData.chartData} maxValue={overviewData.maxValue} color="#0ea5e9" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-emerald-600/30 bg-card/80">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold text-emerald-700">
              <DollarSign className="h-4 w-4" />
              成本统计
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="text-center p-3 rounded-lg bg-rose-50 border border-rose-200">
                <p className="text-xs text-rose-600 font-medium mb-1">AI 成本</p>
                <p className="text-lg font-bold text-rose-700">{formatUSD(stats.allTime.cost_usd)}</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-orange-50 border border-orange-200">
                <p className="text-xs text-orange-600 font-medium mb-1">服务器成本</p>
                <p className="text-lg font-bold text-orange-700">{formatUSD(serverCost)}</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-amber-50 border border-amber-200">
                <p className="text-xs text-amber-600 font-medium mb-1">人力成本</p>
                <p className="text-lg font-bold text-amber-700">{formatUSD(humanCost)}</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                <p className="text-xs text-emerald-600 font-medium mb-1">总节省</p>
                <p className="text-lg font-bold text-emerald-700">{formatUSD(stats.allTime.savings_usd)}</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="font-medium text-foreground">AI + 服务器 vs 人力</span>
                <span className="font-semibold text-emerald-700">
                  节省率 {humanCost > 0 ? ((stats.allTime.savings_usd / humanCost) * 100).toFixed(1) : 0}%
                </span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-muted flex">
                <div
                  className="h-full bg-gradient-to-r from-rose-500 to-orange-500"
                  style={{ width: `${Math.min((totalCost / Math.max(humanCost, 1)) * 100, 100)}%` }}
                />
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-amber-400"
                  style={{ width: `${Math.min((stats.allTime.savings_usd / Math.max(humanCost, 1)) * 100, 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>AI成本 ${stats.allTime.cost_usd.toFixed(2)}</span>
                <span className="text-emerald-600 font-medium">节省 ${stats.allTime.savings_usd.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-600/30 bg-card/80">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <Users className="h-4 w-4" />
            Agents 排行榜（按节省金额）
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {leaderboard.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-8">暂无 Agent 统计数据</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">排名</TableHead>
                  <TableHead>Agent</TableHead>
                  <TableHead className="text-center">任务</TableHead>
                  <TableHead className="text-center">事件</TableHead>
                  <TableHead className="text-center">用时</TableHead>
                  <TableHead className="text-right">节省金额</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaderboard.map((agent, index) => (
                  <TableRow key={agent.id}>
                    <TableCell>
                      <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                        index === 0 ? "bg-amber-100 text-amber-700" : 
                        index === 1 ? "bg-slate-200 text-slate-700" : 
                        index === 2 ? "bg-orange-100 text-orange-700" : 
                        "bg-muted text-muted-foreground"
                      }`}>
                        {index + 1}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{agent.emoji ?? "🤖"}</span>
                        <div>
                          <p className="text-sm font-medium text-foreground">{agent.name}</p>
                          <p className="text-xs text-muted-foreground">{agent.role}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center text-muted-foreground">{(agent.tasks_completed ?? 0).toLocaleString()}</TableCell>
                    <TableCell className="text-center text-muted-foreground">{(agent.events ?? 0).toLocaleString()}</TableCell>
                    <TableCell className="text-center font-medium text-slate-700">{formatDuration(agent.total_task_time_ms ?? 0)}</TableCell>
                    <TableCell className="text-right font-bold text-emerald-700">{formatUSD(agent.savings_usd ?? 0)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
