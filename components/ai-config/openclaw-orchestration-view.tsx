"use client"

import { useEffect, useState } from "react"
import {
  Bot,
  Database,
  DollarSign,
  ShieldCheck,
  Users,
  BarChart3,
} from "lucide-react"

import { useOpenClawWorkflowStream } from "@/lib/openclaw/use-workflow-stream"
import { openClawEventBus, OPENCLAW_EVENTS } from "@/lib/openclaw/event-bus"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AgentGridOffice } from "./agent-grid-office"
import { LivePanel } from "./live-panel"
import { StatsCards } from "./stats-cards"
import { CostDashboard } from "./cost-dashboard"
import SecurityDashboard from "./security-dashboard"
import DatabaseDashboard from "./database-dashboard"
import { TeamDashboard } from "./team-dashboard"
import { AgentChatPanel } from "./agent-chat-panel"
import type { AgentGridItem } from "./agent-grid-label"

// 加载 agents 的函数
async function loadAgents(
  setAgents: (agents: AgentGridItem[]) => void,
  setSelectedAgent?: (agent: AgentGridItem) => void
) {
  try {
    const res = await fetch("/api/openclaw/config")
    const data = await res.json()
    if (data.agents) {
      setAgents(data.agents)
      const mainAgent = data.agents.find((a: AgentGridItem) => a.id === "main")
      if (mainAgent && setSelectedAgent) {
        setSelectedAgent(mainAgent)
      }
    }
  } catch {
    // 忽略错误
  }
}

export function OpenClawOrchestrationView() {
  const { requests, activities } = useOpenClawWorkflowStream()
  const [agents, setAgents] = useState<AgentGridItem[]>([])
  const [activeTab, setActiveTab] = useState("office")
  const [selectedAgent, setSelectedAgent] = useState<AgentGridItem | null>(null)

  // 初始加载
  useEffect(() => {
    loadAgents(setAgents, setSelectedAgent)
  }, [])

  // 监听 agents 更新事件（当 WebSocket 检测到新的 agents 列表时）
  useEffect(() => {
    const handleAgentsUpdate = () => {
      console.log("[OpenClaw] Agents list updated, refreshing...")
      loadAgents(setAgents)
    }

    openClawEventBus.on(OPENCLAW_EVENTS.AGENTS_UPDATE, handleAgentsUpdate)
    
    return () => {
      openClawEventBus.off(OPENCLAW_EVENTS.AGENTS_UPDATE, handleAgentsUpdate)
    }
  }, [])

  const activeRequests = requests.filter((r) => r.state !== "completed" && r.state !== "failed")
  const todayTokenApprox = activities.length * 1200
  const costApprox = (todayTokenApprox / 1000) * 0.08
  const isOfficeTab = activeTab === "office"
  return (
    <div className="flex h-[calc(100vh-10rem)] flex-col gap-2">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-lg text-xl"
            style={{ background: "linear-gradient(135deg, #0a0a1a, #1a1a3a)", border: "1px solid rgba(0,245,255,0.3)" }}
          >
            🤖
          </div>
          <div>
            <h1 className="text-base font-bold">
              <span className="text-cyan-400">OpenClaw</span>
              <span className="mx-2 text-foreground">编排中心</span>
            </h1>
            <p className="text-xs text-muted-foreground">AI Office Dashboard</p>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-green-500/50 bg-green-500/10 px-3 py-1">
            <div className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
            <span className="text-xs font-bold text-green-500">LIVE</span>
          </div>
        </div>

        {/* Quick stats */}
        <div className="hidden items-center gap-6 text-sm lg:flex">
          <div>
            <span className="text-muted-foreground">节点: </span>
            <span className="font-bold text-cyan-400">{agents.length}</span>
          </div>
          <div>
            <span className="text-muted-foreground">任务: </span>
            <span className="font-bold text-cyan-400">{activeRequests.length}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Token: </span>
            <span className="font-bold text-purple-400">
              {(todayTokenApprox / 1000000).toFixed(2)}M
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">节省: </span>
            <span className="font-bold text-green-400">¥{costApprox.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 min-h-0">
        <TabsList className="mb-2 grid w-full grid-cols-6 gap-1.5 bg-transparent p-0">
          <TabsTrigger
            value="office"
            className="gap-1.5 rounded-xl border border-border bg-card text-xs shadow-sm transition-all hover:bg-muted data-[state=active]:border-primary/40 data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-md"
          >
            <Bot className="h-3.5 w-3.5" />
            智能体集群
          </TabsTrigger>
          <TabsTrigger
            value="stats"
            className="gap-1.5 rounded-xl border border-border bg-card text-xs shadow-sm transition-all hover:bg-muted data-[state=active]:border-primary/40 data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-md"
          >
            <BarChart3 className="h-3.5 w-3.5" />
            交互统计
          </TabsTrigger>
          <TabsTrigger
            value="team"
            className="gap-1.5 rounded-xl border border-border bg-card text-xs shadow-sm transition-all hover:bg-muted data-[state=active]:border-primary/40 data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-md"
          >
            <Users className="h-3.5 w-3.5" />
            AI 思维
          </TabsTrigger>
          <TabsTrigger
            value="cost"
            className="gap-1.5 rounded-xl border border-border bg-card text-xs shadow-sm transition-all hover:bg-muted data-[state=active]:border-primary/40 data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-md"
          >
            <DollarSign className="h-3.5 w-3.5" />
            成本分析
          </TabsTrigger>
          <TabsTrigger
            value="security"
            className="gap-1.5 rounded-xl border border-border bg-card text-xs shadow-sm transition-all hover:bg-muted data-[state=active]:border-primary/40 data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-md"
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            安全审计
          </TabsTrigger>
          <TabsTrigger
            value="database"
            className="gap-1.5 rounded-xl border border-border bg-card text-xs shadow-sm transition-all hover:bg-muted data-[state=active]:border-primary/40 data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-md"
          >
            <Database className="h-3.5 w-3.5" />
            数据库
          </TabsTrigger>
        </TabsList>

        <div className={isOfficeTab ? "grid grid-cols-1 gap-3 xl:grid-cols-3 h-[calc(100%-2.5rem)]" : "h-[calc(100%-2.5rem)] overflow-auto"}>
          {/* Main Content */}
          <div className={isOfficeTab ? "xl:col-span-2 flex flex-col" : "w-full"}>
            <TabsContent value="office" className="mt-0 flex-1 min-h-0 flex flex-col">
              <div className="text-center text-[10px] text-muted-foreground mb-1">
                🤖 {agents.length} 个智能体节点 · 点击小人进行对话
              </div>
              <AgentGridOffice agents={agents} onSelectAgent={setSelectedAgent} />
            </TabsContent>

            <TabsContent value="stats" className="mt-0">
              <StatsCards />
            </TabsContent>

            <TabsContent value="team" className="mt-0">
              <TeamDashboard />
            </TabsContent>

            <TabsContent value="cost" className="mt-0">
              <CostDashboard />
            </TabsContent>

            <TabsContent value="security" className="mt-0">
              <SecurityDashboard />
            </TabsContent>

            <TabsContent value="database" className="mt-0">
              <DatabaseDashboard />
            </TabsContent>
          </div>

          {isOfficeTab && (
            <div className="flex flex-col h-full gap-3">
              <div className="flex-1 min-h-0">
                <LivePanel />
              </div>
              <div className="shrink-0">
                <AgentChatPanel selectedAgent={selectedAgent} />
              </div>
            </div>
          )}
        </div>
      </Tabs>
    </div>
  )
}
