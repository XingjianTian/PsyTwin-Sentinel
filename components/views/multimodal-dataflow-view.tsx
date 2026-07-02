"use client"

import { useEffect, useRef, useState, type ElementType } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Activity,
  AlertTriangle,
  Brain,
  Camera,
  CameraOff,
  DoorOpen,
  Eye,
  Hand,
  Heart,
  Mic,
  Radio,
  RefreshCw,
  Zap,
} from "lucide-react"
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { localBrowserCameraAdapter } from "@/lib/vision-camera"

type CameraStatus = "idle" | "loading" | "streaming" | "error"
type VitalMetricKey = "heartRate" | "gsr" | "hrv" | "stress"

interface StudentData {
  id: string
  name: string
  studentId: string
  room: string
  scenario: string
  startTime: string
  duration: number
  emotion: string
  riskLevel: string
  hrHistory?: Array<{ time: string; 心率: number; 血氧: number; hrv: number }>
  vitals: {
    heartRate: number
    hrv: number
    bloodOxygen: number
    gsr: number
    stress: number
  }
  voice: {
    sentiment: string
    tremorIndex: number
    emotionLabel: string
  }
  expression: {
    primary: string
    anxiety: number
    sadness: number
    anger: number
  }
  behavior: {
    interactionFreq: number
    handTremor: number
    responseDelay: number
    avoidanceCount: number
  }
}

interface VitalMetric {
  key: VitalMetricKey
  label: string
  description: string
  value: number
  fallback: number
  unit: string
  color: string
  lightColor: string
  icon: ElementType
}

function getCameraErrorMessage(error: unknown) {
  if (error instanceof DOMException) {
    if (error.name === "NotAllowedError") {
      return "浏览器摄像头权限未授权，请允许当前站点访问摄像头。"
    }

    if (error.name === "NotFoundError") {
      return "未检测到可用摄像头，请检查 Reachy Mini 或本机摄像头连接。"
    }
  }

  if (error instanceof Error) {
    return error.message
  }

  return "摄像头启动失败，请稍后重试。"
}

function getExpressionLabel(primary: string) {
  if (primary === "happy" || primary === "joyful") return "开心"
  if (primary === "sad") return "悲伤"
  if (primary === "angry") return "愤怒"
  if (primary === "fear" || primary === "fearful") return "恐惧"
  if (primary === "surprise" || primary === "surprised") return "惊讶"
  if (primary === "disgust" || primary === "disgusted") return "厌恶"
  if (primary === "nervous") return "紧张"
  if (primary === "neutral") return "中性"
  return "未知"
}

function getExpressionEmoji(primary: string) {
  if (primary === "happy" || primary === "joyful") return "😄"
  if (primary === "sad") return "😢"
  if (primary === "angry") return "😠"
  if (primary === "fear" || primary === "fearful") return "😨"
  if (primary === "surprise" || primary === "surprised") return "😮"
  if (primary === "disgust" || primary === "disgusted") return "🤢"
  if (primary === "nervous") return "😰"
  if (primary === "neutral") return "😐"
  return "❓"
}

function getSentimentLabel(sentiment: string, tremorIndex: number) {
  if (sentiment === "positive") return "积极稳定"
  if (sentiment === "negative") return tremorIndex > 0.3 ? "消极偏紧张" : "消极"
  return tremorIndex > 0.3 ? "中性偏紧张" : "中性"
}

function formatLiveElapsed(durationMinutes: number, seconds: number) {
  const safeMinutes = Number.isFinite(durationMinutes) ? Math.max(0, Math.floor(durationMinutes)) : 0
  const totalSeconds = Math.min(safeMinutes * 60 + seconds, 99 * 60 * 60 + 59 * 60 + 59)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const remainingSeconds = totalSeconds % 60
  const suffix = safeMinutes >= 100 * 60 ? "+" : ""

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}${suffix}`
}

function SignalTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: Array<{ name: string; value: number; color: string }>
  label?: string
}) {
  if (!active || !payload?.length) return null

  return (
    <div className="rounded-md border border-border bg-popover px-3 py-2 text-xs shadow-lg">
      <p className="mb-1 font-medium text-foreground">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}：{p.value}
        </p>
      ))}
    </div>
  )
}

function VoiceWaveform({ levels }: { levels?: number[] }) {
  const [bars, setBars] = useState<number[]>(Array(40).fill(5))

  useEffect(() => {
    if (levels !== undefined && levels.length > 0) {
      const padded = [...levels]
      while (padded.length < 40) padded.unshift(0)
      setBars(padded.slice(-40))
      return
    }

    if (levels !== undefined) {
      setBars(Array(40).fill(18))
      return
    }

    const interval = setInterval(() => {
      setBars((prev) =>
        prev.map((h, index) => {
          const pulse = Math.sin(Date.now() / 180 + index * 0.6) * 18
          return Math.max(8, Math.min(96, h + pulse * 0.12))
        })
      )
    }, 120)
    return () => clearInterval(interval)
  }, [levels])

  return (
    <div className="rounded-lg border border-purple-100 bg-white p-2 shadow-sm dark:border-purple-900 dark:bg-slate-900">
      <div className="flex h-[92px] items-end gap-[2px]">
        {bars.map((h, i) => (
          <div
            key={i}
            className="flex-1 rounded-t-sm transition-all duration-100"
            style={{
              height: `${h}%`,
              background:
                h > 70
                  ? "linear-gradient(to top, #ef4444, #f97316)"
                  : h > 40
                    ? "linear-gradient(to top, #a855f7, #facc15)"
                    : "linear-gradient(to top, #7c3aed, #22d3ee)",
              opacity: 0.86,
            }}
          />
        ))}
      </div>
      <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
        <span>0s</span>
        <span>4s</span>
        <span>8s</span>
      </div>
    </div>
  )
}

function buildVitalSeries(
  metric: VitalMetric,
  history: Array<{ time: string; 心率: number; 血氧: number; hrv: number }>
) {
  const value = metric.value || metric.fallback

  if (history.length > 0) {
    return history.slice(-24).map((point, index) => {
      const base =
        metric.key === "heartRate"
          ? point.心率
          : metric.key === "hrv"
            ? point.hrv
            : metric.key === "gsr"
              ? value + Math.sin(index / 2) * 0.6
              : value + Math.cos(index / 2) * 4

      return {
        time: point.time,
        value: Number(Math.max(0, base).toFixed(1)),
      }
    })
  }

  return Array.from({ length: 24 }, (_, index) => ({
    time: `${index}s`,
    value: Number((value + Math.sin(index / 2) * value * 0.08).toFixed(1)),
  }))
}

function VitalMetricPanel({
  metric,
  series,
  index,
  total,
}: {
  metric: VitalMetric
  series: Array<{ time: string; value: number }>
  index: number
  total: number
}) {
  const Icon = metric.icon
  const displayValue = metric.value || metric.fallback
  const statusLabel =
    metric.key === "heartRate"
      ? displayValue > 90
        ? "偏高"
        : "稳定"
      : metric.key === "hrv"
        ? displayValue < 30
          ? "偏低"
          : "稳定"
        : metric.key === "stress"
          ? displayValue > 55
            ? "需关注"
            : "可控"
          : displayValue > 4
            ? "唤醒升高"
            : "稳定"
  const deltaLabel =
    metric.key === "heartRate"
      ? "±7 bpm"
      : metric.key === "gsr"
        ? "±0.6 μS"
        : metric.key === "hrv"
          ? "±4 ms"
          : "±8"

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-lg"
            style={{ backgroundColor: metric.lightColor }}
          >
            <Icon className="h-5 w-5" style={{ color: metric.color }} />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">当前指标</p>
            <p className="text-lg font-semibold">{metric.label}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold" style={{ color: metric.color }}>
            {displayValue}
            <span className="ml-1 text-xs font-medium text-muted-foreground">{metric.unit}</span>
          </p>
          <p className="text-xs text-muted-foreground">{metric.description}</p>
        </div>
      </div>

      <div className="h-[96px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={series} margin={{ top: 8, right: 8, bottom: 0, left: -24 }}>
            <defs>
              <linearGradient id={`vital-${metric.key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={metric.color} stopOpacity={0.35} />
                <stop offset="95%" stopColor={metric.color} stopOpacity={0.03} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
            <XAxis dataKey="time" hide />
            <YAxis hide domain={["dataMin - 5", "dataMax + 5"]} />
            <Tooltip content={<SignalTooltip />} />
            <Area
              type="monotone"
              dataKey="value"
              name={metric.label}
              stroke={metric.color}
              strokeWidth={2.4}
              fill={`url(#vital-${metric.key})`}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-auto grid grid-cols-3 gap-3 pt-3">
        <div className="min-h-[58px] rounded-lg border border-border bg-muted/30 px-2.5 py-2">
          <p className="text-[11px] leading-tight text-muted-foreground">状态</p>
          <p className="mt-1 whitespace-nowrap text-xs font-semibold leading-tight" style={{ color: metric.color }}>
            {statusLabel}
          </p>
        </div>
        <div className="min-h-[58px] rounded-lg border border-border bg-muted/30 px-2.5 py-2">
          <p className="text-[11px] leading-tight text-muted-foreground">波动</p>
          <p className="mt-1 whitespace-nowrap text-xs font-semibold leading-tight text-foreground">{deltaLabel}</p>
        </div>
        <div className="min-h-[58px] rounded-lg border border-border bg-muted/30 px-2.5 py-2">
          <p className="text-[11px] leading-tight text-muted-foreground">采样</p>
          <p className="mt-1 whitespace-nowrap text-xs font-semibold leading-tight text-foreground">连续</p>
        </div>
      </div>

      <div className="flex items-center justify-between pt-1">
        <div className="flex gap-1">
          {Array.from({ length: total }).map((_, dotIndex) => (
            <span
              key={dotIndex}
              className={`h-2 rounded-full transition-all ${
                dotIndex === index ? "w-8" : "w-2 bg-muted"
              }`}
              style={dotIndex === index ? { backgroundColor: metric.color } : undefined}
            />
          ))}
        </div>
        <span className="text-sm text-muted-foreground">2 秒轮播</span>
      </div>
    </div>
  )
}

export function MultimodalDataFlowView() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [cameraStatus, setCameraStatus] = useState<CameraStatus>("idle")
  const [cameraLabel, setCameraLabel] = useState("Reachy Mini 摄像头")
  const [isCameraFallback, setIsCameraFallback] = useState(false)
  const [cameraError, setCameraError] = useState("")
  const [students, setStudents] = useState<StudentData[]>([])
  const [selectedStudentId, setSelectedStudentId] = useState<string>("")
  const [currentTime, setCurrentTime] = useState(new Date())
  const [loading, setLoading] = useState(true)
  const [isMock, setIsMock] = useState(false)
  const [activeTab, setActiveTab] = useState<string>("realtime-test")
  const [activeVitalMetricIndex, setActiveVitalMetricIndex] = useState(0)
  const [hrHistory, setHrHistory] = useState<Array<{ time: string; 心率: number; 血氧: number; hrv: number }>>([])
  const [audioLevel, setAudioLevel] = useState<number[]>([])
  const [voiceTranscription, setVoiceTranscription] = useState<string>("")
  const [hasReceivedData, setHasReceivedData] = useState(false)

  const testStudent: StudentData = {
    id: "stu-test",
    name: "测试学生",
    studentId: "test-001",
    room: "测试咨询室 A01",
    scenario: "Reachy Mini 实时直播",
    startTime: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }),
    duration: 12,
    emotion: "紧张",
    riskLevel: "medium",
    vitals: {
      heartRate: 92,
      hrv: 28,
      bloodOxygen: 98,
      gsr: 4.6,
      stress: 61,
    },
    voice: {
      sentiment: "neutral",
      tremorIndex: 0.42,
      emotionLabel: "紧张",
    },
    expression: {
      primary: "nervous",
      anxiety: 0.76,
      sadness: 0.18,
      anger: 0.09,
    },
    behavior: {
      interactionFreq: 0.8,
      handTremor: 0.23,
      responseDelay: 1.8,
      avoidanceCount: 2,
    },
  }

  const handleTabChange = (value: string) => {
    if (value === activeTab) return
    setActiveTab(value)
    if (value === "realtime-test") {
      setStudents([testStudent])
      setSelectedStudentId(testStudent.id)
      setIsMock(true)
      setLoading(false)
      setAudioLevel([])
      setHrHistory([])
      setHasReceivedData(false)
    } else {
      setLoading(true)
      void fetchData()
    }
  }

  useEffect(() => {
    let cancelled = false

    async function connectCamera() {
      setCameraStatus("loading")
      setCameraError("")

      try {
        let devices = await localBrowserCameraAdapter.listDevices?.().catch(() => [])
        devices = devices ?? []
        if (cancelled) return

        const reachyDevice = devices.find((device) => /reachy|mini/i.test(device.label))
        let stream = await localBrowserCameraAdapter.start({
          deviceId: reachyDevice?.deviceId,
        })

        if (cancelled) {
          localBrowserCameraAdapter.stop(stream)
          return
        }

        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }

        setCameraStatus("streaming")
        setCameraLabel(reachyDevice?.label || "本机摄像头")
        setIsCameraFallback(!reachyDevice)

        const postPermissionDevices = await localBrowserCameraAdapter.listDevices?.().catch(() => [])
        if (cancelled || !postPermissionDevices?.length) return

        const postPermissionReachy = postPermissionDevices.find((device) => /reachy|mini/i.test(device.label))
        if (!reachyDevice && postPermissionReachy) {
          localBrowserCameraAdapter.stop(stream)
          stream = await localBrowserCameraAdapter.start({ deviceId: postPermissionReachy.deviceId })
          if (cancelled) {
            localBrowserCameraAdapter.stop(stream)
            return
          }
          streamRef.current = stream
          if (videoRef.current) {
            videoRef.current.srcObject = stream
          }
          setCameraLabel(postPermissionReachy.label)
          setIsCameraFallback(false)
        }
      } catch (error) {
        if (!cancelled) {
          setCameraStatus("error")
          setCameraError(getCameraErrorMessage(error))
          setCameraLabel("摄像头未连接")
        }
      }
    }

    void connectCamera()

    return () => {
      cancelled = true
      if (streamRef.current) {
        localBrowserCameraAdapter.stop(streamRef.current)
        streamRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveVitalMetricIndex((index) => (index + 1) % 4)
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (activeTab === "realtime-test") {
      setStudents([testStudent])
      setSelectedStudentId(testStudent.id)
      setIsMock(true)
      setLoading(false)
      setHasReceivedData(false)
      setAudioLevel([])
      setHrHistory([])
    } else {
      setLoading(true)
      void fetchData()
    }
  }, [activeTab])

  useEffect(() => {
    if (activeTab !== "realtime-test" || !hasReceivedData) return

    const fluctuate = () => {
      const anxiety = 0.55 + Math.random() * 0.4
      const sadness = 0.1 + Math.random() * 0.25
      const anger = 0.05 + Math.random() * 0.2

      setStudents((prev) =>
        prev.map((s) => {
          if (s.id === selectedStudentId || s.id === "stu-test") {
            return {
              ...s,
              expression: {
                primary: "nervous",
                anxiety: Math.min(0.98, anxiety),
                sadness: Math.min(0.4, sadness),
                anger: Math.min(0.3, anger),
              },
            }
          }
          return s
        })
      )
    }

    fluctuate()
    const interval = setInterval(fluctuate, 1500 + Math.random() * 1500)

    return () => clearInterval(interval)
  }, [activeTab, selectedStudentId, hasReceivedData])

  useEffect(() => {
    if (activeTab !== "realtime-test") return

    const eventSource = new EventSource("/api/multimodal/sensors/stream")

    eventSource.addEventListener("connected", () => {})

    eventSource.addEventListener("multimodal_data", (event) => {
      try {
        const data = JSON.parse(event.data)
        const isTestStudent = activeTab === "realtime-test" && data.studentId === "stu-test"
        if (isTestStudent) {
          setHasReceivedData(true)
        }
        setStudents((prev) => {
          const currentStudent = prev.find((s) => s.id === selectedStudentId)
          if ((currentStudent && data.studentId === currentStudent.id) || isTestStudent) {
            return prev.map((s) => {
              if ((currentStudent && data.studentId === s.id) || isTestStudent) {
                return {
                  ...s,
                  vitals: data.vitalSign
                    ? {
                        heartRate: data.vitalSign.heartRate || s.vitals.heartRate,
                        hrv: data.vitalSign.hrv || s.vitals.hrv,
                        bloodOxygen: data.vitalSign.bloodOxygen ?? s.vitals.bloodOxygen,
                        gsr: data.vitalSign.gsr || s.vitals.gsr,
                        stress: data.vitalSign.stressIndex || s.vitals.stress,
                      }
                    : s.vitals,
                  voice: data.voiceAnalysis
                    ? {
                        sentiment: data.voiceAnalysis.sentiment?.toLowerCase() || "neutral",
                        tremorIndex: data.voiceAnalysis.tremorIndex || 0,
                        emotionLabel: data.voiceAnalysis.emotionLabel || "未知",
                      }
                    : s.voice,
                  expression: isTestStudent
                    ? s.expression
                    : data.expressionData
                      ? {
                          primary: data.expressionData.primaryExpression || s.expression.primary,
                          anxiety: data.expressionData.anxietyLevel || 0,
                          sadness: data.expressionData.sadnessLevel || 0,
                          anger: data.expressionData.angerLevel || 0,
                        }
                      : s.expression,
                  behavior: data.behaviorData
                    ? {
                        interactionFreq: data.behaviorData.interactionFreq || 0,
                        handTremor: data.behaviorData.handTremor || 0,
                        responseDelay: data.behaviorData.responseDelay || 0,
                        avoidanceCount: data.behaviorData.avoidanceCount || 0,
                      }
                    : s.behavior,
                }
              }
              return s
            })
          }
          return prev
        })

        setHrHistory((prev) => {
          if (data.vitalSign?.heartRate) {
            const now = new Date()
            const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`
            const lastOxygen = prev.slice(-1)[0]?.血氧 ?? 98
            const lastHrv = prev.slice(-1)[0]?.hrv ?? 28
            const newData = [
              ...prev,
              {
                time: timeStr,
                心率: data.vitalSign.heartRate,
                血氧: data.vitalSign.bloodOxygen ?? lastOxygen,
                hrv: data.vitalSign.hrv ?? lastHrv,
              },
            ]
            return newData.slice(-30)
          }
          return prev
        })
      } catch (error) {
        console.error("[SSE] Parse error:", error)
      }
    })

    let transcriptionTimer: ReturnType<typeof setTimeout> | null = null

    eventSource.addEventListener("voice_transcription", (event) => {
      try {
        const data = JSON.parse(event.data)
        if (data.text) {
          setVoiceTranscription((prev) => {
            const newText = data.text
            return prev ? `${prev}\n${newText}` : newText
          })
          if (transcriptionTimer) clearTimeout(transcriptionTimer)
          transcriptionTimer = setTimeout(() => {
            setVoiceTranscription("")
          }, 5000)
        }
      } catch (error) {
        console.error("[SSE] voice_transcription parse error:", error)
      }
    })

    eventSource.addEventListener("voice_level", (event) => {
      try {
        const data = JSON.parse(event.data)
        if (data.audioLevel !== undefined && activeTab === "realtime-test") {
          setAudioLevel((prev) => {
            const updated = [...prev, data.audioLevel]
            return updated.slice(-40)
          })
        }
      } catch (error) {
        console.error("[SSE] voice_level parse error:", error)
      }
    })

    eventSource.addEventListener("heartbeat", () => {})

    eventSource.onerror = () => {
      console.error("[SSE] Connection error, will retry...")
      eventSource.close()
    }

    return () => {
      eventSource.close()
      if (transcriptionTimer) clearTimeout(transcriptionTimer)
    }
  }, [activeTab])

  async function fetchData() {
    setLoading(true)
    try {
      const response = await fetch("/api/multimodal/students")
      if (response.ok) {
        const data = await response.json()
        setStudents(data.students)
        setIsMock(data.isMock)
        if (data.students.length > 0) {
          setSelectedStudentId(data.students[0].id)
          if (data.students[0].hrHistory) {
            setHrHistory(data.students[0].hrHistory)
          }
        }
      }
    } catch (error) {
      console.error("Failed to fetch multimodal data:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">加载多模态数据中...</span>
      </div>
    )
  }

  if (students.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <Activity className="mx-auto h-12 w-12 text-muted-foreground" />
          <p className="mt-2 text-muted-foreground">暂无活跃的学生会话</p>
        </div>
      </div>
    )
  }

  const currentStudent = students.find((s) => s.id === selectedStudentId) || students[0]
  const expressionLabel = getExpressionLabel(currentStudent.expression.primary)
  const expressionEmoji = getExpressionEmoji(currentStudent.expression.primary)
  const sentimentLabel = getSentimentLabel(currentStudent.voice.sentiment, currentStudent.voice.tremorIndex)
  const vitalMetrics: VitalMetric[] = [
    {
      key: "heartRate",
      label: "心率",
      description: "心搏频率",
      value: currentStudent.vitals.heartRate,
      fallback: 92,
      unit: "bpm",
      color: "#ef4444",
      lightColor: "#fee2e2",
      icon: Heart,
    },
    {
      key: "gsr",
      label: "皮电",
      description: "皮肤电反应",
      value: currentStudent.vitals.gsr,
      fallback: 4.6,
      unit: "μS",
      color: "#06b6d4",
      lightColor: "#cffafe",
      icon: Zap,
    },
    {
      key: "hrv",
      label: "HRV",
      description: "心率变异性",
      value: currentStudent.vitals.hrv,
      fallback: 28,
      unit: "ms",
      color: "#22c55e",
      lightColor: "#dcfce7",
      icon: Activity,
    },
    {
      key: "stress",
      label: "压力",
      description: "综合压力指数",
      value: currentStudent.vitals.stress,
      fallback: 61,
      unit: "",
      color: "#f59e0b",
      lightColor: "#fef3c7",
      icon: AlertTriangle,
    },
  ]
  const activeVitalIndex = activeVitalMetricIndex % vitalMetrics.length
  const activeVital = vitalMetrics[activeVitalIndex]
  const activeVitalSeries = buildVitalSeries(activeVital, hrHistory)
  const activeModeLabel = activeTab === "student-list" ? "学生列表" : "实时测试"
  const liveElapsedText = formatLiveElapsed(currentStudent.duration, currentTime.getSeconds())

  return (
    <div className="flex min-h-full flex-col gap-4">
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <div className="flex flex-wrap items-baseline gap-3">
            <h1 className="text-2xl font-bold tracking-normal">实时多模态直播舱</h1>
            <p className="text-sm text-muted-foreground">
              视觉、语音、生理与交互信号的同步直播监测
            </p>
          </div>
        </div>
      </div>

      <Card className="border-border bg-card">
        <CardContent className="px-3 py-3">
          <div className="grid min-w-0 grid-cols-1 items-center gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(130px,1fr)_minmax(150px,1.1fr)_minmax(90px,0.7fr)_minmax(118px,0.8fr)_minmax(152px,auto)]">
            <div className="flex min-w-0 items-center gap-2.5">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-primary/10 text-base text-primary">
                  {currentStudent.name[0]}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{currentStudent.name}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">学号：{currentStudent.studentId}</p>
              </div>
            </div>

            <div className="flex min-w-0 items-center gap-2.5 border-border sm:border-l sm:pl-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted/60">
                <DoorOpen className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{currentStudent.room}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">心理咨询室</p>
              </div>
            </div>

            <div className="flex min-w-0 flex-col items-start border-border xl:border-l xl:pl-4">
              <Badge className="bg-emerald-100 text-xs text-emerald-700 hover:bg-emerald-100">
                {activeModeLabel}
              </Badge>
              <p className="mt-1 text-xs text-muted-foreground">会话状态</p>
            </div>

            <div className="flex min-w-0 flex-col items-start border-border sm:border-l sm:pl-4">
              <Badge className="gap-1 bg-emerald-500 text-white hover:bg-emerald-500">
                <Radio className="h-3.5 w-3.5" />
                LIVE
              </Badge>
              <p className="mt-1 whitespace-nowrap text-xs text-muted-foreground">直播中 {liveElapsedText}</p>
            </div>

            <div className="flex min-w-0 items-center justify-start border-border pt-2 sm:col-span-2 xl:col-span-1 xl:border-l xl:border-t-0 xl:pl-4 xl:pt-0">
              <Tabs value={activeTab} onValueChange={handleTabChange}>
                <TabsList className="grid w-[148px] grid-cols-2 text-xs">
                  <TabsTrigger value="student-list" className="px-2">学生列表</TabsTrigger>
                  <TabsTrigger value="realtime-test" className="px-2">实时测试</TabsTrigger>
                </TabsList>
              </Tabs>
              {activeTab === "student-list" ? (
                <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="选择学生" />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map((student) => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : null}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid flex-1 gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
        <div className="grid min-h-0 gap-4 xl:grid-rows-[minmax(300px,0.92fr)_minmax(270px,1fr)]">
          <Card className="min-h-0 overflow-hidden border-border bg-card py-0">
            <CardContent className="flex min-h-0 flex-1 p-0">
              <div className="relative flex min-h-[300px] flex-1 items-center justify-center overflow-hidden bg-zinc-950">
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  className="h-full max-h-full w-full object-contain"
                />
                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[length:100%_18px] opacity-30" />
                <div className="absolute left-3 top-3 flex items-center gap-2">
                  <Badge className="gap-1 bg-emerald-500 text-white hover:bg-emerald-500">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
                    LIVE
                  </Badge>
                  <Badge variant="secondary" className="bg-black/45 text-white">
                    {cameraLabel} / 自动连接
                  </Badge>
                </div>

                {cameraStatus !== "streaming" ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-zinc-950 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5">
                      {cameraStatus === "error" ? (
                        <CameraOff className="h-6 w-6 text-red-300" />
                      ) : (
                        <Camera className="h-6 w-6 text-cyan-200" />
                      )}
                    </div>
                    <div>
                      <p className="text-base font-medium text-white">
                        {cameraStatus === "loading" ? "正在自动连接摄像头..." : "摄像头暂未连接"}
                      </p>
                      <p className="mt-2 max-w-md text-sm text-zinc-400">
                        {cameraError || "系统将优先选择 Reachy Mini 摄像头，未连接时使用本机摄像头。"}
                      </p>
                    </div>
                  </div>
                ) : null}
              </div>
            </CardContent>
          </Card>

          <div className="grid min-h-0 gap-4 lg:grid-cols-2">
            <Card className="flex min-h-0 flex-col border-purple-100 bg-card dark:border-purple-900">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Mic className="h-4 w-4 text-purple-500" />
                  语音流
                </CardTitle>
                <CardDescription className="text-xs">实时波形 · 实时转写 · 颤抖指数 · 倾向判断</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col gap-3">
                <VoiceWaveform levels={activeTab === "realtime-test" ? audioLevel : undefined} />
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-lg border border-purple-100 bg-purple-50/70 p-2 dark:border-purple-900 dark:bg-purple-950/30">
                    <p className="text-xs text-purple-600">颤抖指数</p>
                    <p className="text-xl font-bold text-purple-700">
                      {currentStudent.voice.tremorIndex.toFixed(2)}
                    </p>
                  </div>
                  <div className="rounded-lg border border-cyan-100 bg-cyan-50/70 p-2 dark:border-cyan-900 dark:bg-cyan-950/30">
                    <p className="text-xs text-cyan-700">倾向判断</p>
                    <p className="text-base font-semibold text-cyan-700">{sentimentLabel}</p>
                  </div>
                </div>
                <div className="rounded-lg border border-border bg-muted/30 p-2">
                  <div className="mb-1 flex items-center gap-1.5">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                    </span>
                    <span className="text-xs font-medium text-muted-foreground">实时转写</span>
                  </div>
                  <div className="h-[44px] overflow-y-auto text-xs leading-relaxed">
                    {voiceTranscription ? (
                      <p className="text-foreground">{voiceTranscription}</p>
                    ) : (
                      <p className="text-muted-foreground">等待语音输入...</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="flex min-h-0 flex-col border-border bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Heart className="h-4 w-4 text-red-500" />
                  生理流
                </CardTitle>
                <CardDescription className="text-xs">心率 · 皮电 · HRV · 压力四指标轮播</CardDescription>
              </CardHeader>
              <CardContent className="flex min-h-0 flex-1">
                <VitalMetricPanel
                  metric={activeVital}
                  series={activeVitalSeries}
                  index={activeVitalIndex}
                  total={vitalMetrics.length}
                />
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="grid min-h-0 gap-4 xl:grid-rows-[minmax(300px,0.92fr)_minmax(270px,1fr)]">
          <Card className="flex min-h-0 flex-col border-blue-100 bg-card dark:border-blue-900">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Eye className="h-4 w-4 text-blue-500" />
                视觉流
              </CardTitle>
              <CardDescription className="text-xs">微表情 · 情绪指标</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col gap-4">
              <div className="flex items-center justify-between gap-3 rounded-lg border border-blue-100 bg-blue-50/60 p-3 dark:border-blue-900 dark:bg-blue-950/30">
                <div>
                  <p className="text-xs text-blue-700">主要表情</p>
                  <p className="mt-1 text-2xl font-semibold text-blue-950 dark:text-blue-100">{expressionLabel}</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-3xl shadow-sm dark:bg-slate-900">
                  {expressionEmoji}
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">焦虑度</span>
                    <span className="text-sm font-medium">{(currentStudent.expression.anxiety * 100).toFixed(0)}%</span>
                  </div>
                  <Progress value={currentStudent.expression.anxiety * 100} className="h-2.5" />
                </div>
                <div>
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">悲伤度</span>
                    <span className="text-sm font-medium">{(currentStudent.expression.sadness * 100).toFixed(0)}%</span>
                  </div>
                  <Progress value={currentStudent.expression.sadness * 100} className="h-2.5" />
                </div>
                <div>
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">愤怒度</span>
                    <span className="text-sm font-medium">{(currentStudent.expression.anger * 100).toFixed(0)}%</span>
                  </div>
                  <Progress value={currentStudent.expression.anger * 100} className="h-2.5" />
                </div>
              </div>

            </CardContent>
          </Card>

          <Card className="flex min-h-0 flex-col border-amber-100 bg-card dark:border-amber-900">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Hand className="h-4 w-4 text-amber-500" />
                交互流
              </CardTitle>
              <CardDescription className="text-xs">行为模式 · 反应延迟</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col gap-3">
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-lg border border-amber-100 bg-amber-50/70 p-2 dark:border-amber-900 dark:bg-amber-950/30">
                  <p className="text-xs text-amber-700">交互频率</p>
                  <p className="text-xl font-bold text-amber-700">{currentStudent.behavior.interactionFreq}/s</p>
                </div>
                <div className="rounded-lg border border-orange-100 bg-orange-50/70 p-2 dark:border-orange-900 dark:bg-orange-950/30">
                  <p className="text-xs text-orange-700">反应延迟</p>
                  <p
                    className={`text-xl font-bold ${
                      currentStudent.behavior.responseDelay > 2
                        ? "text-red-500"
                        : currentStudent.behavior.responseDelay > 1.5
                          ? "text-amber-600"
                          : "text-green-600"
                    }`}
                  >
                    {currentStudent.behavior.responseDelay}s
                  </p>
                </div>
                <div className="rounded-lg border border-cyan-100 bg-cyan-50/70 p-2 dark:border-cyan-900 dark:bg-cyan-950/30">
                  <p className="text-xs text-cyan-700">手部震颤</p>
                  <p
                    className={`text-xl font-bold ${
                      currentStudent.behavior.handTremor > 0.3
                        ? "text-red-500"
                        : currentStudent.behavior.handTremor > 0.2
                          ? "text-amber-600"
                          : "text-green-600"
                    }`}
                  >
                    {currentStudent.behavior.handTremor.toFixed(2)}
                  </p>
                </div>
                <div className="rounded-lg border border-sky-100 bg-sky-50/70 p-2 dark:border-sky-900 dark:bg-sky-950/30">
                  <p className="text-xs text-sky-700">回避次数</p>
                  <p
                    className={`text-xl font-bold ${
                      currentStudent.behavior.avoidanceCount > 5
                        ? "text-red-500"
                        : currentStudent.behavior.avoidanceCount > 2
                          ? "text-amber-600"
                          : "text-green-600"
                    }`}
                  >
                    {currentStudent.behavior.avoidanceCount}
                  </p>
                </div>
              </div>
              <div className="flex-1 rounded-lg border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-3 dark:border-amber-800 dark:from-slate-800 dark:to-slate-900">
                <div className="mb-2 flex items-center gap-2">
                  <Brain className="h-4 w-4 text-amber-600" />
                  <span className="text-sm font-medium text-amber-700">行为分析</span>
                </div>
                <div className="space-y-1.5 text-sm">
                  <p className="text-muted-foreground">
                    {currentStudent.behavior.interactionFreq > 1
                      ? "✓ 高交互频率，表现出积极态度"
                      : currentStudent.behavior.interactionFreq > 0.5
                        ? "○ 中等交互频率"
                        : "△ 交互较少，需要关注"}
                  </p>
                  <p className="text-muted-foreground">
                    {currentStudent.behavior.responseDelay > 2
                      ? "△ 反应较慢"
                      : currentStudent.behavior.responseDelay > 1.5
                        ? "○ 反应正常"
                        : "✓ 反应迅速"}
                  </p>
                  <p className="text-muted-foreground">
                    {currentStudent.behavior.handTremor > 0.3
                      ? "△ 手部震颤明显"
                      : currentStudent.behavior.handTremor > 0.2
                        ? "○ 轻微震颤"
                        : "✓ 手部稳定"}
                  </p>
                  <p className="text-muted-foreground">
                    {currentStudent.behavior.avoidanceCount > 5
                      ? "△ 回避行为较多"
                      : currentStudent.behavior.avoidanceCount > 2
                        ? "○ 偶有回避"
                        : "✓ 无明显回避"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
