"use client"

import Image from "next/image"
import { useParams } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Activity,
  Battery,
  Heart,
  MapPin,
  Moon,
  Sparkles,
  Users,
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
  personality: Array<{ label: string; value: number }>
  notes: Array<{ title: string; detail: string; tone: "good" | "calm" | "watch" }>
}

const petNames = ["小芯", "小安", "可乐", "奶茶", "球球", "墨墨"]
const colors = ["雪白", "浅蓝", "奶油白", "薄荷灰", "月光银"]
const accessories = ["蓝色水手帽", "星星领巾", "圆框护目镜", "轻便背包", "铃铛挂饰"]
const expressions = ["平静", "好奇", "开心", "专注", "有点困"]
const activities = ["在奇幻森林散步", "整理小背包", "和 AI 心宠打招呼", "观察树影变化", "安静休息"]
const schedules = ["自由活动", "课间休息", "午后探索", "晚间放松", "能量恢复"]
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
    personality: [
      { label: "开放度", value: bounded(seed, 4, 44, 72) },
      { label: "责任感", value: bounded(seed, 5, 42, 70) },
      { label: "亲和度", value: bounded(seed, 6, 48, 78) },
      { label: "敏感度", value: bounded(seed, 7, 30, 64) },
    ],
    notes: [
      {
        title: "状态稳定",
        detail: mood >= 70 ? "心情值处于较舒展区间" : "心情值保持在可观察区间",
        tone: mood >= 70 ? "good" : "calm",
      },
      {
        title: "能量节律",
        detail: energy >= 72 ? "当前适合探索和轻社交" : "当前更偏向安静恢复",
        tone: energy >= 72 ? "good" : "calm",
      },
      {
        title: "社交倾向",
        detail: sociability >= 60 ? "愿意接近 AI 心宠同伴" : "更喜欢保持自己的活动半径",
        tone: sociability >= 60 ? "good" : "watch",
      },
    ],
  }
}

function statusTone(value: number) {
  if (value >= 70) return "text-success"
  if (value >= 45) return "text-primary"
  return "text-warning"
}

function noteClass(tone: PetProfile["notes"][number]["tone"]) {
  if (tone === "good") return "border-success/30 bg-success/10 text-success"
  if (tone === "watch") return "border-warning/30 bg-warning/10 text-warning"
  return "border-primary/20 bg-primary/5 text-primary"
}

export default function StudentPetPage() {
  const params = useParams()
  const studentId = params.id as string
  const [student, setStudent] = useState<StudentSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const pet = useMemo(() => buildPetProfile(studentId, student), [studentId, student])

  useEffect(() => {
    async function fetchStudent() {
      try {
        const response = await fetch(`/api/students/${studentId}`)
        if (!response.ok) throw new Error("Failed to fetch student")
        const data = await response.json()
        setStudent({ id: data.id, name: data.name, studentNo: data.studentNo })
      } catch (error) {
        console.error("Failed to fetch student:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStudent()
  }, [studentId])

  if (loading) {
    return <PetSkeleton />
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
      <Card className="overflow-hidden border-border bg-card shadow-sm">
        <CardHeader className="flex flex-row items-center gap-2 pb-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <CardTitle className="text-base font-semibold text-foreground">
            主心宠外观
          </CardTitle>
          <Badge variant="secondary" className="ml-auto">
            {student?.name || "学生"}的心宠
          </Badge>
        </CardHeader>
        <CardContent className="grid gap-5 lg:grid-cols-[minmax(260px,0.9fr)_1fr]">
          <div className="relative flex min-h-[360px] items-end justify-center overflow-hidden rounded-lg border border-border bg-[linear-gradient(180deg,#eef7ff_0%,#f7fbf2_62%,#e4f5dc_100%)] p-6">
            <div className="absolute left-5 top-5 flex items-center gap-2 rounded-full border border-white/70 bg-white/80 px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm">
              <MapPin className="h-3.5 w-3.5 text-primary" />
              {pet.scene}
            </div>
            <div className="absolute inset-x-0 bottom-0 h-24 bg-[linear-gradient(180deg,transparent_0%,rgba(74,124,89,0.16)_100%)]" />
            <div className="absolute bottom-8 h-10 w-44 rounded-[50%] bg-emerald-900/10 blur-sm" />
            <Image
              src={pet.appearanceSrc}
              alt="主心宠外观"
              width={176}
              height={256}
              priority
              unoptimized
              className="relative z-10 h-64 w-auto object-contain drop-shadow-xl"
              style={{ imageRendering: "pixelated", width: "auto" }}
            />
          </div>

          <div className="flex flex-col justify-between gap-5">
            <div>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-2xl font-bold text-foreground">{pet.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    主心宠 · {student?.studentNo || studentId}
                  </p>
                </div>
                <Badge variant="outline">只读观察</Badge>
              </div>

              <div className="mt-5 grid gap-2 sm:grid-cols-3">
                <PetTag label="毛色" value={pet.color} />
                <PetTag label="配饰" value={pet.accessory} />
                <PetTag label="表情" value={pet.expression} />
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <StatusRow icon={Heart} label="心情" value={pet.mood} />
              <StatusRow icon={Battery} label="能量" value={pet.energy} />
              <StatusRow icon={Users} label="社交" value={pet.sociability} />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <InfoTile icon={Activity} label="当前活动" value={pet.activity} />
              <InfoTile icon={Moon} label="日程阶段" value={pet.schedule} />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        <Card className="border-border bg-card shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-foreground">
              心宠状态摘要
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {pet.notes.map((note) => (
              <div
                key={note.title}
                className={`rounded-lg border px-3 py-2 ${noteClass(note.tone)}`}
              >
                <p className="text-sm font-semibold">{note.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  {note.detail}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-border bg-card shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-foreground">
              虚拟人格参数
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {pet.personality.map((item) => (
              <StatusRow key={item.label} label={item.label} value={item.value} compact />
            ))}
          </CardContent>
        </Card>

        <Card className="border-border bg-muted/30 shadow-sm">
          <CardContent className="p-4 text-xs leading-relaxed text-muted-foreground">
            心宠状态来自虚拟心宠系统的展示值，用于老师了解学生端心宠体验与状态提醒线索，不等同于真实心理测评、诊断或风险分级。
          </CardContent>
        </Card>
      </div>
    </div>
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
  compact = false,
}: {
  icon?: React.ComponentType<{ className?: string }>
  label: string
  value: number
  compact?: boolean
}) {
  return (
    <div className={compact ? "space-y-1.5" : "space-y-2"}>
      <div className="flex items-center gap-2">
        {Icon && <Icon className={`h-4 w-4 ${statusTone(value)}`} />}
        <span className="text-sm font-medium text-foreground">{label}</span>
        <span className={`ml-auto font-mono text-sm font-semibold ${statusTone(value)}`}>
          {value}
        </span>
      </div>
      <Progress value={value} className={compact ? "h-1.5" : "h-2"} />
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
