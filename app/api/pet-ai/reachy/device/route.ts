import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

import { requestClawBody } from "@/lib/pet-ai/clawbody-client"
import { isHostBridgeUnavailable, requestHostBridge } from "@/lib/pet-ai/host-bridge-client"
import type { ReachyDeviceCommand, ReachyDeviceSnapshot } from "@/lib/pet-ai/reachy-device"

export const dynamic = "force-dynamic"

const NO_STORE_HEADERS = { "Cache-Control": "private, no-store, max-age=0" }

const commandSchema: z.ZodType<ReachyDeviceCommand> = z.discriminatedUnion("action", [
  z.object({ action: z.literal("discover") }).strict(),
  z.object({ action: z.literal("start"), serialPort: z.string().regex(/^COM\d+$/).optional() }).strict(),
  z.object({ action: z.literal("stop") }).strict(),
  z.object({ action: z.literal("restart") }).strict(),
  z
    .object({
      action: z.literal("device_action"),
      deviceAction: z.enum(["wake_up", "goto_sleep", "center", "antenna_test", "test_sound"]),
    })
    .strict(),
  z
    .object({
      action: z.literal("pose"),
      headPitch: z.number().min(-40).max(40),
      headRoll: z.number().min(-40).max(40),
      headYaw: z.number().min(-65).max(65),
      bodyYaw: z.number().min(-180).max(180),
      leftAntenna: z.number().min(-3.1416).max(3.1416),
      rightAntenna: z.number().min(-3.1416).max(3.1416),
      duration: z.number().min(0.1).max(5),
    })
    .strict(),
  z
    .object({
      action: z.literal("volume"),
      target: z.enum(["speaker", "microphone"]),
      volume: z.number().int().min(0).max(100),
    })
    .strict(),
])

const phaseSchema = z.enum([
  "offline",
  "discovering",
  "starting",
  "connecting",
  "healthchecking",
  "loading_apps",
  "ready",
  "stopping",
  "error",
])

const mediaSchema = z.object({
  camera: z.string(),
  microphone: z.string(),
  speaker: z.string(),
  input_volume: z.number().nullable(),
  output_volume: z.number().nullable(),
})

const deviceErrorSchema = z.object({
  code: z.string(),
  phase: phaseSchema,
  message: z.string(),
  detail: z.string().nullable().optional(),
})

const deviceStatusSchema = z.object({
  phase: phaseSchema,
  operation_id: z.string().nullable(),
  serial_port: z.string().nullable(),
  daemon_owned: z.boolean(),
  daemon_pid: z.number().int().nullable(),
  daemon_version: z.string().nullable(),
  daemon_state: z.string().nullable(),
  motor_mode: z.string().nullable(),
  media: mediaSchema,
  clawbody_reachable: z.boolean(),
  error: deviceErrorSchema.nullable(),
})

const serialDeviceSchema = z.object({
  port: z.string(),
  label: z.string(),
  vid: z.string(),
  pid: z.string(),
})

const deviceLogsSchema = z.object({
  cursor: z.number().int().nonnegative(),
  items: z.array(z.object({
    id: z.number().int().nonnegative(),
    level: z.string(),
    message: z.string(),
    created_at: z.string(),
  })),
})

const clawBodyStatusSchema = z.object({
  running: z.boolean().optional(),
  student_id: z.string().nullable().optional(),
  state: z.string().optional(),
  error: z.string().nullable().optional(),
})

type DeviceStatus = z.infer<typeof deviceStatusSchema>
type DeviceList = z.infer<typeof serialDeviceSchema>[]
type DeviceLogs = z.infer<typeof deviceLogsSchema>
type ClawBodyStatus = z.infer<typeof clawBodyStatusSchema>

const SECRET_PATTERNS = [
  /(authorization\s*:\s*bearer\s+)[^\s,;]+/gi,
  /((?:x-host-bridge-key|x-service-key|host_bridge_api_key|clawbody_service_key|api[_-]?key|password|access[_-]?token|refresh[_-]?token|token)\s*[:=]\s*)[^\s,;]+/gi,
]

function safeText(value: string, limit = 2_000) {
  return SECRET_PATTERNS.reduce(
    (text, pattern) => text.replace(pattern, "$1[REDACTED]"),
    value.slice(0, limit),
  )
}

function publicDeviceStatus(payload: unknown): DeviceStatus {
  const status = deviceStatusSchema.parse(payload)
  return {
    phase: status.phase,
    operation_id: status.operation_id === null ? null : safeText(status.operation_id, 200),
    serial_port: status.serial_port === null ? null : safeText(status.serial_port, 100),
    daemon_owned: status.daemon_owned,
    daemon_pid: status.daemon_pid,
    daemon_version: status.daemon_version === null ? null : safeText(status.daemon_version, 100),
    daemon_state: status.daemon_state === null ? null : safeText(status.daemon_state, 100),
    motor_mode: status.motor_mode === null ? null : safeText(status.motor_mode, 100),
    media: {
      camera: safeText(status.media.camera, 100),
      microphone: safeText(status.media.microphone, 100),
      speaker: safeText(status.media.speaker, 100),
      input_volume: status.media.input_volume,
      output_volume: status.media.output_volume,
    },
    clawbody_reachable: status.clawbody_reachable,
    error: status.error
      ? {
          code: safeText(status.error.code, 200),
          phase: status.error.phase,
          message: safeText(status.error.message),
          detail: status.error.detail == null ? status.error.detail : safeText(status.error.detail),
        }
      : null,
  }
}

function publicDeviceList(payload: unknown): DeviceList {
  return z.array(serialDeviceSchema).parse(payload).map((device) => ({
    port: safeText(device.port, 100),
    label: safeText(device.label, 500),
    vid: safeText(device.vid, 100),
    pid: safeText(device.pid, 100),
  }))
}

function publicDeviceLogs(payload: unknown): DeviceLogs {
  const logs = deviceLogsSchema.parse(payload)
  return {
    cursor: logs.cursor,
    items: logs.items.map((item) => ({
      id: item.id,
      level: safeText(item.level, 100),
      message: safeText(item.message),
      created_at: safeText(item.created_at, 200),
    })),
  }
}

function publicClawBodyStatus(payload: unknown): ClawBodyStatus {
  const status = clawBodyStatusSchema.parse(payload)
  return {
    running: status.running,
    student_id: status.student_id == null ? status.student_id : safeText(status.student_id, 200),
    state: status.state === undefined ? undefined : safeText(status.state, 100),
    error: status.error == null ? status.error : safeText(status.error),
  }
}

function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status, headers: NO_STORE_HEADERS })
}

function readCursor(request: NextRequest) {
  const value = request.nextUrl.searchParams.get("after") || "0"
  if (!/^\d+$/.test(value)) return 0
  const cursor = Number(value)
  return Number.isSafeInteger(cursor) ? cursor : 0
}

async function getClawBodyStatus() {
  try {
    return {
      clawbody_reachable: true,
      session: publicClawBodyStatus(await requestClawBody<unknown>("/v1/status")),
    }
  } catch {
    return {
      clawbody_reachable: false,
      session: { state: "offline" } satisfies ClawBodyStatus,
    }
  }
}

function deviceSnapshot(
  status: DeviceStatus,
  devices: DeviceList,
  logs: DeviceLogs,
  clawbody: Awaited<ReturnType<typeof getClawBodyStatus>>,
): ReachyDeviceSnapshot {
  return {
    phase: status.phase,
    operation_id: status.operation_id,
    serial_port: status.serial_port,
    daemon_owned: status.daemon_owned,
    daemon_pid: status.daemon_pid,
    daemon_version: status.daemon_version,
    daemon_state: status.daemon_state,
    motor_mode: status.motor_mode,
    media: status.media,
    clawbody_reachable: clawbody.clawbody_reachable,
    session: {
      running: clawbody.session.running,
      student_id: clawbody.session.student_id,
      state: clawbody.session.state,
      error: clawbody.session.error,
    },
    devices,
    logs,
    error: status.error,
  }
}

function upstreamError(error: unknown) {
  if (isHostBridgeUnavailable(error)) return json({ message: "心宠设备控制桥未运行" }, 503)
  return json({ message: "心宠设备控制请求失败" }, 502)
}

function mutationRequestError(request: NextRequest) {
  const contentType = request.headers.get("content-type")?.split(";", 1)[0]?.trim().toLowerCase()
  if (contentType !== "application/json") return json({ message: "仅支持 JSON 设备命令" }, 415)

  if (request.headers.get("authorization")?.startsWith("Bearer ")) return null

  const origin = request.headers.get("origin")
  if (!origin) return json({ message: "设备命令来源无效" }, 403)
  try {
    if (new URL(origin).origin !== request.nextUrl.origin) {
      return json({ message: "设备命令来源无效" }, 403)
    }
  } catch {
    return json({ message: "设备命令来源无效" }, 403)
  }
  return null
}

export async function GET(request: NextRequest) {
  const after = readCursor(request)
  try {
    const [status, devices, logs, clawbody] = await Promise.all([
      requestHostBridge<unknown>("/v1/device/status").then(publicDeviceStatus),
      requestHostBridge<unknown>("/v1/device/discover").then(publicDeviceList),
      requestHostBridge<unknown>(`/v1/device/logs?after=${after}`).then(publicDeviceLogs),
      getClawBodyStatus(),
    ])
    return json({ data: deviceSnapshot(status, devices, logs, clawbody) })
  } catch (error) {
    return upstreamError(error)
  }
}

async function stopDevice() {
  let sessionStopped = false
  const warnings: Array<{ code: string; message: string }> = []
  let session: ClawBodyStatus | null = null

  try {
    session = publicClawBodyStatus(await requestClawBody<unknown>("/v1/status"))
  } catch {
    warnings.push({
      code: "clawbody_status_unavailable",
      message: "未能确认当前 ClawBody 会话状态；已继续停止设备",
    })
  }

  if (session?.running === true) {
    try {
      await requestClawBody("/v1/session/stop", { method: "POST" })
      sessionStopped = true
    } catch {
      warnings.push({
        code: "clawbody_session_stop_failed",
        message: "学生会话停止请求失败；已继续停止设备",
      })
    }
  }

  const device = publicDeviceStatus(await requestHostBridge("/v1/device/stop", { method: "POST" }))
  return { sessionStopped, warnings, device }
}

async function runCommand(command: ReachyDeviceCommand) {
  switch (command.action) {
    case "discover":
      return publicDeviceList(await requestHostBridge("/v1/device/discover"))
    case "start":
      return publicDeviceStatus(await requestHostBridge("/v1/device/start", {
        method: "POST",
        body: JSON.stringify({ serial_port: command.serialPort }),
        longRunning: true,
      }))
    case "stop":
      return stopDevice()
    case "restart":
      return publicDeviceStatus(await requestHostBridge("/v1/device/restart", {
        method: "POST",
        body: JSON.stringify({}),
        longRunning: true,
      }))
    case "device_action":
      return publicDeviceStatus(await requestHostBridge("/v1/device/action", {
        method: "POST",
        body: JSON.stringify({ action: command.deviceAction }),
      }))
    case "pose":
      return publicDeviceStatus(await requestHostBridge("/v1/device/pose", {
        method: "POST",
        body: JSON.stringify({
          head_pitch: command.headPitch,
          head_roll: command.headRoll,
          head_yaw: command.headYaw,
          body_yaw: command.bodyYaw,
          left_antenna: command.leftAntenna,
          right_antenna: command.rightAntenna,
          duration: command.duration,
        }),
      }))
    case "volume":
      return publicDeviceStatus(await requestHostBridge("/v1/device/volume", {
        method: "POST",
        body: JSON.stringify({ target: command.target, volume: command.volume }),
      }))
  }
}

export async function POST(request: NextRequest) {
  const requestError = mutationRequestError(request)
  if (requestError) return requestError

  const parsed = commandSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return json({ message: "设备命令参数无效" }, 400)

  try {
    return json({ data: await runCommand(parsed.data) })
  } catch (error) {
    return upstreamError(error)
  }
}
