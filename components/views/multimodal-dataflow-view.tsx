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
  User
} from "lucide-react"

// 模拟正在体验的学生数据
const activeStudents = [
  {
    id: "stu-001",
    name: "张明远",
    studentId: "2024001",
    room: "心理咨询室 A02",
    scenario: "社交焦虑脱敏",
    startTime: "14:30",
    duration: 25,
    emotion: "平静",
    riskLevel: "low",
    vitals: {
      heartRate: 72,
      hrv: 45,
      gsr: 2.3,
      stress: 23
    },
    voice: {
      sentiment: "positive" as const,
      tremorIndex: 0.12,
     情感标签: "轻松"
    },
    expression: {
      primary: "微笑",
      anxiety: 0.15,
      sadness: 0.05,
      anger: 0.02
    },
    behavior: {
      interactionFreq: 3.2,
      handTremor: 0.08,
      responseDelay: 1.2,
      avoidanceCount: 2
    },
    eeg: {
      alpha: 12.5,
      beta: 8.2,
      theta: 6.1
    }
  },
  {
    id: "stu-002",
    name: "李思琪",
    studentId: "2024023",
    room: "减压舱 B01",
    scenario: "考试压力释放",
    startTime: "14:15",
    duration: 40,
    emotion: "紧张",
    riskLevel: "medium",
    vitals: {
      heartRate: 98,
      hrv: 28,
      gsr: 5.8,
      stress: 67
    },
    voice: {
      sentiment: "negative" as const,
      tremorIndex: 0.45,
      情感标签: "焦虑"
    },
    expression: {
      primary: "皱眉",
      anxiety: 0.72,
      sadness: 0.15,
      anger: 0.05
    },
    behavior: {
      interactionFreq: 1.8,
      handTremor: 0.35,
      responseDelay: 2.8,
      avoidanceCount: 8
    },
    eeg: {
      alpha: 6.2,
      beta: 15.8,
      theta: 12.3
    }
  },
  {
    id: "stu-003",
    name: "王博文",
    studentId: "2024015",
    room: "心理咨询室 A01",
    scenario: "职场面试练习",
    startTime: "14:45",
    duration: 10,
    emotion: "专注",
    riskLevel: "low",
    vitals: {
      heartRate: 78,
      hrv: 52,
      gsr: 3.1,
      stress: 35
    },
    voice: {
      sentiment: "neutral" as const,
      tremorIndex: 0.22,
      情感标签: "专注"
    },
    expression: {
      primary: "严肃",
      anxiety: 0.25,
      sadness: 0.02,
      anger: 0.01
    },
    behavior: {
      interactionFreq: 4.5,
      handTremor: 0.12,
      responseDelay: 0.9,
      avoidanceCount: 1
    },
    eeg: {
      alpha: 9.8,
      beta: 12.4,
      theta: 5.2
    }
  },
  {
    id: "stu-004",
    name: "赵天宇",
    studentId: "2024004",
    room: "VR放松舱 C01",
    scenario: "创伤后应激恢复",
    startTime: "14:20",
    duration: 35,
    emotion: "低落",
    riskLevel: "high",
    vitals: {
      heartRate: 65,
      hrv: 22,
      gsr: 1.2,
      stress: 45
    },
    voice: {
      sentiment: "negative" as const,
      tremorIndex: 0.68,
      情感标签: "低落"
    },
    expression: {
      primary: "沮丧",
      anxiety: 0.35,
      sadness: 0.78,
      anger: 0.02
    },
    behavior: {
      interactionFreq: 0.8,
      handTremor: 0.15,
      responseDelay: 3.5,
      avoidanceCount: 12
    },
    eeg: {
      alpha: 4.2,
      beta: 5.1,
      theta: 18.5
    }
  },
  {
    id: "stu-005",
    name: "刘思远",
    studentId: "2024005",
    room: "心理咨询室 A03",
    scenario: "失眠认知行为治疗",
    startTime: "14:40",
    duration: 20,
    emotion: "困倦",
    riskLevel: "medium",
    vitals: {
      heartRate: 58,
      hrv: 35,
      gsr: 1.5,
      stress: 18
    },
    voice: {
      sentiment: "neutral" as const,
      tremorIndex: 0.08,
      情感标签: "困倦"
    },
    expression: {
      primary: "眯眼",
      anxiety: 0.12,
      sadness: 0.08,
      anger: 0.01
    },
    behavior: {
      interactionFreq: 2.1,
      handTremor: 0.05,
      responseDelay: 1.8,
      avoidanceCount: 3
    },
    eeg: {
      alpha: 15.2,
      beta: 4.2,
      theta: 8.3
    }
  },
  {
    id: "stu-006",
    name: "陈雨晴",
    studentId: "2024006",
    room: "减压舱 B02",
    scenario: "学业压力疏导",
    startTime: "14:50",
    duration: 15,
    emotion: "焦虑",
    riskLevel: "medium",
    vitals: {
      heartRate: 105,
      hrv: 25,
      gsr: 6.2,
      stress: 72
    },
    voice: {
      sentiment: "negative" as const,
      tremorIndex: 0.52,
      情感标签: "焦虑"
    },
    expression: {
      primary: "咬唇",
      anxiety: 0.82,
      sadness: 0.18,
      anger: 0.08
    },
    behavior: {
      interactionFreq: 1.2,
      handTremor: 0.42,
      responseDelay: 2.5,
      avoidanceCount: 6
    },
    eeg: {
      alpha: 5.8,
      beta: 18.2,
      theta: 10.5
    }
  }
]

const emotionColors: Record<string, string> = {
  "平静": "text-green-600 bg-green-50",
  "紧张": "text-amber-600 bg-amber-50",
  "焦虑": "text-red-600 bg-red-50",
  "专注": "text-blue-600 bg-blue-50",
  "轻松": "text-green-600 bg-green-50",
  "低落": "text-slate-600 bg-slate-50",
  "困倦": "text-indigo-600 bg-indigo-50"
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
  const [selectedStudent, setSelectedStudent] = useState(activeStudents[0])
  const [currentTime, setCurrentTime] = useState(new Date())

  // 模拟实时数据更新
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const generateWaveData = () => Array.from({ length: 30 }, () => Math.random() * 0.8 + 0.1)

  return (
    <div className="flex h-full gap-4">
      {/* 左侧：学生列表 */}
      <div className="w-80 shrink-0">
        <Card className="h-full">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Activity className="h-5 w-5 text-primary" />
              实时数据流
            </CardTitle>
            <CardDescription>
              {activeStudents.length} 位学生正在体验中
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="flex flex-col">
              {activeStudents.map((student) => (
                <button
                  key={student.id}
                  onClick={() => setSelectedStudent(student)}
                  className={`flex items-start gap-3 border-b p-4 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-900 ${
                    selectedStudent.id === student.id ? "bg-primary/5" : ""
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
                      <p className="font-medium truncate">{student.name}</p>
                      <span className={`h-2 w-2 shrink-0 rounded-full ${riskLevelColors[student.riskLevel]}`} />
                    </div>
                    <p className="text-xs text-muted-foreground">{student.room}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <Badge variant="secondary" className={`text-xs ${emotionColors[student.emotion]}`}>
                        {student.emotion}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{student.scenario}</span>
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
                  <AvatarImage src={selectedStudent.name} />
                  <AvatarFallback className="bg-primary/10 text-lg text-primary">
                    {selectedStudent.name[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-bold">{selectedStudent.name}</h3>
                  <p className="text-sm text-muted-foreground">{selectedStudent.studentId} · {selectedStudent.room}</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedStudent.scenario} · 已使用 {selectedStudent.duration} 分钟
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">当前情绪</p>
                  <Badge className={`mt-1 ${emotionColors[selectedStudent.emotion]}`}>
                    {selectedStudent.emotion}
                  </Badge>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">风险等级</p>
                  <Badge variant={selectedStudent.riskLevel === "low" ? "secondary" : selectedStudent.riskLevel === "medium" ? "outline" : "destructive"} className="mt-1">
                    {selectedStudent.riskLevel === "low" ? "低风险" : selectedStudent.riskLevel === "medium" ? "中风险" : "高风险"}
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
                  value={selectedStudent.vitals.heartRate} 
                  unit="bpm" 
                  trend={selectedStudent.vitals.heartRate > 90 ? "up" : "down"}
                />
                <VitalCard 
                  icon={Activity} 
                  label="HRV" 
                  value={selectedStudent.vitals.hrv} 
                  unit="ms" 
                  trend={selectedStudent.vitals.hrv < 30 ? "down" : undefined}
                />
                <VitalCard 
                  icon={Zap} 
                  label="皮电反应" 
                  value={selectedStudent.vitals.gsr} 
                  unit="μS" 
                  trend={selectedStudent.vitals.gsr > 4 ? "up" : undefined}
                />
                <VitalCard 
                  icon={AlertTriangle} 
                  label="压力指数" 
                  value={selectedStudent.vitals.stress} 
                  unit="" 
                  trend={selectedStudent.vitals.stress > 50 ? "up" : undefined}
                />
              </div>
              {/* 实时曲线 */}
              <div className="mt-4">
                <p className="mb-2 text-xs text-muted-foreground">心率实时曲线</p>
                <WaveformVisual 
                  data={generateWaveData()} 
                  color={selectedStudent.vitals.heartRate > 90 ? "#ef4444" : "#10b981"} 
                />
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
                    selectedStudent.voice.sentiment === "positive" ? "text-green-500" :
                    selectedStudent.voice.sentiment === "negative" ? "text-red-500" : "text-gray-500"
                  }`}>
                    {selectedStudent.voice.sentiment === "positive" ? "积极" :
                     selectedStudent.voice.sentiment === "negative" ? "消极" : "中性"}
                  </p>
                </div>
                <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800">
                  <p className="text-sm text-muted-foreground">语音颤抖指数</p>
                  <p className={`mt-1 text-2xl font-bold ${
                    selectedStudent.voice.tremorIndex > 0.5 ? "text-red-500" :
                    selectedStudent.voice.tremorIndex > 0.3 ? "text-amber-500" : "text-green-500"
                  }`}>
                    {selectedStudent.voice.tremorIndex.toFixed(2)}
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <p className="mb-2 text-xs text-muted-foreground">语音情感波形</p>
                <WaveformVisual 
                  data={generateWaveData()} 
                  color={selectedStudent.voice.sentiment === "positive" ? "#10b981" : 
                         selectedStudent.voice.sentiment === "negative" ? "#ef4444" : "#6b7280"} 
                />
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
                  <p className="mt-1 text-xl font-bold">{selectedStudent.expression.primary}</p>
                </div>
                <div className="h-20 w-20 rounded-full bg-slate-100 flex items-center justify-center dark:bg-slate-800">
                  <span className="text-3xl">
                    {selectedStudent.expression.primary === "微笑" ? "😊" :
                     selectedStudent.expression.primary === "皱眉" ? "😟" :
                     selectedStudent.expression.primary === "严肃" ? "😐" : "🙂"}
                  </span>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">焦虑度</span>
                  <Progress value={selectedStudent.expression.anxiety * 100} className="w-24" />
                  <span className="w-12 text-right text-sm">{(selectedStudent.expression.anxiety * 100).toFixed(0)}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">悲伤度</span>
                  <Progress value={selectedStudent.expression.sadness * 100} className="w-24" />
                  <span className="w-12 text-right text-sm">{(selectedStudent.expression.sadness * 100).toFixed(0)}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">愤怒度</span>
                  <Progress value={selectedStudent.expression.anger * 100} className="w-24" />
                  <span className="w-12 text-right text-sm">{(selectedStudent.expression.anger * 100).toFixed(0)}%</span>
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
                  <p className="mt-1 text-2xl font-bold">{selectedStudent.behavior.interactionFreq}/s</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800">
                  <p className="text-sm text-muted-foreground">反应延迟</p>
                  <p className={`mt-1 text-2xl font-bold ${
                    selectedStudent.behavior.responseDelay > 2 ? "text-red-500" :
                    selectedStudent.behavior.responseDelay > 1.5 ? "text-amber-500" : "text-green-500"
                  }`}>
                    {selectedStudent.behavior.responseDelay}s
                  </p>
                </div>
                <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800">
                  <p className="text-sm text-muted-foreground">手部震颤</p>
                  <p className={`mt-1 text-2xl font-bold ${
                    selectedStudent.behavior.handTremor > 0.3 ? "text-red-500" :
                    selectedStudent.behavior.handTremor > 0.2 ? "text-amber-500" : "text-green-500"
                  }`}>
                    {selectedStudent.behavior.handTremor.toFixed(2)}
                  </p>
                </div>
                <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800">
                  <p className="text-sm text-muted-foreground">回避次数</p>
                  <p className={`mt-1 text-2xl font-bold ${
                    selectedStudent.behavior.avoidanceCount > 5 ? "text-red-500" :
                    selectedStudent.behavior.avoidanceCount > 2 ? "text-amber-500" : "text-green-500"
                  }`}>
                    {selectedStudent.behavior.avoidanceCount}
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
                  <p className="mt-2 text-3xl font-bold text-blue-600">{selectedStudent.eeg.alpha} <span className="text-sm font-normal">μV</span></p>
                  <Progress value={selectedStudent.eeg.alpha / 20 * 100} className="mt-2" />
                </div>
                <div className="rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Beta 波 (β)</span>
                    <Badge variant="outline" className="bg-green-50 text-green-600 dark:bg-green-950">
                      活跃度
                    </Badge>
                  </div>
                  <p className="mt-2 text-3xl font-bold text-green-600">{selectedStudent.eeg.beta} <span className="text-sm font-normal">μV</span></p>
                  <Progress value={selectedStudent.eeg.beta / 20 * 100} className="mt-2" />
                </div>
                <div className="rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Theta 波 (θ)</span>
                    <Badge variant="outline" className="bg-purple-50 text-purple-600 dark:bg-purple-950">
                      倦意/抑郁倾向
                    </Badge>
                  </div>
                  <p className="mt-2 text-3xl font-bold text-purple-600">{selectedStudent.eeg.theta} <span className="text-sm font-normal">μV</span></p>
                  <Progress value={selectedStudent.eeg.theta / 20 * 100} className="mt-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
