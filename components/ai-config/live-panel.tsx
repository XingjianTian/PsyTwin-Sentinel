"use client"

import { useMemo, useState } from "react"
import { Activity, Route } from "lucide-react"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import {
  useOpenClawWorkflowStream,
  type OpenClawRequestItem,
  type OpenClawActivityItem,
} from "@/lib/openclaw/use-workflow-stream"
import { cn } from "@/lib/utils"

// ─── 常量 ────────────────────────────────────────────────────────────────────

const PIPELINE_STATES = [
  { id: "received",     label: "接入" },
  { id: "analyzing",    label: "分析" },
  { id: "task_created", label: "创建" },
  { id: "assigned",     label: "分派" },
  { id: "in_progress",  label: "执行" },
  { id: "completed",    label: "完成" },
] as const

const STATE_INDEX = Object.fromEntries(
  PIPELINE_STATES.map((s, i) => [s.id, i])
)

// ─── 工具函数 ──────────────────────────────────────────────────────────────────

function formatTime(value?: number, fallback?: string) {
  if (fallback) return fallback
  if (!value) return "--:--"
  return new Date(value).toLocaleTimeString("zh-CN", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
  })
}

// ─── 请求行 ───────────────────────────────────────────────────────────────────

function RequestRow({ request }: { request: OpenClawRequestItem }) {
  const currentIndex = STATE_INDEX[request.state as keyof typeof STATE_INDEX] ?? 0
  const agentName = request.agentName || request.assignedTo || "未分派"

  return (
    <div className="rounded-lg border border-border/60 bg-muted/30 p-2.5">
      <div className="mb-1.5 flex items-start justify-between gap-2">
        <p className="line-clamp-2 text-[11px] text-foreground">{request.content}</p>
        <span className="shrink-0 rounded-full border border-primary/30 bg-primary/10 px-1.5 py-0.5 text-[9px] text-primary">
          {agentName}
        </span>
      </div>

      {/* 进度条 */}
      <div className="mb-1 flex gap-0.5">
        {PIPELINE_STATES.map((state, idx) => {
          const isDone    = idx < currentIndex
          const isCurrent = idx === currentIndex
          return (
            <div
              key={state.id}
              className={cn(
                "h-1 flex-1 rounded-full transition-colors",
                isDone    && "bg-green-500",
                isCurrent && "animate-pulse bg-primary",
                !isDone && !isCurrent && "bg-muted-foreground/20"
              )}
            />
          )
        })}
      </div>

      <div className="flex items-center justify-between text-[9px]">
        <span className="text-primary">{PIPELINE_STATES[currentIndex]?.label ?? "接入"}</span>
        <span className="text-muted-foreground">#{request.id.slice(0, 6)}</span>
      </div>
    </div>
  )
}

// ─── 活动行 ───────────────────────────────────────────────────────────────────

function ActivityRow({ item, isFirst }: { item: OpenClawActivityItem; isFirst: boolean }) {
  return (
    <div
      className={cn(
        "rounded border border-border/60 bg-muted/30 px-2 py-1.5",
        isFirst && "border-primary/40 bg-primary/5"
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-[9px] text-muted-foreground">
          {formatTime(item.timestamp, item.time)}
        </span>
        <span className="text-[10px] font-medium text-primary">
          {item.agentName || item.agentId || "系统"}
        </span>
      </div>
      <p className="truncate text-[11px] leading-tight text-foreground">{item.message}</p>
    </div>
  )
}

// ─── 合并面板 ─────────────────────────────────────────────────────────────────

export function LivePanel() {
  const { requests, activities } = useOpenClawWorkflowStream()
  const [activeView, setActiveView] = useState<"pipeline" | "log">("log")

  const activeRequests = useMemo(
    () => requests.filter((r) => r.state !== "completed" && r.state !== "failed").slice(0, 5),
    [requests]
  )

  // 只取 SSE 实时推送的最新 5 条（不拁取历史）
  const recentActivities = useMemo(() => activities.slice(0, 5), [activities])

  return (
    <Card className="flex h-full flex-col border-border bg-card">
      {/* Header */}
      <CardHeader className="shrink-0 border-b border-border px-3 py-2">
        {/* Tab 切换 */}
        <div className="flex items-center gap-1">
          {/* 活动日志 - 现在默认显示，放在前面 */}
          <button
            onClick={() => setActiveView("log")}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
              activeView === "log"
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Activity className="h-3 w-3" />
            活动日志
            <span className="text-[9px] text-green-500">● LIVE</span>
          </button>

          {/* 请求流转 - 现在放在后面 */}
          <button
            onClick={() => setActiveView("pipeline")}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
              activeView === "pipeline"
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Route className="h-3 w-3" />
            请求流转
            {activeRequests.length > 0 && (
              <span className="rounded-full bg-primary/20 px-1 text-[9px] font-bold text-primary">
                {activeRequests.length}
              </span>
            )}
          </button>

          {/* 右侧计数 */}
          <span className="ml-auto text-[10px] text-muted-foreground">
            {activeView === "log"
              ? `${recentActivities.length} 条`
              : `${activeRequests.length} 活跃`}
          </span>
        </div>
      </CardHeader>

      {/* Body */}
      <CardContent className="min-h-0 flex-1 p-0">
        {/* 请求流转 */}
        {activeView === "pipeline" && (
          <div className="h-full overflow-y-auto p-2 space-y-2">
            {activeRequests.length === 0 ? (
              <div className="flex h-full items-center justify-center">
                <p className="text-[11px] text-muted-foreground">暂无进行中请求</p>
              </div>
            ) : (
              activeRequests.slice(0, 5).map((r) => <RequestRow key={r.id} request={r} />)
            )}
          </div>
        )}

        {/* 活动日志 */}
        {activeView === "log" && (
          <div className="h-full overflow-y-auto p-2 space-y-1">
            {recentActivities.length === 0 ? (
              <div className="flex h-full items-center justify-center">
                <p className="text-[11px] text-muted-foreground">等待实时事件...</p>
              </div>
            ) : (
              recentActivities.map((item, i) => (
                <ActivityRow key={item.id} item={item} isFirst={i === 0} />
              ))
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
