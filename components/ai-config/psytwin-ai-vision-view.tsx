"use client"

import { useEffect, useRef, useState } from "react"
import { Camera, CameraOff, MonitorPlay, RefreshCcw, Video } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { localBrowserCameraAdapter, type VisionCameraDevice } from "@/lib/vision-camera"

type CameraStatus = "idle" | "loading" | "streaming" | "error"

function getCameraErrorMessage(error: unknown) {
  if (error instanceof DOMException) {
    if (error.name === "NotAllowedError") {
      return "浏览器摄像头权限未授权，请允许当前站点访问摄像头后重试。"
    }

    if (error.name === "NotFoundError") {
      return "未检测到可用摄像头，请检查设备连接。"
    }
  }

  if (error instanceof Error) {
    return error.message
  }

  return "摄像头启动失败，请稍后重试。"
}

export function PsyTwinAiVisionView() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [status, setStatus] = useState<CameraStatus>("idle")
  const [devices, setDevices] = useState<VisionCameraDevice[]>([])
  const [selectedDeviceId, setSelectedDeviceId] = useState("")
  const [errorMessage, setErrorMessage] = useState("")

  const stopStream = () => {
    if (streamRef.current) {
      localBrowserCameraAdapter.stop(streamRef.current)
      streamRef.current = null
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null
    }

    setStatus("idle")
  }

  const loadDevices = async () => {
    try {
      const cameraDevices = await localBrowserCameraAdapter.listDevices?.()
      setDevices(cameraDevices ?? [])

      if (!selectedDeviceId) {
        const reachyDevice = cameraDevices?.find((device) => /reachy|mini/i.test(device.label))
        if (reachyDevice) {
          setSelectedDeviceId(reachyDevice.deviceId)
        }
      }
    } catch (error) {
      setErrorMessage(getCameraErrorMessage(error))
    }
  }

  const startStream = async () => {
    setStatus("loading")
    setErrorMessage("")

    try {
      if (streamRef.current) {
        localBrowserCameraAdapter.stop(streamRef.current)
      }

      const stream = await localBrowserCameraAdapter.start({
        deviceId: selectedDeviceId || undefined,
      })
      streamRef.current = stream

      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }

      setStatus("streaming")
      await loadDevices()
    } catch (error) {
      setStatus("error")
      setErrorMessage(getCameraErrorMessage(error))
    }
  }

  useEffect(() => {
    void loadDevices()

    return () => {
      if (streamRef.current) {
        localBrowserCameraAdapter.stop(streamRef.current)
      }
    }
  }, [])

  return (
    <div className="flex h-[calc(100vh-10rem)] flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-orange-400">心图AI视窗</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            选择本机或 USB 接入的 Reachy Mini 摄像头，启动后显示实时画面。
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant={status === "streaming" ? "default" : "secondary"}>
            <span
              className={
                status === "streaming"
                  ? "h-1.5 w-1.5 rounded-full bg-emerald-300"
                  : "h-1.5 w-1.5 rounded-full bg-muted-foreground"
              }
            />
            {status === "streaming" ? "实时预览" : "待连接"}
          </Badge>
          <Badge variant="outline">{localBrowserCameraAdapter.label}</Badge>
        </div>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 xl:grid-cols-[minmax(0,1fr)_320px]">
        <Card className="min-h-0 overflow-hidden border-border bg-card py-0">
          <CardContent className="flex min-h-0 flex-1 p-0">
            <div className="relative flex min-h-[360px] flex-1 items-center justify-center bg-zinc-950">
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="h-full max-h-full w-full object-contain"
              />

              {status !== "streaming" ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-zinc-950 text-center">
                  <div className="flex size-16 items-center justify-center rounded-full border border-white/10 bg-white/5">
                    {status === "error" ? (
                      <CameraOff className="size-8 text-red-300" />
                    ) : (
                      <Camera className="size-8 text-cyan-200" />
                    )}
                  </div>
                  <div>
                    <p className="text-base font-medium text-white">
                      {status === "loading" ? "正在连接摄像头..." : "摄像头预览未启动"}
                    </p>
                    <p className="mt-2 max-w-md text-sm text-zinc-400">
                      {errorMessage || "点击启动预览后，浏览器会请求本地摄像头权限。"}
                    </p>
                  </div>
                </div>
              ) : null}
            </div>
          </CardContent>
        </Card>

        <div className="flex min-h-0 flex-col gap-3">
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <MonitorPlay className="size-4 text-cyan-500" />
                视窗控制
              </CardTitle>
              <CardDescription>选择本机或 USB 摄像头并启动实时画面。</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <label className="grid gap-2 text-sm">
                <span className="font-medium">视频输入</span>
                <select
                  value={selectedDeviceId}
                  onChange={(event) => setSelectedDeviceId(event.target.value)}
                  className="h-9 rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                >
                  <option value="">默认摄像头</option>
                  {devices.map((device) => (
                    <option key={device.deviceId} value={device.deviceId}>
                      {device.label}
                    </option>
                  ))}
                </select>
              </label>

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <Button
                  className="gap-1 px-2 text-xs sm:gap-2 sm:px-4 sm:text-sm"
                  onClick={startStream}
                  disabled={status === "loading"}
                >
                  <Video className="size-4" />
                  启动预览
                </Button>
                <Button
                  variant="outline"
                  className="gap-1 px-2 text-xs sm:gap-2 sm:px-4 sm:text-sm"
                  onClick={stopStream}
                  disabled={status !== "streaming"}
                >
                  <CameraOff className="size-4" />
                  停止
                </Button>
              </div>

              <Button variant="ghost" className="w-full" onClick={loadDevices}>
                <RefreshCcw className="size-4" />
                刷新设备列表
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
