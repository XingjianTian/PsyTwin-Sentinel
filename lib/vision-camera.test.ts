import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import test, { type TestContext } from "node:test"

import {
  createReachyCameraPreviewController,
  reachyMiniCameraAdapter,
  type ReachyMiniCameraSession,
} from "./vision-camera"

type MediaDevicesStub = Pick<MediaDevices, "enumerateDevices" | "getUserMedia">

function createTrack() {
  let stopCount = 0
  return {
    track: {
      stop() {
        stopCount += 1
      },
    } as MediaStreamTrack,
    get stopCount() {
      return stopCount
    },
  }
}

function createStream(tracks: MediaStreamTrack[]) {
  return {
    getTracks: () => tracks,
  } as MediaStream
}

function createDeferred<T>() {
  let resolve!: (value: T) => void
  const promise = new Promise<T>((promiseResolve) => {
    resolve = promiseResolve
  })
  return { promise, resolve }
}

function createPreviewSession(deviceLabel: string) {
  let stopCount = 0
  const stream = createStream([])
  return {
    session: {
      stream,
      deviceLabel,
      stop() {
        stopCount += 1
      },
    } satisfies ReachyMiniCameraSession,
    stream,
    get stopCount() {
      return stopCount
    },
  }
}

function installMediaDevices(t: TestContext, mediaDevices: MediaDevicesStub) {
  const navigatorDescriptor = Object.getOwnPropertyDescriptor(globalThis, "navigator")
  Object.defineProperty(globalThis, "navigator", {
    configurable: true,
    value: { mediaDevices },
  })

  t.after(() => {
    if (navigatorDescriptor) {
      Object.defineProperty(globalThis, "navigator", navigatorDescriptor)
    } else {
      Reflect.deleteProperty(globalThis, "navigator")
    }
  })
}

test("prefers a labeled Reachy Mini camera and requests the exact 640x480 stream", async (t) => {
  const permissionTrack = createTrack()
  const previewTrack = createTrack()
  const permissionStream = createStream([permissionTrack.track])
  const previewStream = createStream([previewTrack.track])
  const requests: MediaStreamConstraints[] = []

  installMediaDevices(t, {
    async enumerateDevices() {
      return [
        { deviceId: "laptop", kind: "videoinput", label: "Integrated Camera" },
        { deviceId: "reachy", kind: "videoinput", label: "Reachy Mini Camera" },
        { deviceId: "mic", kind: "audioinput", label: "Reachy Mini Microphone" },
      ] as MediaDeviceInfo[]
    },
    async getUserMedia(constraints) {
      if (!constraints) throw new Error("Expected camera constraints")
      requests.push(constraints)
      return requests.length === 1 ? permissionStream : previewStream
    },
  })

  const session = await reachyMiniCameraAdapter.start()

  assert.equal(session.stream, previewStream)
  assert.equal(session.deviceLabel, "Reachy Mini Camera")
  assert.deepEqual(requests, [
    { audio: false, video: true },
    {
      audio: false,
      video: {
        deviceId: { exact: "reachy" },
        width: { ideal: 640 },
        height: { ideal: 480 },
      },
    },
  ])
  assert.equal(permissionTrack.stopCount, 1)
  assert.equal(previewTrack.stopCount, 0)
})

test("reports when no labeled Reachy Mini camera is available", async (t) => {
  const permissionTrack = createTrack()
  installMediaDevices(t, {
    async enumerateDevices() {
      return [
        { deviceId: "laptop", kind: "videoinput", label: "Integrated Camera" },
      ] as MediaDeviceInfo[]
    },
    async getUserMedia() {
      return createStream([permissionTrack.track])
    },
  })

  await assert.rejects(
    reachyMiniCameraAdapter.start(),
    new Error("心宠摄像头未被浏览器识别"),
  )
  assert.equal(permissionTrack.stopCount, 1)
})

test("maps a busy camera error without changing device readiness", async (t) => {
  const permissionTrack = createTrack()
  let requestCount = 0
  installMediaDevices(t, {
    async enumerateDevices() {
      return [
        { deviceId: "reachy", kind: "videoinput", label: "Reachy Camera" },
      ] as MediaDeviceInfo[]
    },
    async getUserMedia() {
      requestCount += 1
      if (requestCount === 1) return createStream([permissionTrack.track])
      throw new DOMException("Could not start video source", "NotReadableError")
    },
  })

  await assert.rejects(
    reachyMiniCameraAdapter.start(),
    new Error("心宠摄像头正被设备服务或其他程序占用"),
  )
  assert.equal(permissionTrack.stopCount, 1)
})

test("maps a denied browser permission to an actionable message", async (t) => {
  installMediaDevices(t, {
    async enumerateDevices() {
      return []
    },
    async getUserMedia() {
      throw new DOMException("Permission denied", "NotAllowedError")
    },
  })

  await assert.rejects(
    reachyMiniCameraAdapter.start(),
    new Error("摄像头权限未授予，请在浏览器设置中允许访问"),
  )
})

test("maps current and legacy no-device errors to the safe unavailable message", async (t) => {
  const errorNames = ["NotFoundError", "DevicesNotFoundError"]
  let attempt = 0
  installMediaDevices(t, {
    async enumerateDevices() {
      return []
    },
    async getUserMedia() {
      const errorName = errorNames[attempt]
      attempt += 1
      throw new DOMException(`Browser device detail for ${errorName}`, errorName)
    },
  })

  for (const errorName of errorNames) {
    await assert.rejects(
      reachyMiniCameraAdapter.start(),
      new Error("心宠摄像头未被浏览器识别"),
      errorName,
    )
  }
})

test("bounds unknown browser camera errors without exposing their message", async (t) => {
  const sensitiveBrowserMessage = "Camera failed at C:\\private\\device-path"
  installMediaDevices(t, {
    async enumerateDevices() {
      return []
    },
    async getUserMedia() {
      throw new DOMException(sensitiveBrowserMessage, "AbortError")
    },
  })

  await assert.rejects(
    reachyMiniCameraAdapter.start(),
    (error: unknown) => {
      assert.ok(error instanceof Error)
      assert.equal(error.message, "无法打开心宠摄像头")
      assert.doesNotMatch(error.message, /private|device-path/i)
      return true
    },
  )
})

test("session stop closes every preview track", async (t) => {
  const permissionTrack = createTrack()
  const firstPreviewTrack = createTrack()
  const secondPreviewTrack = createTrack()
  let requestCount = 0
  installMediaDevices(t, {
    async enumerateDevices() {
      return [
        { deviceId: "mini", kind: "videoinput", label: "Mini Camera" },
      ] as MediaDeviceInfo[]
    },
    async getUserMedia() {
      requestCount += 1
      return requestCount === 1
        ? createStream([permissionTrack.track])
        : createStream([firstPreviewTrack.track, secondPreviewTrack.track])
    },
  })

  const session = await reachyMiniCameraAdapter.start()
  session.stop()

  assert.equal(firstPreviewTrack.stopCount, 1)
  assert.equal(secondPreviewTrack.stopCount, 1)
})

test("preview controller requests permission only when open is called", async () => {
  const preview = createPreviewSession("Reachy Mini Camera")
  let startCount = 0
  let videoSrcObject: MediaStream | null = null
  const controller = createReachyCameraPreviewController(
    {
      async start() {
        startCount += 1
        return preview.session
      },
    },
    (stream) => {
      videoSrcObject = stream
    },
  )

  assert.equal(startCount, 0)
  const result = await controller.open()

  assert.equal(startCount, 1)
  assert.deepEqual(result, { status: "streaming", deviceLabel: "Reachy Mini Camera" })
  assert.equal(videoSrcObject, preview.stream)
})

test("closing an active preview stops its session and clears the video source", async () => {
  const preview = createPreviewSession("Reachy Mini Camera")
  let videoSrcObject: MediaStream | null = null
  const controller = createReachyCameraPreviewController(
    { start: async () => preview.session },
    (stream) => {
      videoSrcObject = stream
    },
  )
  await controller.open()

  controller.close()

  assert.equal(preview.stopCount, 1)
  assert.equal(videoSrcObject, null)
})

test("disposing an active preview stops its session and clears the video source", async () => {
  const preview = createPreviewSession("Reachy Mini Camera")
  let videoSrcObject: MediaStream | null = null
  const controller = createReachyCameraPreviewController(
    { start: async () => preview.session },
    (stream) => {
      videoSrcObject = stream
    },
  )
  await controller.open()

  controller.dispose()

  assert.equal(preview.stopCount, 1)
  assert.equal(videoSrcObject, null)
})

test("opening a replacement preview stops and clears the active session first", async () => {
  const first = createPreviewSession("Reachy Mini Camera 1")
  const second = createPreviewSession("Reachy Mini Camera 2")
  const sessions = [first.session, second.session]
  const videoSources: Array<MediaStream | null> = []
  const controller = createReachyCameraPreviewController(
    { start: async () => sessions.shift()! },
    (stream) => videoSources.push(stream),
  )
  await controller.open()

  const result = await controller.open()

  assert.equal(first.stopCount, 1)
  assert.equal(second.stopCount, 0)
  assert.deepEqual(result, { status: "streaming", deviceLabel: "Reachy Mini Camera 2" })
  assert.deepEqual(videoSources.slice(-2), [null, second.stream])
})

test("a preview resolved after close is stopped as stale and cannot restore video", async () => {
  const deferred = createDeferred<ReachyMiniCameraSession>()
  const preview = createPreviewSession("Reachy Mini Camera")
  let videoSrcObject: MediaStream | null = null
  const controller = createReachyCameraPreviewController(
    { start: () => deferred.promise },
    (stream) => {
      videoSrcObject = stream
    },
  )

  const openResult = controller.open()
  controller.close()
  deferred.resolve(preview.session)

  assert.deepEqual(await openResult, { status: "stale" })
  assert.equal(preview.stopCount, 1)
  assert.equal(videoSrcObject, null)
})

test("Ready console leaves camera preview to the multimodal live view", async () => {
  const source = await readFile(
    new URL(
      "../components/views/pet-ai-management/reachy-ready-console.tsx",
      import.meta.url,
    ),
    "utf8",
  )

  assert.doesNotMatch(source, /openCameraPreview|打开摄像头预览/)
  assert.doesNotMatch(source, /createReachyCameraPreviewController/)
  assert.doesNotMatch(source, /<video[\s\S]*playsInline/)
  assert.doesNotMatch(source, /reachy-media-heading|媒体设备/)
})
