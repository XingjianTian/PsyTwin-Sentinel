import "server-only"

const hostBridgeUrl = () => (process.env.HOST_BRIDGE_URL || "http://127.0.0.1:7861").replace(/\/$/, "")

const hostBridgePaths = [
  "/v1/device/status",
  "/v1/device/discover",
  "/v1/device/logs",
  "/v1/device/start",
  "/v1/device/stop",
  "/v1/device/restart",
  "/v1/device/action",
  "/v1/device/processing",
  "/v1/device/choreography",
  "/v1/device/pose",
  "/v1/device/volume",
] as const

export type HostBridgePath = (typeof hostBridgePaths)[number] | `/v1/device/logs?after=${number}`

export type HostBridgeRequestInit = Omit<RequestInit, "signal"> & {
  longRunning?: boolean
}

export class HostBridgeUnavailableError extends Error {
  constructor(message = "心宠设备控制桥暂不可用") {
    super(message)
    this.name = "HostBridgeUnavailableError"
  }
}

function isHostBridgePath(path: string): path is HostBridgePath {
  return (
    hostBridgePaths.some((allowedPath) => allowedPath === path) ||
    (path.startsWith("/v1/device/logs?after=") && /^\/v1\/device\/logs\?after=\d+$/.test(path))
  )
}

function isTransportOrAbortFailure(error: unknown) {
  return error instanceof TypeError || (error instanceof Error && error.name === "AbortError")
}

export async function requestHostBridge<T>(path: HostBridgePath, init?: HostBridgeRequestInit): Promise<T> {
  if (!isHostBridgePath(path)) throw new Error("Unsupported Host Bridge path")

  const controller = new AbortController()
  const { longRunning = false, ...requestInit } = init ?? {}
  const timeout = setTimeout(() => controller.abort(), longRunning ? 60_000 : 10_000)

  try {
    const response = await fetch(`${hostBridgeUrl()}${path}`, {
      ...requestInit,
      cache: "no-store",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...requestInit.headers,
        "X-Host-Bridge-Key": process.env.HOST_BRIDGE_API_KEY || "",
      },
    })
    const payload = await response.json().catch(() => ({}))

    if (!response.ok) {
      const error = new Error(payload.detail || payload.message || "心宠设备控制桥请求失败")
      ;(error as Error & { status?: number }).status = response.status
      throw error
    }

    return payload as T
  } catch (error) {
    if ((error as Error & { status?: number }).status) throw error
    if (isTransportOrAbortFailure(error)) throw new HostBridgeUnavailableError()
    throw error
  } finally {
    clearTimeout(timeout)
  }
}

export function isHostBridgeUnavailable(error: unknown) {
  return error instanceof HostBridgeUnavailableError
}
