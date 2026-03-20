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
  main: "/agents-icons/main.png",
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
  const isCompleted = group.some(i => i.type === "lifecycle.end" || i.state === "completed" || i.type === "response.completed")
  const isInProgress = group.some(i => i.state === "in_progress" || i.state === "analyzing")

  const status = hasFailed ? "failed" : isCompleted ? "completed" : isInProgress ? "in_progress" : "pending"

  const subAgentItem = group.find(i => i.type === "subagent.response")
  let displayMessage = firstItem.message?.slice(0, 40) || "新请求"
  if (subAgentItem) {
    const raw = subAgentItem.message || ""
    const cleaned = raw.replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, " ").replace(/\s+/g, " ").trim()
    displayMessage = `【预览】${cleaned.slice(0, 50)}`
  }

  const durationMs = (lastItem.timestamp || 0) - (firstItem.timestamp || 0)
  const durationStr = durationMs > 0
    ? durationMs < 1000 ? `${durationMs}ms`
    : durationMs < 60000 ? `${Math.round(durationMs / 1000)}秒`
    : `${Math.round(durationMs / 60000)}分钟`
    : ""

  const statusIcon = status === "completed" ? "✓" :
                     status === "in_progress" ? "◐" :
                     status === "failed" ? "✗" : "○"

  const avatarItem = subAgentItem || firstItem
  const rawName = avatarItem.agentName || avatarItem.agentId || "系统"
  const agentMeta = getAgentMeta(rawName)
  const avatarPath = getAgentAvatar(avatarItem.agentId || "")
  const avatarColor = agentMeta?.color || "#64748b"

  return (
    <div
      onClick={onClick}
      className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-border/40 bg-card hover:bg-muted/30 hover:border-border/60 hover:shadow-sm transition-all cursor-pointer"
    >
      <div
        className="w-8 h-8 rounded-md border-2 shrink-0 overflow-hidden"
        style={{ borderColor: avatarColor }}
        title={agentMeta?.name || rawName}
      >
        {avatarPath ? (
          <Image
            src={avatarPath}
            alt={agentMeta?.name || rawName}
            width={32}
            height={32}
            className="w-full h-full object-cover"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center text-xs font-medium"
            style={{ backgroundColor: avatarColor + "30", color: avatarColor }}
          >
            {agentMeta ? agentMeta.emoji || agentMeta.name.slice(0, 1) : "?"}
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-medium" style={{ color: avatarColor }}>
            {agentMeta?.name || rawName}
          </span>
          <span className="text-[9px] text-muted-foreground">
            {formatTime(firstItem.timestamp, firstItem.time)}
          </span>
        </div>
        <p className="text-[11px] text-foreground/80 truncate mt-0.5">{displayMessage}</p>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {durationStr && (
          <span className="text-[9px] text-muted-foreground">{durationStr}</span>
        )}
        <span className={cn("text-[10px] px-1.5 py-0.5 rounded", status === "completed" && "bg-green-500/10 text-green-600", status === "in_progress" && "bg-blue-500/10 text-blue-600", status === "failed" && "bg-red-500/10 text-red-600", status === "pending" && "bg-gray-500/10 text-gray-500")}>
          {status === "completed" && "完成"}
          {status === "in_progress" && "进行中"}
          {status === "failed" && "失败"}
          {status === "pending" && "等待"}
        </span>
      </div>
    </div>
  )
}

function DetailDialog({ group, open, onClose }: { group: OpenClawActivityItem[]; open: boolean; onClose: () => void }) {
  if (!open) return null

  const subAgentItems = group.filter(i => i.type === "subagent.response" || i.type === "stream.delta")
  const firstItem = group[0]

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
          {group.map((item, index) => (
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

    const sortedGroups = Array.from(groups.values()).map(group => {
      return group.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0))
    })

    sortedGroups.sort((a, b) => {
      const latestA = a[a.length - 1].timestamp || 0
      const latestB = b[b.length - 1].timestamp || 0
      return latestB - latestA
    })

    return sortedGroups.slice(0, 5)
  }, [activities])

  const totalEvents = groupedActivities.reduce((sum, g) => sum + g.length, 0)

  return (
    <>
      <Card className="flex h-full flex-col border-border bg-card">
        <CardHeader className="shrink-0 border-b border-border px-3 py-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Activity className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs font-medium">活动日志</span>
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

        <CardContent className="min-h-0 flex-1 p-2 overflow-y-auto">
          {groupedActivities.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <p className="text-[11px] text-muted-foreground">等待实时事件...</p>
            </div>
          ) : (
            <div className="space-y-2">
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
