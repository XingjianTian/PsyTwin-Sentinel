"use client"

import { useState, useEffect, useRef } from "react"
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity } from "lucide-react"

const facultyData = [
  { name: "计算机学院", x: 20, y: 70, z: 92, level: "high" },
  { name: "机械工程", x: 45, y: 85, z: 78, level: "high" },
  { name: "外国语", x: 35, y: 40, z: 45, level: "low" },
  { name: "数学学院", x: 60, y: 30, z: 58, level: "medium" },
  { name: "法学院", x: 80, y: 80, z: 42, level: "low" },
  { name: "艺术设计", x: 15, y: 25, z: 35, level: "low" },
  { name: "医学院", x: 55, y: 55, z: 88, level: "high" },
  { name: "化学学院", x: 75, y: 40, z: 52, level: "medium" },
  { name: "土木工程", x: 50, y: 15, z: 60, level: "medium" },
]

const mentalHealthKeywords = [
  "焦虑", "抑郁", "失眠", "压力", "适应", "人际", "学业", "情绪",
]

const getColor = (level: string) => {
  switch (level) {
    case "high": return "#ef4444"
    case "medium": return "#f97316"
    case "low": return "#facc15"
    default: return "#facc15"
  }
}

const getKeywordBg = (level: string) => {
  switch (level) {
    case "high": return "bg-red-500/20 border-red-500/40 text-red-400"
    case "medium": return "bg-orange-500/20 border-orange-500/40 text-orange-400"
    case "low": return "bg-yellow-500/20 border-yellow-500/40 text-yellow-400"
    default: return "bg-yellow-500/20 border-yellow-500/40 text-yellow-400"
  }
}

interface RippleState {
  index: number
  keyword: string
  keywordBg: string
}

export function HeatmapCard() {
  const [ripplingMap, setRipplingMap] = useState<Record<number, { keyword: string; bg: string; sessionId: number }>>({})
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const ripplingRef = useRef<Set<number>>(new Set())
  const sessionIdRef = useRef(0)

  useEffect(() => {
    const pickRandomPoint = () => {
      if (ripplingRef.current.size >= 4) return
      const available = facultyData
        .map((_, i) => i)
        .filter(i => !ripplingRef.current.has(i))
      if (available.length === 0) return
      const picked = available[Math.floor(Math.random() * available.length)]
      if (ripplingRef.current.has(picked)) return
      
      const currentSessionId = ++sessionIdRef.current
      ripplingRef.current.add(picked)
      setRipplingMap(prev => ({
        ...prev,
        [picked]: {
          keyword: mentalHealthKeywords[Math.floor(Math.random() * mentalHealthKeywords.length)],
          bg: getKeywordBg(facultyData[picked].level),
          sessionId: currentSessionId
        }
      }))
      
      setTimeout(() => {
        if (sessionIdRef.current !== currentSessionId) return
        ripplingRef.current.delete(picked)
        setRipplingMap(prev => {
          const next = { ...prev }
          delete next[picked]
          return next
        })
      }, 1800)
    }

    const scheduleNext = () => {
      const delay = 2000 + Math.random() * 2666
      timerRef.current = setTimeout(() => {
        pickRandomPoint()
        scheduleNext()
      }, delay)
    }

    scheduleNext()

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

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
          <span style={{ color: getColor(data.level) }} className="font-mono font-semibold">
            {data.z}
          </span>
        </p>
        <p className="text-muted-foreground">
          等级：
          {data.level === "high" ? "高风险" : data.level === "medium" ? "中风险" : "低风险"}
        </p>
      </div>
    )
  }

  return (
    <Card className="border-border bg-card shadow-sm h-[550px] flex flex-col">
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes ripple-expand {
            0% { transform: scale(1); opacity: 0.8; }
            100% { transform: scale(2.5); opacity: 0; }
          }
          @keyframes ripple-expand-2 {
            0% { transform: scale(1); opacity: 0.6; }
            100% { transform: scale(2.8); opacity: 0; }
          }
          @keyframes keyword-fade {
            0% { opacity: 0; transform: translateY(4px); }
            20% { opacity: 1; transform: translateY(0); }
            80% { opacity: 1; transform: translateY(-2px); }
            100% { opacity: 0; transform: translateY(-6px); }
          }
          @keyframes point-pulse {
            0% { transform: scale(1); }
            30% { transform: scale(1.2); }
            100% { transform: scale(1); }
          }
          @keyframes ecg-draw {
            0% { stroke-dashoffset: 1000; }
            100% { stroke-dashoffset: 0; }
          }
          .ripple-active {
            animation: point-pulse 1.8s ease-out forwards;
          }
          .ripple-ring-1 {
            animation: ripple-expand 1.8s ease-out forwards;
          }
          .ripple-ring-2 {
            animation: ripple-expand-2 1.8s 0.3s ease-out forwards;
          }
          .ripple-keyword {
            animation: keyword-fade 1.8s ease-out forwards;
          }
        `
      }} />
      <CardHeader className="flex flex-row items-center gap-2 pb-2 shrink-0">
        <Activity className="h-5 w-5 text-primary" />
        <CardTitle className="text-base font-semibold text-foreground">
          校园心理热力分布图
        </CardTitle>
        <span className="ml-auto rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
          实时
        </span>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col min-h-0">
        <div className="mb-3 flex items-center gap-4 shrink-0">
          {[
            { label: "高风险", color: "#ef4444" },
            { label: "中风险", color: "#f97316" },
            { label: "低风险", color: "#facc15" },
          ].map((l) => (
            <div key={l.label} className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: l.color }} />
              <span className="text-xs text-muted-foreground">{l.label}</span>
            </div>
          ))}
        </div>

        <div className="relative flex-1 w-full min-h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: 0 }}>
              <defs>
                <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e5e7eb" strokeWidth="0.5" opacity="0.5"/>
                </pattern>
                <pattern id="particles" width="40" height="40" patternUnits="userSpaceOnUse">
                  <circle cx="20" cy="20" r="1" fill="#9ca3af" opacity="0.3"/>
                </pattern>
                <linearGradient id="ecgGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity="0"/>
                  <stop offset="50%" stopColor="#06b6d4" stopOpacity="0.6"/>
                  <stop offset="100%" stopColor="#06b6d4" stopOpacity="0"/>
                </linearGradient>
              </defs>
              <rect x="0" y="0" width="100%" height="100%" fill="url(#grid)" />
              <rect x="0" y="0" width="100%" height="100%" fill="url(#particles)" />
              <path
                d="M 0 160 L 80 160 L 90 100 L 100 220 L 110 60 L 120 200 L 130 160 L 180 160 L 190 100 L 200 220 L 210 60 L 220 200 L 230 160 L 280 160 L 290 100 L 300 220 L 310 60 L 320 200 L 330 160 L 380 160 L 390 100 L 400 220 L 410 60 L 420 200 L 430 160 L 480 160 L 490 100 L 500 220 L 510 60 L 520 200 L 530 160 L 580 160 L 590 100 L 600 220 L 610 60 L 620 200 L 630 160"
                fill="none"
                stroke="url(#ecgGradient)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.7"
                style={{ animation: `ecg-draw 8s linear infinite`, strokeDasharray: "1000", strokeDashoffset: "1000" }}
              />
              <XAxis
                type="number"
                dataKey="x"
                domain={[0, 100]}
                axisLine={{ stroke: "#1e2a45" }}
                tickLine={false}
                label={{ value: "校区东西轴", position: "insideBottom", offset: -5, style: { fill: "#6B7280", fontSize: 10 } }}
              />
              <YAxis
                type="number"
                dataKey="y"
                domain={[0, 100]}
                axisLine={{ stroke: "#1e2a45" }}
                tickLine={false}
                label={{ value: "校区南北轴", angle: -90, position: "insideLeft", style: { fill: "#6B7280", fontSize: 10 } }}
              />
              <ZAxis type="number" dataKey="z" range={[120, 600]} name="压力指数" />
              <Tooltip content={<HeatmapTooltip />} cursor={false} />
              <Scatter data={facultyData} shape={(props: any) => {
                const { cx, cy, payload } = props
                if (!cx || !cy) return <g />
                const levelMultiplier = payload.level === "high" ? 1.75 : payload.level === "medium" ? 1.5 : 1.0
                const r = Math.sqrt(payload.z) * 1.2 * levelMultiplier
                const color = getColor(payload.level)
                const idx = facultyData.findIndex(f => f.name === payload.name)
                const rippleData = ripplingMap[idx]
                const isRippling = !!rippleData
                  return (
                    <g>
                      <text
                        x={cx}
                        y={cy - r - 4}
                        textAnchor="middle"
                        fill="#6b7280"
                        fontSize={15}
                        fontWeight={500}
                      >
                        {payload.name}
                      </text>
                      <circle 
                        cx={cx} cy={cy} r={r} 
                        fill={color} 
                        opacity={0.85} 
                        className={isRippling ? "ripple-active" : ""}
                        style={isRippling ? { transformOrigin: `${cx}px ${cy}px` } : undefined}
                      />
                    {isRippling && rippleData && (
                      <>
                        <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={2} className="ripple-ring-1" style={{ transformOrigin: `${cx}px ${cy}px` }} />
                        <circle cx={cx} cy={cy} r={r * 1.3} fill="none" stroke={color} strokeWidth={1.5} className="ripple-ring-2" style={{ transformOrigin: `${cx}px ${cy}px` }} />
                        <g className="ripple-keyword">
                          <rect
                            x={cx + r * 1.5 - 4}
                            y={cy - 16}
                            width={rippleData.keyword.length * 27 + 16}
                            height={36}
                            rx={6}
                            fill={rippleData.bg.includes("red") ? "rgba(239,68,68,0.15)" : rippleData.bg.includes("orange") ? "rgba(249,115,22,0.15)" : "rgba(234,179,8,0.15)"}
                            stroke={rippleData.bg.includes("red") ? "rgba(239,68,68,0.4)" : rippleData.bg.includes("orange") ? "rgba(249,115,22,0.4)" : "rgba(234,179,8,0.4)"}
                            strokeWidth={1.5}
                          />
                          <text
                            x={cx + r * 1.5 + (rippleData.keyword.length * 27 + 16) / 2 - 6}
                            y={cy + 6}
                            textAnchor="middle"
                            fill={rippleData.bg.includes("red") ? "#fca5a5" : rippleData.bg.includes("orange") ? "#fdba74" : "#fde047"}
                            fontSize={19}
                            fontWeight={600}
                          >
                            {rippleData.keyword}
                          </text>
                        </g>
                      </>
                    )}
                  </g>
                )
              }} />
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-3 shrink-0">
          {[
            { label: "高风险院系", value: "3", color: "text-destructive" },
            { label: "中风险院系", value: "3", color: "text-warning" },
            { label: "低风险院系", value: "3", color: "text-yellow-500" },
          ].map((s) => (
            <div key={s.label} className="rounded-md bg-secondary/50 px-3 py-2 text-center">
              <p className={`font-mono text-lg font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
