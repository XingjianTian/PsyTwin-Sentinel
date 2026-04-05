"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  Heart,
  Mic,
  Eye,
  Hand,
  Brain,
  TrendingUp,
  TrendingDown,
  Zap,
  AlertTriangle,
  RefreshCw,
} from "lucide-react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
} from "recharts"

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

const emotionColors: Record<string, string> = {
  "平静": "text-green-600 bg-green-50",
  "紧张": "text-amber-600 bg-amber-50",
  "焦虑": "text-red-600 bg-red-50",
  "专注": "text-blue-600 bg-blue-50",
  "轻松": "text-green-600 bg-green-50",
  "低落": "text-slate-600 bg-slate-50",
  "困倦": "text-indigo-600 bg-indigo-50"
}

function HrTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-md border border-border bg-popover px-3 py-2 text-xs shadow-lg">
      <p className="mb-1 font-medium text-foreground">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}：{p.value}{p.name === "心率" ? " bpm" : p.name === "血氧" ? "%" : " ms"}
        </p>
      ))}
    </div>
  )
}

function VoiceWaveform({ levels }: { levels?: number[] }) {
  const [bars, setBars] = useState<number[]>(() =>
    Array.from({ length: 40 }, () => Math.random() * 80 + 10)
  )

  useEffect(() => {
    if (levels !== undefined && levels.length > 0) {
      const padded = [...levels]
      while (padded.length < 40) padded.unshift(0)
      setBars(padded.slice(-40))
      return
    }
    if (levels !== undefined) {
      setBars(Array(40).fill(0))
      return
    }
    const interval = setInterval(() => {
      setBars((prev) =>
        prev.map((h) => {
          const delta = (Math.random() - 0.5) * 30
          return Math.max(5, Math.min(95, h + delta))
        })
      )
    }, 120)
    return () => clearInterval(interval)
  }, [levels])

  return (
    <div className="rounded-lg border border-border bg-white p-2 shadow-sm dark:bg-slate-800">
      <div className="flex h-[100px] items-end gap-[2px]">
        {bars.map((h, i) => (
          <div
            key={i}
            className="flex-1 rounded-t-sm transition-all duration-100"
            style={{
              height: `${h}%`,
              background: h > 70
                ? "linear-gradient(to top, #ef4444, #f97316)"
                : h > 40
                  ? "linear-gradient(to top, #f97316, #facc15)"
                  : "linear-gradient(to top, #00d4ff, #22c55e)",
              opacity: 0.85,
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

const riskLevelColors: Record<string, string> = {
  "low": "bg-green-500",
  "medium": "bg-amber-500",
  "high": "bg-red-500"
}

function VitalMiniCard({ icon: Icon, label, value, unit, trend }: {
  icon: any, label: string, value: number, unit: string, trend?: "up" | "down"
}) {
  return (
    <div className="rounded-lg bg-slate-50 p-2 dark:bg-slate-800">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <Icon className="h-3 w-3 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">{label}</span>
        </div>
        {trend && (
          trend === "up" ? <TrendingUp className="h-3 w-3 text-red-500" /> : <TrendingDown className="h-3 w-3 text-green-500" />
        )}
      </div>
      <div className="mt-0.5 flex items-baseline gap-0.5">
        <span className="text-lg font-bold">{value}</span>
        <span className="text-xs text-muted-foreground">{unit}</span>
      </div>
    </div>
  )
}

export function MultimodalDataFlowView() {
  const [students, setStudents] = useState<StudentData[]>([])
  const [selectedStudentId, setSelectedStudentId] = useState<string>("")
  const [currentTime, setCurrentTime] = useState(new Date())
  const [loading, setLoading] = useState(true)
  const [isMock, setIsMock] = useState(false)
  const [activeTab, setActiveTab] = useState<string>("realtime-test")
  const [hrHistory, setHrHistory] = useState<Array<{ time: string; 心率: number; 血氧: number; hrv: number }>>([])
  const [chartKey, setChartKey] = useState(0)
  const [audioLevel, setAudioLevel] = useState<number[]>([])
  const [voiceTranscription, setVoiceTranscription] = useState<string>("")
  const [hasReceivedData, setHasReceivedData] = useState(false)

  const testStudent: StudentData = {
    id: "stu-test",
    name: "测试学生",
    studentId: "test-001",
    room: "测试咨询室 A01",
    scenario: "等待数据...",
    startTime: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }),
    duration: 0,
    emotion: "未知",
    riskLevel: "low",
    vitals: {
      heartRate: 0,
      hrv: 0,
      bloodOxygen: 0,
      gsr: 0,
      stress: 0,
    },
    voice: {
      sentiment: "unknown",
      tremorIndex: 0,
      emotionLabel: "Nervous",
    },
    expression: {
      primary: "nervous",
      anxiety: 0.75,
      sadness: 0.1,
      anger: 0.05,
    },
    behavior: {
      interactionFreq: 0,
      handTremor: 0,
      responseDelay: 0,
      avoidanceCount: 0,
    },
  }

  const handleTabChange = (value: string) => {
    if (value === activeTab) return
    setActiveTab(value)
    if (value === "realtime-test") {
      setStudents([testStudent])
      setSelectedStudentId(testStudent.id)
      setIsMock(true)
      setAudioLevel([])
    } else {
      fetchData()
    }
  }

  useEffect(() => {
    if (activeTab === "realtime-test") {
      setStudents([testStudent])
      setSelectedStudentId(testStudent.id)
      setIsMock(true)
    }
  }, [])

  // 视觉流模拟：收到数据后才开始紧张状态跳动
  useEffect(() => {
    if (activeTab !== "realtime-test" || !hasReceivedData) return

    const fluctuate = () => {
      const anxiety = 0.55 + Math.random() * 0.4
      const sadness = 0.1 + Math.random() * 0.25
      const anger = 0.05 + Math.random() * 0.2

      setStudents(prev => prev.map(s => {
        if (s.id === selectedStudentId || s.id === "stu-test") {
          return {
            ...s,
            expression: {
              primary: "nervous",
              anxiety: Math.min(0.98, anxiety),
              sadness: Math.min(0.4, sadness),
              anger: Math.min(0.3, anger),
            }
          }
        }
        return s
      }))
    }

    fluctuate()
    const interval = setInterval(fluctuate, 1500 + Math.random() * 1500)

    return () => clearInterval(interval)
  }, [activeTab, selectedStudentId, hasReceivedData])

  useEffect(() => {
    const eventSource = new EventSource('/api/multimodal/sensors/stream')

    eventSource.addEventListener('connected', () => {})

    eventSource.addEventListener('multimodal_data', (event) => {
      try {
        const data = JSON.parse(event.data)
        const currentStudent = students.find(s => s.id === selectedStudentId)
        const isTestStudent = activeTab === "realtime-test" && data.studentId === "stu-test"
        if (isTestStudent) {
          setHasReceivedData(true)
        }
        if ((currentStudent && data.studentId === currentStudent.id) || isTestStudent) {
          const now = new Date()
          const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`

          setStudents(prev => prev.map(s => {
            if ((currentStudent && data.studentId === s.id) || isTestStudent) {
              return {
                ...s,
                vitals: data.vitalSign ? {
                  heartRate: data.vitalSign.heartRate || s.vitals.heartRate,
                  hrv: data.vitalSign.hrv || s.vitals.hrv,
                  bloodOxygen: data.vitalSign.bloodOxygen ?? s.vitals.bloodOxygen,
                  gsr: data.vitalSign.gsr || s.vitals.gsr,
                  stress: data.vitalSign.stressIndex || s.vitals.stress,
                } : s.vitals,
                voice: data.voiceAnalysis ? {
                  sentiment: data.voiceAnalysis.sentiment?.toLowerCase() || 'neutral',
                  tremorIndex: data.voiceAnalysis.tremorIndex || 0,
                  emotionLabel: "Nervous",
                } : s.voice,
                expression: isTestStudent ? s.expression : (data.expressionData ? {
                  primary: data.expressionData.primaryExpression || s.expression.primary,
                  anxiety: data.expressionData.anxietyLevel || 0,
                  sadness: data.expressionData.sadnessLevel || 0,
                  anger: data.expressionData.angerLevel || 0,
                } : s.expression),
                behavior: data.behaviorData ? {
                  interactionFreq: data.behaviorData.interactionFreq || 0,
                  handTremor: data.behaviorData.handTremor || 0,
                  responseDelay: data.behaviorData.responseDelay || 0,
                  avoidanceCount: data.behaviorData.avoidanceCount || 0,
                } : s.behavior,
              }
            }
            return s
          }))

          if (data.vitalSign?.heartRate) {
            setHrHistory(prev => {
              const lastOxygen = prev.slice(-1)[0]?.血氧 ?? 0
              const lastHrv = prev.slice(-1)[0]?.hrv ?? 0
              const newData = [...prev, {
                time: timeStr,
                心率: data.vitalSign.heartRate,
                血氧: data.vitalSign.bloodOxygen ?? lastOxygen,
                hrv: data.vitalSign.hrv ?? lastHrv,
              }]
              return newData.slice(-30)
            })
          }
        }
      } catch (error) {
        console.error('[SSE] Parse error:', error)
      }
    })

    let transcriptionTimer: ReturnType<typeof setTimeout> | null = null

    eventSource.addEventListener('voice_transcription', (event) => {
      try {
        const data = JSON.parse(event.data)
        if (data.text) {
          setVoiceTranscription(prev => {
            const newText = data.text
            return prev ? `${prev}\n${newText}` : newText
          })
          if (transcriptionTimer) clearTimeout(transcriptionTimer)
          transcriptionTimer = setTimeout(() => {
            setVoiceTranscription('')
          }, 5000)
        }
      } catch (error) {
        console.error('[SSE] voice_transcription parse error:', error)
      }
    })

    eventSource.addEventListener('voice_level', (event) => {
      try {
        const data = JSON.parse(event.data)
        if (data.audioLevel !== undefined && activeTab === "realtime-test") {
          setAudioLevel(prev => {
            const updated = [...prev, data.audioLevel]
            return updated.slice(-40)
          })
        }
      } catch (error) {
        console.error('[SSE] voice_level parse error:', error)
      }
    })

    eventSource.addEventListener('heartbeat', () => {})

    eventSource.onerror = () => {
      console.error('[SSE] Connection error, will retry...')
      eventSource.close()
    }

    return () => {
      eventSource.close()
      if (transcriptionTimer) clearTimeout(transcriptionTimer)
    }
  }, [selectedStudentId, activeTab, students])

  async function fetchData() {
    setLoading(true)
    try {
      const response = await fetch('/api/multimodal/students')
      if (response.ok) {
        const data = await response.json()
        setStudents(data.students)
        setIsMock(data.isMock)
        if (data.students.length > 0) {
          setSelectedStudentId(data.students[0].id)
          if (data.students[0].hrHistory) {
            setHrHistory(data.students[0].hrHistory)
            setChartKey(k => k + 1)
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch multimodal data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

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

  const currentStudent = students.find(s => s.id === selectedStudentId) || students[0]

  return (
    <div className="flex h-full flex-col gap-4">
      <Card>
        <CardContent className="p-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                  {currentStudent.name[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex items-center gap-2">
                <span className="text-xl font-medium">{currentStudent.name}</span>
                <span className="text-base text-muted-foreground">·</span>
                <span className="text-base text-muted-foreground">{currentStudent.studentId}</span>
                <span className="text-base text-muted-foreground">·</span>
                <span className="text-base text-muted-foreground">{currentStudent.room}</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={`text-xs ${emotionColors[currentStudent.emotion]}`}>
                  {currentStudent.emotion}
                </Badge>
                <Badge variant={currentStudent.riskLevel === "low" ? "secondary" : currentStudent.riskLevel === "medium" ? "outline" : "destructive"} className="text-xs">
                  {currentStudent.riskLevel === "low" ? "低风险" : currentStudent.riskLevel === "medium" ? "中风险" : "高风险"}
                </Badge>
              </div>
              <span className="text-xs text-muted-foreground">场景: {currentStudent.scenario}</span>
              <span className="text-xs text-muted-foreground">已使用 {currentStudent.duration} 分钟</span>
              {isMock && <span className="text-xs text-amber-500">(演示)</span>}
            </div>
            <div className="flex items-center gap-3">
              <Tabs value={activeTab} onValueChange={handleTabChange}>
                <TabsList className="grid grid-cols-2 text-xs">
                  <TabsTrigger value="student-list">学生列表</TabsTrigger>
                  <TabsTrigger value="realtime-test">实时测试</TabsTrigger>
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
              ) : (
                <span className="text-sm text-muted-foreground">实时测试模式</span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid h-full flex-1 grid-cols-4 gap-4">
        <Card className="flex flex-col">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Heart className="h-4 w-4 text-red-500" />
              生理流
            </CardTitle>
            <CardDescription className="text-xs">心率 · HRV · 皮电 · 压力</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-2">
              <VitalMiniCard icon={Heart} label="心率" value={currentStudent.vitals.heartRate} unit="bpm" trend={currentStudent.vitals.heartRate > 90 ? "up" : "down"} />
              <VitalMiniCard icon={Activity} label="HRV" value={currentStudent.vitals.hrv} unit="ms" trend={currentStudent.vitals.hrv < 30 ? "down" : undefined} />
              <VitalMiniCard icon={Zap} label="皮电" value={currentStudent.vitals.gsr} unit="μS" trend={currentStudent.vitals.gsr > 4 ? "up" : undefined} />
              <VitalMiniCard icon={AlertTriangle} label="压力" value={currentStudent.vitals.stress} unit="" trend={currentStudent.vitals.stress > 50 ? "up" : undefined} />
            </div>
            <div className="flex-1">
              <p className="mb-1 text-xs text-muted-foreground">心率曲线</p>
              <div className="h-[160px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart key={chartKey} data={hrHistory} margin={{ top: 15, right: 5, bottom: 0, left: -25 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="time" tick={{ fill: "#6B7280", fontSize: 8 }} axisLine={{ stroke: "#E5E7EB" }} tickLine={false} interval={9} />
                    <YAxis yAxisId="left" tick={{ fill: "#6B7280", fontSize: 8 }} axisLine={false} tickLine={false} domain={[60, 150]} />
                    <Tooltip content={<HrTooltip />} />
                    <Line yAxisId="left" type="monotone" dataKey="心率" stroke="#ef4444" strokeWidth={2} dot={false} isAnimationActive={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Mic className="h-4 w-4 text-purple-500" />
              语音流
            </CardTitle>
            <CardDescription className="text-xs">情感分析 · 语音颤抖</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-lg bg-slate-50 p-2 dark:bg-slate-800">
                <p className="text-xs text-muted-foreground">情感倾向</p>
                <p className={`text-lg font-bold ${
                  currentStudent.voice.sentiment === "positive" ? "text-green-500" :
                  currentStudent.voice.sentiment === "negative" ? "text-red-500" : "text-gray-500"
                }`}>
                  {currentStudent.voice.sentiment === "positive" ? "积极" :
                   currentStudent.voice.sentiment === "negative" ? "消极" : "中性"}
                </p>
              </div>
              <div className="rounded-lg bg-slate-50 p-2 dark:bg-slate-800">
                <p className="text-xs text-muted-foreground">颤抖指数</p>
                <p className={`text-lg font-bold ${
                  currentStudent.voice.tremorIndex > 0.5 ? "text-red-500" :
                  currentStudent.voice.tremorIndex > 0.3 ? "text-amber-500" : "text-green-500"
                }`}>
                  {currentStudent.voice.tremorIndex.toFixed(2)}
                </p>
              </div>
            </div>
            <div>
              <p className="mb-1 text-xs text-muted-foreground">实时转写</p>
              <div className="relative rounded-lg border border-purple-200 bg-gradient-to-br from-slate-50 to-slate-100 p-2 dark:border-purple-800 dark:from-slate-800 dark:to-slate-900">
                <div className="flex items-center gap-1.5 mb-1">
                  <div className="relative h-2 w-2">
                    <div className="absolute inset-0 h-2 w-2 animate-ping rounded-full bg-green-500" />
                    <div className="absolute inset-0 h-2 w-2 rounded-full bg-green-500" />
                  </div>
                  <span className="text-xs font-medium text-purple-600 dark:text-purple-400">LIVE</span>
                </div>
                <div className="h-[50px] overflow-y-auto text-xs leading-relaxed">
                  {voiceTranscription ? (
                    <p className="text-slate-700 dark:text-slate-200">{voiceTranscription}</p>
                  ) : (
                    <p className="text-slate-400 italic">等待语音输入...</p>
                  )}
                </div>
              </div>
            </div>
            <div className="flex-1">
              <p className="mb-1 text-xs text-muted-foreground">实时波形</p>
              <VoiceWaveform levels={activeTab === "realtime-test" ? audioLevel : undefined} />
            </div>
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Eye className="h-4 w-4 text-blue-500" />
              视觉流
            </CardTitle>
            <CardDescription className="text-xs">微表情 · 情绪指标</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">主要表情</p>
                <p className="text-xl font-bold">
                  {currentStudent.expression.primary === "happy" || currentStudent.expression.primary === "joyful" ? "开心" :
                   currentStudent.expression.primary === "sad" ? "悲伤" :
                   currentStudent.expression.primary === "angry" ? "愤怒" :
                   currentStudent.expression.primary === "fear" || currentStudent.expression.primary === "fearful" ? "恐惧" :
                   currentStudent.expression.primary === "surprise" || currentStudent.expression.primary === "surprised" ? "惊讶" :
                   currentStudent.expression.primary === "disgust" || currentStudent.expression.primary === "disgusted" ? "厌恶" :
                   currentStudent.expression.primary === "nervous" ? "紧张" :
                   currentStudent.expression.primary === "neutral" ? "中性" : "未知"}
                </p>
              </div>
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                <span className="text-3xl">
                  {currentStudent.expression.primary === "happy" || currentStudent.expression.primary === "joyful" ? "😄" :
                   currentStudent.expression.primary === "sad" ? "😢" :
                   currentStudent.expression.primary === "angry" ? "😠" :
                   currentStudent.expression.primary === "fear" || currentStudent.expression.primary === "fearful" ? "😨" :
                   currentStudent.expression.primary === "surprise" || currentStudent.expression.primary === "surprised" ? "😮" :
                   currentStudent.expression.primary === "disgust" || currentStudent.expression.primary === "disgusted" ? "🤢" :
                   currentStudent.expression.primary === "nervous" ? "😰" :
                   currentStudent.expression.primary === "neutral" ? "😐" : "😊"}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">焦虑度</span>
                <span className="text-sm">{(currentStudent.expression.anxiety * 100).toFixed(0)}%</span>
              </div>
              <Progress value={currentStudent.expression.anxiety * 100} className="h-3" />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">悲伤度</span>
                <span className="text-sm">{(currentStudent.expression.sadness * 100).toFixed(0)}%</span>
              </div>
              <Progress value={currentStudent.expression.sadness * 100} className="h-3" />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">愤怒度</span>
                <span className="text-sm">{(currentStudent.expression.anger * 100).toFixed(0)}%</span>
              </div>
              <Progress value={currentStudent.expression.anger * 100} className="h-3" />
            </div>
            <div className="mt-auto flex flex-1 items-stretch gap-3">
              <div className="flex items-center justify-center">
                <div className="h-[100px] w-[100px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart cx="50%" cy="50%" innerRadius="30%" outerRadius="90%" data={[
                      { name: "中性", value: Math.max(0, 100 - (currentStudent.expression.anxiety + currentStudent.expression.sadness + currentStudent.expression.anger) * 100), color: "#8B5CF6" },
                      { name: "焦虑", value: currentStudent.expression.anxiety * 100, color: "#F59E0B" },
                      { name: "悲伤", value: currentStudent.expression.sadness * 100, color: "#3B82F6" },
                      { name: "愤怒", value: currentStudent.expression.anger * 100, color: "#EF4444" },
                    ]} startAngle={90} endAngle={-270}>
                      <RadialBar background={{ fill: "#F3F4F6" }} dataKey="value" cornerRadius={4} fill="#8B5CF6" />
                    </RadialBarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="flex flex-col justify-center rounded-lg bg-slate-50 p-3 text-right dark:bg-slate-800">
                <p className="text-sm text-muted-foreground">情绪标签</p>
                <p className="text-lg font-bold text-blue-600">{currentStudent.voice.emotionLabel}</p>
                <p className="mt-2 text-xs text-muted-foreground">各指标处于</p>
                <p className="text-sm font-medium">
                  {(currentStudent.expression.anxiety + currentStudent.expression.sadness + currentStudent.expression.anger) < 0.3 ? "正常范围" : "需关注"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Hand className="h-4 w-4 text-amber-500" />
              交互流
            </CardTitle>
            <CardDescription className="text-xs">行为模式 · 反应延迟</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-lg bg-slate-50 p-2 dark:bg-slate-800">
                <p className="text-xs text-muted-foreground">交互频率</p>
                <p className="text-xl font-bold">{currentStudent.behavior.interactionFreq}/s</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-2 dark:bg-slate-800">
                <p className="text-xs text-muted-foreground">反应延迟</p>
                <p className={`text-xl font-bold ${
                  currentStudent.behavior.responseDelay > 2 ? "text-red-500" :
                  currentStudent.behavior.responseDelay > 1.5 ? "text-amber-500" : "text-green-500"
                }`}>
                  {currentStudent.behavior.responseDelay}s
                </p>
              </div>
              <div className="rounded-lg bg-slate-50 p-2 dark:bg-slate-800">
                <p className="text-xs text-muted-foreground">手部震颤</p>
                <p className={`text-xl font-bold ${
                  currentStudent.behavior.handTremor > 0.3 ? "text-red-500" :
                  currentStudent.behavior.handTremor > 0.2 ? "text-amber-500" : "text-green-500"
                }`}>
                  {currentStudent.behavior.handTremor.toFixed(2)}
                </p>
              </div>
              <div className="rounded-lg bg-slate-50 p-2 dark:bg-slate-800">
                <p className="text-xs text-muted-foreground">回避次数</p>
                <p className={`text-xl font-bold ${
                  currentStudent.behavior.avoidanceCount > 5 ? "text-red-500" :
                  currentStudent.behavior.avoidanceCount > 2 ? "text-amber-500" : "text-green-500"
                }`}>
                  {currentStudent.behavior.avoidanceCount}
                </p>
              </div>
            </div>
            <div className="flex-1 rounded-lg border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-3 dark:border-amber-800 dark:from-slate-800 dark:to-slate-900">
              <div className="flex items-center gap-2 mb-2">
                <Brain className="h-4 w-4 text-amber-600" />
                <span className="text-lg font-medium text-amber-600">行为分析</span>
              </div>
              <div className="space-y-1.5 text-base">
                <p className="text-muted-foreground">
                  {activeTab === "realtime-test" && !currentStudent.behavior.interactionFreq ? "○ 等待数据..." :
                   currentStudent.behavior.interactionFreq > 1 ? "✓ 高交互频率，表现出积极态度" :
                   currentStudent.behavior.interactionFreq > 0.5 ? "○ 中等交互频率" : "△ 交互较少，需要关注"}
                </p>
                <p className="text-muted-foreground">
                  {activeTab === "realtime-test" && !currentStudent.behavior.responseDelay ? "○ 等待数据..." :
                   currentStudent.behavior.responseDelay > 2 ? "△ 反应较慢" :
                   currentStudent.behavior.responseDelay > 1.5 ? "○ 反应正常" : "✓ 反应迅速"}
                </p>
                <p className="text-muted-foreground">
                  {activeTab === "realtime-test" && !currentStudent.behavior.handTremor ? "○ 等待数据..." :
                   currentStudent.behavior.handTremor > 0.3 ? "△ 手部震颤明显" :
                   currentStudent.behavior.handTremor > 0.2 ? "○ 轻微震颤" : "✓ 手部稳定"}
                </p>
                <p className="text-muted-foreground">
                  {activeTab === "realtime-test" && !currentStudent.behavior.avoidanceCount ? "○ 等待数据..." :
                   currentStudent.behavior.avoidanceCount > 5 ? "△ 回避行为较多" :
                   currentStudent.behavior.avoidanceCount > 2 ? "○ 偶有回避" : "✓ 无明显回避"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
