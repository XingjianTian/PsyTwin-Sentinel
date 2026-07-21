"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { ArrowLeft, Bot, Cable, CircleAlert, RefreshCw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ReachyConnectionPanel } from "@/components/views/pet-ai-management/reachy-connection-panel"
import {
  getReachyPhasePresentation,
  type ReachyDeviceCommand,
  type ReachyDevicePhase,
  type ReachyDeviceSnapshot,
} from "@/lib/pet-ai/reachy-device"
import { cn } from "@/lib/utils"

const DEVICE_API_PATH = "/api/pet-ai/reachy/device"
const ACTIVE_POLL_INTERVAL_MS = 1_000
const IDLE_POLL_INTERVAL_MS = 3_000
const activePhases = new Set<ReachyDevicePhase>([
  "discovering",
  "starting",
  "connecting",
  "healthchecking",
  "loading_apps",
  "stopping",
])

type ApiPayload<T> = { data?: T; message?: string }

async function readPayload<T>(response: Response): Promise<ApiPayload<T>> {
  const text = await response.text()
  if (!text) return {}
  try {
    return JSON.parse(text) as ApiPayload<T>
  } catch {
    return {}
  }
}

function mergeSnapshotLogs(
  previous: ReachyDeviceSnapshot | null,
  next: ReachyDeviceSnapshot,
): ReachyDeviceSnapshot {
  if (!previous) return next
  const items = new Map(previous.logs.items.map((item) => [item.id, item]))
  for (const item of next.logs.items) items.set(item.id, item)
  return {
    ...next,
    logs: { cursor: next.logs.cursor, items: [...items.values()].slice(-200) },
  }
}

function ReadyConsoleShell({
  snapshot,
  commandPending,
  onReturnToManagement,
}: {
  snapshot: ReachyDeviceSnapshot
  commandPending: boolean
  onReturnToManagement: () => void
}) {
  const phase = getReachyPhasePresentation(snapshot.phase)
  return (
    <section className="mx-auto w-full max-w-5xl overflow-hidden rounded-xl border bg-card">
      <div className="flex flex-col gap-4 border-b px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-success/10 text-emerald-700">
            <Bot className="size-5" />
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base font-semibold">Reachy Mini Lite</h2>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-success/10 px-2 py-1 text-xs font-medium text-emerald-700">
                <span className="size-1.5 rounded-full bg-success" />{phase.label}
              </span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">设备连接稳定，可以继续进入日常心宠管理与会话联调。</p>
          </div>
        </div>
        <Button type="button" variant="outline" onClick={onReturnToManagement} disabled={commandPending}>
          <ArrowLeft />返回心宠管理
        </Button>
      </div>
      <dl className="grid divide-y sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        <div className="px-4 py-4 sm:px-5">
          <dt className="text-xs text-muted-foreground">连接方式</dt>
          <dd className="mt-1 text-sm font-medium">USB · {snapshot.serial_port || "已连接"}</dd>
        </div>
        <div className="px-4 py-4 sm:px-5">
          <dt className="text-xs text-muted-foreground">daemon</dt>
          <dd className="mt-1 text-sm font-medium">{snapshot.daemon_version || snapshot.daemon_state || "运行中"}</dd>
        </div>
        <div className="px-4 py-4 sm:px-5">
          <dt className="text-xs text-muted-foreground">ClawBody</dt>
          <dd className={cn("mt-1 text-sm font-medium", snapshot.clawbody_reachable ? "text-emerald-700" : "text-muted-foreground")}>
            {snapshot.clawbody_reachable ? "已连接" : "未连接，硬件调试仍可用"}
          </dd>
        </div>
      </dl>
    </section>
  )
}

function ConsoleLoadingState() {
  return (
    <section className="mx-auto w-full max-w-5xl rounded-xl border bg-card p-5" aria-label="正在读取设备状态">
      <div className="flex items-center gap-3">
        <Skeleton className="size-10 shrink-0" />
        <div className="w-full max-w-sm space-y-2">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-3 w-full" />
        </div>
      </div>
      <div className="mt-6 space-y-2">
        <Skeleton className="h-14 w-full" />
        <Skeleton className="h-14 w-full" />
        <Skeleton className="h-10 w-full sm:ml-auto sm:w-36" />
      </div>
      <p className="sr-only">正在读取设备状态</p>
    </section>
  )
}

function BridgeOfflineState({ message, onRetry }: { message: string; onRetry: () => void }) {
  const detail = message && message !== "心宠设备控制桥未运行"
    ? message
    : "无法读取 Windows 宿主机上的 Reachy 设备状态。请先确认 Host Bridge 已安装并处于运行状态。"
  return (
    <section className="mx-auto w-full max-w-3xl rounded-xl border bg-card px-5 py-10 text-center" role="alert">
      <span className="mx-auto flex size-11 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        <Cable className="size-5" />
      </span>
      <h2 className="mt-4 text-base font-semibold">心宠设备控制桥未运行</h2>
      <p className="mx-auto mt-2 max-w-[60ch] text-sm leading-6 text-muted-foreground">
        {detail}
      </p>
      <Button type="button" className="mt-5" onClick={onRetry}>
        <RefreshCw />重新连接
      </Button>
    </section>
  )
}

export function ReachyDebugConsole({ onReturnToManagement }: { onReturnToManagement: () => void }) {
  const [snapshot, setSnapshot] = useState<ReachyDeviceSnapshot | null>(null)
  const [pollError, setPollError] = useState("")
  const [commandError, setCommandError] = useState("")
  const [commandPending, setCommandPending] = useState(false)
  const snapshotRef = useRef<ReachyDeviceSnapshot | null>(null)
  const logCursorRef = useRef(0)
  const commandLockRef = useRef(false)
  const requestGenerationRef = useRef(0)

  const fetchSnapshot = useCallback(async () => {
    const generation = ++requestGenerationRef.current
    const response = await fetch(`${DEVICE_API_PATH}?after=${logCursorRef.current}`, { cache: "no-store" })
    const payload = await readPayload<ReachyDeviceSnapshot>(response)
    if (!response.ok || !payload.data) {
      throw new Error(payload.message || "设备状态读取失败")
    }
    if (generation !== requestGenerationRef.current) return null
    const merged = mergeSnapshotLogs(snapshotRef.current, payload.data)
    logCursorRef.current = merged.logs.cursor
    snapshotRef.current = merged
    setSnapshot(merged)
    setPollError("")
    return merged
  }, [])

  useEffect(() => {
    let cancelled = false
    let timer: ReturnType<typeof setTimeout> | undefined

    const poll = async () => {
      let phase = snapshotRef.current?.phase
      try {
        phase = (await fetchSnapshot())?.phase ?? snapshotRef.current?.phase
      } catch (error) {
        if (!cancelled) setPollError((error as Error).message)
      }
      if (cancelled) return
      const delay = phase && activePhases.has(phase)
        ? ACTIVE_POLL_INTERVAL_MS
        : IDLE_POLL_INTERVAL_MS
      timer = setTimeout(poll, delay)
    }

    void poll()
    return () => {
      cancelled = true
      if (timer) clearTimeout(timer)
    }
  }, [fetchSnapshot])

  const runCommand = useCallback(async (command: ReachyDeviceCommand) => {
    if (commandLockRef.current) return
    commandLockRef.current = true
    setCommandPending(true)
    setCommandError("")
    try {
      const response = await fetch(DEVICE_API_PATH, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(command),
      })
      const payload = await readPayload<unknown>(response)
      if (!response.ok) throw new Error(payload.message || "设备命令执行失败")
      await fetchSnapshot()
    } catch (error) {
      setCommandError((error as Error).message)
    } finally {
      commandLockRef.current = false
      setCommandPending(false)
    }
  }, [fetchSnapshot])

  const retryPoll = () => {
    setPollError("")
    void fetchSnapshot().catch((error) => setPollError((error as Error).message))
  }

  return (
    <section
      aria-labelledby="reachy-debug-heading"
      className="min-h-0 flex-1 overflow-y-auto rounded-xl bg-muted/35 p-3 sm:p-4"
    >
      <div className="mx-auto mb-4 flex w-full max-w-5xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 id="reachy-debug-heading" className="text-lg font-semibold">Reachy 设备调试</h2>
          <p className="mt-1 text-sm text-muted-foreground">发现、启动并检查本机连接的 Reachy Mini Lite。</p>
        </div>
        <Button type="button" variant="ghost" size="sm" onClick={onReturnToManagement}>
          <ArrowLeft />返回管理
        </Button>
      </div>

      {pollError && snapshot ? (
        <div className="mx-auto mb-3 flex w-full max-w-5xl items-start gap-2 rounded-lg bg-destructive/8 px-3 py-2.5 text-sm text-destructive" role="status">
          <CircleAlert className="mt-0.5 size-4 shrink-0" />
          <p className="min-w-0 flex-1">状态暂时未更新，继续显示最近一次成功结果：{pollError}</p>
          <Button type="button" variant="ghost" size="sm" className="h-7 text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={retryPoll}>
            重试
          </Button>
        </div>
      ) : null}

      {!snapshot && !pollError ? <ConsoleLoadingState /> : null}
      {!snapshot && pollError ? <BridgeOfflineState message={pollError} onRetry={retryPoll} /> : null}
      {snapshot && snapshot.phase !== "ready" ? (
        <ReachyConnectionPanel
          snapshot={snapshot}
          commandPending={commandPending}
          commandError={commandError}
          onDiscover={() => void runCommand({ action: "discover" })}
          onStart={(serialPort) => void runCommand({ action: "start", serialPort })}
          onRetry={(serialPort) => void runCommand({ action: "start", serialPort })}
        />
      ) : null}
      {snapshot?.phase === "ready" ? (
        <ReadyConsoleShell
          snapshot={snapshot}
          commandPending={commandPending}
          onReturnToManagement={onReturnToManagement}
        />
      ) : null}
    </section>
  )
}
