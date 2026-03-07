"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Loader2, User, ChevronDown } from "lucide-react"
import {
  Radar,
  Clock,
  FileText,
  Check,
  AlertTriangle,
  Activity,
  Search,
} from "lucide-react"
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar as RechartsRadar,
  ResponsiveContainer,
  Tooltip,
} from "recharts"

interface StudentData {
  id: string
  name: string
  studentNo: string
  className: string
  faculty?: string
  gender?: string
  birthDate?: string
  mbti?: string
  riskLevel?: string
}

interface PsychProfileData {
  adversityQuotient: number
  emotionalStability: number
  socialTendency: number
  stressResistance: number
  selfAwareness: number
  empathy: number
  willpower: number
  adaptability: number
  overallScore: number
  radarData: Array<{ dimension: string; value: number }>
}

interface TimelineEvent {
  id: string
  date: string
  title: string
  desc: string
  status: string
}

interface InterventionRecord {
  id: string
  date: string
  type: string
  counselor: string
  duration: string
  result: string
  status: string
}

interface StudentSearchResult {
  id: string
  name: string
  studentNo: string
  className: string
  riskLevel?: string
}

interface RadarTooltipProps {
  active?: boolean
  payload?: Array<{ payload: { dimension: string; value: number } }>
}

function RadarTooltipContent({ active, payload }: RadarTooltipProps) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="rounded-md border border-border bg-popover px-3 py-2 text-xs shadow-lg">
      <p className="font-medium text-foreground">{d.dimension}</p>
      <p className="text-muted-foreground">
        评分：<span className="font-mono font-semibold text-primary">{d.value}</span>
      </p>
    </div>
  )
}

export function StudentProfileView() {
  const [loading, setLoading] = useState(false)
  const [student, setStudent] = useState<StudentData | null>(null)
  const [psychProfile, setPsychProfile] = useState<PsychProfileData | null>(null)
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([])
  const [interventionRecords, setInterventionRecords] = useState<InterventionRecord[]>([])
  
  // 学生搜索状态
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<StudentSearchResult[]>([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [showSearchResults, setShowSearchResults] = useState(false)

  // 搜索学生
  const searchStudents = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }
    
    try {
      setSearchLoading(true)
      const response = await fetch(`/api/students?search=${encodeURIComponent(query)}&limit=10`)
      const data = await response.json()
      
      if (data.students) {
        setSearchResults(data.students.map((s: any) => ({
          id: s.id,
          name: s.name,
          studentNo: s.studentNo,
          className: s.className,
          riskLevel: s.riskLevel,
        })))
        setShowSearchResults(true)
      }
    } catch (error) {
      console.error('Search failed:', error)
    } finally {
      setSearchLoading(false)
    }
  }

  // 防抖搜索
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery) {
        searchStudents(searchQuery)
      } else {
        setSearchResults([])
        setShowSearchResults(false)
      }
    }, 300)
    
    return () => clearTimeout(timer)
  }, [searchQuery])

  // 加载学生详情
  const loadStudentData = async (studentId: string) => {
    try {
      setLoading(true)
      setShowSearchResults(false)
      setSearchQuery("")
      
      const [profileRes, timelineRes, interventionsRes] = await Promise.all([
        fetch(`/api/students/${studentId}/profile`),
        fetch(`/api/students/${studentId}/timeline`),
        fetch(`/api/students/${studentId}/interventions`),
      ])
      
      const profileData = await profileRes.json()
      const timelineData = await timelineRes.json()
      const interventionsData = await interventionsRes.json()
      
      if (profileData.success) {
        setStudent(profileData.data.student)
        setPsychProfile(profileData.data.psychProfile)
      }
      
      if (timelineData.events) {
        setTimelineEvents(timelineData.events)
      }
      
      if (interventionsData.data?.records) {
        setInterventionRecords(interventionsData.data.records)
      }
    } catch (error) {
      console.error('Failed to load student data:', error)
    } finally {
      setLoading(false)
    }
  }

  // 空状态：未选择学生
  if (!student && !loading) {
    return (
      <div className="flex flex-col gap-4">
        <Card className="border-border bg-card shadow-sm">
          <CardContent className="p-6">
            <div className="relative">
              <label className="text-sm font-medium text-foreground mb-2 block">
                搜索学生
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="输入学生姓名或学号搜索..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchLoading && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                )}
              </div>
              
              {/* 搜索结果下拉 */}
              {showSearchResults && searchResults.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-1 z-50 rounded-lg border border-border bg-popover shadow-xl max-h-60 overflow-auto">
                  {searchResults.map((result) => (
                    <button
                      key={result.id}
                      onClick={() => loadStudentData(result.id)}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-secondary/50 transition-colors border-b border-border/50 last:border-0"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary/10 text-primary text-sm">
                          {result.name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">{result.name}</p>
                        <p className="text-xs text-muted-foreground">{result.studentNo} · {result.className}</p>
                      </div>
                      <Badge className={`text-xs ${
                        result.riskLevel === 'HIGH' ? 'bg-destructive/10 text-destructive' :
                        result.riskLevel === 'MEDIUM' ? 'bg-warning/10 text-warning' :
                        'bg-success/10 text-success'
                      }`}>
                        {result.riskLevel === 'HIGH' ? '高风险' :
                         result.riskLevel === 'MEDIUM' ? '中风险' : '低风险'}
                      </Badge>
                    </button>
                  ))}
                </div>
              )}
              
              {showSearchResults && searchQuery && !searchLoading && searchResults.length === 0 && (
                <div className="absolute left-0 right-0 top-full mt-1 z-50 rounded-lg border border-border bg-popover shadow-xl p-4 text-center text-sm text-muted-foreground">
                  未找到匹配的学生
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* 空状态提示 */}
        <Card className="border-border bg-card shadow-sm">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-secondary/50 flex items-center justify-center mb-4">
              <User className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">请选择学生</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              在上方搜索框输入学生姓名或学号，选择学生后查看其心理画像、生命周期追踪和干预记录
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading || !student) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  const radarData = psychProfile?.radarData || []
  const overallScore = psychProfile?.overallScore || 0

  return (
    <div className="flex flex-col gap-4">
      {/* 搜索栏 */}
      <Card className="border-border bg-card shadow-sm">
        <CardContent className="p-4">
          <div className="relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="搜索其他学生..."
                className="w-full max-w-md pl-10 pr-4 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchLoading && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
              )}
            </div>
            
            {showSearchResults && searchResults.length > 0 && (
              <div className="absolute left-0 top-full mt-1 z-50 w-full max-w-md rounded-lg border border-border bg-popover shadow-xl max-h-60 overflow-auto">
                {searchResults.map((result) => (
                  <button
                    key={result.id}
                    onClick={() => loadStudentData(result.id)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-secondary/50 transition-colors border-b border-border/50 last:border-0"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary/10 text-primary text-sm">
                        {result.name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{result.name}</p>
                      <p className="text-xs text-muted-foreground">{result.studentNo} · {result.className}</p>
                    </div>
                    <Badge className={`text-xs ${
                      result.riskLevel === 'HIGH' ? 'bg-destructive/10 text-destructive' :
                      result.riskLevel === 'MEDIUM' ? 'bg-warning/10 text-warning' :
                      'bg-success/10 text-success'
                    }`}>
                      {result.riskLevel === 'HIGH' ? '高风险' :
                       result.riskLevel === 'MEDIUM' ? '中风险' : '低风险'}
                    </Badge>
                  </button>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 学生信息卡片 */}
      <Card className="border-border bg-card shadow-sm">
        <CardContent className="flex flex-wrap items-center gap-6 p-5">
          <Avatar className="h-16 w-16 border-2 border-primary/20">
            <AvatarFallback className="bg-primary/10 text-lg font-bold text-primary">
              {student.name[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-xl font-bold text-foreground">{student.name}</h2>
            <p className="mt-0.5 text-sm text-muted-foreground">{student.className} | 学号 {student.studentNo}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {student.faculty} | {student.gender} | {student.birthDate ? new Date(student.birthDate).toLocaleDateString('zh-CN') : ''}
            </p>
          </div>
          <div className="ml-auto flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="border-primary/30 bg-primary/5 text-primary">
              MBTI-{student.mbti || '未知'}
            </Badge>
            <Badge className={`${
              student.riskLevel === 'HIGH' ? 'bg-destructive/10 text-destructive border-destructive/30' :
              student.riskLevel === 'MEDIUM' ? 'bg-warning/10 text-warning border-warning/30' :
              'bg-success/10 text-success border-success/30'
            }`}>
              {student.riskLevel === 'HIGH' ? '高风险' :
               student.riskLevel === 'MEDIUM' ? '中风险' : '低风险'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* 雷达图和时间线 */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* 雷达图 */}
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
            {radarData.length > 0 ? (
              <>
                <div className="h-[300px] w-full relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-blue-500/5 rounded-lg" />
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData} outerRadius="75%">
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
                      <PolarGrid stroke="#E5E7EB" strokeDasharray="3 3" />
                      <PolarAngleAxis
                        dataKey="dimension"
                        tick={{ fill: '#6B7280', fontSize: 11, fontWeight: 500 }}
                        tickLine={false}
                      />
                      <PolarRadiusAxis
                        domain={[0, 100]}
                        tick={{ fill: '#9CA3AF', fontSize: 9 }}
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
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                    <div className="text-2xl font-bold text-primary">{overallScore}</div>
                    <div className="text-[10px] text-muted-foreground">综合</div>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap justify-center gap-2">
                  {radarData.slice(0, 4).map((item, idx) => (
                    <div key={item.dimension} className="flex items-center gap-1.5 rounded-full bg-slate-50 px-2.5 py-1 text-xs dark:bg-slate-800">
                      <div className="h-1.5 w-1.5 rounded-full" style={{ background: `hsl(${idx * 60 + 260}, 70%, 55%)` }} />
                      <span className="text-muted-foreground">{item.dimension}</span>
                      <span className="font-medium text-foreground">{item.value}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                暂无心理画像数据
              </div>
            )}
          </CardContent>
        </Card>

        {/* 时间线 */}
        <Card className="border-border bg-card shadow-sm">
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
            <Clock className="h-5 w-5 text-chart-4" />
            <CardTitle className="text-base font-semibold text-foreground">
              全生命周期追踪
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px] pr-3">
              {timelineEvents.length > 0 ? (
                <div className="relative ml-3 border-l-2 border-border/60 pl-6">
                  {timelineEvents.map((event, i) => (
                    <div key={event.id || i} className="relative mb-6 last:mb-0">
                      <div
                        className={`absolute -left-[31px] top-0.5 flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                          event.status === "warning"
                            ? "border-warning bg-warning/20"
                            : event.status === "active"
                              ? "border-primary bg-primary/20"
                              : "border-success bg-success/20"
                        }`}
                      >
                        {event.status === "warning" ? (
                          <AlertTriangle className="h-2.5 w-2.5 text-warning" />
                        ) : event.status === "active" ? (
                          <Activity className="h-2.5 w-2.5 text-primary" />
                        ) : (
                          <Check className="h-2.5 w-2.5 text-success" />
                        )}
                      </div>
                      <p className="text-xs font-semibold text-muted-foreground">
                        {event.date}
                      </p>
                      <p className="mt-0.5 text-sm font-medium text-foreground">
                        {event.title}
                      </p>
                      <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground/80">
                        {event.desc}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  暂无时间线数据
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* 干预记录表格 */}
      <Card className="border-border bg-card/80 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center gap-2 pb-2">
          <FileText className="h-5 w-5 text-muted-foreground" />
          <CardTitle className="text-base font-semibold text-foreground">
            近期干预与咨询记录
          </CardTitle>
          <span className="ml-auto text-xs text-muted-foreground">
            共 {interventionRecords.length} 条记录
          </span>
        </CardHeader>
        <CardContent>
          {interventionRecords.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-xs text-muted-foreground">
                    <th className="px-3 py-2.5 text-left font-medium">日期</th>
                    <th className="px-3 py-2.5 text-left font-medium">类型</th>
                    <th className="px-3 py-2.5 text-left font-medium">咨询师</th>
                    <th className="px-3 py-2.5 text-left font-medium">时长</th>
                    <th className="px-3 py-2.5 text-left font-medium">结果</th>
                    <th className="px-3 py-2.5 text-left font-medium">状态</th>
                  </tr>
                </thead>
                <tbody>
                  {interventionRecords.map((record) => (
                    <tr
                      key={record.id}
                      className="border-b border-border/50 transition-colors hover:bg-secondary/30"
                    >
                      <td className="px-3 py-2.5 font-mono text-xs text-muted-foreground">
                        {new Date(record.date).toLocaleDateString('zh-CN')}
                      </td>
                      <td className="px-3 py-2.5 text-foreground">{record.type}</td>
                      <td className="px-3 py-2.5 text-muted-foreground">{record.counselor}</td>
                      <td className="px-3 py-2.5 font-mono text-xs text-muted-foreground">
                        {record.duration}
                      </td>
                      <td className="px-3 py-2.5 text-foreground">{record.result}</td>
                      <td className="px-3 py-2.5">
                        <Badge className="border-success/30 bg-success/10 text-xs text-success">
                          已完成
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              暂无干预记录
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
