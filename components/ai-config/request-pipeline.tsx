"use client"

import { useMemo, useState } from "react"
import { ChevronDown, Route } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useOpenClawWorkflowStream, type OpenClawRequestItem } from "@/lib/openclaw/use-workflow-stream"
import { cn } from "@/lib/utils"

const PIPELINE_STATES = [
  { id: "received", label: "已接入" },
  { id: "analyzing", label: "分析中" },
  { id: "task_created", label: "已创建任务" },
  { id: "assigned", label: "已分派" },
  { id: "in_progress", label: "执行中" },
  { id: "completed", label: "已完成" },
] as const

const STATE_INDEX = Object.fromEntries(PIPELINE_STATES.map((state, index) => [state.id, index]))

function RequestRow({ request }: { request: OpenClawRequestItem }) {
  const currentIndex = STATE_INDEX[request.state as keyof typeof STATE_INDEX] ?? 0
  const agentName = request.agentName || request.assignedTo || "未分派"

  return (
    <div className="rounded-lg border border-border/60 bg-muted/30 p-2.5 transition-all duration-300 ease-in-out hover:shadow-md">
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

      <div className="mb-1.5 flex gap-0.5">
        {PIPELINE_STATES.map((state, idx) => {
          const isDone = idx < currentIndex
          const isCurrent = idx === currentIndex

          return (
            <div
              key={state.id}
              className={cn(
              className={cn(
                "h-1 flex-1 rounded-full transition-all duration-500 ease-out",
                isDone && "bg-green-500",
                isCurrent && "animate-pulse bg-primary",
                !isDone && !isCurrent && "bg-muted-foreground/20"
              )}
                isDone && "bg-green-500",
                isCurrent && "animate-pulse bg-primary",
                !isDone && !isCurrent && "bg-muted-foreground/20"
              )}
            />
          )
        })}
      </div>

      <div className="flex items-center justify-between text-[9px]">
        <span className="text-primary">{PIPELINE_STATES[currentIndex]?.label ?? "已接入"}</span>
        <span className="text-muted-foreground">#{request.id.slice(0, 6)}</span>
      </div>
    </div>
  )
}

export function RequestPipeline() {
  const { requests } = useOpenClawWorkflowStream()
  const [collapsed, setCollapsed] = useState(false)

  const activeRequests = useMemo(
    () => requests.filter((item) => item.state !== "completed" && item.state !== "failed"),
    [requests]
  )

  return (
    <Card className="border-border bg-card">
      <CardHeader
        className="cursor-pointer border-b border-border py-2"
        onClick={() => setCollapsed((prev) => !prev)}
      >
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-xs text-foreground">
            <Route className="h-3.5 w-3.5" />
            请求流转
            {activeRequests.length > 0 ? (
              <span className="text-[9px] text-green-500">● 处理中</span>
            ) : null}
          </CardTitle>
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <span>{activeRequests.length} 活跃</span>
            <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", !collapsed && "rotate-180")} />
          </div>
        </div>
      </CardHeader>

      {!collapsed ? (
        <CardContent className="space-y-2 p-2.5 max-h-[160px] overflow-y-auto">
          {activeRequests.length === 0 ? (
            <div className="rounded-md border border-dashed border-border bg-muted/20 p-3 text-center text-[11px] text-muted-foreground">
              等待请求...
            </div>
          ) : (
            activeRequests.map((request) => <RequestRow key={request.id} request={request} />)
          )}
        </CardContent>
      ) : null}
    </Card>
  )
}
