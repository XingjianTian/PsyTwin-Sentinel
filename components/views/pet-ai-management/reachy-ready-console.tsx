"use client"

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react"
import {
  ArrowLeft,
  Bot,
  Cable,
  Check,
  CircleAlert,
  Copy,
  Crosshair,
  LoaderCircle,
  Mic,
  Moon,
  Radio,
  RefreshCw,
  RotateCcw,
  SlidersHorizontal,
  Sparkles,
  Speaker,
  Sun,
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
import type {
  ReachyDeviceCommand,
  ReachyDeviceSnapshot,
} from "@/lib/pet-ai/reachy-device"
import {
  clampPose,
  clampVolume,
  isDeviceActionAvailable,
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

function RobotStage({ snapshot }: { snapshot: ReachyDeviceSnapshot }) {
  return (
    <Card className="gap-0 overflow-hidden py-0 shadow-none">
      <div className="flex items-center gap-3 bg-primary/7 px-4 py-3.5">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl border border-primary/15 bg-white/90 text-primary shadow-sm">
            <Bot className="size-7" strokeWidth={1.5} aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">Reachy Mini Lite</p>
            <p className="mt-0.5 text-xs text-muted-foreground">设备连接概览</p>
          </div>
        </div>
      </div>
      <dl className="grid grid-cols-2 divide-x border-t bg-card">
        <div className="px-4 py-2.5">
          <dt className="text-xs text-muted-foreground">USB 连接</dt>
          <dd className="mt-0.5 flex items-center gap-1.5 text-sm font-medium">
            <Cable className="size-3.5 text-primary" aria-hidden="true" />
            {snapshot.serial_port || "已连接"}
          </dd>
        </div>
        <div className="px-4 py-2.5">
          <dt className="text-xs text-muted-foreground">电机模式</dt>
          <dd className="mt-0.5 text-sm font-medium">{snapshot.motor_mode || "未知"}</dd>
        </div>
      </dl>
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
                <h3 className="text-base font-semibold">Reachy Mini Lite</h3>
                <StatusBadge healthy>Ready</StatusBadge>
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">设备已通过启动、连接与健康检查。</p>
            </div>
          </div>
          <Button type="button" variant="outline" onClick={onReturnToManagement}>
            <ArrowLeft aria-hidden="true" />返回心宠管理
          </Button>
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
        className="grid items-start gap-3 lg:grid-cols-2"
      >
        <div className="space-y-3">
          <RobotStage snapshot={snapshot} />
          <Card
            data-layout="reachy-audio-and-live-link"
            className="gap-0 overflow-hidden py-0 shadow-none"
          >
            <CardHeader className="gap-1 border-b px-4 py-3">
              <CardTitle className="text-sm">音频与联调</CardTitle>
              <CardDescription>调整本机音频，或返回学生会话联调。</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 px-4 py-3">
              <div className="grid gap-2 sm:grid-cols-[7rem_minmax(0,1fr)_auto] sm:items-center">
                <div className="flex items-center justify-between gap-2 sm:block">
                  <p className="flex items-center gap-2 text-sm font-medium">
                    <Speaker className="size-4 text-primary" aria-hidden="true" />扬声器
                  </p>
                  <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                    <StatusBadge healthy={speaker.healthy}>{speaker.label}</StatusBadge>
                    <span>{speakerVolume}%</span>
                  </div>
                </div>
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
                  disabled={!speaker.healthy || commandPending}
                  onClick={() => performDeviceAction("test_sound")}
                >
                  <Volume2 aria-hidden="true" />测试声音
                </Button>
              </div>

              <div className="grid gap-2 border-t pt-3 sm:grid-cols-[7rem_minmax(0,1fr)] sm:items-center">
                <div className="flex items-center justify-between gap-2 sm:block">
                  <p className="flex items-center gap-2 text-sm font-medium">
                    <Mic className="size-4 text-primary" aria-hidden="true" />麦克风
                  </p>
                  <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                    <StatusBadge healthy={microphone.healthy}>{microphone.label}</StatusBadge>
                    <span>{microphoneVolume}%</span>
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

        <div className="space-y-3">
          <Card className="gap-3 py-4 shadow-none">
            <CardHeader className="gap-1 px-4">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Sparkles className="size-4 text-primary" aria-hidden="true" />表情与动作
              </CardTitle>
              <CardDescription>所有动作均通过 Sentinel 安全命令执行。</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-2 px-4">
              {[
                { label: "唤醒", action: "wake_up" as const, icon: Sun },
                { label: "休眠", action: "goto_sleep" as const, icon: Moon },
                { label: "头部归中", action: "center" as const, icon: Crosshair },
                { label: "天线测试", action: "antenna_test" as const, icon: Radio },
              ].map(({ label, action, icon: Icon }) => {
                const actionAvailable = isDeviceActionAvailable(
                  action,
                  snapshot.phase,
                  snapshot.motor_mode,
                )
                return (
                  <Button
                    key={action}
                    type="button"
                    variant="outline"
                    className="justify-start"
                    disabled={!actionAvailable || commandPending}
                    onClick={() => performDeviceAction(action)}
                  >
                    <Icon aria-hidden="true" />{label}
                  </Button>
                )
              })}
              {!motorControlsEnabled ? (
                <p className="col-span-2 mt-1 text-xs leading-5 text-muted-foreground">
                  电机未启用，仅保留唤醒；其余动作和姿态控制已安全禁用。
                </p>
              ) : null}
            </CardContent>
          </Card>

          <Card className="gap-3 py-4 shadow-none">
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
        </div>
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
        <ScrollArea ref={logAreaRef} className="h-44 bg-muted/35" aria-label="Reachy 实时日志">
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

      <Card className="gap-3 py-4 shadow-none">
        <CardHeader className="gap-1 px-4">
          <CardTitle className="text-sm">设备生命周期</CardTitle>
          <CardDescription>重启会短暂中断连接；停止设备会关闭 daemon。</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 px-4 sm:flex-row">
          <Button
            type="button"
            variant="outline"
            className="sm:flex-1"
            disabled={commandPending}
            onClick={() => void runCommand({ action: "restart" })}
          >
            {commandPending ? <LoaderCircle className="animate-spin motion-reduce:animate-none" aria-hidden="true" /> : <RefreshCw aria-hidden="true" />}
            重启服务
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                type="button"
                variant="destructive"
                className="bg-red-700 text-white hover:bg-red-800 focus-visible:border-red-800 focus-visible:ring-red-800 focus-visible:ring-offset-2 sm:flex-1"
                disabled={commandPending}
              >
                停止设备
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>确认停止 Reachy 设备？</AlertDialogTitle>
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
                  确认停止设备
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  )
}
