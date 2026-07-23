"use client"

import { useState } from "react"
import {
  Cable,
  Check,
  CircleAlert,
  CircleDot,
  Copy,
  Cpu,
  LoaderCircle,
  RefreshCw,
  RotateCcw,
  Wifi,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  getReachyPhasePresentation,
  type ReachyDevicePhase,
  type ReachyDeviceSnapshot,
} from "@/lib/pet-ai/reachy-device"
import { cn } from "@/lib/utils"

type ConnectionStageId = "starting" | "connecting" | "healthchecking" | "loading_apps"
type ConnectionStageState = "pending" | "running" | "success" | "error"

const connectionStages: Array<{ id: ConnectionStageId; label: string; detail: string }> = [
  { id: "starting", label: "启动", detail: "启动 daemon" },
  { id: "connecting", label: "连接", detail: "连接机器人" },
  { id: "healthchecking", label: "健康检查", detail: "检查电机与媒体" },
  { id: "loading_apps", label: "应用", detail: "加载 ClawBody" },
]

const startupPhases = new Set<ReachyDevicePhase>([
  "discovering",
  "starting",
  "connecting",
  "healthchecking",
  "loading_apps",
])

function getConnectionStageState(
  stage: ConnectionStageId,
  snapshot: ReachyDeviceSnapshot,
): ConnectionStageState {
  const stageIndex = connectionStages.findIndex((item) => item.id === stage)
  const rawPhase = snapshot.phase === "error" ? snapshot.error?.phase : snapshot.phase
  const currentPhase = rawPhase === "discovering" ? "starting" : rawPhase
  const currentIndex = connectionStages.findIndex((item) => item.id === currentPhase)

  if (snapshot.phase === "ready") return "success"
  if (snapshot.phase === "error" && currentIndex === stageIndex) return "error"
  if (currentIndex === stageIndex) return "running"
  if (currentIndex > stageIndex) return "success"
  return "pending"
}

type ReachyConnectionPanelProps = {
  snapshot: ReachyDeviceSnapshot
  commandPending: boolean
  commandError: string
  onDiscover: () => void
  onRetry: (serialPort?: string) => void
  onStart: (serialPort: string) => void
}

export function ReachyConnectionPanel({
  snapshot,
  commandPending,
  commandError,
  onDiscover,
  onRetry,
  onStart,
}: ReachyConnectionPanelProps) {
  const [selectedPortChoice, setSelectedPortChoice] = useState("")
  const [copied, setCopied] = useState(false)
  const selectedPort = (snapshot.devices.some((device) => device.port === selectedPortChoice) ? selectedPortChoice : "")
    || (snapshot.devices.some((device) => device.port === snapshot.serial_port) ? snapshot.serial_port : "")
    || (snapshot.devices.length === 1 ? snapshot.devices[0].port : "")
  const phasePresentation = getReachyPhasePresentation(snapshot.phase)
  const isStarting = startupPhases.has(snapshot.phase)
  const errorPhase = snapshot.error?.phase
  const showStartupProgress = isStarting
    || (snapshot.phase === "error" && !!errorPhase && startupPhases.has(errorPhase))
  const lifecycleBusy = isStarting
    || snapshot.phase === "discovering"
    || snapshot.phase === "stopping"

  const copyDiagnostics = async () => {
    if (!snapshot.error) return
    const diagnostic = [
      `phase=${snapshot.error.phase}`,
      `code=${snapshot.error.code}`,
      `message=${snapshot.error.message}`,
      snapshot.error.detail ? `detail=${snapshot.error.detail}` : "",
      `serial_port=${selectedPort || snapshot.serial_port || "unknown"}`,
    ].filter(Boolean).join("\n")

    try {
      await navigator.clipboard.writeText(diagnostic)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2_000)
    } catch {
      setCopied(false)
    }
  }

  return (
    <section className="mx-auto w-full max-w-5xl overflow-hidden rounded-xl border bg-card">
      <div className="flex flex-col gap-4 border-b px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-base font-semibold">连接实体心宠</h2>
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-medium",
                phasePresentation.tone === "danger" && "bg-destructive/10 text-red-700",
                phasePresentation.tone === "progress" && "bg-primary/10 text-primary",
                phasePresentation.tone === "success" && "bg-success/10 text-emerald-700",
                phasePresentation.tone === "neutral" && "bg-muted text-muted-foreground",
              )}
            >
              <span
                className={cn(
                  "size-1.5 rounded-full bg-current",
                  phasePresentation.tone === "progress" && "animate-pulse motion-reduce:animate-none",
                )}
              />
              {phasePresentation.label}
            </span>
          </div>
          <p className="mt-1 max-w-[65ch] text-sm leading-6 text-muted-foreground">
            选择 Windows 已识别的 USB 串口，Sentinel 将依次启动 daemon、连接机器人并完成健康检查。
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onDiscover}
          disabled={commandPending || lifecycleBusy}
        >
          <RefreshCw className={cn(commandPending && "animate-spin motion-reduce:animate-none")} />
          重新扫描
        </Button>
      </div>

      {showStartupProgress && (
        <ol aria-label="设备启动进度" className="grid gap-px border-b bg-border sm:grid-cols-4">
          {connectionStages.map((stage) => {
            const state = getConnectionStageState(stage.id, snapshot)
            return (
              <li
                key={stage.id}
                aria-current={state === "running" || state === "error" ? "step" : undefined}
                className="flex min-w-0 items-center gap-3 bg-card px-4 py-3"
              >
                <span
                  className={cn(
                    "flex size-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold",
                    state === "pending" && "border-border text-muted-foreground",
                    state === "running" && "border-primary bg-primary/10 text-primary",
                    state === "success" && "border-success/30 bg-success/10 text-emerald-700",
                    state === "error" && "border-destructive/30 bg-destructive/10 text-red-700",
                  )}
                >
                  {state === "success" ? <Check className="size-3.5" /> : null}
                  {state === "running" ? (
                    <LoaderCircle className="size-3.5 animate-spin motion-reduce:animate-none" />
                  ) : null}
                  {state === "error" ? <CircleAlert className="size-3.5" /> : null}
                  {state === "pending" ? <CircleDot className="size-3" /> : null}
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-medium">{stage.label}</span>
                  <span className="block truncate text-xs text-muted-foreground">{stage.detail}</span>
                </span>
              </li>
            )
          })}
        </ol>
      )}

      <div className="p-4 sm:p-5">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h3 className="text-sm font-semibold">可用连接</h3>
          <span className="text-xs text-muted-foreground">
            {snapshot.devices.length > 0 ? `检测到 ${snapshot.devices.length} 个 USB 设备` : "未检测到 USB 设备"}
          </span>
        </div>

        <div className="overflow-hidden rounded-lg border" role="group" aria-label="心宠连接方式">
          {snapshot.devices.map((device) => {
            const selected = selectedPort === device.port
            return (
              <button
                key={device.port}
                type="button"
                aria-pressed={selected}
                onClick={() => setSelectedPortChoice(device.port)}
                disabled={commandPending || lifecycleBusy}
                className={cn(
                  "flex w-full items-center gap-3 border-b px-3 py-3 text-left outline-none last:border-b-0 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring sm:px-4",
                  selected ? "bg-primary/8" : "bg-card hover:bg-muted/60",
                  "disabled:cursor-not-allowed disabled:opacity-60",
                )}
              >
                <span className={cn(
                  "flex size-9 shrink-0 items-center justify-center rounded-md",
                  selected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
                )}>
                  <Cable className="size-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">{device.label}</span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">
                    USB 串口 · {device.port}
                  </span>
                </span>
                <span className={cn(
                  "size-4 shrink-0 rounded-full border-2",
                  selected ? "border-primary bg-primary ring-2 ring-primary/20 ring-offset-2" : "border-muted-foreground/40",
                )} />
              </button>
            )
          })}

          {snapshot.devices.length === 0 && (
            <div className="border-b bg-muted/30 px-4 py-5">
              <div className="flex items-start gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                  <Cable className="size-4" />
                </span>
                <div>
                  <p className="text-sm font-medium">没有找到 USB 心宠设备</p>
                  <p className="mt-1 max-w-[65ch] text-xs leading-5 text-muted-foreground">
                    请检查机器人电源、USB 数据线和 Windows 串口驱动，并在设备管理器中确认 COM 端口已出现。
                  </p>
                </div>
              </div>
            </div>
          )}

          <button
            type="button"
            disabled
            aria-label="Wi-Fi 连接，首版暂不可用"
            className="flex w-full cursor-not-allowed items-center gap-3 border-b bg-muted/30 px-3 py-3 text-left opacity-65 sm:px-4"
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
              <Wifi className="size-4" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-medium">Wi-Fi</span>
              <span className="mt-0.5 block text-xs text-muted-foreground">首版暂不可用</span>
            </span>
          </button>
          <button
            type="button"
            disabled
            aria-label="模拟器连接，首版暂不可用"
            className="flex w-full cursor-not-allowed items-center gap-3 bg-muted/30 px-3 py-3 text-left opacity-65 sm:px-4"
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
              <Cpu className="size-4" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-medium">模拟器</span>
              <span className="mt-0.5 block text-xs text-muted-foreground">首版暂不可用</span>
            </span>
          </button>
        </div>

        {snapshot.phase === "error" && snapshot.error ? (
          <div className="mt-4 rounded-lg bg-destructive/8 px-4 py-3 text-red-700" role="alert">
            <div className="flex items-start gap-3">
              <CircleAlert className="mt-0.5 size-4 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{snapshot.error.message}</p>
                <p className="mt-1 text-xs leading-5 text-red-700">
                  {snapshot.error.detail || `诊断代码：${snapshot.error.code}`}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => onRetry(selectedPort || snapshot.serial_port || undefined)}
                    disabled={commandPending}
                  >
                    <RotateCcw />重试
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={copyDiagnostics}
                  >
                    <Copy />复制诊断信息
                  </Button>
                  <span className="self-center text-xs" role="status" aria-live="polite">
                    {copied ? "已复制" : ""}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {commandError
          && commandError !== snapshot.error?.message
          && commandError !== snapshot.error?.detail ? (
          <p className="mt-3 text-sm text-red-700" role="alert">{commandError}</p>
        ) : null}

        <div className="mt-5 flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            {selectedPort ? `已选择串口：${selectedPort}` : "请选择一个已检测到的 USB 串口"}
          </p>
          <Button
            type="button"
            onClick={() => selectedPort && onStart(selectedPort)}
            disabled={!selectedPort || commandPending || lifecycleBusy || snapshot.phase === "error"}
            className="w-full sm:w-auto"
          >
            {isStarting || commandPending ? (
              <LoaderCircle className="animate-spin motion-reduce:animate-none" />
            ) : (
              <Cable />
            )}
            {isStarting ? "正在启动设备" : "启动设备"}
          </Button>
        </div>
      </div>
    </section>
  )
}
