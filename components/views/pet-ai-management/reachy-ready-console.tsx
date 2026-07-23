"use client"

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react"
import {
  ArrowLeft,
  Check,
  CircleAlert,
  Copy,
  LoaderCircle,
  Mic,
  RotateCcw,
  SlidersHorizontal,
  Sparkles,
  Speaker,
  Volume2,
} from "lucide-react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Slider } from "@/components/ui/slider"
import {
  REACHY_DANCES,
  REACHY_EMOTIONS,
  type ReachyChoreographyItem,
} from "@/lib/pet-ai/reachy-choreographies"
import type {
  ReachyDeviceCommand,
  ReachyDeviceSnapshot,
} from "@/lib/pet-ai/reachy-device"
import {
  clampPose,
  clampVolume,
  isMotorControlAvailable,
  scheduleSafePoseCommand,
  type ReachyPose,
} from "@/lib/pet-ai/reachy-ready-console-state"
import { cn } from "@/lib/utils"

export const VOLUME_DEBOUNCE_MS = 250
export const POSE_THROTTLE_MS = 100

type RunCommand = (
  command: ReachyDeviceCommand,
  canExecute?: () => boolean,
) => void | Promise<void>

type ReachyReadyConsoleProps = {
  snapshot: ReachyDeviceSnapshot
  commandPending: boolean
  commandError: string
  runCommand: RunCommand
  onReturnToManagement: () => void
}

const neutralPose: ReachyPose = {
  headPitch: 0,
  headRoll: 0,
  headYaw: 0,
  bodyYaw: 0,
  leftAntenna: 0,
  rightAntenna: 0,
}

const poseControls: Array<{
  key: keyof ReachyPose
  label: string
  min: number
  max: number
  step: number
  unit: string
}> = [
  { key: "headPitch", label: "头部俯仰", min: -40, max: 40, step: 1, unit: "°" },
  { key: "headRoll", label: "头部侧倾", min: -40, max: 40, step: 1, unit: "°" },
  { key: "headYaw", label: "头部转向", min: -65, max: 65, step: 1, unit: "°" },
  { key: "bodyYaw", label: "身体转向", min: -180, max: 180, step: 1, unit: "°" },
  { key: "leftAntenna", label: "左天线", min: -3.1416, max: 3.1416, step: 0.1, unit: " rad" },
  { key: "rightAntenna", label: "右天线", min: -3.1416, max: 3.1416, step: 0.1, unit: " rad" },
]

function mediaPresentation(status: string) {
  if (status === "ready") return { label: "可用", healthy: true }
  if (status === "unavailable") return { label: "不可用", healthy: false }
  return { label: "状态未知", healthy: false }
}

function formatLogTime(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(date)
}

function StatusBadge({ healthy, children }: { healthy: boolean; children: React.ReactNode }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "gap-1.5 border-transparent",
        healthy
          ? "bg-success/10 text-emerald-700"
          : "bg-muted text-muted-foreground",
      )}
    >
      <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
      {children}
    </Badge>
  )
}

function ExpressionAndMotionCard({
  commandPending,
  motorControlsEnabled,
  runCommand,
}: {
  commandPending: boolean
  motorControlsEnabled: boolean
  runCommand: RunCommand
}) {
  const [library, setLibrary] = useState<"emotion" | "dance">("emotion")
  const [selected, setSelected] = useState<string | null>(null)
  const items = library === "emotion" ? REACHY_EMOTIONS : REACHY_DANCES

  const play = async (item: ReachyChoreographyItem) => {
    setSelected(item.name)
    try {
      await runCommand({ action: "choreography", kind: item.kind, move: item.name })
    } finally {
      setSelected(null)
    }
  }

  return (
    <Card className="flex h-full min-h-0 flex-col gap-3 overflow-hidden py-4 shadow-none">
      <CardHeader className="gap-3 px-4">
        <div>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Sparkles className="size-4 text-primary" aria-hidden="true" />表情与动作
          </CardTitle>
          <CardDescription className="mt-1">选择官方表情或舞蹈，由安全命令链路执行。</CardDescription>
        </div>
        <div className="grid grid-cols-2 rounded-lg bg-muted p-1" aria-label="表情与动作分类">
          {(["emotion", "dance"] as const).map((value) => (
            <Button
              key={value}
              type="button"
              size="sm"
              variant="ghost"
              className={cn("h-8", library === value && "bg-background text-foreground shadow-sm hover:bg-background")}
              aria-pressed={library === value}
              onClick={() => setLibrary(value)}
            >
              {value === "emotion" ? `表情 ${REACHY_EMOTIONS.length}` : `舞蹈 ${REACHY_DANCES.length}`}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="flex min-h-0 flex-1 flex-col overflow-hidden px-4">
        <ScrollArea className="h-0 min-h-60 flex-1 pr-3" aria-label={`${library === "emotion" ? "表情" : "舞蹈"}动作列表`}>
          <div className="grid grid-cols-3 gap-2 pb-1 sm:grid-cols-4">
            {items.map((item) => (
              <Button
                key={`${item.kind}:${item.name}`}
                type="button"
                variant="outline"
                className="h-auto min-h-16 flex-col gap-1 px-2 py-2 text-center"
                title={item.name}
                disabled={!motorControlsEnabled || commandPending}
                onClick={() => void play(item)}
              >
                {selected === item.name && commandPending ? (
                  <LoaderCircle className="size-5 animate-spin motion-reduce:animate-none" aria-hidden="true" />
                ) : (
                  <span className="text-xl leading-none" aria-hidden="true">{item.emoji}</span>
                )}
                <span className="w-full truncate text-[11px] font-medium">{item.label}</span>
              </Button>
            ))}
          </div>
        </ScrollArea>
        {!motorControlsEnabled ? (
          <p className="text-xs leading-5 text-muted-foreground">电机未启用，表情和舞蹈已安全禁用。</p>
        ) : null}
      </CardContent>
    </Card>
  )
}

export function ReachyReadyConsole({
  snapshot,
  commandPending,
  commandError,
  runCommand,
  onReturnToManagement,
}: ReachyReadyConsoleProps) {
  const [pose, setPose] = useState<ReachyPose>(neutralPose)
  const [speakerVolume, setSpeakerVolume] = useState(snapshot.media.output_volume ?? 50)
  const [microphoneVolume, setMicrophoneVolume] = useState(snapshot.media.input_volume ?? 50)
  const [copied, setCopied] = useState(false)
  const poseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const speakerTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const microphoneTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const snapshotRef = useRef(snapshot)
  const logAreaRef = useRef<HTMLDivElement>(null)
  const nearBottomRef = useRef(true)
  const motorControlsEnabled = isMotorControlAvailable(snapshot.phase, snapshot.motor_mode)
  const microphone = mediaPresentation(snapshot.media.microphone)
  const speaker = mediaPresentation(snapshot.media.speaker)
  const sessionRunning = snapshot.session.running === true

  useLayoutEffect(() => {
    snapshotRef.current = snapshot
  }, [snapshot])

  useEffect(() => () => {
    if (poseTimerRef.current) clearTimeout(poseTimerRef.current)
    if (speakerTimerRef.current) clearTimeout(speakerTimerRef.current)
    if (microphoneTimerRef.current) clearTimeout(microphoneTimerRef.current)
  }, [])

  useEffect(() => {
    const viewport = logAreaRef.current?.querySelector<HTMLElement>(
      '[data-slot="scroll-area-viewport"]',
    )
    if (!viewport) return
    const updateNearBottom = () => {
      nearBottomRef.current = viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight < 48
    }
    viewport.addEventListener("scroll", updateNearBottom, { passive: true })
    return () => viewport.removeEventListener("scroll", updateNearBottom)
  }, [])

  useEffect(() => {
    if (!nearBottomRef.current) return
    const viewport = logAreaRef.current?.querySelector<HTMLElement>(
      '[data-slot="scroll-area-viewport"]',
    )
    if (viewport) viewport.scrollTop = viewport.scrollHeight
  }, [snapshot.logs.items])

  const queueVolume = useCallback((target: "speaker" | "microphone", value: number) => {
    const volume = clampVolume(value)
    const timerRef = target === "speaker" ? speakerTimerRef : microphoneTimerRef
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      void runCommand({ action: "volume", target, volume })
    }, VOLUME_DEBOUNCE_MS)
  }, [runCommand])

  const queuePose = useCallback((nextPose: ReachyPose) => {
    const clamped = clampPose(nextPose)
    setPose(clamped)
    if (poseTimerRef.current) clearTimeout(poseTimerRef.current)
    poseTimerRef.current = scheduleSafePoseCommand(
      clamped,
      () => snapshotRef.current,
      runCommand,
      POSE_THROTTLE_MS,
    )
  }, [runCommand])

  const performDeviceAction = (deviceAction: Extract<ReachyDeviceCommand, { action: "device_action" }>["deviceAction"]) => {
    void runCommand({ action: "device_action", deviceAction })
  }

  const copyLogs = async () => {
    const text = snapshot.logs.items
      .map((entry) => `${entry.created_at} [${entry.level.toUpperCase()}] ${entry.message}`)
      .join("\n")
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2_000)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-3">
      <Card className="gap-0 overflow-hidden py-0 shadow-none">
        <div className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-success/10 text-emerald-700">
              <Check className="size-4.5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base font-semibold">实体心宠</h3>
                <StatusBadge healthy>Ready</StatusBadge>
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">设备已通过启动、连接与健康检查。</p>
            </div>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                type="button"
                variant="destructive"
                data-action="reachy-power-off"
                className="bg-red-700 text-white hover:bg-red-800 focus-visible:border-red-800 focus-visible:ring-red-800 focus-visible:ring-offset-2"
                disabled={commandPending}
              >
                {commandPending ? (
                  <LoaderCircle className="animate-spin motion-reduce:animate-none" aria-hidden="true" />
                ) : null}
                关机
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>确认关闭心宠设备？</AlertDialogTitle>
                <AlertDialogDescription>
                  {sessionRunning
                    ? "检测到当前学生会话，学生对话将先停止，随后机器人休眠并关闭 daemon。"
                    : "机器人将先进入安全休眠，然后关闭 daemon。需要再次启动才能继续调试。"}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>取消</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-red-700 text-white hover:bg-red-800 focus-visible:border-red-800 focus-visible:ring-red-800 focus-visible:ring-offset-2"
                  onClick={() => void runCommand({ action: "stop" })}
                >
                  确认关机
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
        <dl className="grid grid-cols-2 divide-x divide-y border-t sm:grid-cols-4 sm:divide-y-0">
          <div className="px-4 py-2.5">
            <dt className="text-xs text-muted-foreground">连接</dt>
            <dd className="mt-1 text-sm font-medium">USB · {snapshot.serial_port || "已连接"}</dd>
          </div>
          <div className="px-4 py-2.5">
            <dt className="text-xs text-muted-foreground">daemon</dt>
            <dd className="mt-1 text-sm font-medium">
              {snapshot.daemon_version || snapshot.daemon_state || "运行中"}
            </dd>
          </div>
          <div className="px-4 py-2.5">
            <dt className="text-xs text-muted-foreground">电机</dt>
            <dd className={cn("mt-1 text-sm font-medium", motorControlsEnabled ? "text-emerald-700" : "text-red-700")}>
              {snapshot.motor_mode || "未知"}
            </dd>
          </div>
          <div className="px-4 py-2.5">
            <dt className="text-xs text-muted-foreground">ClawBody</dt>
            <dd className={cn("mt-1 text-sm font-medium", snapshot.clawbody_reachable ? "text-emerald-700" : "text-muted-foreground")}>
              {snapshot.clawbody_reachable ? "已连接" : "未连接"}
            </dd>
          </div>
        </dl>
      </Card>

      {commandError ? (
        <div className="flex items-start gap-2 rounded-lg bg-destructive/8 px-3 py-2.5 text-sm text-red-700" role="alert">
          <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>{commandError}</span>
        </div>
      ) : null}
      <p className="sr-only" aria-live="polite">
        {commandPending ? "正在执行设备命令" : copied ? "日志已复制" : "设备控制台就绪"}
      </p>

      <div
        data-layout="reachy-compact-console"
        className="grid items-stretch gap-3 lg:grid-cols-[minmax(0,1.15fr)_minmax(22rem,0.85fr)] lg:grid-rows-[auto_auto]"
      >
        <div className="min-w-0 overflow-hidden lg:row-span-2 lg:h-full lg:[contain:size]">
          <ExpressionAndMotionCard
            commandPending={commandPending}
            motorControlsEnabled={motorControlsEnabled}
            runCommand={runCommand}
          />
        </div>

          <Card className="min-w-0 gap-3 py-4 shadow-none">
            <CardHeader className="gap-1 px-4">
              <CardTitle className="flex items-center gap-2 text-sm">
                <SlidersHorizontal className="size-4 text-primary" aria-hidden="true" />机器人控制器
              </CardTitle>
              <CardDescription>拖动后按 Host Bridge 安全范围发送姿态。</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-x-5 gap-y-3 px-4 sm:grid-cols-2">
              {poseControls.map((control) => (
                <div key={control.key} className="space-y-2">
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <label htmlFor={`reachy-${control.key}`} className="font-medium">{control.label}</label>
                    <output className="font-mono text-muted-foreground">
                      {pose[control.key].toFixed(control.step < 1 ? 1 : 0)}{control.unit}
                    </output>
                  </div>
                  <Slider
                    id={`reachy-${control.key}`}
                    aria-label={control.label}
                    min={control.min}
                    max={control.max}
                    step={control.step}
                    value={[pose[control.key]]}
                    disabled={!motorControlsEnabled || commandPending}
                    onValueChange={([value]) => queuePose({ ...pose, [control.key]: value })}
                  />
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                className="sm:col-span-2"
                disabled={!motorControlsEnabled || commandPending}
                onClick={() => queuePose(neutralPose)}
              >
                <RotateCcw aria-hidden="true" />重置控制器
              </Button>
            </CardContent>
          </Card>

          <Card
            data-layout="reachy-audio-and-live-link"
            className="min-w-0 gap-0 overflow-hidden py-0 shadow-none"
          >
            <CardContent className="space-y-3 px-4 py-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <p className="flex items-center gap-2 text-sm font-medium">
                    <Speaker className="size-4 text-primary" aria-hidden="true" />扬声器
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <StatusBadge healthy={speaker.healthy}>{speaker.label}</StatusBadge>
                    <span className="w-9 text-right tabular-nums">{speakerVolume}%</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Slider
                    aria-label="扬声器音量"
                    value={[speakerVolume]}
                    min={0}
                    max={100}
                    step={1}
                    disabled={!speaker.healthy || commandPending}
                    onValueChange={([value]) => {
                      const next = clampVolume(value)
                      setSpeakerVolume(next)
                      queueVolume("speaker", next)
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="shrink-0"
                    disabled={!speaker.healthy || commandPending}
                    onClick={() => performDeviceAction("test_sound")}
                  >
                    <Volume2 aria-hidden="true" />测试
                  </Button>
                </div>
              </div>

              <div className="space-y-2 border-t pt-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="flex items-center gap-2 text-sm font-medium">
                    <Mic className="size-4 text-primary" aria-hidden="true" />麦克风
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <StatusBadge healthy={microphone.healthy}>{microphone.label}</StatusBadge>
                    <span className="w-9 text-right tabular-nums">{microphoneVolume}%</span>
                  </div>
                </div>
                <Slider
                  aria-label="麦克风音量"
                  value={[microphoneVolume]}
                  min={0}
                  max={100}
                  step={1}
                  disabled={!microphone.healthy || commandPending}
                  onValueChange={([value]) => {
                    const next = clampVolume(value)
                    setMicrophoneVolume(next)
                    queueVolume("microphone", next)
                  }}
                />
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={onReturnToManagement}
              >
                <ArrowLeft aria-hidden="true" />返回实时联调
              </Button>
            </CardContent>
          </Card>
      </div>

      <Card className="gap-0 overflow-hidden py-0 shadow-none">
        <div className="flex flex-col gap-2 border-b px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-sm font-semibold">实时日志</h3>
            <p className="mt-1 text-xs text-muted-foreground">最多保留最近 300 条，离开底部时不会抢夺滚动位置。</p>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={copyLogs} disabled={!snapshot.logs.items.length}>
            {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
            {copied ? "已复制" : "复制日志"}
          </Button>
        </div>
        <ScrollArea ref={logAreaRef} className="h-44 bg-muted/35" aria-label="心宠实时日志">
          <ol className="min-w-max divide-y px-4 font-mono text-xs" role="log" aria-live="off">
            {snapshot.logs.items.length ? snapshot.logs.items.map((entry) => (
              <li key={entry.id} className="grid grid-cols-[5rem_4.5rem_minmax(20rem,1fr)] gap-2 py-2.5">
                <time className="text-muted-foreground" dateTime={entry.created_at}>{formatLogTime(entry.created_at)}</time>
                <span className={cn(
                  "font-semibold uppercase",
                  entry.level === "error" && "text-red-700",
                  entry.level === "warning" && "text-amber-700",
                  entry.level === "info" && "text-primary",
                  entry.level === "debug" && "text-muted-foreground",
                )}>{entry.level}</span>
                <span className="whitespace-pre-wrap break-words text-foreground">{entry.message}</span>
              </li>
            )) : (
              <li className="py-10 text-center font-sans text-sm text-muted-foreground">等待设备日志…</li>
            )}
          </ol>
        </ScrollArea>
      </Card>

    </div>
  )
}
