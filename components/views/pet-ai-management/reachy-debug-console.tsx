"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { ArrowLeft, Cable, CircleAlert, RefreshCw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ReachyConnectionPanel } from "@/components/views/pet-ai-management/reachy-connection-panel"
import { ReachyReadyConsole } from "@/components/views/pet-ai-management/reachy-ready-console"
import {
  type ReachyDeviceCommand,
  type ReachyDevicePhase,
  type ReachyDeviceSnapshot,
} from "@/lib/pet-ai/reachy-device"
import { mergeReachyLogs } from "@/lib/pet-ai/reachy-ready-console-state"

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
    if (generation !== requestGenerationRef.current) return null
    if (!response.ok || !payload.data) {
      throw new Error(payload.message || "设备状态读取失败")
    }
    const merged = {
      ...payload.data,
      logs: mergeReachyLogs(
        snapshotRef.current?.logs ?? { cursor: 0, items: [] },
        payload.data.logs,
      ),
    }
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
        <ReachyReadyConsole
          snapshot={snapshot}
          commandPending={commandPending}
          commandError={commandError}
          runCommand={runCommand}
          onReturnToManagement={onReturnToManagement}
        />
      ) : null}
    </section>
  )
}
