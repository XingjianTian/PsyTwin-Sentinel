"use client"

import { useMemo } from "react"
import { Activity } from "lucide-react"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import {
  useOpenClawWorkflowStream,
  type OpenClawActivityItem,
} from "@/lib/openclaw/use-workflow-stream"
import { cn } from "@/lib/utils"

function formatTime(value?: number, fallback?: string) {
  if (fallback) return fallback
  if (!value) return "--:--"
  return new Date(value).toLocaleTimeString("zh-CN", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
  })
}

const AGENT_COLORS: Record<string, string> = {
  "首席数据官": "#3b82f6",
  "main": "#3b82f6",
  "分析师": "#8b5cf6",
  "analyst": "#8b5cf6",
  "采集员": "#10b981",
  "collector": "#10b981",
  "DBA": "#f59e0b",
  "数据哨兵": "#f59e0b",
  "dba": "#f59e0b",
  "中继工程师": "#06b6d4",
  "relayer": "#06b6d4",
  "咨询师": "#ec4899",
  "therapist": "#ec4899",
  "subagent": "#888888",
}

function getAgentColor(nameOrId: string): string {
  return AGENT_COLORS[nameOrId] || "#64748b"
}

function ActivityRow({ item, isFirst }: { item: OpenClawActivityItem; isFirst: boolean }) {
  const displayName = item.agentName || item.agentId || "系统"
  const agentColor = getAgentColor(displayName)

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
        "rounded-lg border border-border/60 bg-card p-2 transition-all duration-300 ease-out hover:bg-muted/30",
        isFirst && "border-primary/40 bg-primary/5"
      )}
    >
      <div className="flex gap-2">
        <div
          className="shrink-0 w-16 rounded-md px-2 py-1.5 flex items-center justify-center"
          style={{
            backgroundColor: `${agentColor}20`,
            border: `1px solid ${agentColor}50`,
          }}
        >
          <span
            className="text-[10px] font-semibold text-center leading-tight"
            style={{ color: agentColor }}
          >
            {displayName}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[9px] text-muted-foreground">
              {formatTime(item.timestamp, item.time)}
            </span>
          </div>
          <p className="text-[11px] text-foreground leading-relaxed line-clamp-3">
            {cleanMessage}
            {hasMore && <span className="text-muted-foreground">...</span>}
          </p>
        </div>

        <div className="shrink-0 w-8 flex items-center justify-center">
          <span className={cn("text-lg", stateColor)}>
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
