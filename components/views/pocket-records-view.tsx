"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, MessageCircle, Bot, Calendar, Heart, Eye } from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from "recharts"
import {
  getPocketDataRecords,
  type PocketDataRecord,
} from "@/app/actions/pocket-records"
import { cn } from "@/lib/utils"

const kpiIcons = [FileText, MessageCircle, Bot, Calendar]
const kpiLabels = ["心墙发帖数", "评论互动数", "AI咨询次数", "预约咨询数"]

export function PocketRecordsView() {
  const [data, setData] = useState<PocketDataRecord | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [animatedCards, setAnimatedCards] = useState(false)
  const [animatedCharts, setAnimatedCharts] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const result = await getPocketDataRecords()
        setData(result)
      } finally {
        setIsLoading(false)
      }
    }
    void load()
  }, [])

  useEffect(() => {
    if (data) {
      const timer = setTimeout(() => {
        setAnimatedCards(true)
        setAnimatedCharts(true)
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [data])

  if (isLoading || !data) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-muted-foreground">加载中...</p>
      </div>
    )
  }

  const kpiValues = [
    data.kpis.postCount,
    data.kpis.commentCount,
    data.kpis.aiConsultCount,
    data.kpis.appointmentCount,
  ]
  const kpiChanges = [
    data.kpis.postChange,
    data.kpis.commentChange,
    data.kpis.aiConsultChange,
    data.kpis.appointmentChange,
  ]

  return (
    <div className="flex flex-col gap-4">
      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpiValues.map((value, i) => {
          const Icon = kpiIcons[i]
          return (
            <Card
              key={kpiLabels[i]}
              className={cn(
                "transition-all duration-500 hover:-translate-y-1 hover:shadow-lg",
                animatedCards ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              )}
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              <CardContent className="flex items-center gap-3 p-4">
                <div className="rounded-lg bg-primary/10 p-2.5 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground truncate">{kpiLabels[i]}</p>
                  <p className="text-xl font-bold text-foreground">{value.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground truncate">{kpiChanges[i]}</p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Main content grid */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Left: Post feed */}
        <div className="lg:col-span-2">
          <Card className="border-border bg-card shadow-sm">
            <CardHeader className="flex flex-row items-center gap-2 pb-2">
              <FileText className="h-5 w-5 text-primary" />
                <CardTitle className="text-base font-semibold text-foreground">
                心墙动态
              </CardTitle>
              <span className="ml-2 rounded bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">
                重点关注
              </span>
            </CardHeader>
            <CardContent className="max-h-[600px] overflow-y-auto">
              <div className="space-y-4">
                {data.posts.map((post, idx) => (
                  <div
                    key={post.id}
                    className={cn(
                      "rounded-lg border border-border/50 bg-secondary/10 p-4 transition-all",
                      animatedCards ? "animate-fade-in-up opacity-100" : "opacity-0"
                    )}
                    style={{ animationDelay: `${idx * 80}ms` }}
                  >
                    <div className="mb-2 flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-xs font-medium text-primary">
                        {post.studentName.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{post.studentName}</p>
                        <p className="text-xs text-muted-foreground">
                          {post.studentClass} · {post.timeAgo}
                        </p>
                      </div>
                    </div>
                    <p className="mb-3 text-sm text-foreground leading-relaxed">{post.content}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Heart className="h-3.5 w-3.5" />
                        {post.likes}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle className="h-3.5 w-3.5" />
                        {post.comments}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="h-3.5 w-3.5" />
                        {post.shares}
                      </span>
                    </div>
                  </div>
                ))}
                {data.posts.length === 0 && (
                  <p className="py-8 text-center text-sm text-muted-foreground">暂无数据</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Charts */}
        <div className="space-y-4">
          {/* Hourly distribution */}
          <Card className="border-border bg-card shadow-sm">
            <CardHeader className="flex flex-row items-center gap-2 pb-2">
              <MessageCircle className="h-5 w-5 text-chart-2" />
              <CardTitle className="text-base font-semibold text-foreground">
                活跃时段分布
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3">
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.hourlyDist} margin={{ top: 5, right: 5, bottom: 20, left: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                    <XAxis
                      dataKey="hour"
                      tick={{ fill: "#6B7280", fontSize: 14 }}
                      axisLine={{ stroke: "#E5E7EB" }}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: "#6B7280", fontSize: 12 }}
                      axisLine={{ stroke: "#E5E7EB" }}
                      tickLine={false}
                    />
                    <Tooltip
                      cursor={{ fill: "rgba(124, 58, 237, 0.05)" }}
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #E5E7EB",
                        borderRadius: "6px",
                        fontSize: "12px",
                      }}
                    />
                    <Bar 
                      dataKey="count" 
                      fill="#10B981" 
                      radius={[4, 4, 0, 0]}
                      isAnimationActive={animatedCharts}
                      animationDuration={1200}
                      animationEasing="ease-out"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Content type distribution */}
          <Card className="border-border bg-card shadow-sm">
            <CardHeader className="flex flex-row items-center gap-2 pb-2">
              <FileText className="h-5 w-5 text-chart-4" />
              <CardTitle className="text-base font-semibold text-foreground">
                内容类型分布
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3">
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.contentDist} layout="vertical" margin={{ top: 5, right: 40, bottom: 5, left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" horizontal={false} />
                    <XAxis
                      type="number"
                      tick={{ fill: "#6B7280", fontSize: 12 }}
                      axisLine={{ stroke: "#E5E7EB" }}
                      tickLine={false}
                    />
                    <YAxis
                      type="category"
                      dataKey="type"
                      tick={{ fill: "#6B7280", fontSize: 14 }}
                      axisLine={{ stroke: "#E5E7EB" }}
                      tickLine={false}
                    />
                    <Tooltip
                      cursor={{ fill: "rgba(124, 58, 237, 0.05)" }}
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #E5E7EB",
                        borderRadius: "6px",
                        fontSize: "12px",
                      }}
                    />
                    <Bar 
                      dataKey="count" 
                      radius={[0, 4, 4, 0]}
                      isAnimationActive={animatedCharts}
                      animationDuration={1200}
                      animationEasing="ease-out"
                    >
                      {data.contentDist.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
