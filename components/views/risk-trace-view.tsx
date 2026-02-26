"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  AlertTriangle,
  AudioLines,
  HeartPulse,
  BrainCircuit,
  ShieldCheck,
  ShieldAlert,
} from "lucide-react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts"

const CLASSES = ["网络2401", "虚拟2503", "软件2402", "数媒2401", "信安2401", "大数据2502"]

interface WorkOrder {
  id: number
  name: string
  className: string
  riskType: string
  level: "high" | "medium"
  time: string
  summary: string
}

const workOrders: WorkOrder[] = [
  { id: 1, name: "陈雨晴", className: "软件2402", riskType: "语音情感异常", level: "high", time: "14:32", summary: "连续3次语音检测触发阈值" },
  { id: 2, name: "张明远", className: "网络2401", riskType: "心率持续偏高", level: "high", time: "14:28", summary: "心率连续45分钟超过110bpm" },
  { id: 3, name: "刘思远", className: "数媒2401", riskType: "睡眠严重不足", level: "medium", time: "14:15", summary: "近7日平均睡眠时长不足4小时" },
  { id: 4, name: "吴志远", className: "大数据2502", riskType: "社交隔离", level: "high", time: "13:50", summary: "14天未出宿舍门禁记录" },
  { id: 5, name: "周航宇", className: "虚拟2503", riskType: "语音颤抖频发", level: "medium", time: "13:32", summary: "情感波动指数持续高位" },
  { id: 6, name: "赵天宇", className: "信安2401", riskType: "心率激增", level: "high", time: "13:10", summary: "突发性心率飙升至145bpm" },
  { id: 7, name: "黄思萌", className: "软件2402", riskType: "进食异常", level: "medium", time: "12:45", summary: "食堂消费记录连续7天为零" },
  { id: 8, name: "林志豪", className: "大数据2502", riskType: "步态异常", level: "medium", time: "12:20", summary: "行动轨迹分析检测到异常模式" },
]

const [selectedDefault] = workOrders

// Voice waveform component
function VoiceWaveform() {
  const [bars, setBars] = useState<number[]>(() =>
    Array.from({ length: 64 }, () => Math.random() * 80 + 10)
  )

  useEffect(() => {
    const interval = setInterval(() => {
      setBars((prev) =>
        prev.map((h) => {
          const delta = (Math.random() - 0.5) * 30
          return Math.max(5, Math.min(95, h + delta))
        })
      )
    }, 120)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex h-[140px] items-end gap-[2px] px-2">
      {bars.map((h, i) => (
        <div
          key={i}
          className="flex-1 rounded-t-sm transition-all duration-100"
          style={{
            height: `${h}%`,
            background: h > 70
              ? "linear-gradient(to top, #ef4444, #f97316)"
              : h > 40
                ? "linear-gradient(to top, #f97316, #facc15)"
                : "linear-gradient(to top, #00d4ff, #22c55e)",
            opacity: 0.8,
          }}
        />
      ))}
    </div>
  )
}

// Heart rate chart data
const hrData = Array.from({ length: 30 }, (_, i) => ({
  time: `${String(Math.floor(i / 2) + 13).padStart(2, "0")}:${i % 2 === 0 ? "00" : "30"}`,
  心率: Math.floor(75 + Math.sin(i * 0.5) * 15 + Math.random() * 20),
  血氧: Math.floor(96 + Math.sin(i * 0.3) * 2 + Math.random() * 2),
}))

interface HrTooltipProps {
  active?: boolean
  payload?: Array<{ name: string; value: number; color: string }>
  label?: string
}

function HrTooltip({ active, payload, label }: HrTooltipProps) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-md border border-border bg-popover px-3 py-2 text-xs shadow-lg">
      <p className="mb-1 font-medium text-foreground">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}：{p.value}{p.name === "心率" ? " bpm" : "%"}
        </p>
      ))}
    </div>
  )
}

// AI assessment text
const aiAssessment = `【Qwen-14B 风险溯源分析报告】

综合多模态数据交叉验证，该生近期心理状态评估如下：

1. 语音情感分析：在最近3次课堂发言中，声学特征显示语音基频（F0）波动幅度超出正常范围217%，梅尔频率倒谱系数（MFCC）呈现焦虑特征模式。语速较基线水平降低34%，伴随频繁停顿和语气词增多。

2. 生理特征监测：心率变异性（HRV）指标持续偏低，SDNN值为28.3ms（正常参考>50ms），提示自主神经调节功能受损。睡眠质量评分为2.1/10，深睡眠占比仅11%。

3. 行为轨迹分析：社交网络图谱显示近14天社交半径收缩至宿舍楼栋范围内，食堂就餐频率下降72%。图书馆打卡记录中断。

【风险等级评估】：中高风险（综合评分 78/100）
【建议干预方案】：启动二级预警流程，安排心理咨询师48小时内面谈，同步通知辅导员关注。`

export function RiskTraceView() {
  const [selectedOrder, setSelectedOrder] = useState<WorkOrder>(selectedDefault)

  return (
    <div className="grid gap-4 lg:grid-cols-5">
      {/* Left: Work order list */}
      <div className="lg:col-span-2">
        <Card className="border-[#3a1a2a]/60 bg-[#1a0a18]/70 backdrop-blur-md">
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
              <ul className="flex flex-col gap-2">
                {workOrders.map((order) => (
                  <li key={order.id}>
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className={`w-full rounded-lg border px-3 py-3 text-left transition-all ${
                        selectedOrder.id === order.id
                          ? "border-destructive/40 bg-destructive/10 ring-1 ring-destructive/20"
                          : "border-[#3a1a2a]/40 bg-[#1a0a18]/50 hover:bg-[#2a1020]/60"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-foreground">{order.name}</span>
                        <span className="text-xs text-muted-foreground">{order.className}</span>
                        <Badge
                          className={`ml-auto text-xs ${
                            order.level === "high"
                              ? "border-destructive/30 bg-destructive/20 text-destructive"
                              : "border-warning/30 bg-warning/20 text-warning"
                          }`}
                        >
                          {order.level === "high" ? "高危" : "中危"}
                        </Badge>
                      </div>
                      <p className="mt-1 text-xs font-medium text-muted-foreground">
                        {order.riskType}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground/70">
                        {order.summary}
                      </p>
                      <p className="mt-1 text-right font-mono text-xs text-muted-foreground/50">
                        {order.time}
                      </p>
                    </button>
                  </li>
                ))}
              </ul>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Right: Detail cards */}
      <div className="flex flex-col gap-4 lg:col-span-3">
        {/* Card A: Voice Waveform */}
        <Card className="border-[#0a2a2e]/60 bg-[#081e22]/80 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
            <AudioLines className="h-5 w-5 text-primary" />
            <CardTitle className="text-base font-semibold text-foreground">
              语音情感波形图
            </CardTitle>
            <span className="ml-auto text-xs text-muted-foreground">
              当前对象：{selectedOrder.name} ({selectedOrder.className})
            </span>
          </CardHeader>
          <CardContent>
            <VoiceWaveform />
            <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-destructive" />
                <span>高唤醒区</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-warning" />
                <span>中唤醒区</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-primary" />
                <span>平稳区</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card B: Heart Rate Chart */}
        <Card className="border-[#0a1a3a]/60 bg-[#080e22]/80 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
            <HeartPulse className="h-5 w-5 text-destructive" />
            <CardTitle className="text-base font-semibold text-foreground">
              生理特征曲线
            </CardTitle>
            <div className="ml-auto flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full" style={{ background: "#ef4444" }} />
                心率
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full" style={{ background: "#00d4ff" }} />
                血氧
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[180px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={hrData} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e2a45" />
                  <XAxis
                    dataKey="time"
                    tick={{ fill: "#64748b", fontSize: 10 }}
                    axisLine={{ stroke: "#1e2a45" }}
                    tickLine={false}
                    interval={4}
                  />
                  <YAxis
                    tick={{ fill: "#64748b", fontSize: 10 }}
                    axisLine={{ stroke: "#1e2a45" }}
                    tickLine={false}
                    domain={[60, 150]}
                  />
                  <Tooltip content={<HrTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="心率"
                    stroke="#ef4444"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4, fill: "#ef4444" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="血氧"
                    stroke="#00d4ff"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4, fill: "#00d4ff" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Card C: AI Risk Assessment */}
        <Card className="border-[#101a40]/60 bg-[#0a1030]/80 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
            <BrainCircuit className="h-5 w-5 text-chart-4" />
            <CardTitle className="text-base font-semibold text-foreground">
              AI 风险评估结论
            </CardTitle>
            <Badge className="ml-auto border-chart-4/30 bg-chart-4/10 font-mono text-xs text-chart-4">
              Qwen-14B
            </Badge>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[200px]">
              <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-secondary-foreground/90">
                {aiAssessment}
              </pre>
            </ScrollArea>
            <div className="mt-4 flex items-center justify-end gap-3">
              <button className="rounded-lg border border-success/30 bg-success/10 px-5 py-2 text-sm font-medium text-success shadow-[0_0_15px_rgba(34,197,94,0.15)] transition-all hover:bg-success/20 hover:shadow-[0_0_25px_rgba(34,197,94,0.25)]">
                <span className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4" />
                  确认干预
                </span>
              </button>
              <button className="rounded-lg border border-primary/30 bg-primary/10 px-5 py-2 text-sm font-medium text-primary shadow-[0_0_15px_rgba(0,212,255,0.15)] transition-all hover:bg-primary/20 hover:shadow-[0_0_25px_rgba(0,212,255,0.25)]">
                <span className="flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4" />
                  解除预警
                </span>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
