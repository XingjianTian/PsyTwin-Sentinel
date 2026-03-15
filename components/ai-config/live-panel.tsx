"use client"

import { useMemo } from "react"
import Image from "next/image"
import { Activity } from "lucide-react"

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

function getAgentMeta(nameOrId: string) {
  const agentEntry = Object.entries(AGENTS).find(
    ([key, meta]) =>
      key.toLowerCase() === nameOrId.toLowerCase() ||
      meta.name === nameOrId
  )
  return agentEntry ? agentEntry[1] : null
}

function getAgentAvatar(agentId: string): string | null {
  const directMatch = AGENT_AVATAR_MAP[agentId.toLowerCase()]
  if (directMatch) return directMatch
  for (const [key, path] of Object.entries(AGENT_AVATAR_MAP)) {
    if (agentId.toLowerCase().includes(key)) return path
  }
  return null
}

function ActivityRow({ item, isFirst }: { item: OpenClawActivityItem; isFirst: boolean }) {
  const displayName = item.agentName || item.agentId || "系统"
  const agentMeta = getAgentMeta(displayName)
  const agentColor = agentMeta?.color || "#64748b"
  const avatarPath = getAgentAvatar(item.agentId || "")

  const cleanMessage = item.message
    ?.replace(/^\*?\*?\[[^\]]+\]\*?\*?\s*/, "")
    ?.replace(new RegExp(`^\\S+\\s+${item.agentId}\\s*`), "")
    ?.slice(0, 100)
    ?.replace(/\n/g, " ")

  const hasMore = (item.message?.length || 0) > 100

  const stateIcon = item.state === "completed" ? "✓" :
                    item.state === "in_progress" ? "◐" :
                    item.state === "analyzing" ? "🔍" :
                    item.state === "failed" ? "✗" : "●"

  const stateColor = item.state === "completed" ? "text-green-500" :
                     item.state === "in_progress" ? "text-blue-500" :
                     item.state === "analyzing" ? "text-amber-500" :
                     item.state === "failed" ? "text-red-500" : "text-gray-500"

  return (
    <div
      className={cn(
        "h-[68px] rounded-lg border border-border/60 bg-primary/3 p-2 transition-colors hover:bg-primary/5"
      )}
    >
      <div className="flex gap-2 h-full">
        <div
          className="shrink-0 w-12 h-12 rounded-md overflow-hidden border-2"
          style={{ borderColor: agentColor }}
        >
          {avatarPath ? (
            <Image
              src={avatarPath}
              alt={displayName}
              width={48}
              height={48}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-muted text-lg">
              {agentMeta?.emoji || "🤖"}
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <div className="flex items-center justify-between mb-0.5">
            <span 
              className="text-xs font-semibold truncate"
              style={{ color: agentColor }}
            >
              {displayName}
            </span>
            <span className="text-[9px] text-muted-foreground shrink-0 ml-2">
              {formatTime(item.timestamp, item.time)}
            </span>
          </div>
          <p className="text-[11px] text-foreground leading-snug line-clamp-2">
            {cleanMessage}
            {hasMore && <span className="text-muted-foreground">...</span>}
          </p>
        </div>

        <div className="shrink-0 w-6 flex items-center justify-center">
          <span className={cn("text-base", stateColor)}>
            {stateIcon}
          </span>
        </div>
      </div>
    </div>
  )
}

export function LivePanel() {
  const { activities } = useOpenClawWorkflowStream()

  const recentActivities = useMemo(() => {
    const seen = new Map<string, OpenClawActivityItem>()
    activities.forEach((item) => {
      const key = item.requestId || item.id
      if (!seen.has(key) || (item.timestamp && seen.get(key)!.timestamp! < item.timestamp)) {
        seen.set(key, item)
      }
    })
    return Array.from(seen.values()).slice(0, 5)
  }, [activities])

  return (
    <Card className="flex h-full flex-col border-border bg-card">
      <CardHeader className="shrink-0 border-b border-border px-3 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Activity className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs font-medium">活动日志</span>
            <span className="text-[9px] text-green-500">● LIVE</span>
          </div>
          <span className="text-[10px] text-muted-foreground">
            {recentActivities.length} 条
          </span>
        </div>
      </CardHeader>

      <CardContent className="min-h-0 flex-1 p-2 overflow-y-auto">
        {recentActivities.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-[11px] text-muted-foreground">等待实时事件...</p>
          </div>
        ) : (
          <div className="space-y-1">
            {recentActivities.map((item, i) => (
              <ActivityRow key={item.id} item={item} isFirst={i === 0} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
