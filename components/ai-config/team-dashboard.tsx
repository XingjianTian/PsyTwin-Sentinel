"use client"

import { AnimatePresence, motion } from "framer-motion"
import { useEffect, useMemo, useState } from "react"

import { Card, CardContent } from "@/components/ui/card"

type AgentStats = {
  conversations: number
  completed: number
  words: number
  tokens: number
}

type OpenClawAgent = {
  id: string
  name: string
  role?: string
  emoji?: string
  color?: string
  stats?: Partial<AgentStats>
  conversations?: number
  completed?: number
  words?: number
  tokens?: number
}

const DEFAULT_THOUGHTS = [
  "正在整理上下文，准备下一步行动...",
  "持续评估风险与收益，优化决策路径...",
  "与协作节点同步进度，保持链路稳定...",
]

const AGENT_THOUGHTS: Record<string, string[]> = {
  "司礼监": [
    "正在协调各节点任务分配...",
    "监控全局状态，确保流程顺畅...",
    "优化请求路由策略...",
    "复核关键节点结果，准备下发下一轮指令...",
  ],
  "兵部": [
    "分析代码实现细节...",
    "寻找最优技术方案...",
    "执行开发任务中...",
    "正在拆解复杂需求为可执行步骤...",
  ],
  "礼部": [
    "整理交互语言风格，统一输出规范...",
    "润色答复结构，增强可读性...",
    "检查表达是否符合场景语境...",
  ],
  "刑部": [
    "扫描潜在安全风险点...",
    "校验权限边界与访问策略...",
    "记录异常行为，准备审计结论...",
  ],
  "户部": [
    "追踪 token 与成本变化趋势...",
    "计算资源占用，优化配额策略...",
    "评估模型调用性价比...",
  ],
  "工部": [
    "构建自动化流水线任务...",
    "排查构建链路中的阻塞点...",
    "提升部署稳定性与回滚效率...",
  ],
  "锦衣卫": [
    "实时监听异常请求信号...",
    "追踪关键日志，定位问题根因...",
    "执行防护策略并持续观察效果...",
  ],
}

const AGENT_THOUGHTS_BY_ID: Record<string, string[]> = {
  silijian: AGENT_THOUGHTS["司礼监"],
  bingbu: AGENT_THOUGHTS["兵部"],
  libu: AGENT_THOUGHTS["礼部"],
  xingbu: AGENT_THOUGHTS["刑部"],
  hubu: AGENT_THOUGHTS["户部"],
  gongbu: AGENT_THOUGHTS["工部"],
  jinyiwei: AGENT_THOUGHTS["锦衣卫"],
}

function hashToNumber(input: string) {
  let hash = 0
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

function getFallbackStats(agent: OpenClawAgent): AgentStats {
  const seed = hashToNumber(`${agent.id}-${agent.name}`)
  return {
    conversations: 12 + (seed % 30),
    completed: 8 + (seed % 24),
    words: 3000 + (seed % 12000),
    tokens: 9000 + (seed % 48000),
  }
}

function getAgentThoughts(agent: OpenClawAgent) {
  return AGENT_THOUGHTS[agent.name] || AGENT_THOUGHTS_BY_ID[agent.id?.toLowerCase()] || DEFAULT_THOUGHTS
}

function formatTokens(tokens: number) {
  if (tokens >= 1000) {
    return `${(tokens / 1000).toFixed(tokens >= 10000 ? 0 : 1)}k`
  }
  return `${tokens}`
}

function AgentThoughtCard({ agent }: { agent: OpenClawAgent }) {
  const thoughts = useMemo(() => getAgentThoughts(agent), [agent])
  const [thoughtIndex, setThoughtIndex] = useState(0)

  useEffect(() => {
    if (thoughts.length <= 1) return
    const timer = setInterval(() => {
      setThoughtIndex((prev) => (prev + 1) % thoughts.length)
    }, 6000)
    return () => clearInterval(timer)
  }, [thoughts])

  const baseColor = agent.color || "#38bdf8"
  const fallbackStats = getFallbackStats(agent)
  const stats: AgentStats = {
    conversations: agent.stats?.conversations ?? agent.conversations ?? fallbackStats.conversations,
    completed: agent.stats?.completed ?? agent.completed ?? fallbackStats.completed,
    words: agent.stats?.words ?? agent.words ?? fallbackStats.words,
    tokens: agent.stats?.tokens ?? agent.tokens ?? fallbackStats.tokens,
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      whileHover={{ y: -2 }}
    >
      <Card className="relative overflow-hidden border-border/60 bg-card/80 backdrop-blur-sm">
        <div
          className="pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full opacity-20 blur-xl"
          style={{ backgroundColor: `${baseColor}66` }}
        />

        <CardContent className="space-y-3 p-4">
          <div className="flex items-center gap-3">
            <div
              className="relative flex h-12 w-12 items-center justify-center rounded-xl text-2xl"
              style={{
                background: `${baseColor}1f`,
                border: `2px solid ${baseColor}`,
                boxShadow: `0 0 18px ${baseColor}66`,
              }}
            >
              <span>{agent.emoji || "🤖"}</span>
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold" style={{ color: baseColor }}>
                {agent.name}
              </p>
              <p className="truncate text-xs text-muted-foreground">{agent.role || "智能体"}</p>
            </div>
          </div>

          <div className="rounded-lg border border-border/50 bg-muted/20 p-3 min-h-[68px]">
            <AnimatePresence mode="wait">
              <motion.p
                key={`${agent.id}-${thoughtIndex}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="text-sm italic text-muted-foreground"
              >
                “{thoughts[thoughtIndex]}”
              </motion.p>
            </AnimatePresence>
          </div>

          <div className="grid grid-cols-4 gap-2 text-center">
            <div>
              <p className="text-[10px] text-muted-foreground">💬 对话数</p>
              <p className="text-sm font-semibold text-foreground">{stats.conversations}</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">✅ 已完成</p>
              <p className="text-sm font-semibold text-green-500">{stats.completed}</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">📝 字数</p>
              <p className="text-sm font-semibold text-cyan-500">{stats.words.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">🔢 Token</p>
              <p className="text-sm font-semibold text-purple-500">{formatTokens(stats.tokens)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export function TeamDashboard() {
  const [agents, setAgents] = useState<OpenClawAgent[]>([])

  useEffect(() => {
    fetch("/api/openclaw/config")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data?.agents)) {
          setAgents(data.agents)
        }
      })
      .catch(() => {})
  }, [])

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h3 className="text-base font-semibold text-foreground">AI 思维</h3>
        <p className="text-xs text-muted-foreground">监听每个 Agent 的当前思绪与执行状态</p>
      </div>

      {agents.length === 0 ? (
        <Card className="border-dashed border-border/70 bg-muted/10">
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            正在等待 agent 数据接入...
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {agents.map((agent) => (
            <AgentThoughtCard key={agent.id} agent={agent} />
          ))}
        </div>
      )}
    </div>
  )
}

export default TeamDashboard
