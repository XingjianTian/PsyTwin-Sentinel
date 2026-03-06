"use client"

import { useEffect, useState } from "react"
import { WorkOrderStatus } from "@prisma/client"
import { AlertTriangle, CalendarDays, ClipboardList, UserRound } from "lucide-react"

import { getWorkOrderDetail, updateWorkOrderStatus, type WorkOrderDetail } from "@/app/actions/work-order"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"

interface WorkOrderDetailSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  workOrderId: string | null
  onStatusChange?: () => Promise<void> | void
}

const statusColor: Record<WorkOrderDetail["status"], string> = {
  已结案: "border-success/30 bg-success/10 text-success",
  待处理: "border-muted-foreground/30 bg-muted/30 text-muted-foreground",
  干预中: "border-primary/30 bg-primary/10 text-primary",
}

const riskColor: Record<WorkOrderDetail["riskLevel"], string> = {
  高危: "border-destructive/30 bg-destructive/15 text-destructive",
  中危: "border-warning/30 bg-warning/15 text-warning",
  低危: "border-success/30 bg-success/15 text-success",
}

export function WorkOrderDetailSheet({
  open,
  onOpenChange,
  workOrderId,
  onStatusChange,
}: WorkOrderDetailSheetProps) {
  const [detail, setDetail] = useState<WorkOrderDetail | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open || !workOrderId) return
    const currentId = workOrderId

    let active = true

    async function loadDetail() {
      setIsLoading(true)
      setError(null)
      try {
        const result = await getWorkOrderDetail(currentId)
        if (!active) return
        setDetail(result)
      } catch {
        if (!active) return
        setError("工单详情加载失败，请稍后重试")
      } finally {
        if (!active) return
        setIsLoading(false)
      }
    }

    void loadDetail()

    return () => {
      active = false
    }
  }, [open, workOrderId])

  async function handleStatusUpdate(status: WorkOrderStatus) {
    if (!workOrderId) return
    setIsSubmitting(true)
    setError(null)

    try {
      await updateWorkOrderStatus(workOrderId, status)
      const latest = await getWorkOrderDetail(workOrderId)
      setDetail(latest)
      await onStatusChange?.()
    } catch {
      setError("状态更新失败，请稍后重试")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full border-l-border/70 sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle className="text-left text-xl">工单详情</SheetTitle>
          <SheetDescription>
            {detail ? `工单编号：${detail.id}` : "查看并更新干预工单的详细信息"}
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="mt-4 h-[calc(100vh-220px)] pr-1">
          {isLoading ? (
            <div className="rounded-lg border border-border bg-secondary/20 p-4 text-sm text-muted-foreground">
              正在加载工单详情...
            </div>
          ) : error ? (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
              {error}
            </div>
          ) : !detail ? (
            <div className="rounded-lg border border-border bg-secondary/20 p-4 text-sm text-muted-foreground">
              未找到工单详情
            </div>
          ) : (
            <div className="space-y-4 pb-2">
              <div className="rounded-xl border border-primary/20 bg-gradient-to-br from-primary/10 to-background p-4">
                <div className="mb-3 flex items-start justify-between gap-2">
                  <div>
                    <p className="text-lg font-semibold text-foreground">{detail.studentName}</p>
                    <p className="text-xs text-muted-foreground">{detail.studentNo} · {detail.className}</p>
                  </div>
                  <Badge className={`text-xs ${statusColor[detail.status]}`}>{detail.status}</Badge>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Badge className={`text-xs ${riskColor[detail.riskLevel]}`}>{detail.riskLevel}</Badge>
                  <Badge className="border-border bg-secondary/40 text-xs text-foreground">{detail.method}</Badge>
                  <Badge className="border-border bg-secondary/40 text-xs text-foreground">咨询师：{detail.counselor}</Badge>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border border-border bg-secondary/15 p-3">
                  <p className="mb-1 flex items-center gap-1 text-xs text-muted-foreground">
                    <ClipboardList className="h-3.5 w-3.5" />工单编号
                  </p>
                  <p className="break-all font-mono text-xs text-foreground">{detail.id}</p>
                </div>
                <div className="rounded-lg border border-border bg-secondary/15 p-3">
                  <p className="mb-1 flex items-center gap-1 text-xs text-muted-foreground">
                    <CalendarDays className="h-3.5 w-3.5" />记录时间
                  </p>
                  <p className="text-sm text-foreground">{detail.date}</p>
                </div>
                <div className="rounded-lg border border-border bg-secondary/15 p-3">
                  <p className="mb-1 flex items-center gap-1 text-xs text-muted-foreground">
                    <UserRound className="h-3.5 w-3.5" />负责咨询师
                  </p>
                  <p className="text-sm text-foreground">{detail.counselor}</p>
                </div>
                <div className="rounded-lg border border-border bg-secondary/15 p-3">
                  <p className="mb-1 flex items-center gap-1 text-xs text-muted-foreground">
                    <AlertTriangle className="h-3.5 w-3.5" />触发原因
                  </p>
                  <p className="line-clamp-2 text-sm text-foreground" title={detail.trigger}>{detail.trigger}</p>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="rounded-lg border border-border/70 bg-muted/20 p-3">
                  <p className="text-xs text-muted-foreground">工单摘要</p>
                  <p className="mt-2 rounded-lg border border-border bg-secondary/20 p-3 text-sm leading-relaxed text-foreground">
                    {detail.summary}
                  </p>
                </div>

                <div className="rounded-lg border border-border/70 bg-muted/20 p-3">
                  <p className="text-xs text-muted-foreground">工单详情</p>
                  <p className="mt-2 rounded-lg border border-border bg-secondary/20 p-3 text-sm leading-relaxed text-foreground">
                    {detail.detail}
                  </p>
                </div>

                <div className="rounded-lg border border-border/70 bg-muted/20 p-3">
                  <p className="text-xs text-muted-foreground">快捷状态操作</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {detail.status === "待处理" && (
                      <Button
                        size="sm"
                        variant="secondary"
                        className="border border-violet-300/40 bg-violet-500/10 text-violet-300 hover:bg-violet-500/20"
                        onClick={() => void handleStatusUpdate(WorkOrderStatus.IN_PROGRESS)}
                        disabled={isSubmitting}
                      >
                        设为干预中
                      </Button>
                    )}
                    {detail.status === "干预中" && (
                      <Button
                        size="sm"
                        variant="secondary"
                        className="border border-success/40 bg-success/10 text-success hover:bg-success/20"
                        onClick={() => void handleStatusUpdate(WorkOrderStatus.COMPLETED)}
                        disabled={isSubmitting}
                      >
                        设为已完成
                      </Button>
                    )}
                    {detail.status === "已结案" && (
                      <p className="text-sm text-muted-foreground">该工单已结案</p>
                    )}
                  </div>
              </div>
            </div>
          )}
        </ScrollArea>

        <SheetFooter className="mt-4 border-t border-border/60 pt-4">
          <div className="flex w-full items-center justify-between gap-2">
            <p className="text-xs text-muted-foreground">
              {isSubmitting ? "正在提交状态更新..." : "状态更新会实时同步到风险溯源和干预记录页面"}
            </p>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              关闭
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
