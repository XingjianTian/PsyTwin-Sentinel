"use client"

import Image from "next/image"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Activity, Bot, BrainCircuit, CircleAlert, MessageSquareText, PawPrint, Play, RefreshCw, Save, Search, Settings2, Square, Volume2 } from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { ReachyDebugConsole } from "@/components/views/pet-ai-management/reachy-debug-console"
import { getCollaborationEventPresentation } from "@/lib/pet-ai/collaboration-presentation"
import { mergeUniqueById, newestFirstById } from "@/lib/pet-ai/event-stream"
import { getReachySessionEntryPresentation, type ReachyServiceAvailability } from "@/lib/pet-ai/reachy-session-entry"
import { getRiskPresentation, highestRiskLevel, normalizeRiskLevel } from "@/lib/pet-ai/risk-presentation"
import { cn } from "@/lib/utils"

type StudentSummary = { id: string; name: string; studentNo: string; className: string; riskLevel: string; mbti: string | null; pet: { id: string; name: string; isOnline: boolean; expression: string | null; mood: number } | null }
type AiProfile = { tone: string; responseStyle: string; initiative: number; systemPrompt: string; knowledgeScope: string[] }
type PetPersonality = { openness: number; conscientiousness: number; extraversion: number; agreeableness: number; neuroticism: number }
type Detail = {
  student: { id: string; name: string; studentNo: string; className: string; riskLevel: string; mbti: string | null; psychProfile: Record<string, number> | null }
  pet: { id: string; name: string; imageSrc: string; species: string; color: string; accessory: string; expression: string; mood: number; energy: number; sociability: number; activity: string; scene: string; state: string; personality: PetPersonality }
  aiProfile: AiProfile
  conversations: Array<{ id: string; role: "student" | "pet"; content: string; createdAt: string; topic: string; demo: true; riskLevel: string }>
  isDemoStudent: boolean
}
type ReachyEvent = { id: number; kind: "emotion" | "handoff" | "professional" | "relay" | "tts"; status: "complete" | "fallback" | "error"; title: string; summary: string; risk_level?: string; created_at: string }
type ReachyTranscriptItem = { id: number; role: string; content: string; risk_level?: string; created_at: string }
type ReachyStatus = { running?: boolean; student_id?: string | null; state?: string; error?: string | null; risk_level?: string; transcript?: { cursor?: number; items?: ReachyTranscriptItem[] }; events?: { cursor?: number; items?: ReachyEvent[] } }
type WorkspaceMode = "management" | "debug"
const traitLabels: Array<[keyof PetPersonality, string]> = [["openness", "开放"], ["conscientiousness", "尽责"], ["extraversion", "外向"], ["agreeableness", "亲和"], ["neuroticism", "敏感"]]

async function readPayload(response: Response) {
  const text = await response.text()
  if (!text) return {}
  try { return JSON.parse(text) } catch { return {} }
}

export function PetAiManagementView() {
  const [workspaceMode, setWorkspaceMode] = useState<WorkspaceMode>("management")
  const [students, setStudents] = useState<StudentSummary[]>([])
  const [classes, setClasses] = useState<string[]>([])
  const [selectedId, setSelectedId] = useState("")
  const [detail, setDetail] = useState<Detail | null>(null)
  const [profile, setProfile] = useState<AiProfile | null>(null)
  const [search, setSearch] = useState("")
  const [className, setClassName] = useState("")
  const [riskLevel, setRiskLevel] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState("info")
  const [reachy, setReachy] = useState<ReachyStatus>({ state: "offline" })
  const [reachyError, setReachyError] = useState("")
  const [reachyAvailability, setReachyAvailability] = useState<ReachyServiceAvailability>("checking")
  const transcriptCursorRef = useRef(0)
  const eventCursorRef = useRef(0)

  const loadStudents = useCallback(async () => {
    setLoading(true)
    const query = new URLSearchParams({ limit: "50" })
    if (search) query.set("search", search)
    if (className) query.set("className", className)
    if (riskLevel) query.set("riskLevel", riskLevel)
    try {
      const response = await fetch(`/api/pet-ai/students?${query}`)
      const payload = await readPayload(response)
      if (!response.ok) throw new Error(payload.message || "学生列表加载失败")
      setStudents(payload.data.students)
      setClasses(payload.data.classes)
      setSelectedId((current) => payload.data.students.some((item: StudentSummary) => item.id === current) ? current : (payload.data.students.find((item: StudentSummary) => item.id === payload.data.demoStudentId)?.id || payload.data.students[0]?.id || ""))
    } catch (error) {
      toast.error((error as Error).message)
    } finally {
      setLoading(false)
    }
  }, [search, className, riskLevel])

  useEffect(() => { const timer = setTimeout(loadStudents, 220); return () => clearTimeout(timer) }, [loadStudents])

  useEffect(() => {
    if (!selectedId) return
    let cancelled = false
    fetch(`/api/pet-ai/students/${selectedId}`).then(async (response) => {
      const payload = await readPayload(response)
      if (!response.ok) throw new Error(payload.message || "心宠资料加载失败")
      if (!cancelled) { setDetail(payload.data); setProfile(payload.data.aiProfile) }
    }).catch((error) => !cancelled && toast.error(error.message))
    return () => { cancelled = true }
  }, [selectedId])

  const pollReachy = useCallback(async () => {
    try {
      const after = transcriptCursorRef.current
      const eventAfter = eventCursorRef.current
      const response = await fetch(`/api/pet-ai/reachy/status?after=${after}&eventAfter=${eventAfter}`)
      const payload = await readPayload(response)
      if (!response.ok) throw new Error(payload.message || "设备服务不可用")
      transcriptCursorRef.current = payload.data.transcript?.cursor || after
      eventCursorRef.current = payload.data.events?.cursor || eventAfter
      setReachy((current) => ({
        ...payload.data,
        transcript: { cursor: payload.data.transcript?.cursor, items: mergeUniqueById(current.transcript?.items || [], payload.data.transcript?.items || []).slice(-100) },
        events: { cursor: payload.data.events?.cursor, items: mergeUniqueById(current.events?.items || [], payload.data.events?.items || []).slice(-100) },
      }))
      setReachyError("")
      setReachyAvailability("available")
    } catch (error) {
      setReachyError((error as Error).message)
      setReachyAvailability("unavailable")
    }
  }, [])

  useEffect(() => {
    if (activeTab !== "live") return
    void pollReachy()
    const timer = setInterval(pollReachy, 1000)
    return () => clearInterval(timer)
  }, [activeTab, pollReachy])

  useEffect(() => {
    transcriptCursorRef.current = 0
    eventCursorRef.current = 0
  }, [selectedId])

  const selectStudent = (studentId: string) => {
    transcriptCursorRef.current = 0
    eventCursorRef.current = 0
    setReachy((current) => ({ ...current, transcript: { cursor: 0, items: [] }, events: { cursor: 0, items: [] } }))
    setSelectedId(studentId)
  }

  const saveProfile = async () => {
    if (!detail || !profile) return
    setSaving(true)
    try {
      const response = await fetch(`/api/pet-ai/students/${detail.student.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(profile) })
      const payload = await readPayload(response)
      if (!response.ok) throw new Error(payload.message || "保存失败")
      toast.success("性格配置已保存")
    } catch (error) { toast.error((error as Error).message) } finally { setSaving(false) }
  }

  const sessionEntry = getReachySessionEntryPresentation({
    isDemoStudent: detail?.isDemoStudent === true,
    running: reachy.running === true,
    availability: reachyAvailability,
    serviceState: reachy.state,
    serviceError: reachyError,
  })

  const controlSession = async (action: "start" | "stop") => {
    if (!detail || !profile) return
    if (action === "start" && !sessionEntry.canStart) {
      toast.error(sessionEntry.reason)
      return
    }
    try {
      const response = await fetch("/api/pet-ai/reachy/session", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action, studentId: detail.student.id }) })
      const payload = await readPayload(response)
      if (!response.ok) throw new Error(payload.message || "操作失败")
      if (action === "start" || action === "stop") {
        transcriptCursorRef.current = 0
        eventCursorRef.current = 0
        setReachy((current) => ({ ...current, transcript: { cursor: 0, items: [] }, events: { cursor: 0, items: [] } }))
      }
      toast.success(action === "start" ? "Reachy 对话已启动" : "Reachy 对话已停止")
      void pollReachy()
    } catch (error) { toast.error((error as Error).message) }
  }

  const ocean = useMemo(() => detail?.pet.personality || null, [detail])
  const sessionRiskLevel = useMemo(
    () => reachy.student_id === selectedId ? highestRiskLevel(detail?.student.riskLevel, reachy.risk_level) : normalizeRiskLevel(detail?.student.riskLevel),
    [detail?.student.riskLevel, reachy.risk_level, reachy.student_id, selectedId],
  )
  const sessionRisk = getRiskPresentation(sessionRiskLevel)

  return (
    <div className="flex h-[calc(100dvh-6.5rem)] min-h-[560px] flex-col gap-3 overflow-hidden">
      <header className="flex shrink-0 flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
        <div><h1 className="text-xl font-semibold">心宠AI管理中心</h1><p className="mt-1 text-sm text-muted-foreground">{workspaceMode === "management" ? "管理每位学生的心宠形象、性格与对话能力" : "连接并检查本机 Reachy Mini Lite 的运行状态"}</p></div>
        <div role="group" aria-label="心宠工作区" className="grid w-full grid-cols-2 rounded-lg bg-muted p-1 sm:w-auto">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            aria-pressed={workspaceMode === "management"}
            onClick={() => setWorkspaceMode("management")}
            className={cn(
              "min-w-24 shadow-none",
              workspaceMode === "management" && "bg-card text-foreground shadow-xs hover:bg-card",
            )}
          >心宠管理</Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            aria-pressed={workspaceMode === "debug"}
            onClick={() => setWorkspaceMode("debug")}
            className={cn(
              "min-w-24 shadow-none",
              workspaceMode === "debug" && "bg-card text-primary shadow-xs hover:bg-card hover:text-primary",
            )}
          >心宠调试</Button>
        </div>
      </header>

      {workspaceMode === "management" ? <section className="grid min-h-0 flex-1 grid-cols-1 gap-3 overflow-y-auto lg:grid-cols-2 lg:overflow-hidden">
        <aside className="flex min-h-[320px] min-w-0 flex-col overflow-hidden rounded-xl border bg-card lg:min-h-0">
          <div className="border-b p-3"><div className="flex items-center gap-2 font-medium"><PawPrint className="size-4 text-primary" />学生与心宠</div><div className="relative mt-3"><Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" /><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="搜索姓名或学号" className="pl-8" /></div><div className="mt-2 grid grid-cols-2 gap-2"><select aria-label="班级筛选" value={className} onChange={(event) => setClassName(event.target.value)} className="h-9 rounded-md border bg-background px-2 text-sm"><option value="">全部班级</option>{classes.map((item) => <option key={item}>{item}</option>)}</select><select aria-label="风险筛选" value={riskLevel} onChange={(event) => setRiskLevel(event.target.value)} className="h-9 rounded-md border bg-background px-2 text-sm"><option value="">全部风险</option><option value="LOW">低风险</option><option value="MEDIUM">中风险</option><option value="HIGH">高风险</option><option value="CRITICAL">危机</option></select></div></div>
          <div className="min-h-0 flex-1 overflow-y-auto p-2">
            {loading ? Array.from({ length: 6 }, (_, index) => <div key={index} className="mb-2 h-16 animate-pulse rounded-lg bg-muted" />) : students.map((student) => {
              const displayedRiskLevel = reachy.student_id === student.id ? highestRiskLevel(student.riskLevel, reachy.risk_level) : normalizeRiskLevel(student.riskLevel)
              const displayedRisk = getRiskPresentation(displayedRiskLevel)
              return <button key={student.id} onClick={() => selectStudent(student.id)} className={cn("mb-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", selectedId === student.id ? "bg-primary/10 text-primary" : "hover:bg-muted")}><div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold">{student.name.slice(0, 1)}</div><div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-2"><span className="truncate text-sm font-medium text-foreground">{student.name}</span><span className={cn("size-2 shrink-0 rounded-full", student.pet?.isOnline ? "bg-success" : "bg-border")} /></div><p className="truncate text-xs text-muted-foreground">{student.className} · {student.pet?.name || "待生成"}</p></div><Badge variant="outline" aria-label={`${student.name}${displayedRisk.label}`} className={cn("px-1.5", displayedRisk.badgeClassName)}>{displayedRisk.label}</Badge></button>
            })}
          </div>
        </aside>

        <section className="min-h-[520px] min-w-0 overflow-hidden rounded-xl border bg-card lg:min-h-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full gap-0">
            <TabsList className="m-3 mb-0 grid w-[calc(100%-1.5rem)] shrink-0 grid-cols-4">
              <TabsTrigger value="info"><PawPrint />心宠信息</TabsTrigger>
              <TabsTrigger value="records"><MessageSquareText />对话记录</TabsTrigger>
              <TabsTrigger value="live"><Activity />实时联调</TabsTrigger>
              <TabsTrigger value="profile"><Settings2 />性格配置</TabsTrigger>
            </TabsList>

            <TabsContent value="info" className="min-h-0 overflow-y-auto p-4">
              {!detail || !profile ? <div className="space-y-3">{Array.from({ length: 4 }, (_, index) => <div key={index} className="h-24 animate-pulse rounded-lg bg-muted" />)}</div> : <div className="space-y-6">
                <section className="flex items-start gap-4">
                  <div className="relative flex size-32 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-primary/5"><Image src={detail.pet.imageSrc} alt={`${detail.pet.name}的心宠外观`} width={150} height={150} loading="eager" className="size-28 object-contain" /></div>
                  <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h2 className="text-lg font-semibold">{detail.pet.name}</h2>{detail.isDemoStudent && <Badge>Pocket 同款心宠 · Reachy 联调</Badge>}</div><p className="mt-1 text-sm text-muted-foreground">{detail.student.name} · {detail.student.studentNo} · {detail.student.className}</p><dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-sm"><div><dt className="text-muted-foreground">外观</dt><dd className="mt-0.5">{detail.pet.color} · {detail.pet.accessory}</dd></div><div><dt className="text-muted-foreground">表情</dt><dd className="mt-0.5">{detail.pet.expression}</dd></div><div><dt className="text-muted-foreground">当前场景</dt><dd className="mt-0.5">{detail.pet.scene}</dd></div><div><dt className="text-muted-foreground">活动</dt><dd className="mt-0.5">{detail.pet.activity}</dd></div></dl></div>
                </section>

                <section><div className="mb-3 flex items-center justify-between gap-3"><h3 className="text-sm font-semibold">OCEAN 性格画像</h3><span className="text-xs text-muted-foreground">读取心宠真实性格数据</span></div><div className="grid grid-cols-5 gap-2">{ocean && traitLabels.map(([key, label]) => <div key={key} className="rounded-lg bg-muted/70 p-2 text-center"><div className="text-base font-semibold text-primary">{ocean[key]}</div><div className="text-xs text-muted-foreground">{label}</div></div>)}</div><p className="mt-2 text-xs text-muted-foreground">学生画像：MBTI {detail.student.mbti || "未记录"} · 心理综合分 {detail.student.psychProfile?.overallScore ?? "未记录"}</p></section>

                <section className="border-t pt-5">
                  <div><h3 className="text-sm font-semibold">当前性格配置</h3><p className="mt-1 text-xs text-muted-foreground">此处仅展示当前生效配置，请在“性格配置”页签中修改。</p></div>
                  <dl className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-lg bg-muted/60 px-3 py-2.5"><dt className="text-xs text-muted-foreground">表达语气</dt><dd className="mt-1 text-sm font-medium">{profile.tone}</dd></div>
                    <div className="rounded-lg bg-muted/60 px-3 py-2.5"><dt className="text-xs text-muted-foreground">回复风格</dt><dd className="mt-1 text-sm font-medium">{profile.responseStyle}</dd></div>
                    <div className="rounded-lg bg-muted/60 px-3 py-2.5"><dt className="text-xs text-muted-foreground">主动程度</dt><dd className="mt-1 text-sm font-medium">{profile.initiative}</dd></div>
                    <div className="rounded-lg bg-muted/60 px-3 py-2.5"><dt className="text-xs text-muted-foreground">知识范围</dt><dd className="mt-1 text-sm font-medium">{profile.knowledgeScope.join("、") || "未配置"}</dd></div>
                  </dl>
                  <div className="mt-3"><span className="text-xs text-muted-foreground">身份与行为约束</span><p className="mt-1 rounded-lg bg-muted/60 px-3 py-2.5 text-sm leading-6 text-pretty">{profile.systemPrompt}</p></div>
                </section>
              </div>}
            </TabsContent>

            <TabsContent value="records" className="min-h-0 overflow-y-auto p-4">
              <div className="mb-4 flex items-center justify-between"><span className="text-sm font-medium">最近对话</span><Badge variant="secondary">演示记录</Badge></div>
              {detail?.conversations.length === 0 ? <div className="rounded-lg border border-dashed px-5 py-10 text-center"><MessageSquareText className="mx-auto size-6 text-muted-foreground" /><p className="mt-3 text-sm font-medium">测试心宠还没有历史对话</p><p className="mt-1 text-xs leading-5 text-muted-foreground">启动 Reachy 会话后，请在“实时联调”中查看本次转写。当前会话不会保存为历史记录。</p></div> : <div className="space-y-3">{detail?.conversations.map((message, index) => {
                const messageDate = new Date(message.createdAt)
                const previous = detail.conversations[index - 1]
                const showDate = !previous || new Date(previous.createdAt).toDateString() !== messageDate.toDateString()
                const isStudent = message.role === "student"
                const messageRiskLevel = normalizeRiskLevel(message.riskLevel)
                const messageRisk = getRiskPresentation(messageRiskLevel)
                return <div key={message.id}>
                  {showDate && <div className="my-3 flex items-center gap-2 text-[11px] text-muted-foreground"><span className="h-px flex-1 bg-border" /><span>{messageDate.toLocaleDateString("zh-CN", { month: "long", day: "numeric" })}</span><span className="h-px flex-1 bg-border" /></div>}
                  <div className={cn("flex items-end gap-2", isStudent ? "justify-end" : "justify-start")}>
                    {!isStudent && <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10"><Image src={detail.pet.imageSrc} alt="心宠头像" width={40} height={40} className="size-9 object-contain" /></div>}
                    <div aria-label={isStudent ? "学生发送" : "心宠回复"} className={cn("w-fit max-w-[82%] px-3 py-2 text-sm transition-colors duration-200 motion-reduce:transition-none", isStudent ? "rounded-2xl rounded-br-md" : "rounded-2xl rounded-bl-md", isStudent ? messageRisk.studentMessageClassName : messageRisk.petMessageClassName)}>
                      <div className="mb-1 flex flex-wrap items-center gap-2 text-[11px]"><span className="font-medium text-current/75">{isStudent ? detail.student.name : detail.pet.name}</span><span className="text-current/65">{message.topic}</span><span className="text-current/65">{messageDate.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}</span>{messageRiskLevel !== "LOW" && <Badge variant="outline" className={cn("h-5 px-1.5 text-[10px]", messageRisk.badgeClassName)}>{messageRisk.label}</Badge>}</div>
                      <p className="max-w-[42ch] leading-6 text-pretty">{message.content}</p>
                    </div>
                    {isStudent && <div aria-label="学生头像" className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-medium">{detail.student.name.slice(0, 1)}</div>}
                  </div>
                </div>
              })}</div>}
            </TabsContent>
            <TabsContent value="live" className="min-h-0 overflow-y-auto p-4">
              <div className="rounded-lg bg-muted/70 p-3"><div className="flex items-center justify-between gap-3"><div className="flex items-center gap-2"><span className={cn("size-2.5 rounded-full", reachy.running ? "bg-success" : "bg-muted-foreground/50")} /><span className="text-sm font-medium">{reachy.running ? "设备会话运行中" : "设备待机"}</span>{reachy.student_id === selectedId && <Badge variant="outline" className={cn("ml-1 gap-1.5", sessionRisk.badgeClassName)}><CircleAlert className="size-3" />实时风险 · {sessionRisk.label}</Badge>}</div><Button size="icon-sm" variant="ghost" onClick={pollReachy} aria-label="刷新设备状态"><RefreshCw /></Button></div><p id="reachy-session-entry-reason" aria-live="polite" className="mt-1 text-xs text-muted-foreground">{sessionEntry.reason || (detail?.isDemoStudent ? "当前绑定：测试学生 · 实体 Reachy" : "当前学生仅支持文本联调")}</p><div className="mt-3 flex gap-2"><Button size="sm" onClick={() => controlSession("start")} disabled={!sessionEntry.canStart} aria-describedby="reachy-session-entry-reason" title={sessionEntry.reason || undefined}><Play />开始对话</Button><Button size="sm" variant="outline" onClick={() => controlSession("stop")} disabled={!reachy.running}><Square />停止</Button></div></div>

              <section className="mt-4"><div className="mb-2 flex items-center justify-between"><h3 className="text-sm font-medium">实时对话</h3><span className="text-[11px] text-muted-foreground">百度 ASR / TTS</span></div>{(reachy.transcript?.items || []).length === 0 ? <p className="rounded-lg border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">启动设备会话后，学生语音与测试心宠回复会显示在这里。</p> : <div className="space-y-2">{reachy.transcript?.items?.map((item) => {
                const isStudent = item.role === "user"
                const itemRiskLevel = normalizeRiskLevel(item.risk_level)
                const itemRisk = getRiskPresentation(itemRiskLevel)
                return <div key={item.id} className={cn("flex", isStudent ? "justify-end" : "justify-start")}><div className={cn("w-fit max-w-[88%] rounded-xl px-3 py-2 text-sm leading-5 transition-colors duration-200 motion-reduce:transition-none", isStudent ? "rounded-br-sm" : "rounded-bl-sm", isStudent ? itemRisk.studentMessageClassName : itemRisk.petMessageClassName)}><div className="mb-1 flex items-center gap-2 text-[11px] font-medium"><span className={itemRiskLevel === "LOW" ? "text-muted-foreground" : "text-current/75"}>{isStudent ? "测试学生 · ASR" : "测试心宠 · TTS"}</span>{itemRiskLevel !== "LOW" && <Badge variant="outline" className={cn("h-5 px-1.5 text-[10px]", itemRisk.badgeClassName)}>{itemRisk.label}</Badge>}</div><p className="text-pretty">{item.content}</p></div></div>
              })}</div>}</section>

              <section className="mt-5 border-t pt-4"><div className="mb-3 flex items-start justify-between gap-3"><div><h3 className="text-sm font-medium">协作过程</h3><p className="mt-0.5 text-[11px] leading-4 text-muted-foreground">显示可审核的阶段摘要，不展示模型原始思维链；最新状态置顶。</p></div><Badge variant="outline">双层 AI</Badge></div>{(reachy.events?.items || []).length === 0 ? <div className="rounded-lg border border-dashed p-4 text-xs leading-5 text-muted-foreground">检测到负面情绪后，这里会依次显示转交咨询师智能体、<span className="text-foreground">咨询师智能体专业建议</span>、心宠转述和<span className="text-foreground">百度 TTS</span>状态。</div> : <div className="space-y-2">{newestFirstById(reachy.events?.items || []).map((event) => {
                const EventIcon = event.kind === "emotion" ? CircleAlert : event.kind === "professional" ? BrainCircuit : event.kind === "tts" ? Volume2 : event.kind === "relay" ? PawPrint : Bot
                const eventPresentation = getCollaborationEventPresentation(event.kind, event.title)
                const eventRiskLevel = normalizeRiskLevel(event.risk_level || sessionRiskLevel)
                const eventRisk = getRiskPresentation(eventRiskLevel)
                return <div key={event.id} className={cn("flex gap-3 rounded-lg border p-3 transition-colors duration-200 motion-reduce:transition-none", eventRisk.eventClassName)}>{eventPresentation.avatarSrc ? <div className="flex size-10 shrink-0 overflow-hidden rounded-full border bg-background"><Image src={eventPresentation.avatarSrc} alt="咨询师智能体头像" width={40} height={40} className="size-10 object-cover" /></div> : <div className={cn("flex size-10 shrink-0 items-center justify-center rounded-full", event.status === "error" ? "bg-destructive text-destructive-foreground" : event.status === "fallback" ? "bg-amber-200 text-amber-900" : eventRisk.iconClassName)}><EventIcon className="size-4" /></div>}<div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-2"><span className="text-xs font-semibold">{eventPresentation.title}</span><div className="flex items-center gap-2"><Badge variant="outline" className={cn("h-5 px-1.5 text-[10px]", eventRisk.badgeClassName)}>{eventRisk.label}</Badge><span className="text-[10px] text-current/65">{new Date(event.created_at).toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</span></div></div><p className="mt-1 text-xs leading-5 text-current/80">{event.summary}</p></div></div>
              })}</div>}</section>
            </TabsContent>
            <TabsContent value="profile" className="min-h-0 overflow-y-auto p-4">
              {!detail || !profile ? <div className="space-y-3">{Array.from({ length: 4 }, (_, index) => <div key={index} className="h-20 animate-pulse rounded-lg bg-muted" />)}</div> : <div className="space-y-5">
                <div><h2 className="text-base font-semibold">性格配置</h2><p className="mt-1 text-sm text-muted-foreground">设置 {detail.pet.name} 与 {detail.student.name} 对话时的表达方式和行为边界。</p></div>
                <div className="grid gap-4 sm:grid-cols-2"><label className="space-y-1.5 text-sm"><span>表达语气</span><Input value={profile.tone} onChange={(event) => setProfile({ ...profile, tone: event.target.value })} /></label><label className="space-y-1.5 text-sm"><span>回复风格</span><Input value={profile.responseStyle} onChange={(event) => setProfile({ ...profile, responseStyle: event.target.value })} /></label></div>
                <label className="block space-y-2 text-sm"><span className="flex justify-between">主动程度 <strong>{profile.initiative}</strong></span><Slider value={[profile.initiative]} onValueChange={([value]) => setProfile({ ...profile, initiative: value })} /></label>
                <label className="block space-y-1.5 text-sm"><span>身份与行为约束</span><Textarea rows={6} value={profile.systemPrompt} onChange={(event) => setProfile({ ...profile, systemPrompt: event.target.value })} /></label>
                <label className="block space-y-1.5 text-sm"><span>知识范围</span><Input value={profile.knowledgeScope.join("、")} onChange={(event) => setProfile({ ...profile, knowledgeScope: event.target.value.split(/[、,，]/).map((item) => item.trim()).filter(Boolean) })} /><span className="block text-xs text-muted-foreground">使用顿号或逗号分隔多个知识范围。</span></label>
                <div className="flex items-center justify-between gap-4 border-t pt-4"><p className="text-xs text-muted-foreground">保存后用于下一次 Reachy 会话</p><Button onClick={saveProfile} disabled={saving}><Save />{saving ? "保存中" : "保存配置"}</Button></div>
              </div>}
            </TabsContent>
          </Tabs>
        </section>
      </section> : <ReachyDebugConsole onReturnToManagement={() => setWorkspaceMode("management")} />}
    </div>
  )
}
