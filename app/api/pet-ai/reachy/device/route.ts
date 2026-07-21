import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

import { isClawBodyUnavailable, requestClawBody } from "@/lib/pet-ai/clawbody-client"
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

type ClawBodyStatus = ReachyDeviceSnapshot["session"] & { running?: boolean }
type DeviceStatus = Omit<ReachyDeviceSnapshot, "clawbody_reachable" | "session" | "devices" | "logs">
type DeviceList = ReachyDeviceSnapshot["devices"]
type DeviceLogs = ReachyDeviceSnapshot["logs"]

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
      session: await requestClawBody<ClawBodyStatus>("/v1/status"),
    }
  } catch (error) {
    if (!isClawBodyUnavailable(error)) throw error
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
    media: {
      camera: status.media.camera,
      microphone: status.media.microphone,
      speaker: status.media.speaker,
      input_volume: status.media.input_volume,
      output_volume: status.media.output_volume,
    },
    clawbody_reachable: clawbody.clawbody_reachable,
    session: {
      running: clawbody.session.running,
      student_id: clawbody.session.student_id,
      state: clawbody.session.state,
      error: clawbody.session.error,
    },
    devices: devices.map((device) => ({
      port: device.port,
      label: device.label,
      vid: device.vid,
      pid: device.pid,
    })),
    logs: {
      cursor: logs.cursor,
      items: logs.items.map((item) => ({
        id: item.id,
        level: item.level,
        message: item.message,
        created_at: item.created_at,
      })),
    },
    error: status.error
      ? {
          code: status.error.code,
          phase: status.error.phase,
          message: status.error.message,
          detail: status.error.detail,
        }
      : null,
  }
}

function upstreamError(error: unknown) {
  if (isHostBridgeUnavailable(error)) return json({ message: "心宠设备控制桥未运行" }, 503)
  return json({ message: "心宠设备控制请求失败" }, 502)
}

export async function GET(request: NextRequest) {
  const after = readCursor(request)
  try {
    const [status, devices, logs, clawbody] = await Promise.all([
      requestHostBridge<DeviceStatus>("/v1/device/status"),
      requestHostBridge<DeviceList>("/v1/device/discover"),
      requestHostBridge<DeviceLogs>(`/v1/device/logs?after=${after}`),
      getClawBodyStatus(),
    ])
    return json({ data: deviceSnapshot(status, devices, logs, clawbody) })
  } catch (error) {
    return upstreamError(error)
  }
}

async function stopDevice() {
  const session = await requestClawBody<ClawBodyStatus>("/v1/status")
  let sessionStopped = false
  if (session.running === true) {
    await requestClawBody("/v1/session/stop", { method: "POST" })
    sessionStopped = true
  }
  const device = await requestHostBridge("/v1/device/stop", { method: "POST" })
  return { sessionStopped, device }
}

async function runCommand(command: ReachyDeviceCommand) {
  switch (command.action) {
    case "discover":
      return requestHostBridge("/v1/device/discover")
    case "start":
      return requestHostBridge("/v1/device/start", {
        method: "POST",
        body: JSON.stringify({ serial_port: command.serialPort }),
        longRunning: true,
      })
    case "stop":
      return stopDevice()
    case "restart":
      return requestHostBridge("/v1/device/restart", {
        method: "POST",
        body: JSON.stringify({}),
        longRunning: true,
      })
    case "device_action":
      return requestHostBridge("/v1/device/action", {
        method: "POST",
        body: JSON.stringify({ action: command.deviceAction }),
      })
    case "pose":
      return requestHostBridge("/v1/device/pose", {
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
      })
    case "volume":
      return requestHostBridge("/v1/device/volume", {
        method: "POST",
        body: JSON.stringify({ target: command.target, volume: command.volume }),
      })
  }
}

export async function POST(request: NextRequest) {
  const parsed = commandSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return json({ message: "设备命令参数无效" }, 400)

  try {
    return json({ data: await runCommand(parsed.data) })
  } catch (error) {
    return upstreamError(error)
  }
}
