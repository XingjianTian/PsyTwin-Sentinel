"use client"

import { useMemo, useState } from "react"
import Image from "next/image"
import { Activity, X } from "lucide-react"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import {
  useOpenClawWorkflowStream,
  type OpenClawActivityItem,
} from "@/lib/openclaw/use-workflow-stream"
import { cn } from "@/lib/utils"
import { AGENTS } from "@/lib/openclaw/agents.config"

const AGENT_AVATAR_MAP: Record<string, string> = {
  analyst: "/agents-icons/Analyst.png",
  collector: "/agents-icons/Collector.png",
  dba: "/agents-icons/DBA.png",
  relayer: "/agents-icons/Relayer.png",
  therapist: "/agents-icons/Therapist.png",
  main: "/agents-icons/psytwin.jpg",
}

function formatTime(value?: number, fallback?: string) {
  if (fallback) return fallback
  if (!value) return "--:--"
  return new Date(value).toLocaleTimeString("zh-CN", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
  })
}

type AgentMeta = { name: string; emoji: string; color: string; role: string }

function getAgentMeta(nameOrId: string): AgentMeta | null {
  const entry = Object.entries(AGENTS).find(
    ([key, meta]) =>
      key.toLowerCase() === nameOrId.toLowerCase() ||
      meta.name === nameOrId
  )
  return entry ? entry[1] as AgentMeta : null
}

function getAgentAvatar(agentId: string): string | null {
  const directMatch = AGENT_AVATAR_MAP[agentId.toLowerCase()]
  if (directMatch) return directMatch
  for (const [key, path] of Object.entries(AGENT_AVATAR_MAP)) {
    if (agentId.toLowerCase().includes(key)) return path
  }
  return null
}

function WorkflowRow({ group, onClick }: { group: OpenClawActivityItem[]; onClick: () => void }) {
  const firstItem = group[0]
  const lastItem = group[group.length - 1]

  const hasFailed = group.some(i => i.type === "failed" || i.state === "failed")
  const isCompleted = group.some(i => i.type === "lifecycle.end" || i.state === "completed" || i.type === "response.completed" || i.type === "pocket.completed")
  const isInProgress = group.some(i => i.state === "in_progress" || i.state === "analyzing")

  const durationMs = (lastItem.timestamp || 0) - (firstItem.timestamp || 0)
  const durationStr = durationMs > 0
    ? durationMs < 1000 ? `${durationMs}ms`
    : durationMs < 60000 ? `${Math.round(durationMs / 1000)}秒`
    : `${Math.round(durationMs / 60000)}分钟`
    : ""

  const avatarItem = firstItem
  const rawName = avatarItem.agentName || avatarItem.agentId || "系统"
  const agentMeta = getAgentMeta(rawName)
  const avatarPath = getAgentAvatar(avatarItem.agentId || "")
  const avatarColor = agentMeta?.color || "#64748b"

  const steps = []
  if (group.some(i => i.type === "pocket.chat" || i.type === "request.start")) {
    steps.push({ label: "收到", color: "bg-gray-400" })
  }
  if (group.some(i => i.state === "analyzing" || i.type === "lifecycle.start")) {
    steps.push({ label: "分析", color: "bg-blue-400" })
  }
  if (group.some(i => i.type === "subagent.response")) {
    steps.push({ label: "子代理", color: "bg-cyan-400" })
  }
  if (isInProgress) {
    steps.push({ label: "处理", color: "bg-purple-400" })
  }
  if (isCompleted) {
    steps.push({ label: "完成", color: "bg-green-400" })
  }
  if (hasFailed) {
    steps.push({ label: "失败", color: "bg-red-400" })
  }

  const isPocket = group.some(i => i.type === "pocket.chat" || i.type === "pocket.completed")
  const isSentinel = group.some(i => i.type === "request.start" || i.type === "response.completed" || i.type === "lifecycle.start" || i.type === "lifecycle.end")
  const isVR = group.some(i => i.type === "stream.delta" || i.type === "stream.assistant" || i.type === "subagent.response")

  const sourceLabel = isPocket ? "微信小程序" : isSentinel ? "指挥中心" : "VR任务"
  const sourceColors = isPocket
    ? { bg: "bg-cyan-500/10", border: "border-cyan-500/30", text: "text-cyan-600" }
    : isSentinel
    ? { bg: "bg-purple-500/10", border: "border-purple-500/30", text: "text-purple-600" }
    : { bg: "bg-amber-500/10", border: "border-amber-500/30", text: "text-amber-600" }

  return (
    <div
      onClick={onClick}
      className="flex items-start gap-3 px-3 py-3 rounded-lg border-2 border-border bg-card shadow-sm hover:bg-muted/30 hover:shadow-md transition-all cursor-pointer"
    >
      <div
        className="w-10 h-10 rounded-md border-2 shrink-0 overflow-hidden"
        style={{ borderColor: avatarColor }}
        title={agentMeta?.name || rawName}
      >
        {avatarPath ? (
          <Image
            src={avatarPath}
            alt={agentMeta?.name || rawName}
            width={40}
            height={40}
            className="w-full h-full object-cover"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center text-sm font-medium"
            style={{ backgroundColor: avatarColor + "30", color: avatarColor }}
          >
            {agentMeta ? agentMeta.emoji || agentMeta.name.slice(0, 1) : "?"}
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0 space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium" style={{ color: avatarColor }}>
            {agentMeta?.name || rawName}
          </span>
          <span className="text-xs text-muted-foreground">
            {formatTime(firstItem.timestamp, firstItem.time)}
          </span>
          {durationStr && (
            <span className="text-xs text-muted-foreground ml-auto">{durationStr}</span>
          )}
        </div>
        <div className="flex items-center gap-1.5 flex-nowrap overflow-hidden">
          {steps.map((step) => (
            <span key={step.label} className={cn("text-xs px-2 py-0.5 rounded text-white font-medium shrink-0", step.color)}>
              {step.label}
            </span>
          ))}
        </div>
        <div className="flex items-center justify-end">
          <span className={cn("text-xs px-2 py-1 rounded border shadow-sm", sourceColors.bg, sourceColors.border, sourceColors.text)}>
            {sourceLabel}
          </span>
        </div>
      </div>
    </div>
  )
}

function DetailDialog({ group, open, onClose }: { group: OpenClawActivityItem[]; open: boolean; onClose: () => void }) {
  if (!open) return null

  const sortedItems = [...group].sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-card rounded-xl border shadow-xl w-[90%] max-w-md max-h-[70vh] flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <span className="text-sm font-medium">活动详情</span>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {sortedItems.map((item, index) => (
            <div key={item.id} className="p-3 rounded-lg border bg-muted/30">
              <div className="flex items-center gap-2 mb-2">
                <span
                  className="text-xs font-medium px-2 py-0.5 rounded"
                  style={{ backgroundColor: (getAgentMeta(item.agentName || item.agentId || "")?.color || "#64748b") + "20", color: getAgentMeta(item.agentName || item.agentId || "")?.color || "#64748b" }}
                >
                  {getAgentMeta(item.agentName || item.agentId || "")?.name || item.agentId || "系统"}
                </span>
                <span className="text-[9px] text-muted-foreground">
                  {formatTime(item.timestamp, item.time)}
                </span>
                {item.type === "subagent.response" && (
                  <span className="text-[9px] text-cyan-500">子代理响应</span>
                )}
              </div>
              <p className="text-[11px] text-foreground whitespace-pre-wrap break-words">
                {item.message}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function LivePanel() {
  const { activities } = useOpenClawWorkflowStream()
  const [selectedGroup, setSelectedGroup] = useState<OpenClawActivityItem[] | null>(null)

  const groupedActivities = useMemo(() => {
    const groups = new Map<string, OpenClawActivityItem[]>()

    for (const item of activities) {
      const key = item.requestId || item.id
      if (!groups.has(key)) {
        groups.set(key, [])
      }
      groups.get(key)!.push(item)
    }

    const sortedGroups = Array.from(groups.values())

    sortedGroups.sort((a, b) => {
      const latestA = a[a.length - 1].timestamp || 0
      const latestB = b[b.length - 1].timestamp || 0
      if (latestB !== latestA) return latestB - latestA
      const firstA = a[0].timestamp || 0
      const firstB = b[0].timestamp || 0
      return firstB - firstA
    })

    return sortedGroups.slice(0, 4)
  }, [activities])

  const totalEvents = groupedActivities.reduce((sum, g) => sum + g.length, 0)

  return (
    <>
      <Card className="flex h-full flex-col border-border bg-card">
        <CardHeader className="shrink-0 border-b border-border px-2 py-0.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Activity className="h-3 w-3 text-muted-foreground" />
              <span className="text-base font-medium">活动日志</span>
              <span className="text-[9px] text-green-500">● LIVE</span>
              {groupedActivities.length > 0 && (
                <span className="text-[9px] text-muted-foreground/60 ml-1">点击查看详情</span>
              )}
            </div>
            <span className="text-[10px] text-muted-foreground">
              {groupedActivities.length} 请求 · {totalEvents} 事件
            </span>
          </div>
        </CardHeader>

        <CardContent className="min-h-0 flex-1 p-1 overflow-y-auto">
          {groupedActivities.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <p className="text-[11px] text-muted-foreground">等待实时事件...</p>
            </div>
          ) : (
            <div className="space-y-1">
              {groupedActivities.map((group) => (
                <WorkflowRow
                  key={(group[0].requestId || group[0].id)}
                  group={group}
                  onClick={() => setSelectedGroup(group)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <DetailDialog
        group={selectedGroup || []}
        open={selectedGroup !== null}
        onClose={() => setSelectedGroup(null)}
      />
    </>
  )
}
