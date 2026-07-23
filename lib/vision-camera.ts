"use client"

export type VisionCameraSourceKind = "local-browser" | "reachy-mini"

export interface VisionCameraStartOptions {
  deviceId?: string
}

export interface VisionCameraDevice {
  deviceId: string
  label: string
}

export interface VisionCameraAdapter {
  id: string
  label: string
  kind: VisionCameraSourceKind
  start: (options?: VisionCameraStartOptions) => Promise<MediaStream>
  stop: (stream: MediaStream) => void
  listDevices?: () => Promise<VisionCameraDevice[]>
}

export interface ReachyMiniCameraSession {
  stream: MediaStream
  deviceLabel: string
  stop: () => void
}

export interface ReachyMiniCameraAdapter {
  id: string
  label: string
  kind: "reachy-mini"
  start: () => Promise<ReachyMiniCameraSession>
  stop: (stream: MediaStream) => void
}

export type ReachyCameraPreviewResult =
  | { status: "streaming"; deviceLabel: string }
  | { status: "error"; message: string }
  | { status: "stale" }

export interface ReachyCameraPreviewController {
  open: () => Promise<ReachyCameraPreviewResult>
  close: () => void
  dispose: () => void
}

export function createReachyCameraPreviewController(
  adapter: Pick<ReachyMiniCameraAdapter, "start">,
  setVideoStream: (stream: MediaStream | null) => void,
): ReachyCameraPreviewController {
  let requestGeneration = 0
  let activeSession: ReachyMiniCameraSession | null = null

  const releaseActiveSession = () => {
    activeSession?.stop()
    activeSession = null
    setVideoStream(null)
  }

  const close = () => {
    requestGeneration += 1
    releaseActiveSession()
  }

  return {
    async open() {
      const requestId = requestGeneration + 1
      requestGeneration = requestId
      releaseActiveSession()

      try {
        const session = await adapter.start()
        if (requestGeneration !== requestId) {
          session.stop()
          return { status: "stale" }
        }

        activeSession = session
        setVideoStream(session.stream)
        return { status: "streaming", deviceLabel: session.deviceLabel }
      } catch (error) {
        if (requestGeneration !== requestId) return { status: "stale" }
        return {
          status: "error",
          message: error instanceof Error ? error.message : "无法打开心宠摄像头",
        }
      }
    },
    close,
    dispose: close,
  }
}

function assertMediaDevicesAvailable() {
  if (
    typeof navigator === "undefined"
    || !navigator.mediaDevices?.getUserMedia
    || !navigator.mediaDevices.enumerateDevices
  ) {
    throw new Error("当前浏览器不支持摄像头访问")
  }
}

function stopMediaStream(stream: MediaStream) {
  stream.getTracks().forEach((track) => track.stop())
}

function mapReachyCameraError(error: unknown): Error {
  const errorName = error instanceof DOMException
    ? error.name
    : (error as { name?: unknown } | null)?.name

  if (errorName === "NotReadableError") {
    return new Error("心宠摄像头正被设备服务或其他程序占用")
  }
  if (errorName === "NotFoundError" || errorName === "DevicesNotFoundError") {
    return new Error("心宠摄像头未被浏览器识别")
  }
  if (errorName === "NotAllowedError" || errorName === "SecurityError") {
    return new Error("摄像头权限未授予，请在浏览器设置中允许访问")
  }
  if (error instanceof Error && error.message === "心宠摄像头未被浏览器识别") {
    return error
  }
  return new Error("无法打开心宠摄像头")
}

export const localBrowserCameraAdapter: VisionCameraAdapter = {
  id: "local-browser-camera",
  label: "本地电脑摄像头",
  kind: "local-browser",
  async start(options) {
    assertMediaDevicesAvailable()

    return navigator.mediaDevices.getUserMedia({
      audio: false,
      video: {
        deviceId: options?.deviceId ? { exact: options.deviceId } : undefined,
        facingMode: options?.deviceId ? undefined : "user",
        height: { ideal: 720 },
        width: { ideal: 1280 },
      },
    })
  },
  stop(stream) {
    stopMediaStream(stream)
  },
  async listDevices() {
    assertMediaDevicesAvailable()

    const devices = await navigator.mediaDevices.enumerateDevices()
    return devices
      .filter((device) => device.kind === "videoinput")
      .map((device, index) => ({
        deviceId: device.deviceId,
        label: device.label || `摄像头 ${index + 1}`,
      }))
  },
}

export const reachyMiniCameraAdapter: ReachyMiniCameraAdapter = {
  id: "reachy-mini-camera",
  label: "心宠摄像头",
  kind: "reachy-mini",
  async start() {
    assertMediaDevicesAvailable()

    let permissionStream: MediaStream | null = null
    try {
      permissionStream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: true,
      })

      const devices = await navigator.mediaDevices.enumerateDevices()
      const selected = devices.find(
        (device) => device.kind === "videoinput" && /reachy|mini/i.test(device.label),
      )
      if (!selected) {
        throw new Error("心宠摄像头未被浏览器识别")
      }

      stopMediaStream(permissionStream)
      permissionStream = null

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          deviceId: { exact: selected.deviceId },
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
      })

      return {
        stream,
        deviceLabel: selected.label,
        stop: () => stopMediaStream(stream),
      }
    } catch (error) {
      throw mapReachyCameraError(error)
    } finally {
      if (permissionStream) stopMediaStream(permissionStream)
    }
  },
  stop(stream) {
    stopMediaStream(stream)
  },
}
