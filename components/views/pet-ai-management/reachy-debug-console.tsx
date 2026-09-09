"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Cable, CircleAlert, RefreshCw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ReachyConnectionPanel } from "@/components/views/pet-ai-management/reachy-connection-panel"
import { ReachyReadyConsole } from "@/components/views/pet-ai-management/reachy-ready-console"
import {
  type ReachyDeviceCommand,
  type ReachyDevicePhase,
  type ReachyDeviceSnapshot,
} from "@/lib/pet-ai/reachy-device"
import type { ReachyNetworkConnection } from "@/lib/pet-ai/reachy-network"
import { ReachyCommandQueue } from "@/lib/pet-ai/reachy-command-queue"
import {
  getReachyLifecycleWarningUpdate,
  type ReachyLifecycleWarning,
} from "@/lib/pet-ai/reachy-lifecycle-warning"
import { mergeReachyLogs, sanitizePetFacingDeviceSnapshot, toPetFacingText } from "@/lib/pet-ai/reachy-ready-console-state"

const DEVICE_API_PATH = "/api/pet-ai/reachy/device"
const NETWORK_API_PATH = "/api/pet-ai/reachy/network"
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
    : "无法读取 Windows 宿主机上的心宠设备状态。请先确认 Host Bridge 已安装并处于运行状态。"
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
  const [wifiPending, setWifiPending] = useState(false)
  const [wifiError, setWifiError] = useState("")
  const [wifiConnection, setWifiConnection] = useState<ReachyNetworkConnection | null>(null)
  const [lifecycleWarnings, setLifecycleWarnings] = useState<ReachyLifecycleWarning[]>([])
  const snapshotRef = useRef<ReachyDeviceSnapshot | null>(null)
  const logCursorRef = useRef(0)
  const requestGenerationRef = useRef(0)

  const fetchSnapshot = useCallback(async () => {
    const generation = ++requestGenerationRef.current
    const response = await fetch(`${DEVICE_API_PATH}?after=${logCursorRef.current}`, { cache: "no-store" })
    const payload = await readPayload<ReachyDeviceSnapshot>(response)
    if (generation !== requestGenerationRef.current) return null
    if (!response.ok || !payload.data) {
      throw new Error(toPetFacingText(payload.message || "设备状态读取失败"))
    }
    const safeSnapshot = sanitizePetFacingDeviceSnapshot(payload.data)
    const merged = {
      ...safeSnapshot,
      logs: mergeReachyLogs(
        snapshotRef.current?.logs ?? { cursor: 0, items: [] },
        safeSnapshot.logs,
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

  const executeCommand = useCallback(async (command: ReachyDeviceCommand) => {
    const response = await fetch(DEVICE_API_PATH, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(command),
    })
    const payload = await readPayload<unknown>(response)
    if (!response.ok) throw new Error(toPetFacingText(payload.message || "设备命令执行失败"))
    const warningUpdate = getReachyLifecycleWarningUpdate(command, payload.data)
    if (warningUpdate !== null) setLifecycleWarnings(warningUpdate)
    await fetchSnapshot()
  }, [fetchSnapshot])

  const commandQueueRef = useRef<ReachyCommandQueue | null>(null)
  useEffect(() => {
    commandQueueRef.current = new ReachyCommandQueue(executeCommand, setCommandPending)
    return () => {
      commandQueueRef.current = null
    }
  }, [executeCommand])

  const runCommand = useCallback(async (
    command: ReachyDeviceCommand,
    canExecute?: () => boolean,
  ) => {
    setCommandError("")
    const commandQueue = commandQueueRef.current
    if (!commandQueue) {
      setCommandError("设备命令队列尚未就绪，请稍后重试")
      return
    }
    try {
      const result = await commandQueue.enqueue(command, canExecute)
      if (result === "rejected") {
        setCommandError("已有设备命令正在执行，请稍后重试")
      }
    } catch (error) {
      setCommandError((error as Error).message)
    }
  }, [])

  const retryPoll = () => {
    setPollError("")
    void fetchSnapshot().catch((error) => setPollError((error as Error).message))
  }

  const connectWifi = useCallback(async (host: string, port: number) => {
    setWifiPending(true)
    setWifiError("")
    try {
      const response = await fetch(NETWORK_API_PATH, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ host, port }),
      })
      const payload = await readPayload<ReachyNetworkConnection>(response)
      if (!response.ok || !payload.data) throw new Error(payload.message || "Wi-Fi 连接失败")
      setWifiConnection(payload.data)
    } catch (error) {
      setWifiConnection(null)
      setWifiError((error as Error).message)
    } finally {
      setWifiPending(false)
    }
  }, [])

  return (
    <section
      aria-label="心宠设备调试"
      className="min-h-0 flex-1 overflow-y-auto rounded-xl bg-muted/35 p-3 sm:p-4"
    >
      {pollError && snapshot ? (
        <div className="mx-auto mb-3 flex w-full max-w-5xl items-start gap-2 rounded-lg bg-destructive/8 px-3 py-2.5 text-sm text-red-700" role="status">
          <CircleAlert className="mt-0.5 size-4 shrink-0" />
          <p className="min-w-0 flex-1">状态暂时未更新，继续显示最近一次成功结果：{pollError}</p>
          <Button type="button" variant="ghost" size="sm" className="h-7 text-red-700 hover:bg-destructive/10 hover:text-red-800" onClick={retryPoll}>
            重试
          </Button>
        </div>
      ) : null}

      {lifecycleWarnings.length > 0 ? (
        <div
          className="mx-auto mb-3 flex w-full max-w-5xl items-start gap-2 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2.5 text-sm text-amber-900"
          role="alert"
        >
          <CircleAlert className="mt-0.5 size-4 shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="font-medium">设备已停止，但会话清理需要确认</p>
            <ul className="mt-1 list-disc space-y-1 pl-5">
              {lifecycleWarnings.map((warning) => (
                <li key={warning.code}>{warning.message}</li>
              ))}
            </ul>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 text-amber-900 hover:bg-amber-100 hover:text-amber-950"
            aria-label="关闭设备停止警告"
            onClick={() => setLifecycleWarnings([])}
          >
            关闭
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
          wifiPending={wifiPending}
          wifiError={wifiError}
          wifiConnection={wifiConnection}
          onDiscover={() => void runCommand({ action: "discover" })}
          onConnectWifi={(host, port) => void connectWifi(host, port)}
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
