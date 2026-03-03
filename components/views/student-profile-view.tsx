"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  User,
  Radar,
  Clock,
  FileText,
  Check,
  AlertTriangle,
  Activity,
  Search,
  ChevronDown,
  Filter,
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

// Radar chart data
const radarData = [
  { dimension: "逆商", value: 82 },
  { dimension: "情绪稳定", value: 68 },
  { dimension: "社交倾向", value: 75 },
  { dimension: "抗压能力", value: 85 },
  { dimension: "自我认知", value: 78 },
  { dimension: "共情能力", value: 90 },
  { dimension: "意志力", value: 72 },
  { dimension: "适应性", value: 80 },
]

// Timeline data
const timelineEvents = [
  {
    date: "2025年9月",
    title: "入学普测完成",
    desc: "SCL-90/SDS/SAS三量表联合筛查，评分正常范围",
    status: "success" as const,
  },
  {
    date: "2025年10月",
    title: "VR脱敏训练（第一期）",
    desc: "完成社交焦虑VR脱敏训练6次，焦虑指数下降22%",
    status: "success" as const,
  },
  {
    date: "2025年11月",
    title: "触发预警（信安2401班处理）",
    desc: "室友反馈情绪波动大，心理咨询师介入评估",
    status: "warning" as const,
  },
  {
    date: "2025年12月",
    title: "心理咨询面谈（3次）",
    desc: "认知行为疗法（CBT）干预，建立积极认知重构",
    status: "success" as const,
  },
  {
    date: "2026年1月",
    title: "期末复查",
    desc: "各项指标恢复正常，情绪稳定性提升18%",
    status: "success" as const,
  },
  {
    date: "2026年2月",
    title: "新学期跟踪中",
    desc: "持续监测中，当前状态良好",
    status: "active" as const,
  },
]

// Intervention records
const interventionRecords = [
  {
    date: "2026-02-15",
    type: "定期访谈",
    counselor: "刘芳（高级咨询师）",
    duration: "50分钟",
    result: "状态良好",
    status: "completed",
  },
  {
    date: "2026-01-20",
    type: "CBT疗法",
    counselor: "张伟（心理治疗师）",
    duration: "60分钟",
    result: "认知重构进展顺利",
    status: "completed",
  },
  {
    date: "2025-12-28",
    type: "团体辅导",
    counselor: "王丽（辅导员）",
    duration: "90分钟",
    result: "社交互动改善",
    status: "completed",
  },
  {
    date: "2025-12-15",
    type: "危机干预",
    counselor: "刘芳（高级咨询师）",
    duration: "45分钟",
    result: "情绪稳定",
    status: "completed",
  },
  {
    date: "2025-11-22",
    type: "初次评估",
    counselor: "刘芳（高级咨询师）",
    duration: "60分钟",
    result: "建立干预方案",
    status: "completed",
  },
]

interface RadarTooltipProps {
  active?: boolean
  payload?: Array<{ payload: (typeof radarData)[0] }>
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

/* ── Grade & class options ── */
const gradeOptions = ["全部年级", "2024级", "2025级", "2026级"]
const classOptions = ["全部班级", "网络2401", "虚拟2503", "软件2402", "数媒2401", "信安2401", "大数据2502"]

export function StudentProfileView() {
  const [searchText, setSearchText] = useState("")
  const [selectedGrade, setSelectedGrade] = useState("全部年级")
  const [gradeDropdownOpen, setGradeDropdownOpen] = useState(false)
  const [selectedClass, setSelectedClass] = useState("全部班级")
  const [classDropdownOpen, setClassDropdownOpen] = useState(false)

  return (
    <div className="flex flex-col gap-4">
      {/* ── Filter bar ── */}
      <Card className="border-border bg-card shadow-sm">
        <CardContent className="flex flex-wrap items-center gap-4 p-4">
          {/* Search */}
          <div className="flex items-center gap-2 rounded-lg border border-border bg-secondary/30 px-3 py-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="搜索学生姓名、学号..."
              className="w-48 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>

          {/* Grade dropdown */}
          <div className="relative">
            <button
              onClick={() => { setGradeDropdownOpen(!gradeDropdownOpen); setClassDropdownOpen(false) }}
              className="flex items-center gap-2 rounded-lg border border-border bg-secondary/30 px-3 py-2 text-sm text-foreground transition-colors hover:bg-secondary/50"
            >
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span>{selectedGrade}</span>
              <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${gradeDropdownOpen ? "rotate-180" : ""}`} />
            </button>
            {gradeDropdownOpen && (
              <div className="absolute left-0 top-full z-10 mt-1 min-w-[140px] rounded-lg border border-border bg-popover py-1 shadow-xl">
                {gradeOptions.map((grade) => (
                  <button
                    key={grade}
                    onClick={() => { setSelectedGrade(grade); setGradeDropdownOpen(false) }}
                    className={`flex w-full items-center px-4 py-2 text-sm transition-colors ${
                      selectedGrade === grade
                        ? "bg-primary/10 text-primary"
                        : "text-foreground hover:bg-secondary/50"
                    }`}
                  >
                    {grade}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Class dropdown */}
          <div className="relative">
            <button
              onClick={() => { setClassDropdownOpen(!classDropdownOpen); setGradeDropdownOpen(false) }}
              className="flex items-center gap-2 rounded-lg border border-border bg-secondary/30 px-3 py-2 text-sm text-foreground transition-colors hover:bg-secondary/50"
            >
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span>{selectedClass}</span>
              <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${classDropdownOpen ? "rotate-180" : ""}`} />
            </button>
            {classDropdownOpen && (
              <div className="absolute left-0 top-full z-10 mt-1 min-w-[140px] rounded-lg border border-border bg-popover py-1 shadow-xl">
                {classOptions.map((cls) => (
                  <button
                    key={cls}
                    onClick={() => { setSelectedClass(cls); setClassDropdownOpen(false) }}
                    className={`flex w-full items-center px-4 py-2 text-sm transition-colors ${
                      selectedClass === cls
                        ? "bg-primary/10 text-primary"
                        : "text-foreground hover:bg-secondary/50"
                    }`}
                  >
                    {cls}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Result hint */}
          <span className="ml-auto text-xs text-muted-foreground">
            当前查看学生：<span className="font-semibold text-foreground">张宇</span>
          </span>
        </CardContent>
      </Card>

      {/* Top: Student Info Card */}
      <Card className="border-border bg-card shadow-sm">
        <CardContent className="flex flex-wrap items-center gap-6 p-5">
          <Avatar className="h-16 w-16 border-2 border-warning/30">
            <AvatarFallback className="bg-warning/10 text-lg font-bold text-warning">
              张
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-xl font-bold text-foreground">张宇</h2>
            <p className="mt-0.5 text-sm text-muted-foreground">大数据2502 | 学号 2025030218</p>
            <p className="mt-0.5 text-xs text-muted-foreground">信息工程学院 | 男 | 2006年3月</p>
          </div>
          <div className="ml-auto flex flex-wrap items-center gap-2">
            <Badge className="border-primary/30 bg-primary/10 text-primary">
              MBTI-INTJ
            </Badge>
            <Badge className="border-success/30 bg-success/10 text-success">
              抑郁低风险
            </Badge>
            <Badge className="border-chart-4/30 bg-chart-4/10 text-chart-4">
              抗压能力强
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Middle: Radar + Timeline */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Radar Chart */}
        <Card className="border-border bg-card shadow-sm">
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
            <Radar className="h-5 w-5 text-primary" />
            <CardTitle className="text-base font-semibold text-foreground">
              多维心理雷达图
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData} outerRadius="75%">
                  <PolarGrid stroke="#E5E7EB" />
                  <PolarAngleAxis
                    dataKey="dimension"
                    tick={{ fill: "#6B7280", fontSize: 12 }}
                  />
                  <PolarRadiusAxis
                    domain={[0, 100]}
                    tick={{ fill: "#475569", fontSize: 10 }}
                    axisLine={false}
                  />
                  <Tooltip content={<RadarTooltipContent />} />
                  <RechartsRadar
                    name="心理指标"
                    dataKey="value"
                    stroke="#7C3AED"
                    fill="#7C3AED"
                    fill="#00d4ff"
                    fillOpacity={0.15}
                    strokeWidth={2}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Timeline */}
        <Card className="border-border bg-card shadow-sm">
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
            <Clock className="h-5 w-5 text-chart-4" />
            <CardTitle className="text-base font-semibold text-foreground">
              全生命周期追踪
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px] pr-3">
              <div className="relative ml-3 border-l-2 border-border/60 pl-6">
                {timelineEvents.map((event, i) => (
                  <div key={i} className="relative mb-6 last:mb-0">
                    {/* Node dot */}
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
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Bottom: Intervention Records Table */}
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
                {interventionRecords.map((record, i) => (
                  <tr
                    key={i}
                    className="border-b border-border/50 transition-colors hover:bg-secondary/30"
                  >
                    <td className="px-3 py-2.5 font-mono text-xs text-muted-foreground">
                      {record.date}
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
        </CardContent>
      </Card>
    </div>
  )
}
