"use client"

import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity } from "lucide-react"

// Faculty data: x/y positions simulate a campus map, z is stress index
const facultyData = [
  { name: "计算机学院", x: 20, y: 70, z: 92, level: "high" },
  { name: "机械工程", x: 45, y: 85, z: 78, level: "high" },
  { name: "经济管理", x: 70, y: 60, z: 65, level: "medium" },
  { name: "外国语", x: 35, y: 40, z: 45, level: "low" },
  { name: "数学学院", x: 60, y: 30, z: 58, level: "medium" },
  { name: "法学院", x: 80, y: 80, z: 42, level: "low" },
  { name: "艺术设计", x: 15, y: 25, z: 35, level: "low" },
  { name: "医学院", x: 55, y: 55, z: 88, level: "high" },
  { name: "物理学院", x: 30, y: 65, z: 72, level: "high" },
  { name: "化学学院", x: 75, y: 40, z: 52, level: "medium" },
  { name: "土木工程", x: 50, y: 15, z: 60, level: "medium" },
  { name: "生命科学", x: 85, y: 25, z: 48, level: "low" },
]

const getColor = (level: string) => {
  switch (level) {
    case "high":
      return "#ef4444"
    case "medium":
      return "#f97316"
    case "low":
      return "#facc15"
    default:
      return "#facc15"
  }
}

interface HeatmapTooltipProps {
  active?: boolean
  payload?: Array<{ payload: (typeof facultyData)[0] }>
}

function HeatmapTooltip({ active, payload }: HeatmapTooltipProps) {
  if (!active || !payload?.length) return null
  const data = payload[0].payload
  return (
    <div className="rounded-md border border-border bg-popover px-3 py-2 text-xs shadow-lg">
      <p className="font-medium text-foreground">{data.name}</p>
      <p className="text-muted-foreground">
        压力指数：
        <span
          style={{ color: getColor(data.level) }}
          className="font-mono font-semibold"
        >
          {data.z}
        </span>
      </p>
      <p className="text-muted-foreground">
        等级：
        {data.level === "high"
          ? "高风险"
          : data.level === "medium"
            ? "中风险"
            : "低风险"}
      </p>
    </div>
  )
}

export function HeatmapCard() {
  return (
    <Card className="animate-pulse-glow border-border bg-card">
      <CardHeader className="flex flex-row items-center gap-2 pb-2">
        <Activity className="h-5 w-5 text-primary" />
        <CardTitle className="text-base font-semibold text-foreground">
          校园心理热力分布图
        </CardTitle>
        <span className="ml-auto rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
          实时
        </span>
      </CardHeader>
      <CardContent>
        {/* Legend */}
        <div className="mb-3 flex items-center gap-4">
          {[
            { label: "高风险", color: "#ef4444" },
            { label: "中风险", color: "#f97316" },
            { label: "低风险", color: "#facc15" },
          ].map((l) => (
            <div key={l.label} className="flex items-center gap-1.5">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: l.color }}
              />
              <span className="text-xs text-muted-foreground">{l.label}</span>
            </div>
          ))}
        </div>

        {/* Scatter Heatmap */}
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: 0 }}>
              <XAxis
                type="number"
                dataKey="x"
                domain={[0, 100]}
                tick={{ fill: "#64748b", fontSize: 10 }}
                axisLine={{ stroke: "#1e2a45" }}
                tickLine={false}
                label={{
                  value: "校区东西轴",
                  position: "insideBottom",
                  offset: -5,
                  style: { fill: "#64748b", fontSize: 10 },
                }}
              />
              <YAxis
                type="number"
                dataKey="y"
                domain={[0, 100]}
                tick={{ fill: "#64748b", fontSize: 10 }}
                axisLine={{ stroke: "#1e2a45" }}
                tickLine={false}
                label={{
                  value: "校区南北轴",
                  angle: -90,
                  position: "insideLeft",
                  style: { fill: "#64748b", fontSize: 10 },
                }}
              />
              <ZAxis
                type="number"
                dataKey="z"
                range={[120, 600]}
                name="压力指数"
              />
              <Tooltip
                content={<HeatmapTooltip />}
                cursor={false}
              />
              <Scatter data={facultyData} fillOpacity={0.7}>
                {facultyData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={getColor(entry.level)}
                    stroke={getColor(entry.level)}
                    strokeWidth={1}
                    opacity={0.75}
                  />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        {/* Summary row */}
        <div className="mt-3 grid grid-cols-3 gap-3">
          {[
            { label: "高风险院系", value: "4", color: "text-destructive" },
            { label: "中风险院系", value: "4", color: "text-warning" },
            { label: "低风险院系", value: "4", color: "text-chart-4" },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-md bg-secondary/50 px-3 py-2 text-center"
            >
              <p className={`font-mono text-lg font-bold ${s.color}`}>
                {s.value}
              </p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
