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

function assertMediaDevicesAvailable() {
  if (!navigator.mediaDevices?.getUserMedia) {
    throw new Error("当前浏览器不支持摄像头访问")
  }
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
    stream.getTracks().forEach((track) => track.stop())
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

export const reachyMiniCameraAdapter: VisionCameraAdapter = {
  id: "reachy-mini-camera",
  label: "Reachy Mini 摄像头",
  kind: "reachy-mini",
  async start() {
    throw new Error("Reachy Mini 摄像头接口尚未接入")
  },
  stop(stream) {
    stream.getTracks().forEach((track) => track.stop())
  },
}
