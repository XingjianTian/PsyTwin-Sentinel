"use client"

import { useState, useEffect, useRef } from "react"
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
  { stage: "干预执行", value: 531, rate: "42.5%", color: "#7C3AED" },
  { stage: "康复闭环", value: 387, rate: "31.0%", color: "#22c55e" },
]

interface FunnelTooltipProps {
  active?: boolean
  payload?: Array<{ payload: (typeof funnelData)[0] & { displayRate?: string; progress?: number } }>
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
        转化率：<span className="font-mono font-semibold" style={{ color: d.color }}>{d.displayRate || d.rate}</span>
      </p>
    </div>
  )
}

export function FunnelCard() {
  const [progresses, setProgresses] = useState<number[]>(funnelData.map(() => 0))
  const [shouldAnimate, setShouldAnimate] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)
  const hasAnimatedRef = useRef(false)

  useEffect(() => {
    if (hasAnimatedRef.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimatedRef.current) {
          hasAnimatedRef.current = true
          setShouldAnimate(true)
          observer.disconnect()
        }
      },
      { threshold: 0.8 }
    )

    if (cardRef.current) {
      observer.observe(cardRef.current)
    }

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!shouldAnimate) return

    let startTime: number
    let animationFrame: number

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const elapsed = timestamp - startTime

      let allDone = true
      const newProgresses = funnelData.map((_, i) => {
        const delay = i * 150
        const duration = 600
        let p = (elapsed - delay) / duration
        if (p < 0) p = 0
        if (p > 1) p = 1
        else allDone = false

        return 1 - Math.pow(1 - p, 4)
      })

      setProgresses(newProgresses)

      if (!allDone) {
        animationFrame = requestAnimationFrame(animate)
      }
    }

    animationFrame = requestAnimationFrame(animate)

    return () => cancelAnimationFrame(animationFrame)
  }, [shouldAnimate])

  const animatedData = funnelData.map((item, i) => {
    const p = progresses[i]
    const targetRate = parseFloat(item.rate)
    const currentRate = targetRate * p
    const displayRate = item.rate.includes('.') 
      ? currentRate.toFixed(1) + "%" 
      : Math.round(currentRate) + "%"

    return {
      ...item,
      value: Math.round(item.value * p),
      displayRate,
      progress: p,
    }
  })

  return (
    <Card ref={cardRef} className="border-border bg-card shadow-sm">
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
              data={animatedData}
              layout="vertical"
              margin={{ top: 5, right: 40, left: 10, bottom: 5 }}
              barCategoryGap="20%"
            >
              <XAxis
                type="number"
                domain={[0, 1400]}
                tick={{ fill: "#64748b", fontSize: 10 }}
                axisLine={{ stroke: "#E5E7EB" }}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="stage"
                width={72}
                tick={{ fill: "#6B7280", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<FunnelTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
              <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={24} isAnimationActive={false}>
                {animatedData.map((entry, index) => (
                  <Cell key={`funnel-${index}`} fill={entry.color} fillOpacity={0.85} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Progress Steps */}
        <div className="mt-4 flex items-center gap-1">
          {animatedData.map((item, i) => (
            <div key={item.stage} className="flex flex-1 items-center">
              <div className="flex flex-1 flex-col items-center gap-1">
                <div
                  className="flex h-[60px] w-[60px] items-center justify-center rounded-full text-[18px] font-bold transition-all duration-300"
                  style={{
                    backgroundColor: item.color + "20",
                    color: item.color,
                    border: `1.5px solid ${item.color}40`,
                    opacity: 0.3 + (item.progress * 0.7),
                    transform: `scale(${0.9 + (item.progress * 0.1)})`,
                  }}
                >
                  {item.displayRate}
                </div>
                <span 
                  className="text-center text-xs text-muted-foreground transition-opacity duration-300"
                  style={{ opacity: 0.5 + (item.progress * 0.5) }}
                >
                  {item.stage}
                </span>
              </div>
              {i < animatedData.length - 1 && (
                <div 
                  className="mx-1 h-px flex-1 bg-border transition-opacity duration-300" 
                  style={{ 
                    opacity: 0.3 + (animatedData[i + 1].progress * 0.7) 
                  }} 
                />
              )}
            </div>
          ))}
        </div>

        {/* KPI row */}
        <div className="mt-4 grid grid-cols-3 gap-3">
          <div className="rounded-md bg-secondary/50 px-3 py-2 text-center">
            <p className="font-mono text-lg font-bold text-destructive">{animatedData[0].value}</p>
            <p className="text-xs text-muted-foreground">总发现风险</p>
          </div>
          <div className="rounded-md bg-secondary/50 px-3 py-2 text-center">
            <p className="font-mono text-lg font-bold text-primary">{animatedData[2].displayRate}</p>
            <p className="text-xs text-muted-foreground">干预覆盖率</p>
          </div>
          <div className="rounded-md bg-secondary/50 px-3 py-2 text-center">
            <p className="font-mono text-lg font-bold text-success">{animatedData[4].displayRate}</p>
            <p className="text-xs text-muted-foreground">康复闭环率</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
