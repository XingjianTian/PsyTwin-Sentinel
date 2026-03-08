"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import {
  User,
  Calendar,
  Clock,
  FileText,
  Activity,
  Lightbulb,
  MessageSquare,
  Target,
  Stethoscope,
  Paperclip,
  AlertCircle,
  TrendingUp,
  ChevronRight,
} from "lucide-react"

import type { InterventionRecordDetail } from "@/app/actions/intervention-records"
import { getInterventionRecordDetail } from "@/app/actions/intervention-records"

interface InterventionDetailDialogProps {
  recordId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

const typeColor: Record<string, string> = {
  "定期面谈": "border-blue-300/30 bg-blue-500/10 text-blue-600",
  "CBT治疗": "border-purple-300/30 bg-purple-500/10 text-purple-600",
  "团体辅导": "border-green-300/30 bg-green-500/10 text-green-600",
  "危机干预": "border-red-300/30 bg-red-500/10 text-red-600",
  "初次评估": "border-orange-300/30 bg-orange-500/10 text-orange-600",
}

const statusColor: Record<string, string> = {
  "已完成": "border-green-500/30 bg-green-500/10 text-green-600",
  "进展中": "border-purple-500/30 bg-purple-500/10 text-purple-600",
  "待开始": "border-yellow-500/30 bg-yellow-500/10 text-yellow-600",
}

// 情绪等级显示
function MoodLevel({ level, label }: { level: number | null | undefined; label: string }) {
  if (level === null || level === undefined) return <span className="text-muted-foreground text-sm">未记录</span>
  
  const getColor = (l: number) => {
    if (l <= 3) return "bg-green-500"
    if (l <= 6) return "bg-yellow-500"
    return "bg-red-500"
  }
  
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground w-12">{label}</span>
      <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
        <div 
          className={`h-full ${getColor(level)} transition-all duration-500`}
          style={{ width: `${level * 10}%` }}
        />
      </div>
      <span className="text-sm font-medium w-6">{level}</span>
    </div>
  )
}

// 改善指标卡片
function ImprovementCard({ 
  label, 
  before, 
  after 
}: { 
  label: string
  before: number | null | undefined
  after: number | null | undefined
}) {
  if (before === null || before === undefined || after === null || after === undefined) {
    return null
  }
  
  const diff = before - after
  const improved = diff > 0
  
  return (
    <div className="bg-secondary/30 rounded-lg p-3">
      <div className="text-sm text-muted-foreground mb-2">{label}</div>
      <div className="flex items-center justify-between">
        <div className="text-center">
          <div className="text-xs text-muted-foreground">干预前</div>
          <div className="text-lg font-semibold text-foreground">{before}</div>
        </div>
        <ChevronRight className={`h-4 w-4 ${improved ? 'text-green-500' : 'text-red-500'}`} />
        <div className="text-center">
          <div className="text-xs text-muted-foreground">干预后</div>
          <div className={`text-lg font-semibold ${improved ? 'text-green-600' : 'text-red-600'}`}>
            {after}
          </div>
        </div>
        <div className={`text-xs px-2 py-1 rounded ${improved ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'}`}>
          {improved ? '↓' : '↑'} {Math.abs(diff)}
        </div>
      </div>
    </div>
  )
}

// 信息区块组件
function InfoSection({ 
  title, 
  icon: Icon, 
  children,
  className 
}: { 
  title: string
  icon: React.ComponentType<{ className?: string }>
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-primary" />
        <h4 className="font-medium text-foreground">{title}</h4>
      </div>
      <div className="pl-6">
        {children}
      </div>
    </div>
  )
}

// 文本字段组件
function TextField({ 
  label, 
  value,
  multiline = false
}: { 
  label: string
  value: string | null | undefined
  multiline?: boolean
}) {
  if (!value) return null
  
  return (
    <div className="mb-3">
      <div className="text-xs text-muted-foreground mb-1">{label}</div>
      {multiline ? (
        <div className="text-sm text-foreground bg-secondary/30 rounded-md p-3 whitespace-pre-wrap">
          {value}
        </div>
      ) : (
        <div className="text-sm text-foreground">{value}</div>
      )}
    </div>
  )
}

export function InterventionDetailDialog({
  recordId,
  open,
  onOpenChange,
}: InterventionDetailDialogProps) {
  const [detail, setDetail] = useState<InterventionRecordDetail | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open && recordId) {
      loadDetail(recordId)
    } else {
      setDetail(null)
      setError(null)
    }
  }, [open, recordId])

  async function loadDetail(id: string) {
    setLoading(true)
    setError(null)
    try {
      const data = await getInterventionRecordDetail(id)
      setDetail(data)
    } catch (err) {
      setError("加载详情失败，请稍后重试")
    } finally {
      setLoading(false)
    }
  }

  // 获取详情数据（嵌套在 detail.detail 中）
  const detailData = detail?.detail

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] p-0">
        <DialogHeader className="px-6 pt-6 pb-2 border-b">
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-xl flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                干预记录详情
              </DialogTitle>
              {detail && (
                <div className="mt-2 flex flex-col gap-2">
                  <DialogDescription>
                    记录编号：{detail.id.slice(-8)}
                  </DialogDescription>
                  <div className="flex gap-2">
                    <Badge className={typeColor[detail.type] || "border-gray-300/30 bg-gray-500/10 text-gray-600"}>
                      {detail.type}
                    </Badge>
                    <Badge className={statusColor[detail.status] || "border-gray-300/30 bg-gray-500/10 text-gray-600"}>
                      {detail.status}
                    </Badge>
                  </div>
                </div>
              )}
            </div>
          </div>
        </DialogHeader>

        {loading ? (
          <div className="p-6 space-y-4">
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-4 w-1/2" />
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
            </div>
            <Skeleton className="h-32" />
          </div>
        ) : error ? (
          <div className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-3" />
            <p className="text-destructive">{error}</p>
          </div>
        ) : detail ? (
          <>
            {/* 基本信息卡片 */}
            <div className="px-6 py-4 border-b">
              <div className="grid grid-cols-4 gap-4 p-4 bg-secondary/20 rounded-lg">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-xs text-muted-foreground">学生</div>
                    <div className="text-sm font-medium">{detail.name}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-xs text-muted-foreground">班级</div>
                    <div className="text-sm font-medium">{detail.cls}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Stethoscope className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-xs text-muted-foreground">咨询师</div>
                    <div className="text-sm font-medium">{detail.counselor}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-xs text-muted-foreground">日期</div>
                    <div className="text-sm font-medium">{detail.date}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-xs text-muted-foreground">时长</div>
                    <div className="text-sm font-medium">{detail.duration}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 col-span-3">
                  <Activity className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-xs text-muted-foreground">干预结果</div>
                    <div className="text-sm font-medium">{detail.result}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs 内容 */}
            <Tabs defaultValue="assessment" className="px-6 pb-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="assessment">干预前评估</TabsTrigger>
                <TabsTrigger value="process">干预过程</TabsTrigger>
                <TabsTrigger value="effect">干预效果</TabsTrigger>
                <TabsTrigger value="followup">后续建议</TabsTrigger>
              </TabsList>

              <ScrollArea className="h-[400px] mt-4 pr-4">
                {!detailData ? (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                    <FileText className="h-12 w-12 mb-3 opacity-50" />
                    <p>暂无详细干预数据</p>
                    <p className="text-sm mt-1">该记录尚未录入详细评估信息</p>
                  </div>
                ) : (
                  <>
                    {/* 干预前评估 */}
                    <TabsContent value="assessment" className="space-y-6">
                      <InfoSection title="情绪状态评估" icon={Activity}>
                        <div className="space-y-3">
                          <MoodLevel level={detailData.preAnxietyLevel} label="焦虑程度" />
                          <MoodLevel level={detailData.preDepressionLevel} label="抑郁程度" />
                          <MoodLevel level={detailData.preStressLevel} label="压力水平" />
                        </div>
                        <TextField label="情绪状态描述" value={detailData.preMood} />
                      </InfoSection>

                      <Separator />

                      <InfoSection title="问题与风险" icon={AlertCircle}>
                        <TextField label="主要问题" value={detailData.mainIssues} multiline />
                        <TextField label="风险等级" value={detailData.riskLevel} />
                        <TextField label="风险评估" value={detailData.riskAssessment} multiline />
                      </InfoSection>
                    </TabsContent>

                    {/* 干预过程 */}
                    <TabsContent value="process" className="space-y-6">
                      <InfoSection title="会话内容" icon={MessageSquare}>
                        <TextField label="内容摘要" value={detailData.sessionContent} multiline />
                        <TextField label="关键要点" value={detailData.keyPoints} multiline />
                        <TextField label="情绪变化观察" value={detailData.emotionalChanges} multiline />
                      </InfoSection>

                      <Separator />

                      <InfoSection title="干预技术" icon={Lightbulb}>
                        {detailData.techniquesUsed && detailData.techniquesUsed.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {detailData.techniquesUsed.map((tech, idx) => (
                              <Badge key={idx} variant="secondary">
                                {tech}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">未记录使用的技术</span>
                        )}
                      </InfoSection>

                      <Separator />

                      <InfoSection title="学生反馈" icon={User}>
                        <TextField label="参与度/反馈" value={detailData.studentEngagement} multiline />
                      </InfoSection>
                    </TabsContent>

                    {/* 干预效果 */}
                    <TabsContent value="effect" className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <ImprovementCard 
                          label="焦虑改善" 
                          before={detailData.preAnxietyLevel} 
                          after={detailData.postAnxietyLevel} 
                        />
                        <ImprovementCard 
                          label="抑郁改善" 
                          before={detailData.preDepressionLevel} 
                          after={detailData.postDepressionLevel} 
                        />
                      </div>

                      {detailData.improvementScore !== null && detailData.improvementScore !== undefined && (
                        <InfoSection title="整体改善评分" icon={TrendingUp}>
                          <div className="flex items-center gap-4">
                            <div className="flex-1 h-3 bg-secondary rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-primary transition-all duration-500"
                                style={{ width: `${detailData.improvementScore * 10}%` }}
                              />
                            </div>
                            <span className="text-lg font-bold text-primary">{detailData.improvementScore}/10</span>
                          </div>
                        </InfoSection>
                      )}

                      <Separator />

                      <InfoSection title="情绪变化" icon={Activity}>
                        <TextField label="干预后情绪状态" value={detailData.postMood} />
                      </InfoSection>

                      <Separator />

                      <InfoSection title="关键突破" icon={Target}>
                        <TextField label="突破点记录" value={detailData.breakthroughPoints} multiline />
                        <TextField label="未解决问题" value={detailData.unfinishedIssues} multiline />
                      </InfoSection>
                    </TabsContent>

                    {/* 后续建议 */}
                    <TabsContent value="followup" className="space-y-6">
                      <InfoSection title="行动计划" icon={Target}>
                        <TextField label="后续行动" value={detailData.followUpActions} multiline />
                        <TextField label="给学生的建议" value={detailData.recommendations} multiline />
                      </InfoSection>

                      {detailData.nextAppointment && (
                        <InfoSection title="下次预约" icon={Calendar}>
                          <div className="text-sm text-foreground">{detailData.nextAppointment}</div>
                        </InfoSection>
                      )}

                      <Separator />

                      <InfoSection title="转介建议" icon={AlertCircle}>
                        <TextField label="转介信息" value={detailData.referrals} multiline />
                      </InfoSection>

                      {detailData.privateNotes && (
                        <>
                          <Separator />
                          <InfoSection title="咨询师笔记（私人）" icon={FileText}>
                            <div className="text-sm text-foreground bg-yellow-500/5 rounded-md p-3 whitespace-pre-wrap border border-yellow-500/20">
                              {detailData.privateNotes}
                            </div>
                          </InfoSection>
                        </>
                      )}

                      {detailData.attachments && detailData.attachments.length > 0 && (
                        <>
                          <Separator />
                          <InfoSection title="附件" icon={Paperclip}>
                            <div className="space-y-2">
                              {detailData.attachments.map((url, idx) => (
                                <a 
                                  key={idx}
                                  href={url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 text-sm text-primary hover:underline"
                                >
                                  <Paperclip className="h-3 w-3" />
                                  附件 {idx + 1}
                                </a>
                              ))}
                            </div>
                          </InfoSection>
                        </>
                      )}
                    </TabsContent>
                  </>
                )}
              </ScrollArea>
            </Tabs>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
