"use client"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp } from "lucide-react"

const funnelData = [
  { stage: "发现风险", value: 1248, rate: "100%", color: "#ef4444" },
  { stage: "初步评估", value: 986, rate: "79.0%", color: "#f97316" },
  { stage: "下达干预", value: 724, rate: "58.0%", color: "#facc15" },
  { stage: "干预执行", value: 531, rate: "42.5%", color: "#00d4ff" },
  { stage: "康复闭环", value: 387, rate: "31.0%", color: "#22c55e" },
]

interface FunnelTooltipProps {
  active?: boolean
  payload?: Array<{ payload: (typeof funnelData)[0] }>
}

function FunnelTooltip({ active, payload }: FunnelTooltipProps) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="rounded-md border border-border bg-popover px-3 py-2 text-xs shadow-lg">
      <p className="font-medium text-foreground">{d.stage}</p>
      <p className="text-muted-foreground">
        人数：<span className="font-mono font-semibold text-foreground">{d.value}</span>
      </p>
      <p className="text-muted-foreground">
        转化率：<span className="font-mono font-semibold" style={{ color: d.color }}>{d.rate}</span>
      </p>
    </div>
  )
}

export function FunnelCard() {
  return (
    <Card className="border-[#1a2040] bg-[#0d1225]/80 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center gap-2 pb-2">
        <TrendingUp className="h-5 w-5 text-success" />
        <CardTitle className="text-base font-semibold text-foreground">
          干预转化率监控
        </CardTitle>
        <span className="ml-auto text-xs text-muted-foreground">
          本学期累计
        </span>
      </CardHeader>
      <CardContent>
        {/* Funnel Bar Chart */}
        <div className="h-[180px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={funnelData}
              layout="vertical"
              margin={{ top: 5, right: 40, left: 10, bottom: 5 }}
              barCategoryGap="20%"
            >
              <XAxis
                type="number"
                domain={[0, 1400]}
                tick={{ fill: "#64748b", fontSize: 10 }}
                axisLine={{ stroke: "#1e2a45" }}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="stage"
                width={72}
                tick={{ fill: "#c4d0e4", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<FunnelTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
              <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={24}>
                {funnelData.map((entry, index) => (
                  <Cell key={`funnel-${index}`} fill={entry.color} fillOpacity={0.85} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Progress Steps */}
        <div className="mt-4 flex items-center gap-1">
          {funnelData.map((item, i) => (
            <div key={item.stage} className="flex flex-1 items-center">
              <div className="flex flex-1 flex-col items-center gap-1">
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold"
                  style={{
                    backgroundColor: item.color + "20",
                    color: item.color,
                    border: `1.5px solid ${item.color}40`,
                  }}
                >
                  {item.rate}
                </div>
                <span className="text-center text-xs text-muted-foreground">
                  {item.stage}
                </span>
              </div>
              {i < funnelData.length - 1 && (
                <div className="mx-1 h-px flex-1 bg-border" />
              )}
            </div>
          ))}
        </div>

        {/* KPI row */}
        <div className="mt-4 grid grid-cols-3 gap-3">
          <div className="rounded-md bg-secondary/50 px-3 py-2 text-center">
            <p className="font-mono text-lg font-bold text-destructive">1248</p>
            <p className="text-xs text-muted-foreground">总发现风险</p>
          </div>
          <div className="rounded-md bg-secondary/50 px-3 py-2 text-center">
            <p className="font-mono text-lg font-bold text-primary">58.0%</p>
            <p className="text-xs text-muted-foreground">干预覆盖率</p>
          </div>
          <div className="rounded-md bg-secondary/50 px-3 py-2 text-center">
            <p className="font-mono text-lg font-bold text-success">31.0%</p>
            <p className="text-xs text-muted-foreground">康复闭环率</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
