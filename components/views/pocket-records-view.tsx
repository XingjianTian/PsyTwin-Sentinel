"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Activity,
  ArrowRight,
  Battery,
  Bot,
  Calendar,
  Eye,
  FileText,
  Heart,
  MapPin,
  MessageCircle,
  Moon,
  Sparkles,
  Users,
} from "lucide-react"
import {
  getPocketDataRecords,
  type PocketDataRecord,
} from "@/app/actions/pocket-records"
import type { StudentPetSnapshot } from "@/app/actions/pet-snapshot"
import { cn } from "@/lib/utils"
import { AnimatePresence, motion } from "framer-motion"

const kpiIcons = [FileText, MessageCircle, Bot, Calendar]
const kpiLabels = ["心墙发帖数", "评论互动数", "AI咨询次数", "预约咨询数"]

const dashboardColumns = "xl:grid-cols-[minmax(0,1.45fr)_minmax(340px,0.9fr)]"
const dynamicCardClass = "flex h-[560px] flex-col gap-0 border-border bg-card py-0 shadow-sm"
const dynamicContentClass =
  "min-h-0 flex-1 overflow-y-auto px-4 pb-4 pr-2 [scrollbar-gutter:stable] [scrollbar-width:thin] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-track]:bg-transparent"

function stateClass(state: string) {
  if (state === "需要关注") return "border-warning/30 bg-warning/10 text-warning"
  if (state === "能量恢复中") return "border-primary/20 bg-primary/10 text-primary"
  return "border-success/25 bg-success/10 text-success"
}

function noteClass(tone: StudentPetSnapshot["notes"][number]["tone"]) {
  if (tone === "good") return "border-success/30 bg-success/10 text-success"
  if (tone === "watch") return "border-warning/30 bg-warning/10 text-warning"
  return "border-primary/20 bg-primary/5 text-primary"
}

function PetInfoTag({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-background/80 px-2.5 py-2">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className="mt-0.5 truncate text-xs font-semibold text-foreground">{value}</p>
    </div>
  )
}

function PetStatusRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Heart
  label: string
  value: number
}) {
  return (
    <div className="grid gap-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="flex items-center gap-1.5 text-muted-foreground">
          <Icon className="h-3.5 w-3.5 text-primary" />
          {label}
        </span>
        <span className="font-semibold text-foreground">{value}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-primary transition-all duration-700" style={{ width: `${value}%` }} />
      </div>
    </div>
  )
}

function PetInfoTile({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Activity
  label: string
  value: string
}) {
  return (
    <div className="rounded-lg border border-border bg-background/80 p-3">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Icon className="h-3.5 w-3.5 text-primary" />
        {label}
      </div>
      <p className="mt-1.5 text-sm font-medium leading-snug text-foreground">{value}</p>
    </div>
  )
}

export function PocketRecordsView() {
  const [data, setData] = useState<PocketDataRecord | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [animatedCards, setAnimatedCards] = useState(false)
  const [animatedCharts, setAnimatedCharts] = useState(false)
  const [rotateIndex, setRotateIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

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
    setAnimatedCards(false)
    setAnimatedCharts(false)
    if (data) {
      const timer = setTimeout(() => {
        setAnimatedCards(true)
        setAnimatedCharts(true)
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [data])

  useEffect(() => {
    if (!data || data.posts.length <= 1) return

    if (!isPaused) {
      intervalRef.current = setInterval(() => {
        setRotateIndex((prev) => (prev + 1) % data.posts.length)
      }, 4000)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [data, isPaused])

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

  const rotatedPosts =
    data.posts.length > 0
      ? [...data.posts.slice(rotateIndex), ...data.posts.slice(0, rotateIndex)]
      : []
  const currentPost = rotatedPosts[0]
  const currentPet = currentPost ? data.petsByStudentId[currentPost.studentId] : null
  const maxHourlyCount = Math.max(...data.hourlyDist.map((item) => item.count), 1)

  return (
    <div className="flex flex-col gap-4">
      <div className={cn("grid items-start gap-4", dashboardColumns)}>
      <div className="grid content-start gap-3 sm:grid-cols-2">
        {kpiValues.map((value, i) => {
          const Icon = kpiIcons[i]
          return (
            <Card
              key={kpiLabels[i]}
              className={cn(
                "gap-0 rounded-lg py-0 transition-all duration-500 hover:-translate-y-1 hover:shadow-lg",
                animatedCards ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
              )}
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              <CardContent className="flex min-h-[72px] items-center gap-3 p-3">
                <div className="rounded-lg bg-primary/10 p-2.5 text-primary">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs text-muted-foreground">{kpiLabels[i]}</p>
                  <p className="text-xl font-bold text-foreground">{value.toLocaleString()}</p>
                  <p className="truncate text-xs text-muted-foreground">{kpiChanges[i]}</p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card className="gap-0 border-border bg-card py-0 shadow-sm">
        <CardHeader className="flex flex-row items-center gap-2 p-4 pb-1">
          <MessageCircle className="h-4 w-4 text-chart-2" />
          <CardTitle className="text-base font-semibold text-foreground">活跃时段分布</CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-3 pt-1">
          <div className="relative h-[112px] w-full pl-8">
            <div className="absolute bottom-5 left-0 top-1 flex flex-col justify-between text-[10px] text-muted-foreground">
              <span>600</span>
              <span>300</span>
              <span>0</span>
            </div>
            <div className="absolute bottom-5 left-8 right-0 top-1 border-l border-b border-border/70">
              <div className="absolute inset-x-0 top-0 border-t border-dashed border-border" />
              <div className="absolute inset-x-0 top-1/2 border-t border-dashed border-border" />
            </div>
            <div className="relative grid h-full grid-cols-4 items-end gap-3 pb-5 pl-3">
              {data.hourlyDist.map((item) => (
                <div key={item.hour} className="relative flex h-[82px] items-end justify-center">
                  <div
                    className="w-7 rounded-t bg-emerald-500 transition-[height] duration-700 ease-out"
                    style={{
                      height: animatedCharts
                        ? `${Math.max(10, (item.count / maxHourlyCount) * 72)}px`
                        : 0,
                    }}
                    title={`${item.hour}: ${item.count}`}
                  />
                  <span className="absolute -bottom-5 text-xs text-muted-foreground">{item.hour}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
      </div>

      <div className={cn("grid gap-4", dashboardColumns)}>
      <Card className={dynamicCardClass}>
        <CardHeader className="flex flex-row items-center gap-2 p-4 pb-2">
          <FileText className="h-5 w-5 text-primary" />
          <CardTitle className="text-base font-semibold text-foreground">心墙动态</CardTitle>
          <span className="ml-2 rounded bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">
            重点关注
          </span>
        </CardHeader>
        <CardContent
          className={dynamicContentClass}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {rotatedPosts.map((post, idx) => {
                const isTop = idx === 0
                return (
                  <motion.div
                    key={post.id}
                    layout
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className={cn(
                      "rounded-lg border bg-secondary/10 p-4 transition-all",
                      isTop
                        ? "border-primary/50 shadow-[0_0_15px_rgba(139,92,246,0.26),0_0_30px_rgba(139,92,246,0.08)]"
                        : "border-border/50",
                    )}
                  >
                    <div className="mb-2 flex items-center gap-2">
                      <div
                        className={cn(
                          "flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium transition-all",
                          isTop ? "scale-110 bg-primary/30 text-primary" : "bg-primary/20 text-primary",
                        )}
                      >
                        {post.studentName.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">{post.studentName}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {post.studentClass} · {post.timeAgo}
                        </p>
                      </div>
                    </div>
                    <p className="mb-3 line-clamp-3 text-sm leading-relaxed text-foreground">{post.content}</p>
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
                  </motion.div>
                )
              })}
            </AnimatePresence>
            {data.posts.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">暂无数据</p>}
          </div>
        </CardContent>
      </Card>

      <Card className={dynamicCardClass}>
        <CardHeader className="flex flex-row items-center gap-2 p-4 pb-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <CardTitle className="text-base font-semibold text-foreground">心宠动态</CardTitle>
          <span className="ml-auto rounded border border-primary/20 bg-primary/5 px-2 py-0.5 text-xs font-medium text-primary">
            跟随心墙首条
          </span>
        </CardHeader>
        <CardContent
          className={dynamicContentClass}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <AnimatePresence mode="wait">
            {currentPet ? (
              <motion.div
                key={currentPet.studentId}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="space-y-4"
              >
                <div className="overflow-hidden rounded-lg border border-primary/30 bg-secondary/10 shadow-[0_0_18px_rgba(139,92,246,0.16)]">
                  <div className="relative flex min-h-[164px] items-end justify-center overflow-hidden bg-[linear-gradient(180deg,#eef7ff_0%,#f7fbf2_62%,#e4f5dc_100%)] p-4">
                    <div className="absolute left-4 top-4 flex items-center gap-1.5 rounded-full border border-white/70 bg-white/80 px-2.5 py-1 text-xs text-muted-foreground shadow-sm">
                      <MapPin className="h-3.5 w-3.5 text-primary" />
                      {currentPet.scene}
                    </div>
                    <span className={cn("absolute right-4 top-4 rounded border px-2 py-0.5 text-xs font-medium", stateClass(currentPet.state))}>
                      {currentPet.state}
                    </span>
                    <div className="absolute inset-x-0 bottom-0 h-16 bg-[linear-gradient(180deg,transparent_0%,rgba(74,124,89,0.16)_100%)]" />
                    <div className="absolute bottom-5 h-7 w-32 rounded-[50%] bg-emerald-900/10 blur-sm" />
                    <img
                      src={currentPet.imageSrc}
                      alt={`${currentPet.studentName}的心宠`}
                      className="pet-float relative z-10 h-32 w-auto object-contain drop-shadow-xl [image-rendering:pixelated]"
                    />
                  </div>

                  <div className="p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm text-muted-foreground">{currentPet.studentName} · {currentPet.studentClass}</p>
                        <h3 className="mt-1 text-2xl font-bold text-foreground">{currentPet.name}</h3>
                      </div>
                      <Button asChild size="sm" variant="outline" className="h-8 shrink-0">
                        <Link href={`/students/${currentPet.studentId}/pet`}>
                          查看
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      </Button>
                    </div>

                    <div className="mt-3 grid grid-cols-3 gap-2">
                      <PetInfoTag label="毛色" value={currentPet.color} />
                      <PetInfoTag label="配饰" value={currentPet.accessory} />
                      <PetInfoTag label="表情" value={currentPet.expression} />
                    </div>
                  </div>
                </div>

                <div className="space-y-3 rounded-lg border border-border/70 bg-background/60 p-3">
                  <PetStatusRow icon={Heart} label="心情" value={currentPet.mood} />
                  <PetStatusRow icon={Battery} label="能量" value={currentPet.energy} />
                  <PetStatusRow icon={Users} label="社交" value={currentPet.sociability} />
                </div>

                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
                  <PetInfoTile icon={Activity} label="当前活动" value={currentPet.activity} />
                  <PetInfoTile icon={Moon} label="日程阶段" value={currentPet.schedule} />
                </div>

                <div className="space-y-2">
                  {currentPet.notes.map((note) => (
                    <div key={note.title} className={cn("rounded-lg border px-3 py-2", noteClass(note.tone))}>
                      <p className="text-sm font-semibold">{note.title}</p>
                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{note.detail}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            ) : (
              <p className="py-8 text-center text-sm text-muted-foreground">暂无数据</p>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
      </div>
    </div>
  )
}
