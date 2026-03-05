"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Gamepad2,
  Timer,
  TrendingUp,
  Monitor,
  Activity,
} from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  LineChart,
  Line,
  Legend,
} from "recharts"

import {
  createWorkOrderFromVrSession,
  getDashboardVrRecords,
  type DashboardVrRecord,
} from "@/app/actions/vr-dashboard"

/* ── KPI stats ── */
const stats = [
  {
    label: "累计体验人次",
    value: "8,432",
    change: "+186 本周",
    icon: Gamepad2,
    gradient: "from-primary/20 to-primary/5",
    borderColor: "border-primary/20",
    iconColor: "text-primary",
  },
  {
    label: "平均单次时长",
    value: "23.5 分钟",
    change: "+2.1 分钟",
    icon: Timer,
    gradient: "from-chart-3/20 to-chart-3/5",
    borderColor: "border-chart-3/20",
    iconColor: "text-chart-3",
  },
  {
    label: "情绪改善率",
    value: "76.8%",
    change: "+3.2%",
    icon: TrendingUp,
    gradient: "from-chart-2/20 to-chart-2/5",
    borderColor: "border-chart-2/20",
    iconColor: "text-chart-2",
  },
  {
    label: "活跃设备数",
    value: "42 台",
    change: "3 台维护中",
    icon: Monitor,
    gradient: "from-chart-4/20 to-chart-4/5",
    borderColor: "border-chart-4/20",
    iconColor: "text-chart-4",
  },
]

/* ── Scene usage data ── */
const sceneData = [
  { scene: "社交焦虑脱敏", 频次: 2340 },
  { scene: "考试压力释放", 频次: 1980 },
  { scene: "正念冥想空间", 频次: 2680 },
  { scene: "情绪宣泄训练", 频次: 1432 },
]

/* ── Before/After stress line data ── */
const stressData = [
  { week: "第1周", 体验前: 72, 体验后: 68 },
  { week: "第2周", 体验前: 75, 体验后: 62 },
  { week: "第3周", 体验前: 70, 体验后: 55 },
  { week: "第4周", 体验前: 68, 体验后: 48 },
  { week: "第5周", 体验前: 73, 体验后: 45 },
  { week: "第6周", 体验前: 71, 体验后: 42 },
  { week: "第7周", 体验前: 69, 体验后: 38 },
  { week: "第8周", 体验前: 74, 体验后: 36 },
]

/* ── Tooltips ── */
interface SceneTooltipProps {
  active?: boolean
  payload?: Array<{ value: number }>
  label?: string
}
function SceneTooltip({ active, payload, label }: SceneTooltipProps) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-md border border-border bg-popover px-3 py-2 text-xs shadow-lg">
      <p className="mb-1 font-medium text-foreground">{label}</p>
      <p className="text-primary">使用频次：{payload[0].value} 次</p>
    </div>
  )
}

interface StressTooltipProps {
  active?: boolean
  payload?: Array<{ name: string; value: number; color: string }>
  label?: string
}
function StressTooltip({ active, payload, label }: StressTooltipProps) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-md border border-border bg-popover px-3 py-2 text-xs shadow-lg">
      <p className="mb-1 font-medium text-foreground">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}：{p.value} 分
        </p>
      ))}
    </div>
  )
}

export function VrDashboardView() {
  const [vrRecords, setVrRecords] = useState<DashboardVrRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [actionMessage, setActionMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [actingId, setActingId] = useState<string | null>(null)

  async function loadRecords() {
    try {
      const data = await getDashboardVrRecords()
      setVrRecords(data)
      setError(null)
    } catch {
      setError("VR记录加载失败，请稍后重试")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadRecords()
  }, [])

  async function handleCreateWorkOrder(sessionId: string, studentName: string) {
    setActingId(sessionId)
    setActionMessage(null)
    try {
      await createWorkOrderFromVrSession(sessionId)
      setActionMessage(`已为 ${studentName} 创建（或复用）跟进工单`)
    } catch {
      setError("创建工单失败，请稍后重试")
    } finally {
      setActingId(null)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* ── Top: Two charts (moved to front) ── */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Bar chart: Scene usage frequency */}
        <Card className="border-border bg-card shadow-sm">
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
            <Gamepad2 className="h-5 w-5 text-primary" />
            <CardTitle className="text-base font-semibold text-foreground">
              四大场景使用频次
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sceneData} margin={{ top: 10, right: 10, bottom: 30, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                  <XAxis
                    dataKey="scene"
                    tick={{ fill: "#6B7280", fontSize: 11 }}
                    axisLine={{ stroke: "#E5E7EB" }}
                    tickLine={false}
                    interval={0}
                    angle={-20}
                    textAnchor="end"
                    height={50}
                  />
                  <YAxis
                    tick={{ fill: "#6B7280", fontSize: 10 }}
                    axisLine={{ stroke: "#E5E7EB" }}
                    tickLine={false}
                  />
                  <Tooltip content={<SceneTooltip />} cursor={{ fill: "rgba(124, 58, 237, 0.05)" }} />
                  <Bar
                    dataKey="频次"
                    fill="#7C3AED"
                    radius={[4, 4, 0, 0]}
                    barSize={40}
                    fillOpacity={0.85}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Line chart: Before/After stress comparison */}
        <Card className="border-border bg-card shadow-sm">
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
            <Activity className="h-5 w-5 text-chart-2" />
            <CardTitle className="text-base font-semibold text-foreground">
              体验前后压力值对比
            </CardTitle>
            <div className="ml-auto flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full" style={{ background: "#F59E0B" }} />
                体验前
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full" style={{ background: "#10B981" }} />
                体验后
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stressData} margin={{ top: 10, right: 10, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis
                    dataKey="week"
                    tick={{ fill: "#6B7280", fontSize: 11 }}
                    axisLine={{ stroke: "#E5E7EB" }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: "#6B7280", fontSize: 10 }}
                    axisLine={{ stroke: "#E5E7EB" }}
                    tickLine={false}
                    domain={[20, 90]}
                  />
                  <Tooltip content={<StressTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="体验前"
                    stroke="#F59E0B"
                    strokeWidth={2}
                    dot={{ fill: "#F59E0B", r: 3 }}
                    activeDot={{ r: 5, fill: "#F59E0B" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="体验后"
                    stroke="#10B981"
                    strokeWidth={2}
                    dot={{ fill: "#10B981", r: 3 }}
                    activeDot={{ r: 5, fill: "#10B981" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Middle: 4 stat cards ── */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <Card
            key={s.label}
            className={`relative overflow-hidden border bg-gradient-to-br ${s.gradient} ${s.borderColor} backdrop-blur-sm`}
          >
            <CardContent className="flex items-center gap-4 p-4">
              <div className={`rounded-lg bg-background/40 p-2.5 ${s.iconColor}`}>
                <s.icon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className="mt-0.5 text-xl font-bold text-foreground">{s.value}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{s.change}</p>
              </div>
            </CardContent>
            {/* subtle glow corner */}
            <div className={`absolute -right-4 -top-4 h-16 w-16 rounded-full bg-gradient-to-br ${s.gradient} opacity-40 blur-xl`} />
          </Card>
        ))}
      </div>

      {/* ── Bottom: Recent VR records table ── */}
      <Card className="border-border bg-card shadow-sm">
        <CardHeader className="flex flex-row items-center gap-2 pb-2">
          <Gamepad2 className="h-5 w-5 text-muted-foreground" />
          <CardTitle className="text-base font-semibold text-foreground">
            最新VR干预记录
          </CardTitle>
          <span className="ml-auto text-xs text-muted-foreground">
            共 {vrRecords.length} 条记录
          </span>
        </CardHeader>
        <CardContent>
          {actionMessage ? (
            <p className="mb-2 text-right text-xs text-success">{actionMessage}</p>
          ) : null}
          {error ? (
            <p className="mb-2 text-right text-xs text-destructive">{error}</p>
          ) : null}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-xs text-muted-foreground">
                  <th className="px-3 py-2.5 text-left font-medium">学生姓名</th>
                  <th className="px-3 py-2.5 text-left font-medium">班级</th>
                  <th className="px-3 py-2.5 text-left font-medium">体验场景</th>
                  <th className="px-3 py-2.5 text-left font-medium">时长</th>
                  <th className="px-3 py-2.5 text-left font-medium">体验前情绪</th>
                  <th className="px-3 py-2.5 text-left font-medium">体验后情绪</th>
                  <th className="px-3 py-2.5 text-left font-medium">转化结果</th>
                  <th className="px-3 py-2.5 text-left font-medium">操作</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="px-3 py-8 text-center text-sm text-muted-foreground">
                      正在加载VR记录...
                    </td>
                  </tr>
                ) : null}
                {vrRecords.map((r) => (
                  <tr
                    key={r.id}
                    className="border-b border-border/30 transition-colors hover:bg-secondary/20"
                  >
                    <td className="px-3 py-2.5 font-medium text-foreground">{r.name}</td>
                    <td className="px-3 py-2.5 text-muted-foreground">{r.cls}</td>
                    <td className="px-3 py-2.5 text-foreground">{r.scene}</td>
                    <td className="px-3 py-2.5 font-mono text-xs text-muted-foreground">{r.duration}</td>
                    <td className="px-3 py-2.5">
                      <Badge className="border-destructive/30 bg-destructive/10 text-xs text-destructive">
                        {r.before}
                      </Badge>
                    </td>
                    <td className="px-3 py-2.5">
                      <Badge className={`text-xs ${
                        r.result === "positive"
                          ? "border-success/30 bg-success/10 text-success"
                          : "border-chart-4/30 bg-chart-4/10 text-chart-4"
                      }`}>
                        {r.after}
                      </Badge>
                    </td>
                    <td className="px-3 py-2.5">
                      <Badge className={`text-xs ${
                        r.result === "positive"
                          ? "border-success/30 bg-success/10 text-success"
                          : "border-chart-4/30 bg-chart-4/10 text-chart-4"
                      }`}>
                        {r.result === "positive" ? "有效改善" : "持续观察"}
                      </Badge>
                    </td>
                    <td className="px-3 py-2.5">
                      <button
                        onClick={() => handleCreateWorkOrder(r.id, r.name)}
                        disabled={actingId === r.id}
                        className="rounded border border-primary/30 bg-primary/10 px-2 py-1 text-xs text-primary transition-colors hover:bg-primary/20 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        生成跟进工单
                      </button>
                    </td>
                  </tr>
                ))}
                {!isLoading && vrRecords.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-3 py-8 text-center text-sm text-muted-foreground">
                      暂无VR记录
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
