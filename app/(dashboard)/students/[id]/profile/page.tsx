"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar as RechartsRadar,
  ResponsiveContainer,
  Tooltip,
} from "recharts"
import { Skeleton } from "@/components/ui/skeleton"
import { Radar, Clock, Check, AlertTriangle, Activity } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"

interface StudentDetail {
  id: string
  name: string
  psychProfile: {
    adversityQuotient: number
    emotionalStability: number
    socialTendency: number
    stressResistance: number
    selfAwareness: number
    empathy: number
    willpower: number
    adaptability: number
    overallScore: number
  } | null
}

interface TimelineEvent {
  id: string
  date: string
  title: string
  description: string
  status: "success" | "warning" | "active"
}

// Radar chart data structure
const radarDataStatic = [
  { dimension: "逆商", value: 82 },
  { dimension: "情绪稳定", value: 68 },
  { dimension: "社交倾向", value: 75 },
  { dimension: "抗压能力", value: 85 },
  { dimension: "自我认知", value: 78 },
  { dimension: "共情能力", value: 90 },
  { dimension: "意志力", value: 72 },
  { dimension: "适应性", value: 80 },
]

interface RadarTooltipProps {
  active?: boolean
  payload?: Array<{ payload: { dimension: string; value: number } }>
}

function RadarTooltipContent({ active, payload }: RadarTooltipProps) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="rounded-md border border-border bg-popover px-3 py-2 text-xs shadow-lg">
      <p className="font-medium text-foreground">{d.dimension}</p>
      <p className="text-muted-foreground">
        评分：<span className="font-mono font-semibold text-primary">{d.value}</span>
      </p>
    </div>
  )
}

export default function StudentProfilePage() {
  const params = useParams()
  const studentId = params.id as string
  
  const [student, setStudent] = useState<StudentDetail | null>(null)
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const [studentRes, timelineRes] = await Promise.all([
          fetch(`/api/students/${studentId}`),
          fetch(`/api/students/${studentId}/timeline`),
        ])
        
        if (!studentRes.ok) throw new Error("Failed to fetch student")
        if (!timelineRes.ok) throw new Error("Failed to fetch timeline")
        
        const studentData = await studentRes.json()
        const timelineData = await timelineRes.json()
        
        setStudent(studentData)
        setTimelineEvents(timelineData.events?.slice(0, 5) || [])
      } catch (error) {
        console.error("Failed to fetch data:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [studentId])

  if (loading) {
    return <ProfileSkeleton />
  }

  if (!student?.psychProfile) {
    return (
      <Card>
        <CardContent className="flex h-64 items-center justify-center">
          <p className="text-muted-foreground">暂无心理画像数据</p>
        </CardContent>
      </Card>
    )
  }

  const overallScore = student.psychProfile.overallScore

  // 使用静态数据展示雷达图（确保能正常显示）
  // 实际项目中应该用 student.psychProfile 的数据
  const radarData = [
    { dimension: "逆商", value: student.psychProfile.adversityQuotient },
    { dimension: "情绪稳定", value: student.psychProfile.emotionalStability },
    { dimension: "社交倾向", value: student.psychProfile.socialTendency },
    { dimension: "抗压能力", value: student.psychProfile.stressResistance },
    { dimension: "自我认知", value: student.psychProfile.selfAwareness },
    { dimension: "共情能力", value: student.psychProfile.empathy },
    { dimension: "意志力", value: student.psychProfile.willpower },
    { dimension: "适应性", value: student.psychProfile.adaptability },
  ]

  return (
    <div className="flex flex-col gap-4">
      {/* Top: Radar + Timeline */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Radar Chart */}
        <Card className="border-border bg-card shadow-sm lg:col-span-2">
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
            <Radar className="h-5 w-5 text-primary" />
            <CardTitle className="text-base font-semibold text-foreground">
              多维心理雷达图
            </CardTitle>
            <Badge variant="outline" className="ml-auto">
              综合 {overallScore}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData} outerRadius="75%">
                  <PolarGrid stroke="#E5E7EB" />
                  <PolarAngleAxis
                    dataKey="dimension"
                    tick={{ fill: "#6B7280", fontSize: 12 }}
                  />
                  <PolarRadiusAxis
                    domain={[0, 100]}
                    tick={{ fill: "#9CA3AF", fontSize: 10 }}
                    axisLine={false}
                  />
                  <Tooltip content={<RadarTooltipContent />} />
                  <RechartsRadar
                    name="心理指标"
                    dataKey="value"
                    stroke="#7C3AED"
                    fill="#7C3AED"
                    fillOpacity={0.2}
                    strokeWidth={2}
                  />
                </RadarChart>
              </ResponsiveContainer>
              {/* 中心综合评分 */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                <div className="text-2xl font-bold text-primary">{overallScore}</div>
                <div className="text-[10px] text-muted-foreground">综合</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Timeline */}
        <Card className="border-border bg-card shadow-sm">
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
            <Clock className="h-5 w-5 text-chart-4" />
            <CardTitle className="text-base font-semibold text-foreground">
              全心理周期追踪
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px] pr-3">
              <div className="relative ml-3 border-l-2 border-border/60 pl-6">
                {timelineEvents.map((event, i) => (
                  <div key={i} className="relative mb-6 last:mb-0">
                    <div
                      className={`absolute -left-[31px] top-0.5 flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                        event.status === "warning"
                          ? "border-warning bg-warning/20"
                          : event.status === "active"
                            ? "border-primary bg-primary/20"
                            : "border-success bg-success/20"
                      }`}
                    >
                      {event.status === "warning" ? (
                        <AlertTriangle className="h-2.5 w-2.5 text-warning" />
                      ) : event.status === "active" ? (
                        <Activity className="h-2.5 w-2.5 text-primary" />
                      ) : (
                        <Check className="h-2.5 w-2.5 text-success" />
                      )}
                    </div>
                    <p className="text-xs font-semibold text-muted-foreground">
                      {event.date}
                    </p>
                    <p className="mt-0.5 text-sm font-medium text-foreground">
                      {event.title}
                    </p>
                    <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground/80">
                      {event.description}
                    </p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function ProfileSkeleton() {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardContent className="p-6">
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-6">
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    </div>
  )
}
