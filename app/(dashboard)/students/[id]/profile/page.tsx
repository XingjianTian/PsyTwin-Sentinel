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
// import { getStudentDetail, type StudentDetail } from "@/app/actions/students"

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
import { Skeleton } from "@/components/ui/skeleton"
import { Radar, TrendingUp, TrendingDown, Minus } from "lucide-react"

// 维度映射配置
const dimensionConfig = [
  { key: "adversityQuotient", label: "逆商", description: "面对逆境时的应对能力" },
  { key: "emotionalStability", label: "情绪稳定", description: "情绪调节与控制能力" },
  { key: "socialTendency", label: "社交倾向", description: "人际交往的积极性" },
  { key: "stressResistance", label: "抗压能力", description: "承受压力的能力" },
  { key: "selfAwareness", label: "自我认知", description: "对自我的了解程度" },
  { key: "empathy", label: "共情能力", description: "理解他人情感的能力" },
  { key: "willpower", label: "意志力", description: "坚持目标的毅力" },
  { key: "adaptability", label: "适应性", description: "适应环境变化的能力" },
]

interface RadarTooltipProps {
  active?: boolean
  payload?: Array<{ payload: { dimension: string; value: number; fullMark: number } }>
}

function RadarTooltipContent({ active, payload }: RadarTooltipProps) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  const config = dimensionConfig.find(c => c.label === d.dimension)
  return (
    <div className="rounded-md border border-border bg-popover px-3 py-2 text-xs shadow-lg">
      <p className="font-medium text-foreground">{d.dimension}</p>
      <p className="text-muted-foreground">{config?.description}</p>
      <p className="mt-1 text-muted-foreground">
        评分：<span className="font-mono font-semibold text-primary">{d.value}</span>
        <span className="text-muted-foreground/60">/100</span>
      </p>
    </div>
  )
}

// 获取趋势图标
function getTrendIcon(value: number) {
  if (value >= 80) return <TrendingUp className="h-3.5 w-3.5 text-success" />
  if (value >= 60) return <Minus className="h-3.5 w-3.5 text-warning" />
  return <TrendingDown className="h-3.5 w-3.5 text-destructive" />
}

// 获取评分颜色
function getScoreColor(value: number): string {
  if (value >= 80) return "text-success"
  if (value >= 60) return "text-warning"
  return "text-destructive"
}

export default function StudentProfilePage() {
  const params = useParams()
  const studentId = params.id as string
  
  const [student, setStudent] = useState<StudentDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStudent() {
      try {
        const response = await fetch(`/api/students/${studentId}`)
        if (!response.ok) throw new Error("Failed to fetch student")
        const data = await response.json()
        setStudent(data)
      } catch (error) {
        console.error("Failed to fetch student:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchStudent()
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

  // 构建雷达图数据
  const radarData = dimensionConfig.map(config => ({
    dimension: config.label,
    value: student.psychProfile![config.key as keyof typeof student.psychProfile] as number,
    fullMark: 100,
  }))

  const overallScore = student.psychProfile.overallScore

  // 计算维度统计
  const scores = radarData.map(d => d.value)
  const maxScore = Math.max(...scores)
  const minScore = Math.min(...scores)
  const avgScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)

  // 找出最强和最弱维度
  const strongestDimension = radarData.find(d => d.value === maxScore)
  const weakestDimension = radarData.find(d => d.value === minScore)

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {/* Radar Chart */}
      <Card className="border-border bg-card shadow-sm overflow-hidden lg:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-primary/10 p-1.5">
              <Radar className="h-5 w-5 text-primary" />
            </div>
            <CardTitle className="text-base font-semibold text-foreground">
              心理画像雷达
            </CardTitle>
          </div>
          <Badge variant="outline" className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-primary/20">
            <span className="mr-1 h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            实时数据
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="h-[350px] w-full relative">
            {/* 背景装饰 */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-blue-500/5 rounded-lg" />
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} outerRadius="70%">
                <defs>
                  <linearGradient id="radarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#7C3AED" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#3B82F6" stopOpacity={0.2} />
                  </linearGradient>
                  <linearGradient id="radarStroke" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#7C3AED" />
                    <stop offset="100%" stopColor="#3B82F6" />
                  </linearGradient>
                </defs>
                <PolarGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
                <PolarAngleAxis
                  dataKey="dimension"
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11, fontWeight: 500 }}
                  tickLine={false}
                />
                <PolarRadiusAxis
                  domain={[0, 100]}
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 9 }}
                  axisLine={false}
                  tickCount={5}
                />
                <Tooltip content={<RadarTooltipContent />} />
                <RechartsRadar
                  name="心理指标"
                  dataKey="value"
                  stroke="url(#radarStroke)"
                  strokeWidth={2.5}
                  fill="url(#radarGradient)"
                  fillOpacity={0.35}
                />
              </RadarChart>
            </ResponsiveContainer>
            {/* 中心指数 */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
              <div className={`text-2xl font-bold ${getScoreColor(overallScore)}`}>
                {overallScore}
              </div>
              <div className="text-[10px] text-muted-foreground">综合评分</div>
            </div>
          </div>

          {/* 维度指标 */}
          <div className="mt-4 grid grid-cols-4 gap-2">
            {radarData.slice(0, 4).map((item, idx) => (
              <div 
                key={item.dimension} 
                className="flex flex-col items-center gap-1 rounded-lg bg-secondary/30 px-2 py-2 text-center"
              >
                <div 
                  className="h-2 w-2 rounded-full" 
                  style={{ background: `hsl(${idx * 60 + 260}, 70%, 55%)` }} 
                />
                <span className="text-[10px] text-muted-foreground">{item.dimension}</span>
                <span className={`text-sm font-semibold ${getScoreColor(item.value)}`}>
                  {item.value}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-2 grid grid-cols-4 gap-2">
            {radarData.slice(4).map((item, idx) => (
              <div 
                key={item.dimension} 
                className="flex flex-col items-center gap-1 rounded-lg bg-secondary/30 px-2 py-2 text-center"
              >
                <div 
                  className="h-2 w-2 rounded-full" 
                  style={{ background: `hsl(${(idx + 4) * 60 + 260}, 70%, 55%)` }} 
                />
                <span className="text-[10px] text-muted-foreground">{item.dimension}</span>
                <span className={`text-sm font-semibold ${getScoreColor(item.value)}`}>
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Stats Summary */}
      <div className="flex flex-col gap-4">
        {/* Overall Score Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              综合心理评分
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className={`text-4xl font-bold ${getScoreColor(overallScore)}`}>
                {overallScore}
              </span>
              <span className="text-sm text-muted-foreground">/100</span>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              {overallScore >= 80 
                ? "心理状态良好，各项指标均衡发展"
                : overallScore >= 60
                ? "心理状态正常，部分维度可加强"
                : "建议关注，需进行心理干预"
              }
            </p>
          </CardContent>
        </Card>

        {/* Dimension Stats */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              维度统计
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">平均分</span>
              <span className="font-semibold">{avgScore}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">最高分</span>
              <span className="font-semibold text-success">{maxScore}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">最低分</span>
              <span className="font-semibold text-destructive">{minScore}</span>
            </div>
          </CardContent>
        </Card>

        {/* Strongest Dimension */}
        {strongestDimension && (
          <Card className="border-success/30 bg-success/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-success flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                优势维度
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-semibold">{strongestDimension.dimension}</p>
              <p className="text-2xl font-bold text-success">{strongestDimension.value}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {dimensionConfig.find(c => c.label === strongestDimension.dimension)?.description}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Weakest Dimension */}
        {weakestDimension && (
          <Card className="border-destructive/30 bg-destructive/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-destructive flex items-center gap-2">
                <TrendingDown className="h-4 w-4" />
                关注维度
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-semibold">{weakestDimension.dimension}</p>
              <p className="text-2xl font-bold text-destructive">{weakestDimension.value}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {dimensionConfig.find(c => c.label === weakestDimension.dimension)?.description}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

function ProfileSkeleton() {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardContent className="p-6">
          <Skeleton className="h-[350px] w-full" />
        </CardContent>
      </Card>
      <div className="flex flex-col gap-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    </div>
  )
}
