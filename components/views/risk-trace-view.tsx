"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  AlertTriangle,
  BrainCircuit,
  ShieldCheck,
  ShieldAlert,
} from "lucide-react"

import {
  confirmIntervention,
  getRiskWorkOrders,
  resolveWarning,
  type RiskWorkOrder,
} from "@/app/actions/risk-trace"
import { WorkOrderDetailSheet } from "@/components/work-order-detail-sheet"

// AI assessment text
const aiAssessment = `【Qwen-14B 风险溯源分析报告】

综合多模态数据交叉验证，该生近期心理状态评估如下：

1. 语音情感分析：在最近3次课堂发言中，声学特征显示语音基频（F0）波动幅度超出正常范围217%，梅尔频率倒谱系数（MFCC）呈现焦虑特征模式。语速较基线水平降低34%，伴随频繁停顿和语气词增多。

2. 生理特征监测：心率变异性（HRV）指标持续偏低，SDNN值为28.3ms（正常参考>50ms），提示自主神经调节功能受损。睡眠质量评分为2.1/10，深睡眠占比仅11%。

3. 行为轨迹分析：社交网络图谱显示近14天社交半径收缩至宿舍楼栋范围内，食堂就餐频率下降72%。图书馆打卡记录中断。

【风险等级评估】：中高风险（综合评分 78/100）
【建议干预方案】：启动二级预警流程，安排心理咨询师48小时内面谈，同步通知辅导员关注。`

export function RiskTraceView() {
  const [workOrders, setWorkOrders] = useState<RiskWorkOrder[]>([])
  const [selectedOrder, setSelectedOrder] = useState<RiskWorkOrder | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionMessage, setActionMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function loadOrders() {
    try {
      const orders = await getRiskWorkOrders()
      setWorkOrders(orders)
      setSelectedOrder((current) => {
        if (!orders.length) return null
        if (!current) return orders[0]
        return orders.find((item) => item.id === current.id) ?? orders[0]
      })
      setError(null)
    } catch {
      setError("工单加载失败，请稍后重试")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadOrders()
  }, [])

  async function handleConfirmIntervention() {
    if (!selectedOrder) return

    setIsSubmitting(true)
    setActionMessage(null)
    try {
      await confirmIntervention(selectedOrder.id)
      setActionMessage(`已确认干预：${selectedOrder.name}`)
      await loadOrders()
    } catch {
      setError("确认干预失败，请稍后重试")
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleResolveWarning() {
    if (!selectedOrder) return

    setIsSubmitting(true)
    setActionMessage(null)
    try {
      await resolveWarning(selectedOrder.id)
      setActionMessage(`已解除预警：${selectedOrder.name}`)
      await loadOrders()
    } catch {
      setError("解除预警失败，请稍后重试")
    } finally {
      setIsSubmitting(false)
    }
  }

  function openDetail() {
    setSheetOpen(true)
  }

  return (
    <div className="grid gap-4 lg:grid-cols-5">
      {/* Left: Work order list */}
      <div className="lg:col-span-2">
        <Card className="border-border bg-card shadow-sm">
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <CardTitle className="text-base font-semibold text-foreground">
              高危预警工单列表
            </CardTitle>
            <Badge className="ml-auto border-destructive/30 bg-destructive/15 text-destructive">
              {workOrders.length} 条待处理
            </Badge>
          </CardHeader>
          <CardContent className="px-3 pb-3">
            <ScrollArea className="h-[calc(100vh-200px)]">
              {isLoading ? (
                <p className="px-2 py-6 text-sm text-muted-foreground">正在加载工单...</p>
              ) : error ? (
                <p className="px-2 py-6 text-sm text-destructive">{error}</p>
              ) : workOrders.length === 0 ? (
                <p className="px-2 py-6 text-sm text-muted-foreground">暂无待处理工单</p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {workOrders.map((order) => (
                    <li key={order.id}>
                      <div
                        role="button"
                        tabIndex={0}
                        onClick={() => setSelectedOrder(order)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault()
                            setSelectedOrder(order)
                          }
                        }}
                        className={`w-full cursor-pointer rounded-lg border px-3 py-3 text-left transition-all ${
                          selectedOrder?.id === order.id
                            ? "border-destructive/40 bg-destructive/10 ring-1 ring-destructive/20"
                            : "border-border bg-muted/50 hover:bg-muted"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-foreground">{order.name}</span>
                          <span className="text-xs text-muted-foreground">{order.className}</span>
                          <Badge
                            className={`ml-auto text-xs ${
                              order.level === "high"
                                ? "border-destructive/30 bg-destructive/20 text-destructive"
                                : order.level === "medium"
                                  ? "border-warning/30 bg-warning/20 text-warning"
                                  : "border-success/30 bg-success/15 text-success"
                            }`}
                          >
                            {order.level === "high" ? "高危" : order.level === "medium" ? "中危" : "低危"}
                          </Badge>
                        </div>
                        <p className="mt-1 text-xs font-medium text-muted-foreground">{order.riskType}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground/70">{order.summary}</p>
                        <div className="mt-1 flex items-center justify-between">
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation()
                              setSelectedOrder(order)
                              openDetail()
                            }}
                            className="rounded border border-border px-2 py-0.5 text-[11px] text-muted-foreground transition-colors hover:bg-secondary/60"
                          >
                            查看详情
                          </button>
                          <p className="font-mono text-xs text-muted-foreground/50">{order.time}</p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Right: AI Risk Assessment only */}
      {/* Right: AI Risk Assessment - aligned with work order list */}
      <div className="lg:col-span-3">
        {/* Card C: AI Risk Assessment - Full Width */}
        <Card className="border-2 border-chart-4/30 bg-card shadow-lg">
          <CardHeader className="flex flex-row items-center gap-3 pb-3">
            <BrainCircuit className="h-6 w-6 text-chart-4" />
            <CardTitle className="text-lg font-bold text-foreground">
              AI 风险评估结论
            </CardTitle>
            <Badge className="ml-auto border-chart-4/30 bg-chart-4/10 font-mono text-xs text-chart-4">
              Qwen-14B
            </Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 推荐策略 Tag 突出显示 */}
            <div className="flex flex-wrap items-center gap-3 rounded-lg bg-gradient-to-r from-chart-4/10 to-transparent p-4">
              <span className="flex items-center gap-2 text-sm font-semibold text-chart-4">
                <ShieldCheck className="h-5 w-5" />
                推荐策略：
              </span>
              <Badge className="border-destructive/50 bg-destructive/15 px-3 py-1 text-sm font-bold text-destructive">
                立即干预
              </Badge>
              <Badge className="border-amber-500/50 bg-amber-500/15 px-3 py-1 text-sm font-bold text-amber-600">
                心理咨询
              </Badge>
              <Badge className="border-blue-500/50 bg-blue-500/15 px-3 py-1 text-sm font-bold text-blue-600">
                辅导员关注
              </Badge>
              <Badge className="border-purple-500/50 bg-purple-500/15 px-3 py-1 text-sm font-bold text-purple-600">
                家长沟通
              </Badge>
            </div>

            <ScrollArea className="h-[480px]">
              <pre className="whitespace-pre-wrap font-sans text-m leading-relaxed text-secondary-foreground/90">
                {aiAssessment}
              </pre>
            </ScrollArea>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => {
                  if (!selectedOrder) return
                  openDetail()
                }}
                disabled={!selectedOrder || isSubmitting}
                className="rounded-lg border border-border bg-secondary/30 px-5 py-2 text-sm font-medium text-foreground transition-all hover:bg-secondary/50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                查看工单详情
              </button>
              <button
                onClick={handleConfirmIntervention}
                disabled={!selectedOrder || isSubmitting}
                className="rounded-lg border border-success/30 bg-success/10 px-5 py-2 text-sm font-medium text-success shadow-[0_0_15px_rgba(34,197,94,0.15)] transition-all hover:bg-success/20 hover:shadow-[0_0_25px_rgba(34,197,94,0.25)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4" />
                  确认干预
                </span>
              </button>
              <button
                onClick={handleResolveWarning}
                disabled={!selectedOrder || isSubmitting}
                className="rounded-lg border border-primary/30 bg-primary/10 px-5 py-2 text-sm font-medium text-primary shadow-[0_0_15px_rgba(0,212,255,0.15)] transition-all hover:bg-primary/20 hover:shadow-[0_0_25px_rgba(0,212,255,0.25)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span className="flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4" />
                  解除预警
                </span>
              </button>
            </div>
            {actionMessage ? (
              <p className="text-right text-xs text-success">{actionMessage}</p>
            ) : null}
          </CardContent>
        </Card>
      </div>

      <WorkOrderDetailSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        workOrderId={selectedOrder?.id ?? null}
        onStatusChange={loadOrders}
      />
    </div>
  )
}
