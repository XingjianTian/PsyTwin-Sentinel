"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { ScrollArea } from "@/components/ui/scroll-area"

interface TimelineEvent {
  id: string
  date: string
  title: string
  description: string
  status: "success" | "warning" | "active"
}

import { Skeleton } from "@/components/ui/skeleton"
import { Clock, Check, AlertTriangle, Activity, Calendar, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"

// 事件状态配置
const statusConfig = {
  success: {
    icon: Check,
    borderColor: "border-success",
    bgColor: "bg-success/20",
    iconColor: "text-success",
    label: "已完成",
    badgeVariant: "default" as const,
    badgeClass: "bg-success/10 text-success border-success/30",
  },
  warning: {
    icon: AlertTriangle,
    borderColor: "border-warning",
    bgColor: "bg-warning/20",
    iconColor: "text-warning",
    label: "需关注",
    badgeVariant: "default" as const,
    badgeClass: "bg-warning/10 text-warning border-warning/30",
  },
  active: {
    icon: Activity,
    borderColor: "border-primary",
    bgColor: "bg-primary/20",
    iconColor: "text-primary",
    label: "进行中",
    badgeVariant: "default" as const,
    badgeClass: "bg-primary/10 text-primary border-primary/30",
  },
}

// 事件类型过滤选项
const filterOptions = [
  { value: "all", label: "全部事件" },
  { value: "success", label: "已完成" },
  { value: "warning", label: "需关注" },
  { value: "active", label: "进行中" },
]

export default function StudentTimelinePage() {
  const params = useParams()
  const studentId = params.id as string
  
  const [events, setEvents] = useState<TimelineEvent[]>([])
  const [filteredEvents, setFilteredEvents] = useState<TimelineEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("all")

  useEffect(() => {
    async function fetchTimeline() {
      try {
        const response = await fetch(`/api/students/${studentId}/timeline`)
        if (!response.ok) throw new Error("Failed to fetch timeline")
        const result = await response.json()
        const data = result.events || []
        setEvents(data)
        setFilteredEvents(data)
      } catch (error) {
        console.error("Failed to fetch timeline:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchTimeline()
  }, [studentId])

  useEffect(() => {
    if (filter === "all") {
      setFilteredEvents(events)
    } else {
      setFilteredEvents(events.filter(e => e.status === filter))
    }
  }, [filter, events])

  // 按年份分组事件 - 处理中文日期格式
  const groupedEvents = filteredEvents.reduce((acc, event) => {
    // 解析中文日期格式 "2025年9月" 或 ISO 日期
    let year: number
    const chineseDateMatch = event.date.match(/(\d{4})年(\d{1,2})月/)
    if (chineseDateMatch) {
      year = parseInt(chineseDateMatch[1], 10)
    } else {
      year = new Date(event.date).getFullYear()
      if (isNaN(year)) year = 2025 // 默认值
    }
    if (!acc[year]) acc[year] = []
    acc[year].push(event)
    return acc
  }, {} as Record<number, TimelineEvent[]>)

  const sortedYears = Object.keys(groupedEvents)
    .map(Number)
    .sort((a, b) => b - a)

  if (loading) {
    return <TimelineSkeleton />
  }

  if (events.length === 0) {
    return (
      <Card>
        <CardContent className="flex h-64 items-center justify-center">
          <p className="text-muted-foreground">暂无心理周期事件</p>
        </CardContent>
      </Card>
    )
  }

  // 统计各状态事件数量
  const stats = {
    total: events.length,
    success: events.filter(e => e.status === "success").length,
    warning: events.filter(e => e.status === "warning").length,
    active: events.filter(e => e.status === "active").length,
  }

  return (
    <div className="grid gap-4 lg:grid-cols-4">
      {/* Left: Stats & Filters */}
      <div className="flex flex-col gap-4 lg:col-span-1">
        {/* Stats Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              事件统计
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">总事件数</span>
              <span className="font-semibold text-lg">{stats.total}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-success">已完成</span>
              <span className="font-semibold text-success">{stats.success}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-warning">需关注</span>
              <span className="font-semibold text-warning">{stats.warning}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-primary">进行中</span>
              <span className="font-semibold text-primary">{stats.active}</span>
            </div>
          </CardContent>
        </Card>

        {/* Filter Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Filter className="h-4 w-4" />
              筛选
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2">
              {filterOptions.map((option) => (
                <Button
                  key={option.value}
                  variant={filter === option.value ? "default" : "outline"}
                  size="sm"
                  className="justify-start"
                  onClick={() => setFilter(option.value)}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Info */}
        <Card className="bg-muted/50">
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground">
              心理周期事件记录了学生从入学到当前的所有心理健康相关活动，包括测评、干预、训练等。
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Right: Timeline */}
      <Card className="lg:col-span-3 border-border bg-card shadow-sm">
        <CardHeader className="flex flex-row items-center gap-2 pb-2">
          <Clock className="h-5 w-5 text-chart-4" />
          <CardTitle className="text-base font-semibold text-foreground">
            全心理周期追踪
          </CardTitle>
          <Badge variant="outline" className="ml-auto">
            {filteredEvents.length} 条记录
          </Badge>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px] pr-3">
            <div className="space-y-6">
              {sortedYears.map((year) => (
                <div key={year} className="relative">
                  {/* Year Header */}
                  <div className="sticky top-0 z-10 mb-3 flex items-center gap-3 bg-card/95 backdrop-blur-sm py-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                      <Calendar className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-lg font-bold text-foreground">{year}年</span>
                    <div className="flex-1 border-t border-border/60" />
                    <Badge variant="secondary">{groupedEvents[year].length} 件</Badge>
                  </div>

                  {/* Events for this year */}
                  <div className="relative ml-4 border-l-2 border-border/60 pl-6 space-y-4">
                    {groupedEvents[year].map((event) => {
                      const config = statusConfig[event.status]
                      const Icon = config.icon
                      
                      // 解析中文日期格式 "2025年9月"
                      let month: number, day: number
                      const chineseDateMatch = event.date.match(/(\d{4})年(\d{1,2})月/)
                      if (chineseDateMatch) {
                        month = parseInt(chineseDateMatch[2], 10)
                        day = 1 // 中文格式没有具体日期，显示1日
                      } else {
                        const eventDate = new Date(event.date)
                        month = eventDate.getMonth() + 1
                        day = eventDate.getDate()
                      }
                      if (isNaN(month)) {
                        month = 1
                        day = 1
                      }
                      
                      return (
                        <div key={event.id} className="relative">
                          {/* Node dot */}
                          <div
                            className={`absolute -left-[31px] top-0 flex h-5 w-5 items-center justify-center rounded-full border-2 ${config.borderColor} ${config.bgColor}`}
                          >
                            <Icon className={`h-2.5 w-2.5 ${config.iconColor}`} />
                          </div>

                          {/* Event Card */}
                          <div className="rounded-lg border border-border/60 bg-card/50 p-4 transition-colors hover:bg-secondary/30">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <p className="text-xs font-semibold text-muted-foreground">
                                    {month}月{day}日
                                  </p>
                                  <Badge 
                                    variant="outline" 
                                    className={config.badgeClass}
                                  >
                                    {config.label}
                                  </Badge>
                                </div>
                                <p className="text-sm font-medium text-foreground">
                                  {event.title}
                                </p>
                                <p className="mt-1 text-xs leading-relaxed text-muted-foreground/80">
                                  {event.description}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}

              {filteredEvents.length === 0 && (
                <div className="flex h-32 items-center justify-center">
                  <p className="text-muted-foreground">没有符合条件的事件</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}

function TimelineSkeleton() {
  return (
    <div className="grid gap-4 lg:grid-cols-4">
      <div className="flex flex-col gap-4">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
      <Card className="lg:col-span-3">
        <CardContent className="p-6">
          <Skeleton className="h-[500px] w-full" />
        </CardContent>
      </Card>
    </div>
  )
}
