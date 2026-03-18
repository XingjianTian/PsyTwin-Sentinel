"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { 
  Activity,
  Brain,
  Watch,
  Mic,
  Eye,
  Hand,
  Heart,
  Zap,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Clock,
  User,
  RefreshCw,
} from "lucide-react"
// Recharts 图表组件
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

// 学生数据类型
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
    情感标签: string
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
  eeg: {
    alpha: number
    beta: number
    theta: number
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
// 心率图表数据 - 修复时间显示，每30分钟一个数据点，从13:00开始
const hrData = Array.from({ length: 30 }, (_, i) => {
  const totalMinutes = 13 * 60 + i * 30
  const hours = Math.floor(totalMinutes / 60) % 24
  const minutes = totalMinutes % 60
  return {
    time: `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`,
    心率: Math.floor(75 + Math.sin(i * 0.5) * 15 + Math.random() * 20),
    血氧: Math.floor(96 + Math.sin(i * 0.3) * 2 + Math.random() * 2),
  }
})

interface HrTooltipProps {
  active?: boolean
  payload?: Array<{ name: string; value: number; color: string }>
  label?: string
}

function HrTooltip({ active, payload, label }: HrTooltipProps) {
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

// 语音波形可视化组件 - 带渐变、动画、坐标轴和图例
function VoiceWaveform() {
  const [bars, setBars] = useState<number[]>(() =>
    Array.from({ length: 64 }, () => Math.random() * 80 + 10)
  )

  useEffect(() => {
    const interval = setInterval(() => {
      setBars((prev) =>
        prev.map((h) => {
          const delta = (Math.random() - 0.5) * 30
          return Math.max(5, Math.min(95, h + delta))
        })
      )
    }, 120)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="rounded-lg border border-border bg-white p-3 shadow-sm">
      <div className="mb-1 flex h-[180px] items-stretch gap-1">
        <div className="flex flex-col justify-between py-0.5 pr-2 text-[10px] text-muted-foreground">
          <span>强度</span>
          <span>100%</span>
          <span>50%</span>
          <span>0%</span>
        </div>
        <div className="flex flex-1 flex-col">
          <div className="flex flex-1 items-end gap-[2px]">
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
            <span>2s</span>
            <span>4s</span>
            <span>6s</span>
            <span>8s</span>
          </div>
        </div>
      </div>
      <div className="mt-2 flex items-center justify-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-gradient-to-t from-red-500 to-orange-500" />
          <span>高唤醒区</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-gradient-to-t from-orange-500 to-yellow-400" />
          <span>中唤醒区</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-gradient-to-t from-cyan-500 to-green-500" />
          <span>平稳区</span>
        </div>
      </div>
    </div>
  )
}

const riskLevelColors: Record<string, string> = {
  "low": "bg-green-500",
  "medium": "bg-amber-500",
  "high": "bg-red-500"
}

function VitalCard({ icon: Icon, label, value, unit, trend }: { 
  icon: any, label: string, value: number, unit: string, trend?: "up" | "down" 
}) {
  return (
    <div className="rounded-lg bg-white p-3 shadow-sm dark:bg-slate-800">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">{label}</span>
        </div>
        {trend && (
          trend === "up" ? <TrendingUp className="h-4 w-4 text-red-500" /> : <TrendingDown className="h-4 w-4 text-green-500" />
        )}
      </div>
      <div className="mt-1 flex items-baseline gap-1">
        <span className="text-2xl font-bold">{value}</span>
        <span className="text-sm text-muted-foreground">{unit}</span>
      </div>
    </div>
  )
}

function WaveformVisual({ data, color }: { data: number[], color: string }) {
  const points = data.map((v, i) => `${i * 10},${50 - v * 40}`).join(" ")
  return (
    <div className="h-16 w-full overflow-hidden rounded bg-slate-50 dark:bg-slate-900">
      <svg viewBox="0 0 300 100" className="h-full w-full">
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="2"
          points={points}
        />
      </svg>
    </div>
  )
}

export function MultimodalDataFlowView() {
  const [students, setStudents] = useState<StudentData[]>([])
  const [selectedStudent, setSelectedStudent] = useState<StudentData | null>(null)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [loading, setLoading] = useState(true)
  const [isMock, setIsMock] = useState(false)
  const [activeTab, setActiveTab] = useState<string>("student-list")
  const [hrHistory, setHrHistory] = useState<Array<{ time: string; 心率: number; 血氧: number; hrv: number }>>([])
  const [chartKey, setChartKey] = useState(0)

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
      情感标签: "未知",
    },
    expression: {
      primary: "未知",
      anxiety: 0,
      sadness: 0,
      anger: 0,
    },
    behavior: {
      interactionFreq: 0,
      handTremor: 0,
      responseDelay: 0,
      avoidanceCount: 0,
    },
    eeg: {
      alpha: 0,
      beta: 0,
      theta: 0,
    },
  }

  const handleTabChange = (value: string) => {
    if (value === activeTab) return
    setActiveTab(value)
    if (value === "realtime-test") {
      setStudents([testStudent])
      setSelectedStudent(testStudent)
      setIsMock(true)
    } else {
      fetchData()
    }
  }

  useEffect(() => {
    if (activeTab === "realtime-test") {
      setStudents([testStudent])
      setSelectedStudent(testStudent)
      setIsMock(true)
    }

    const eventSource = new EventSource('/api/multimodal/sensors/stream')

    eventSource.addEventListener('connected', (event) => {
      console.log('[SSE] Connected:', JSON.parse(event.data))
    })

    eventSource.addEventListener('multimodal_data', (event) => {
      try {
        const data = JSON.parse(event.data)
        console.log('[SSE] Received data:', data)

        const isTestStudent = activeTab === "test" && data.studentId === "stu-test"
        if ((selectedStudent && data.studentId === selectedStudent.id) || isTestStudent) {
          const now = new Date()
          const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`

          setSelectedStudent((prev) => {
            if (!prev) return prev
            return {
              ...prev,
              vitals: data.vitalSign ? {
                heartRate: data.vitalSign.heartRate || prev.vitals.heartRate,
                hrv: data.vitalSign.hrv || prev.vitals.hrv,
                bloodOxygen: data.vitalSign.bloodOxygen ?? prev.vitals.bloodOxygen,
                gsr: data.vitalSign.gsr || prev.vitals.gsr,
                stress: data.vitalSign.stressIndex || prev.vitals.stress,
              } : prev.vitals,
              voice: data.voiceAnalysis ? {
                sentiment: data.voiceAnalysis.sentiment?.toLowerCase() || 'neutral',
                tremorIndex: data.voiceAnalysis.tremorIndex || 0,
                情感标签: data.voiceAnalysis.emotionLabel || '未知',
              } : prev.voice,
              expression: data.expressionData ? {
                primary: data.expressionData.primaryExpression || prev.expression.primary,
                anxiety: data.expressionData.anxietyLevel || 0,
                sadness: data.expressionData.sadnessLevel || 0,
                anger: data.expressionData.angerLevel || 0,
              } : prev.expression,
              behavior: data.behaviorData ? {
                interactionFreq: data.behaviorData.interactionFreq || 0,
                handTremor: data.behaviorData.handTremor || 0,
                responseDelay: data.behaviorData.responseDelay || 0,
                avoidanceCount: data.behaviorData.avoidanceCount || 0,
              } : prev.behavior,
              eeg: data.eegData ? {
                alpha: data.eegData.alpha || 0,
                beta: data.eegData.beta || 0,
                theta: data.eegData.theta || 0,
              } : prev.eeg,
            }
          })

          if (data.vitalSign?.heartRate) {
            setHrHistory((prev) => {
              const newData = [...prev, {
                time: timeStr,
                心率: data.vitalSign.heartRate,
                血氧: data.vitalSign.bloodOxygen ?? prev.slice(-1)[0]?.血氧 ?? 0,
                hrv: data.vitalSign.hrv ?? prev.slice(-1)[0]?.hrv ?? 0,
              }]
              return newData.slice(-30)
            })
          }
        }
      } catch (error) {
        console.error('[SSE] Parse error:', error)
      }
    })

    eventSource.addEventListener('heartbeat', (event) => {
    })

    eventSource.onerror = (error) => {
      console.error('[SSE] Error:', error)
    }

    return () => {
      eventSource.close()
    }
  }, [selectedStudent?.id, activeTab])

  async function fetchData() {
    setLoading(true)
    try {
      const response = await fetch('/api/multimodal/students')
      if (response.ok) {
        const data = await response.json()
        setStudents(data.students)
        setIsMock(data.isMock)
        if (data.students.length > 0) {
          const firstStudent = data.students[0]
          setSelectedStudent(firstStudent)
          if (firstStudent.hrHistory) {
            setHrHistory(firstStudent.hrHistory)
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

  // 模拟实时数据更新
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const generateWaveData = () => Array.from({ length: 30 }, () => Math.random() * 0.8 + 0.1)

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

  // 确保有选中的学生
  const currentStudent = selectedStudent || students[0]

  return (
    <div className="flex h-full gap-4">
      {/* 左侧：学生列表 */}
      <div className="w-80 shrink-0">
        <Card className="flex h-full flex-col overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Activity className="h-5 w-5 text-primary" />
              实时数据流
            </CardTitle>
            <CardDescription className="text-xs">
              {students.length} 位学生正在体验中
              {isMock && <span className="ml-1 text-amber-500">(演示)</span>}
            </CardDescription>
            <Tabs value={activeTab} onValueChange={handleTabChange} className="mt-2 w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="student-list">学生列表</TabsTrigger>
                <TabsTrigger value="realtime-test">实时测试</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-0">
            <div className="flex flex-col">
              {students.map((student) => (
                <button
                  key={student.id}
                  onClick={() => {
                    setSelectedStudent(student)
                    if (student.hrHistory) {
                      setHrHistory(student.hrHistory)
                      setChartKey(k => k + 1)
                    }
                  }}
                  className={`flex items-start gap-3 border-b p-3 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-900 ${
                    currentStudent?.id === student.id ? "bg-primary/5" : ""
                  }`}
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={student.name} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {student.name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 overflow-hidden">
                    <div className="flex items-center justify-between">
                      <p className="truncate font-medium text-sm">{student.name}</p>
                      <span className={`h-2 w-2 shrink-0 rounded-full ${riskLevelColors[student.riskLevel]}`} />
                    </div>
                    <p className="text-xs text-muted-foreground">{student.room}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <Badge variant="secondary" className={`text-xs ${emotionColors[student.emotion]}`}>
                        {student.emotion}
                      </Badge>
                      <span className="truncate text-xs text-muted-foreground">{student.scenario}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 右侧：详细数据面板 */}
      <div className="flex-1 overflow-y-auto">
        {/* 学生基本信息 */}
        <Card className="mb-4">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="h-14 w-14">
                  <AvatarImage src={currentStudent.name} />
                  <AvatarFallback className="bg-primary/10 text-lg text-primary">
                    {currentStudent.name[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-bold">{currentStudent.name}</h3>
                  <p className="text-sm text-muted-foreground">{currentStudent.studentId} · {currentStudent.room}</p>
                  <p className="text-sm text-muted-foreground">
                    {currentStudent.scenario} · 已使用 {currentStudent.duration} 分钟
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">当前情绪</p>
                  <Badge className={`mt-1 ${emotionColors[currentStudent.emotion]}`}>
                    {currentStudent.emotion}
                  </Badge>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">风险等级</p>
                  <Badge variant={currentStudent.riskLevel === "low" ? "secondary" : currentStudent.riskLevel === "medium" ? "outline" : "destructive"} className="mt-1">
                    {currentStudent.riskLevel === "low" ? "低风险" : currentStudent.riskLevel === "medium" ? "中风险" : "高风险"}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 数据流模块 */}
        <div className="grid gap-4 lg:grid-cols-2">
          {/* 生理流 */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Heart className="h-5 w-5 text-red-500" />
                生理流
              </CardTitle>
              <CardDescription>心率 · HRV · 皮电 · 压力指数</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <VitalCard 
                  icon={Heart} 
                  label="心率" 
                  value={currentStudent.vitals.heartRate} 
                  unit="bpm" 
                  trend={currentStudent.vitals.heartRate > 90 ? "up" : "down"}
                />
                <VitalCard 
                  icon={Activity} 
                  label="HRV" 
                  value={currentStudent.vitals.hrv} 
                  unit="ms" 
                  trend={currentStudent.vitals.hrv < 30 ? "down" : undefined}
                />
                <VitalCard 
                  icon={Zap} 
                  label="皮电反应" 
                  value={currentStudent.vitals.gsr} 
                  unit="μS" 
                  trend={currentStudent.vitals.gsr > 4 ? "up" : undefined}
                />
                <VitalCard 
                  icon={AlertTriangle} 
                  label="压力指数" 
                  value={currentStudent.vitals.stress} 
                  unit="" 
                  trend={currentStudent.vitals.stress > 50 ? "up" : undefined}
                />
              </div>
              {/* 实时曲线 */}
              <div className="mt-4 h-[180px] -mx-2">
                <p className="mb-2 pl-2 text-xs text-muted-foreground">实时生理曲线</p>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart key={chartKey} data={hrHistory} margin={{ top: 5, right: 60, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="time" tick={{ fill: "#6B7280", fontSize: 10 }} axisLine={{ stroke: "#E5E7EB" }} tickLine={false} interval={4} />
                    <YAxis yAxisId="left" tick={{ fill: "#6B7280", fontSize: 10 }} axisLine={{ stroke: "#E5E7EB" }} tickLine={false} domain={[60, 150]} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fill: "#6B7280", fontSize: 10 }} axisLine={{ stroke: "#E5E7EB" }} tickLine={false} domain={[90, 100]} />
                    <Tooltip content={<HrTooltip />} />
                    <Line yAxisId="left" type="monotone" dataKey="心率" stroke="#ef4444" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: "#ef4444" }} isAnimationActive={true} animationDuration={800} />
                    <Line yAxisId="right" type="monotone" dataKey="血氧" stroke="#7C3AED" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: "#7C3AED" }} isAnimationActive={true} animationDuration={800} />
                    <Line yAxisId="left" type="monotone" dataKey="hrv" stroke="#10b981" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: "#10b981" }} isAnimationActive={true} animationDuration={800} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* 语音流 */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Mic className="h-5 w-5 text-purple-500" />
                语音流
              </CardTitle>
              <CardDescription>情感分析 · 语音颤抖指数</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800">
                  <p className="text-sm text-muted-foreground">情感倾向</p>
                  <p className={`mt-1 text-2xl font-bold ${
                    currentStudent.voice.sentiment === "positive" ? "text-green-500" :
                    currentStudent.voice.sentiment === "negative" ? "text-red-500" : "text-gray-500"
                  }`}>
                    {currentStudent.voice.sentiment === "positive" ? "积极" :
                     currentStudent.voice.sentiment === "negative" ? "消极" : "中性"}
                  </p>
                </div>
                <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800">
                  <p className="text-sm text-muted-foreground">语音颤抖指数</p>
                  <p className={`mt-1 text-2xl font-bold ${
                    currentStudent.voice.tremorIndex > 0.5 ? "text-red-500" :
                    currentStudent.voice.tremorIndex > 0.3 ? "text-amber-500" : "text-green-500"
                  }`}>
                    {currentStudent.voice.tremorIndex.toFixed(2)}
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <p className="mb-2 text-xs text-muted-foreground">实时情感波形图</p>
                <VoiceWaveform />
              </div>
            </CardContent>
          </Card>

          {/* 视觉流 */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Eye className="h-5 w-5 text-blue-500" />
                视觉流
              </CardTitle>
              <CardDescription>微表情 · 眼动追踪</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">主要表情</p>
                  <p className="mt-1 text-xl font-bold">{currentStudent.expression.primary}</p>
                </div>
                <div className="h-20 w-20 rounded-full bg-slate-100 flex items-center justify-center dark:bg-slate-800">
                  <span className="text-3xl">
                    {currentStudent.expression.primary === "微笑" ? "😊" :
                     currentStudent.expression.primary === "皱眉" ? "😟" :
                     currentStudent.expression.primary === "严肃" ? "😐" : "🙂"}
                  </span>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">焦虑度</span>
                  <Progress value={currentStudent.expression.anxiety * 100} className="w-24" />
                  <span className="w-12 text-right text-sm">{(currentStudent.expression.anxiety * 100).toFixed(0)}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">悲伤度</span>
                  <Progress value={currentStudent.expression.sadness * 100} className="w-24" />
                  <span className="w-12 text-right text-sm">{(currentStudent.expression.sadness * 100).toFixed(0)}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">愤怒度</span>
                  <Progress value={currentStudent.expression.anger * 100} className="w-24" />
                  <span className="w-12 text-right text-sm">{(currentStudent.expression.anger * 100).toFixed(0)}%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 交互流 */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Hand className="h-5 w-5 text-amber-500" />
                交互流
              </CardTitle>
              <CardDescription>行为模式 · 反应延迟</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800">
                  <p className="text-sm text-muted-foreground">交互频率</p>
                  <p className="mt-1 text-2xl font-bold">{currentStudent.behavior.interactionFreq}/s</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800">
                  <p className="text-sm text-muted-foreground">反应延迟</p>
                  <p className={`mt-1 text-2xl font-bold ${
                    currentStudent.behavior.responseDelay > 2 ? "text-red-500" :
                    currentStudent.behavior.responseDelay > 1.5 ? "text-amber-500" : "text-green-500"
                  }`}>
                    {currentStudent.behavior.responseDelay}s
                  </p>
                </div>
                <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800">
                  <p className="text-sm text-muted-foreground">手部震颤</p>
                  <p className={`mt-1 text-2xl font-bold ${
                    currentStudent.behavior.handTremor > 0.3 ? "text-red-500" :
                    currentStudent.behavior.handTremor > 0.2 ? "text-amber-500" : "text-green-500"
                  }`}>
                    {currentStudent.behavior.handTremor.toFixed(2)}
                  </p>
                </div>
                <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800">
                  <p className="text-sm text-muted-foreground">回避次数</p>
                  <p className={`mt-1 text-2xl font-bold ${
                    currentStudent.behavior.avoidanceCount > 5 ? "text-red-500" :
                    currentStudent.behavior.avoidanceCount > 2 ? "text-amber-500" : "text-green-500"
                  }`}>
                    {currentStudent.behavior.avoidanceCount}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 脑电数据 */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Brain className="h-5 w-5 text-green-500" />
                脑电数据 (EEG)
              </CardTitle>
              <CardDescription>Alpha · Beta · Theta 波段分析</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Alpha 波 (α)</span>
                    <Badge variant="outline" className="bg-blue-50 text-blue-600 dark:bg-blue-950">
                      放松度
                    </Badge>
                  </div>
                  <p className="mt-2 text-3xl font-bold text-blue-600">{currentStudent.eeg.alpha} <span className="text-sm font-normal">μV</span></p>
                  <Progress value={currentStudent.eeg.alpha / 20 * 100} className="mt-2" />
                </div>
                <div className="rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Beta 波 (β)</span>
                    <Badge variant="outline" className="bg-green-50 text-green-600 dark:bg-green-950">
                      活跃度
                    </Badge>
                  </div>
                  <p className="mt-2 text-3xl font-bold text-green-600">{currentStudent.eeg.beta} <span className="text-sm font-normal">μV</span></p>
                  <Progress value={currentStudent.eeg.beta / 20 * 100} className="mt-2" />
                </div>
                <div className="rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Theta 波 (θ)</span>
                    <Badge variant="outline" className="bg-purple-50 text-purple-600 dark:bg-purple-950">
                      倦意/抑郁倾向
                    </Badge>
                  </div>
                  <p className="mt-2 text-3xl font-bold text-purple-600">{currentStudent.eeg.theta} <span className="text-sm font-normal">μV</span></p>
                  <Progress value={currentStudent.eeg.theta / 20 * 100} className="mt-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
