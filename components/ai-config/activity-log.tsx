"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Activity, ChevronDown } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useOpenClawWorkflowStream, type OpenClawActivityItem } from "@/lib/openclaw/use-workflow-stream"
import { cn } from "@/lib/utils"

function formatTime(value?: number, fallback?: string) {
  if (fallback) return fallback
  if (!value) return "--:--"
  return new Date(value).toLocaleTimeString("zh-CN", { hour12: false, hour: "2-digit", minute: "2-digit" })
}

export function ActivityLog() {
  const { activities } = useOpenClawWorkflowStream()
  const [collapsed, setCollapsed] = useState(false)
  const [historyEvents, setHistoryEvents] = useState<OpenClawActivityItem[]>([])
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)

  const containerRef = useRef<HTMLDivElement | null>(null)
  const offsetRef = useRef(0)

  const loadMoreHistory = useCallback(async () => {
    if (loading || !hasMore) return

    setLoading(true)
    try {
      const offset = offsetRef.current
      const response = await fetch(`/api/openclaw/workflow?type=events&limit=50&offset=${offset}`)
      const data = await response.json()

      const events = (data.events || []) as OpenClawActivityItem[]
      if (events.length > 0) {
        setHistoryEvents((prev) => [...prev, ...events])
        offsetRef.current += events.length
        setTotal(data.total || 0)
        setHasMore(offsetRef.current < (data.total || 0))
      } else {
        setHasMore(false)
      }
    } catch {
    } finally {
      setLoading(false)
    }
  }, [hasMore, loading])

  useEffect(() => {
    loadMoreHistory()
  }, [loadMoreHistory])

  const mergedActivities = useMemo(() => {
    const seen = new Set<string>()
    const merged: OpenClawActivityItem[] = []

    for (const item of activities) {
      if (!seen.has(item.id)) {
        seen.add(item.id)
        merged.push(item)
      }
    }

    for (const item of historyEvents) {
      if (!seen.has(item.id)) {
        seen.add(item.id)
        merged.push(item)
      }
    }

    return merged
  }, [activities, historyEvents])

  const handleScroll = useCallback(() => {
    const el = containerRef.current
    if (!el) return

    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80
    if (nearBottom) loadMoreHistory()
  }, [loadMoreHistory])

  return (
    <Card className="border-border bg-card">
      <CardHeader
        className="cursor-pointer border-b border-border py-1"
        onClick={() => setCollapsed((prev) => !prev)}
      >
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-xs text-foreground">
            <Activity className="h-3 w-3" />
            活动日志
            <span className="text-[9px] text-green-500">● LIVE</span>
          </CardTitle>
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <span>{total || mergedActivities.length} 条</span>
            <ChevronDown className={cn("h-3 w-3 transition-transform", !collapsed && "rotate-180")} />
          </div>
        </div>
      </CardHeader>

      {!collapsed ? (
        <CardContent className="p-0">
          <div
            ref={containerRef}
            onScroll={handleScroll}
            className="max-h-[90px] space-y-0 overflow-y-auto p-1.5"
          >
            {mergedActivities.length === 0 ? (
              <div className="rounded-md border border-dashed border-border bg-muted/20 p-2 text-center text-[11px] text-muted-foreground">
                等待活动...
              </div>
            ) : (
              mergedActivities.slice(0, 15).map((item, index) => (
                <div
                  key={item.id}
                  className={cn(
                    "rounded border border-border/60 bg-muted/30 px-2 py-1 transition-all duration-300 ease-out hover:bg-muted/50",
                    index === 0 && "animate-in fade-in slide-in-from-top-2 duration-500 border-primary/40 bg-primary/5"
                  )}
                >
                  {/* 第一行：时间 + 状态 */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[9px] text-muted-foreground">{formatTime(item.timestamp, item.time)}</span>
                    {item.state && (
                      <span className={cn(
                        "text-[9px] px-1 py-0.5 rounded-full",
                        item.state === "completed" && "bg-green-500/15 text-green-600",
                        item.state === "in_progress" && "bg-blue-500/15 text-blue-600",
                        item.state === "analyzing" && "bg-amber-500/15 text-amber-600",
                        item.state === "failed" && "bg-red-500/15 text-red-600",
                        !["completed", "in_progress", "analyzing", "failed"].includes(item.state) && "bg-gray-500/15 text-gray-600"
                      )}>
                        {item.state === "completed" && "✓"}
                        {item.state === "in_progress" && "◐"}
                        {item.state === "analyzing" && "🔍"}
                        {item.state === "failed" && "✗"}
                        {!item.state && "●"}
                      </span>
                    )}
                  </div>
                  
                  {/* 第二行：彩色Name标签 + 状态描述 */}
                  <div className="flex items-start gap-2 mt-0.5">
                    {/* Agent Name 彩色卡片 */}
                    <span
                      className="shrink-0 text-[10px] font-medium px-1 py-0.5 rounded-md border"
                      style={{
                        backgroundColor: `${item.agentColor || "#64748b"}15`,
                        borderColor: `${item.agentColor || "#64748b"}40`,
                        color: item.agentColor || "#64748b",
                      }}
                    >
                      {item.agentName || item.agentId || "系统"}
                    </span>
                    
                    {/* 状态描述（从 message 提取，去掉 agentId 前缀） */}
                    <span className="text-[11px] text-foreground leading-tight pt-0.5">
                      {item.message?.replace?.(/^\S+\s*/, "") || item.message}
                    </span>
                  </div>
                </div>
              ))
            )}

            {loading ? <p className="py-1 text-center text-[10px] text-muted-foreground">加载...</p> : null}
            {!hasMore && mergedActivities.length > 0 ? (
              <p className="py-1 text-center text-[9px] text-muted-foreground">— 完 —</p>
            ) : null}
          </div>
        </CardContent>
      ) : null}
    </Card>
  )
}
