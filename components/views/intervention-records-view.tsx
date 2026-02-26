"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  FileText,
  Search,
  ChevronDown,
  Calendar,
  Filter,
  Check,
} from "lucide-react"

/* ── Filter options ── */
const riskLevels = ["全部", "高危", "中危", "低危"]

/* ── Work order data ── */
interface WorkOrder {
  id: string
  name: string
  cls: string
  trigger: string
  riskLevel: "高危" | "中危" | "低危"
  method: string
  counselor: string
  status: "已结案" | "跟进中" | "待分配" | "干预中"
  date: string
  detail: string
}

const orders: WorkOrder[] = [
  { id: "GD-20260201", name: "陈雨晴", cls: "软件2402", trigger: "语音情感异常连续触发", riskLevel: "高危", method: "VR脱敏训练", counselor: "刘芳", status: "跟进中", date: "2026-02-18", detail: "第3次VR训练后焦虑指数下降18%" },
  { id: "GD-20260202", name: "张明远", cls: "网络2401", trigger: "心率持续偏高（>110bpm）", riskLevel: "高危", method: "线下谈话", counselor: "张伟", status: "干预中", date: "2026-02-17", detail: "已安排心理咨询师面谈2次" },
  { id: "GD-20260203", name: "刘思远", cls: "数媒2401", trigger: "连续7天睡眠不足4小时", riskLevel: "中危", method: "VR脱敏训练", counselor: "王丽", status: "已结案", date: "2026-02-15", detail: "完成正念冥想训练后睡眠改善，复查正常" },
  { id: "GD-20260204", name: "吴志远", cls: "大数据2502", trigger: "14天未出宿舍门禁", riskLevel: "高危", method: "线下谈话", counselor: "刘芳", status: "跟进中", date: "2026-02-14", detail: "辅导员已上门家访，后续安排团体辅导" },
  { id: "GD-20260205", name: "周航宇", cls: "虚拟2503", trigger: "语音颤抖频率超标", riskLevel: "中危", method: "VR脱敏训练", counselor: "张伟", status: "已结案", date: "2026-02-13", detail: "4次VR训练后声学指标恢复正常范围" },
  { id: "GD-20260206", name: "赵天宇", cls: "信安2401", trigger: "突发心率飙升（145bpm）", riskLevel: "高危", method: "线下谈话", counselor: "刘芳", status: "待分配", date: "2026-02-12", detail: "等待排班安排，已通知辅导员关注" },
  { id: "GD-20260207", name: "黄思萌", cls: "软件2402", trigger: "食堂消费记录连续7天为零", riskLevel: "中危", method: "线下谈话", counselor: "王丽", status: "已结案", date: "2026-02-10", detail: "确认为饮食习惯调整，非心理因素" },
  { id: "GD-20260208", name: "林志豪", cls: "大数据2502", trigger: "行动轨迹异常收缩", riskLevel: "低危", method: "VR脱敏训练", counselor: "张伟", status: "已结案", date: "2026-02-08", detail: "经评估为期末备考期正常收缩，已解除关注" },
  { id: "GD-20260209", name: "王语嫣", cls: "网络2401", trigger: "社交回避行为加剧", riskLevel: "中危", method: "VR脱敏训练", counselor: "刘芳", status: "跟进中", date: "2026-02-06", detail: "第2次社交焦虑VR脱敏训练进行中" },
  { id: "GD-20260210", name: "孙浩然", cls: "虚拟2503", trigger: "情绪波动指数持续高位", riskLevel: "中危", method: "线下谈话", counselor: "王丽", status: "干预中", date: "2026-02-05", detail: "CBT认知重构疗法进行中，第1阶段" },
  { id: "GD-20260211", name: "李瑶瑶", cls: "数媒2401", trigger: "VR训练中焦虑指数反弹", riskLevel: "低危", method: "VR脱敏训练", counselor: "张伟", status: "已结案", date: "2026-02-03", detail: "调整VR场景难度后指标恢复正常" },
  { id: "GD-20260212", name: "何俊辉", cls: "信安2401", trigger: "课堂出勤率骤降至40%", riskLevel: "高危", method: "线下谈话", counselor: "刘芳", status: "跟进中", date: "2026-02-01", detail: "确认存在适应性问题，已建立辅导方案" },
]

const statusColor: Record<string, string> = {
  "已结案": "border-success/30 bg-success/10 text-success",
  "跟进中": "border-chart-4/30 bg-chart-4/10 text-chart-4",
  "待分配": "border-muted-foreground/30 bg-muted/30 text-muted-foreground",
  "干预中": "border-primary/30 bg-primary/10 text-primary",
}

const riskColor: Record<string, string> = {
  "高危": "border-destructive/30 bg-destructive/15 text-destructive",
  "中危": "border-warning/30 bg-warning/15 text-warning",
  "低危": "border-success/30 bg-success/15 text-success",
}

export function InterventionRecordsView() {
  const [selectedRisk, setSelectedRisk] = useState("全部")
  const [riskDropdownOpen, setRiskDropdownOpen] = useState(false)
  const [dateRange, setDateRange] = useState("2026-02-01 至 2026-02-26")
  const [searchText, setSearchText] = useState("")

  const filtered = orders.filter((o) => {
    if (selectedRisk !== "全部" && o.riskLevel !== selectedRisk) return false
    if (searchText && !o.name.includes(searchText) && !o.id.includes(searchText) && !o.cls.includes(searchText)) return false
    return true
  })

  return (
    <div className="flex flex-col gap-4">
      {/* ── Filter bar ── */}
      <Card className="border-[#101a40]/60 bg-[#0a1030]/70 backdrop-blur-sm">
        <CardContent className="flex flex-wrap items-center gap-4 p-4">
          {/* Search */}
          <div className="flex items-center gap-2 rounded-lg border border-border bg-secondary/30 px-3 py-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="搜索工单编号、姓名、班级..."
              className="w-48 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>

          {/* Date range */}
          <div className="flex items-center gap-2 rounded-lg border border-border bg-secondary/30 px-3 py-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-foreground">{dateRange}</span>
          </div>

          {/* Risk level dropdown */}
          <div className="relative">
            <button
              onClick={() => setRiskDropdownOpen(!riskDropdownOpen)}
              className="flex items-center gap-2 rounded-lg border border-border bg-secondary/30 px-3 py-2 text-sm text-foreground transition-colors hover:bg-secondary/50"
            >
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span>风险等级：{selectedRisk}</span>
              <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${riskDropdownOpen ? "rotate-180" : ""}`} />
            </button>
            {riskDropdownOpen && (
              <div className="absolute left-0 top-full z-10 mt-1 min-w-[140px] rounded-lg border border-border bg-popover py-1 shadow-xl">
                {riskLevels.map((level) => (
                  <button
                    key={level}
                    onClick={() => { setSelectedRisk(level); setRiskDropdownOpen(false) }}
                    className={`flex w-full items-center px-4 py-2 text-sm transition-colors ${
                      selectedRisk === level
                        ? "bg-primary/10 text-primary"
                        : "text-foreground hover:bg-secondary/50"
                    }`}
                  >
                    {level}
                    {selectedRisk === level && <Check className="ml-auto h-4 w-4 text-primary" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Result count */}
          <span className="ml-auto text-xs text-muted-foreground">
            共筛选出 <span className="font-semibold text-foreground">{filtered.length}</span> 条记录
          </span>
        </CardContent>
      </Card>

      {/* ── Main table ── */}
      <Card className="border-[#101a40]/60 bg-[#0a1030]/70 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center gap-2 pb-2">
          <FileText className="h-5 w-5 text-muted-foreground" />
          <CardTitle className="text-base font-semibold text-foreground">
            干预工单列表
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[calc(100vh-280px)]">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-xs text-muted-foreground">
                    <th className="px-3 py-3 text-left font-medium">工单编号</th>
                    <th className="px-3 py-3 text-left font-medium">学生姓名</th>
                    <th className="px-3 py-3 text-left font-medium">班级</th>
                    <th className="px-3 py-3 text-left font-medium">触发原因</th>
                    <th className="px-3 py-3 text-left font-medium">风险等级</th>
                    <th className="px-3 py-3 text-left font-medium">干预方式</th>
                    <th className="px-3 py-3 text-left font-medium">负责咨询师</th>
                    <th className="px-3 py-3 text-left font-medium">日期</th>
                    <th className="px-3 py-3 text-left font-medium">当前状态</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((order) => (
                    <tr
                      key={order.id}
                      className="group border-b border-border/30 transition-colors hover:bg-secondary/20"
                    >
                      <td className="px-3 py-3 font-mono text-xs text-primary/80">{order.id}</td>
                      <td className="px-3 py-3 font-medium text-foreground">{order.name}</td>
                      <td className="px-3 py-3 text-muted-foreground">{order.cls}</td>
                      <td className="max-w-[200px] truncate px-3 py-3 text-foreground" title={order.trigger}>
                        {order.trigger}
                      </td>
                      <td className="px-3 py-3">
                        <Badge className={`text-xs ${riskColor[order.riskLevel]}`}>
                          {order.riskLevel}
                        </Badge>
                      </td>
                      <td className="px-3 py-3 text-foreground">{order.method}</td>
                      <td className="px-3 py-3 text-muted-foreground">{order.counselor}</td>
                      <td className="px-3 py-3 font-mono text-xs text-muted-foreground">{order.date}</td>
                      <td className="px-3 py-3">
                        <Badge className={`text-xs ${statusColor[order.status]}`}>
                          {order.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}
