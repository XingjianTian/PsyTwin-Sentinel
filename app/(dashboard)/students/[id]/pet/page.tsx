"use client"

import Image from "next/image"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import {
  getStudentPetSnapshot,
  type StudentPetSnapshot,
} from "@/app/actions/pet-snapshot"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { PocketPetStage } from "@/components/pet/pocket-pet-stage"
import {
  PetLogCarousel,
  type PetLogCarouselItem,
} from "@/components/pet/pet-log-carousel"
import { usePetLiveSync, type PetLiveSyncConnectionStatus } from "@/hooks/use-pet-live-sync"
import { DEFAULT_POCKET_SCENE_ID, getPocketScenePresentation } from "@/lib/pet-live-sync"
import {
  Activity,
  Battery,
  Heart,
  MapPin,
  Moon,
  Sparkles,
  Users,
  Wifi,
  WifiOff,
} from "lucide-react"

interface StudentSummary {
  id: string
  name: string
  studentNo: string
}

interface PetProfile {
  name: string
  appearanceSrc: string
  color: string
  accessory: string
  expression: string
  mood: number
  energy: number
  sociability: number
  activity: string
  scene: string
  schedule: string
  logs: PetLog[]
}

type PetLog = PetLogCarouselItem

const petNames = ["小芯", "小安", "可乐", "奶茶", "球球", "墨墨"]
const colors = ["雪白", "浅蓝", "奶油白", "薄荷灰", "月光银"]
const accessories = ["蓝色水手帽", "星星领巾", "圆框护目镜", "轻便背包", "铃铛挂饰"]
const expressions = ["平静", "好奇", "开心", "专注", "有点困"]
const activities = ["在奇幻森林散步", "整理小背包", "和 AI 心宠打招呼", "观察树影变化", "安静休息"]
const schedules = ["自由活动", "课间休息", "午后探索", "晚间放松", "能量恢复"]
const petLogTemplates: Array<Omit<PetLog, "time">> = [
  {
    source: "Unity",
    title: "鲁班锁解密中",
    detail: "进入 Unity 益智互动场景，当前停留在第三层旋转结构。",
    tone: "unity",
  },
  {
    source: "小程序",
    title: "浏览心宠商店",
    detail: "查看了能量饮料、星星贴纸和安抚玩具，未触发购买记录。",
    tone: "shop",
  },
  {
    source: "小程序",
    title: "打开心情日记",
    detail: "查看今日日记入口，心宠尚未生成新的 AI 日记正文。",
    tone: "diary",
  },
  {
    source: "小程序",
    title: "整理心宠背包",
    detail: "筛选了恢复类物品，背包容量仍处于可用区间。",
    tone: "pocket",
  },
  {
    source: "小程序",
    title: "查看世界地图",
    detail: "从奇幻森林切到学校二级地图，短暂停留在图书馆场景。",
    tone: "pocket",
  },
  {
    source: "Unity",
    title: "完成轻量交互",
    detail: "与心宠进行一次抚摸反馈，心情数值小幅上升。",
    tone: "unity",
  },
  {
    source: "小程序",
    title: "查看帮助事件",
    detail: "阅读了心宠求助提示，暂未提交新的事件选项。",
    tone: "calm",
  },
]
const petVariantSources = Array.from(
  { length: 20 },
  (_, index) => `/pet/variants/pet-${String(index + 1).padStart(2, "0")}.png`,
)
const petAssetVersion = "20260609-bottom-base-v3"

function hashString(value: string) {
  return value.split("").reduce((acc, char) => {
    return (acc * 31 + char.charCodeAt(0)) >>> 0
  }, 7)
}

function pick<T>(items: T[], seed: number, offset = 0) {
  return items[(seed + offset) % items.length]
}

function bounded(seed: number, offset: number, min: number, max: number) {
  return min + ((seed * (offset + 17)) % (max - min + 1))
}

function buildPetProfile(studentId: string, student?: StudentSummary | null): PetProfile {
  const dataKey = [studentId, student?.studentNo, student?.name].filter(Boolean).join(":")
  const seed = hashString(dataKey)
  const mood = bounded(seed, 1, 58, 86)
  const energy = bounded(seed, 2, 52, 90)
  const sociability = bounded(seed, 3, 34, 76)

  return {
    name: pick(petNames, seed),
    appearanceSrc: `${pick(petVariantSources, seed)}?v=${petAssetVersion}`,
    color: pick(colors, seed, 1),
    accessory: pick(accessories, seed, 2),
    expression: pick(expressions, seed, 3),
    mood,
    energy,
    sociability,
    activity: pick(activities, seed, 4),
    scene: "奇幻森林",
    schedule: pick(schedules, seed, 5),
    logs: buildPetLogs(seed),
  }
}

function buildPetLogs(seed: number) {
  const baseHour = 8 + (seed % 8)
  return Array.from({ length: 5 }, (_, index) => {
    const template = pick(petLogTemplates, seed, index * 2)
    const hour = Math.min(21, baseHour + index * 2)
    const minute = (seed * (index + 11)) % 60

    return {
      ...template,
      time: `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`,
    }
  })
}

type StatusPalette = "mood" | "energy" | "social" | "default"

function statusTone(value: number) {
  if (value >= 70) return "text-success"
  if (value >= 45) return "text-primary"
  return "text-warning"
}

function petStatusTone(value: number, palette: StatusPalette = "default") {
  if (palette === "mood") return value >= 50 ? "text-[#FF8E8E]" : "text-[#FF6B6B]"
  if (palette === "energy") return value >= 50 ? "text-[#35CFA0]" : "text-[#FF8C42]"
  if (palette === "social") return value >= 50 ? "text-[#46BDE8]" : "text-[#9B89B3]"
  return statusTone(value)
}

function petStatusBarClass(value: number, palette: StatusPalette = "default") {
  if (palette === "mood") return value >= 50 ? "bg-[#FF8E8E]" : "bg-[#FF6B6B]"
  if (palette === "energy") return value >= 50 ? "bg-[#A8E6CF]" : "bg-[#FF8C42]"
  if (palette === "social") return value >= 50 ? "bg-[#87CEEB]" : "bg-[#9B89B3]"
  return "bg-primary"
}

function petStatusTrackClass(value: number, palette: StatusPalette = "default") {
  if (palette === "mood") return value >= 50 ? "bg-[#FF8E8E]/25" : "bg-[#FF6B6B]/25"
  if (palette === "energy") return value >= 50 ? "bg-[#A8E6CF]/35" : "bg-[#FF8C42]/25"
  if (palette === "social") return value >= 50 ? "bg-[#87CEEB]/30" : "bg-[#9B89B3]/25"
  return ""
}

export default function StudentPetPage() {
  const params = useParams()
  const studentId = params.id as string
  const [student, setStudent] = useState<StudentSummary | null>(null)
  const [pet, setPet] = useState<StudentPetSnapshot | null>(null)
  const [loading, setLoading] = useState(true)
  const isDemoPetObserver = studentId === "stu-test"
  const liveSync = usePetLiveSync({ enabled: isDemoPetObserver, userId: "demo_pet" })

  useEffect(() => {
    async function fetchPetData() {
      try {
        const [response, petSnapshot] = await Promise.all([
          fetch(`/api/students/${studentId}`),
          getStudentPetSnapshot(studentId),
        ])
        if (!response.ok) throw new Error("Failed to fetch student")
        const data = await response.json()
        setStudent({ id: data.id, name: data.name, studentNo: data.studentNo })
        setPet(petSnapshot)
      } catch (error) {
        console.error("Failed to fetch pet data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchPetData()
  }, [studentId])

  if (loading || !pet) {
    return <PetSkeleton />
  }

  const defaultPocketScene = getPocketScenePresentation(DEFAULT_POCKET_SCENE_ID)
  const displayedMood = liveSync.update?.mood ?? pet.mood
  const displayedEnergy = liveSync.update?.energy ?? pet.energy
  const displayedSociability = liveSync.update?.sociability ?? pet.sociability
  const displayedActivity = liveSync.update?.activity ?? pet.activity
  const displayedSceneName = liveSync.update?.sceneName ?? defaultPocketScene.sceneName
  const displayedSceneBackground =
    liveSync.update?.sceneBackgroundSrc ?? defaultPocketScene.sceneBackgroundSrc
  const displayedLogs: PetLog[] =
    isDemoPetObserver && liveSync.update?.logs?.length
      ? liveSync.update.logs.map((log) => ({
          id: log.id,
          time: formatServerLogTime(log.date, log.time, log.timestamp),
          source: "心宠服务",
          title: log.title,
          detail: log.detail,
          tone: "server",
          mood: log.mood,
          energy: log.energy,
          sociability: log.sociability,
        }))
      : pet.logs

  return (
    <div className="flex flex-col gap-4">
      <Card className="overflow-hidden border-border bg-card shadow-sm">
        <CardHeader className="flex flex-row items-center gap-2 pb-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <CardTitle className="text-base font-semibold text-foreground">
            心宠外观
          </CardTitle>
          <Badge variant="secondary" className="ml-auto">
            {student?.name || "学生"}的心宠
          </Badge>
        </CardHeader>
        <CardContent className="grid gap-5 lg:grid-cols-[minmax(260px,0.9fr)_1fr]">
          {isDemoPetObserver ? (
            <PocketPetStage
              sceneName={displayedSceneName}
              sceneBackgroundSrc={displayedSceneBackground}
              demoConversation={liveSync.update?.demoConversation}
            />
          ) : (
          <div className="relative flex min-h-[360px] items-end justify-center overflow-hidden rounded-lg border border-border bg-[linear-gradient(180deg,#eef7ff_0%,#f7fbf2_62%,#e4f5dc_100%)] p-6">
            <div className="absolute left-5 top-5 flex items-center gap-2 rounded-full border border-white/70 bg-white/80 px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm">
              <MapPin className="h-3.5 w-3.5 text-primary" />
              {pet.scene}
            </div>
            <div className="absolute inset-x-0 bottom-0 h-24 bg-[linear-gradient(180deg,transparent_0%,rgba(74,124,89,0.16)_100%)]" />
            <div className="absolute bottom-8 h-10 w-44 rounded-[50%] bg-emerald-900/10 blur-sm" />
            <Image
              src={pet.imageSrc}
              alt="心宠外观"
              width={176}
              height={256}
              priority
              unoptimized
              className="pet-float relative z-10 h-64 w-auto object-contain drop-shadow-xl"
              style={{ imageRendering: "pixelated", width: "auto" }}
            />
          </div>
          )}

          <div className="flex flex-col justify-between gap-5">
            <div>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-2xl font-bold text-foreground">{pet.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    心宠 · {student?.studentNo || studentId}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <Badge variant="outline">只读观察</Badge>
                  {isDemoPetObserver && (
                    <LiveSyncBadge
                      status={liveSync.connectionStatus}
                      lastUpdatedAt={liveSync.lastUpdatedAt}
                    />
                  )}
                </div>
              </div>

              <div className="mt-5 grid gap-2 sm:grid-cols-3">
                <PetTag label="毛色" value={pet.color} />
                <PetTag label="配饰" value={pet.accessory} />
                <PetTag label="表情" value={pet.expression} />
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <StatusRow icon={Heart} label="心情" value={displayedMood} delta={isDemoPetObserver ? undefined : pet.metricChanges.mood} palette="mood" />
              <StatusRow icon={Battery} label="能量" value={displayedEnergy} delta={isDemoPetObserver ? undefined : pet.metricChanges.energy} palette="energy" />
              <StatusRow icon={Users} label="社交" value={displayedSociability} delta={isDemoPetObserver ? undefined : pet.metricChanges.sociability} palette="social" />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <InfoTile icon={Activity} label="当前活动" value={displayedActivity} />
              <InfoTile icon={Moon} label="日程阶段" value={pet.schedule} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border bg-card shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base font-semibold text-foreground">
            <Activity className="h-4 w-4 text-primary" />
            学生端心宠日志
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <PetLogCarousel logs={displayedLogs} />
          <p className="pt-1 text-xs leading-relaxed text-muted-foreground">
            {isDemoPetObserver && liveSync.update?.logs?.length
              ? "日志来自本地心宠服务，展示心宠最近所在场景、活动事件与状态变化；不等同于真实心理测评、诊断或风险分级。"
              : "日志和变化值来自心宠数据库中的事件与日记记录，用于帮助老师理解学生端可见的心宠体验线索，不等同于真实心理测评、诊断或风险分级。"}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

function formatServerLogTime(date: string, time: string, timestamp?: number) {
  const today = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date())

  if (timestamp !== undefined) {
    const normalizedDate = new Intl.DateTimeFormat("sv-SE", {
      timeZone: "Asia/Shanghai",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date(timestamp))
    const normalizedTime = new Intl.DateTimeFormat("zh-CN", {
      timeZone: "Asia/Shanghai",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }).format(new Date(timestamp))
    return normalizedDate === today ? normalizedTime : `${normalizedDate.slice(5)} ${normalizedTime}`
  }

  return date === today ? time : `${date.slice(5)} ${time}`
}

function LiveSyncBadge({
  status,
  lastUpdatedAt,
}: {
  status: PetLiveSyncConnectionStatus
  lastUpdatedAt: number | null
}) {
  const presentation = {
    connecting: {
      label: "正在连接本地心宠",
      className: "border-sky-200 bg-sky-50 text-sky-700",
      icon: Wifi,
    },
    live: {
      label: "实时同步",
      className: "border-emerald-200 bg-emerald-50 text-emerald-700",
      icon: Wifi,
    },
    reconnecting: {
      label: "正在重连",
      className: "border-amber-200 bg-amber-50 text-amber-700",
      icon: WifiOff,
    },
    offline: {
      label: "本地服务未连接",
      className: "border-slate-200 bg-slate-50 text-slate-600",
      icon: WifiOff,
    },
  }[status]
  const Icon = presentation.icon
  const updateTime = lastUpdatedAt
    ? new Date(lastUpdatedAt).toLocaleTimeString("zh-CN", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      })
    : null

  return (
    <Badge variant="outline" className={presentation.className}>
      <Icon className="h-3 w-3" />
      {presentation.label}
      {updateTime ? ` · ${updateTime}` : ""}
    </Badge>
  )
}

function PetTag({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-muted/30 px-3 py-2">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-semibold text-foreground">{value}</p>
    </div>
  )
}

function StatusRow({
  icon: Icon,
  label,
  value,
  delta,
  compact = false,
  palette = "default",
}: {
  icon?: React.ComponentType<{ className?: string }>
  label: string
  value: number
  delta?: number
  compact?: boolean
  palette?: StatusPalette
}) {
  const toneClass = petStatusTone(value, palette)
  const deltaLabel = delta === undefined ? null : `${delta >= 0 ? "+" : ""}${delta}`

  return (
    <div className={compact ? "space-y-1.5" : "space-y-2"}>
      <div className="flex items-center gap-2">
        {Icon && <Icon className={`h-4 w-4 ${toneClass}`} />}
        <span className="text-sm font-medium text-foreground">{label}</span>
        <span className={`ml-auto font-mono text-sm font-semibold ${toneClass}`}>
          {value}
        </span>
        {deltaLabel && (
          <span
            className={`rounded px-1.5 py-0.5 text-xs font-semibold ${
              delta && delta < 0 ? "bg-warning/10 text-warning" : "bg-success/10 text-success"
            }`}
          >
            {deltaLabel}
          </span>
        )}
      </div>
      <Progress
        value={value}
        className={`${compact ? "h-1.5" : "h-2"} ${petStatusTrackClass(value, palette)}`}
        indicatorClassName={petStatusBarClass(value, palette)}
      />
    </div>
  )
}

function InfoTile({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
}) {
  return (
    <div className="rounded-lg border border-border bg-muted/30 px-3 py-3">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Icon className="h-3.5 w-3.5 text-primary" />
        {label}
      </div>
      <p className="mt-2 text-sm font-semibold text-foreground">{value}</p>
    </div>
  )
}

function PetSkeleton() {
  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
      <Card>
        <CardContent className="grid gap-5 p-6 lg:grid-cols-[minmax(260px,0.9fr)_1fr]">
          <Skeleton className="h-[360px] rounded-lg" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-36" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        </CardContent>
      </Card>
      <div className="space-y-4">
        <Skeleton className="h-44 w-full" />
        <Skeleton className="h-44 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    </div>
  )
}
