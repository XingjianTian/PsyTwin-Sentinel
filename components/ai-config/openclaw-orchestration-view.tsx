"use client"

import { useEffect, useState } from "react"

import { useOpenClawWorkflowStream } from "@/lib/openclaw/use-workflow-stream"
import { openClawEventBus, OPENCLAW_EVENTS } from "@/lib/openclaw/event-bus"
import { Card, CardContent } from "@/components/ui/card"

import { AgentGridOffice } from "./agent-grid-office"
import { LivePanel } from "./live-panel"
import type { AgentGridItem } from "./agent-grid-label"

export function OpenClawOrchestrationView() {
  const { requests, activities } = useOpenClawWorkflowStream()
  const [agents, setAgents] = useState<AgentGridItem[]>([])
  const [selectedAgent, setSelectedAgent] = useState<AgentGridItem | null>(null)
  const [showGrid, setShowGrid] = useState(true)

  useEffect(() => {
    async function loadAndSelect() {
      try {
        const res = await fetch("/api/openclaw/config")
        const data = await res.json()
        if (data.agents) {
          setAgents(data.agents)
          const mainAgent = data.agents.find((a: AgentGridItem) => a.id === "main")
          if (mainAgent) {
            setSelectedAgent(mainAgent)
          }
        }
      } catch {
      }
    }
    loadAndSelect()
  }, [])

  // 监听 agents 更新事件（当 WebSocket 检测到新的 agents 列表时）
  useEffect(() => {
    const handleAgentsUpdate = () => {
      console.log("[OpenClaw] Agents list updated, refreshing...")
      fetch("/api/openclaw/config")
        .then((res) => res.json())
        .then((data) => {
          if (data.agents) {
            setAgents(data.agents)
            const mainAgent = data.agents.find((a: AgentGridItem) => a.id === "main")
            if (mainAgent) {
              setSelectedAgent(mainAgent)
            }
          }
        })
    }

    openClawEventBus.on(OPENCLAW_EVENTS.AGENTS_UPDATE, handleAgentsUpdate)
    
    return () => {
      openClawEventBus.off(OPENCLAW_EVENTS.AGENTS_UPDATE, handleAgentsUpdate)
    }
  }, [])

  const activeRequests = requests.filter((r) => r.state !== "completed" && r.state !== "failed")
  const todayTokenApprox = activities.length * 1200
  const costApprox = (todayTokenApprox / 1000) * 0.08
  return (
    <div className="flex h-[calc(100vh-10rem)] flex-col gap-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">
            <span className="text-orange-400">心图·AI 可视化指挥中心</span>
          </h1>
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

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-3 flex-1 min-h-0">
        <div className="xl:col-span-2 flex flex-col">
          <Card className="flex flex-1 flex-col border-border bg-card">
            <CardContent className="min-h-0 flex-1 p-0">
              <AgentGridOffice agents={agents} onSelectAgent={setSelectedAgent} showGrid={showGrid} selectedAgent={selectedAgent} />
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col h-full">
          <div className="flex-1 min-h-0">
            <LivePanel />
          </div>
        </div>
      </div>
    </div>
  )
}
