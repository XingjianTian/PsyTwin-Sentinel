"use client"

import { BrainCircuit, ShieldAlert, ShieldCheck, Sparkles } from "lucide-react"

import type { DashboardVrRecord } from "@/app/actions/vr-dashboard"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"

interface VrAnalysisReportSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  record: DashboardVrRecord | null
  onCreateWorkOrder: (sessionId: string, studentName: string) => Promise<void>
  isSubmitting?: boolean
  actionMessage?: string | null
  error?: string | null
}

type RiskMeta = {
  score: number
  level: string
  scoreColor: string
  levelClassName: string
  recommendations: { label: string; className: string }[]
}

function getRiskMeta(record: DashboardVrRecord): RiskMeta {
  if (record.result === "positive") {
    return {
      score: 38,
      level: "低危",
      scoreColor: "#10B981",
      levelClassName: "border-success/30 bg-success/10 text-success",
      recommendations: [
        { label: "持续观察", className: "border-success/40 bg-success/10 text-success" },
        { label: "辅导员关注", className: "border-blue-500/40 bg-blue-500/10 text-blue-600" },
        { label: "阶段复盘", className: "border-violet-500/40 bg-violet-500/10 text-violet-600" },
      ],
    }
  }

  return {
    score: 72,
    level: "中危",
    scoreColor: "#F59E0B",
    levelClassName: "border-warning/30 bg-warning/10 text-warning",
    recommendations: [
      { label: "优先复盘", className: "border-warning/40 bg-warning/10 text-warning" },
      { label: "心理咨询", className: "border-amber-500/40 bg-amber-500/10 text-amber-600" },
      { label: "辅导员关注", className: "border-blue-500/40 bg-blue-500/10 text-blue-600" },
      { label: "家长沟通", className: "border-purple-500/40 bg-purple-500/10 text-purple-600" },
    ],
  }
}

function RiskScoreRing({ score, color }: { score: number; color: string }) {
  const circumference = 2 * Math.PI * 45
  const offset = circumference - (score / 100) * circumference

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg className="h-16 w-16" viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="currentColor"
          strokeWidth="6"
          className="text-muted/20"
        />
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-lg font-bold" style={{ color }}>
          {score}
        </span>
      </div>
    </div>
  )
}

export function VrAnalysisReportSheet({
  open,
  onOpenChange,
  record,
  onCreateWorkOrder,
  isSubmitting = false,
  actionMessage = null,
  error = null,
}: VrAnalysisReportSheetProps) {
  const riskMeta = record ? getRiskMeta(record) : null

  async function handleCreateWorkOrder() {
    if (!record) return
    await onCreateWorkOrder(record.id, record.name)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full overflow-y-auto border-l-border/70 sm:max-w-3xl">
        <SheetHeader className="sr-only">
          <SheetTitle>
            {record ? `${record.name} 的 VR 分析报告` : "VR 分析报告"}
          </SheetTitle>
        </SheetHeader>

        <div className="mt-10 pr-1 pb-4">
          {!record ? (
            <div className="rounded-lg border border-border bg-secondary/20 p-4 text-sm text-muted-foreground">
              未找到分析报告数据
            </div>
          ) : (
            <div className="space-y-4 pb-2">
              <div className="rounded-2xl border border-destructive/20 bg-card p-5 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <BrainCircuit className="h-7 w-7 text-destructive" />
                      <div>
                        <p className="text-2xl font-semibold text-foreground">AI 风险感知预警</p>
                        <p className="text-sm text-muted-foreground">
                          [Qwen-14B VR 干预效果分析报告 - {record.name}]
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Badge className={riskMeta!.levelClassName}>{riskMeta!.level}</Badge>
                      <Badge className="border-border bg-secondary/40 text-foreground">{record.cls}</Badge>
                      <Badge className="border-border bg-secondary/40 text-foreground">{record.scene}</Badge>
                      <Badge className="border-border bg-secondary/40 text-foreground">体验时长：{record.duration}</Badge>
                    </div>
                  </div>

                  <RiskScoreRing score={riskMeta!.score} color={riskMeta!.scoreColor} />
                </div>

                <div className="mt-5 rounded-2xl border border-destructive/10 bg-destructive/5 p-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2 text-destructive">
                      <ShieldAlert className="h-5 w-5" />
                      <span className="text-lg font-semibold">推荐策略</span>
                    </div>
                    {riskMeta!.recommendations.map((item) => (
                      <Badge key={item.label} className={`rounded-xl px-3 py-1 text-sm font-semibold ${item.className}`}>
                        {item.label}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-border/70 bg-muted/15 p-4">
                <p className="text-base leading-8 text-foreground">
                  基于本次 VR 体验场景、情绪转化结果与沉浸时长综合分析，该生本轮干预呈现
                  <span className="mx-1 font-semibold text-primary">
                    {record.result === "positive" ? "正向缓和趋势" : "有限改善趋势"}
                  </span>
                  ，建议先查看本次体验分析，再决定是否进入后续人工跟进。
                </p>
              </div>

              <div className="space-y-4 rounded-xl border border-border/70 bg-card p-4">
                <div>
                  <p className="text-xl font-semibold text-foreground">一、沉浸体验参与度</p>
                  <p className="mt-3 text-base leading-8 text-muted-foreground">
                    本次体验场景为“{record.scene}”，总时长 {record.duration}。学生在体验前呈现“{record.before}”情绪，
                    说明进入 VR 干预时仍存在较明显的情绪紧绷或心理负荷。{record.duration === "1分钟"
                      ? "由于本次停留时间较短，建议结合后续体验频次一起判断稳定性，避免对单次体验过度解读。"
                      : "当前体验时长已具备基本观察价值，可作为短周期干预趋势判断样本。"}
                  </p>
                </div>

                <div>
                  <p className="text-xl font-semibold text-foreground">二、情绪转化趋势</p>
                  <p className="mt-3 text-base leading-8 text-muted-foreground">
                    情绪标签从“{record.before}”转化为“{record.after}”，系统判定本次结果为
                    <span className="mx-1 font-semibold text-primary">
                      {record.result === "positive" ? "有效改善" : "持续观察"}
                    </span>
                    。这表明 VR 场景对学生即时情绪调节具有一定作用，但是否转化为稳定改善，仍需结合后续复测、咨询记录或辅导员观察持续验证。
                  </p>
                </div>

                <div>
                  <p className="text-xl font-semibold text-foreground">三、后续跟进建议</p>
                  <p className="mt-3 text-base leading-8 text-muted-foreground">
                    建议先由值班老师或咨询师查看本报告，结合学生近期档案与风险轨迹进行二次判断。若后续多次体验仍反复出现“{record.before}”等高唤醒状态，
                    或者线下观察发现回避、压抑、社交退缩等行为信号，再生成跟进工单进入人工复盘；若后续维持“{record.after}”等稳定状态，则以持续观察为主即可。
                  </p>
                </div>
              </div>

              <Separator />

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-border/70 bg-secondary/15 p-4">
                  <p className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <Sparkles className="h-4 w-4 text-primary" />
                    本次体验摘要
                  </p>
                  <ul className="mt-3 space-y-2 text-sm leading-7 text-muted-foreground">
                    <li>学生：{record.name}</li>
                    <li>班级：{record.cls}</li>
                    <li>体验前：{record.before}</li>
                    <li>体验后：{record.after}</li>
                  </ul>
                </div>

                <div className="rounded-xl border border-border/70 bg-secondary/15 p-4">
                  <p className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <ShieldCheck className="h-4 w-4 text-success" />
                    决策建议
                  </p>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">
                    当前交互已调整为“先看报告，再决定跟进”。如果您确认需要人工介入，可直接在本抽屉底部生成跟进工单。
                  </p>
                </div>
              </div>

              <div className="mt-2 border-t border-border/60 pt-3">
                {actionMessage ? (
                  <p className="mb-2 text-sm text-success">{actionMessage}</p>
                ) : null}
                {error ? (
                  <p className="mb-2 text-sm text-destructive">{error}</p>
                ) : null}
                <div className="flex items-center justify-end gap-2">
                  <Button variant="outline" onClick={() => onOpenChange(false)}>
                    关闭
                  </Button>
                  <Button onClick={() => void handleCreateWorkOrder()} disabled={!record || isSubmitting}>
                    {isSubmitting ? "生成中..." : "生成跟进工单"}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
