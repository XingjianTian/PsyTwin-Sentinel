import type {
  ReachyDeviceCommand,
  ReachyDevicePhase,
  ReachyDeviceSnapshot,
} from "./reachy-device"

export const MAX_LOG_ITEMS = 300

export type ReachyLogBuffer = ReachyDeviceSnapshot["logs"]

export function toPetFacingText(value: string) {
  return value
    .replace(/reachy[\s_-]*mini(?:\s*lite)?/gi, "心宠")
    .replace(/\breachy\b/gi, "心宠")
}

export function sanitizePetFacingDeviceSnapshot(
  snapshot: ReachyDeviceSnapshot,
): ReachyDeviceSnapshot {
  return {
    ...snapshot,
    devices: snapshot.devices.map((device) => ({
      ...device,
      label: toPetFacingText(device.label),
    })),
    error: snapshot.error ? {
      ...snapshot.error,
      message: toPetFacingText(snapshot.error.message),
      detail: snapshot.error.detail ? toPetFacingText(snapshot.error.detail) : snapshot.error.detail,
    } : null,
    logs: {
      ...snapshot.logs,
      items: snapshot.logs.items.map((entry) => ({
        ...entry,
        message: toPetFacingText(entry.message),
      })),
    },
  }
}

export type ReachyPose = {
  headPitch: number
  headRoll: number
  headYaw: number
  bodyYaw: number
  leftAntenna: number
  rightAntenna: number
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value))

export function clampVolume(value: number) {
  return Math.round(clamp(value, 0, 100))
}

export function clampPose(pose: ReachyPose): ReachyPose {
  return {
    headPitch: clamp(pose.headPitch, -40, 40),
    headRoll: clamp(pose.headRoll, -40, 40),
    headYaw: clamp(pose.headYaw, -65, 65),
    bodyYaw: clamp(pose.bodyYaw, -180, 180),
    leftAntenna: clamp(pose.leftAntenna, -3.1416, 3.1416),
    rightAntenna: clamp(pose.rightAntenna, -3.1416, 3.1416),
  }
}

export function isMotorControlAvailable(
  phase: ReachyDevicePhase,
  motorMode: string | null,
) {
  return phase === "ready" && motorMode?.toLowerCase() === "enabled"
}

type DeviceAction = Extract<
  ReachyDeviceCommand,
  { action: "device_action" }
>["deviceAction"]

export function isDeviceActionAvailable(
  action: DeviceAction,
  phase: ReachyDevicePhase,
  motorMode: string | null,
) {
  if (phase !== "ready") return false
  if (action === "wake_up" || action === "test_sound") return true
  return isMotorControlAvailable(phase, motorMode)
}

export function scheduleSafePoseCommand(
  pose: ReachyPose,
  getSnapshot: () => Pick<ReachyDeviceSnapshot, "phase" | "motor_mode">,
  send: (
    command: Extract<ReachyDeviceCommand, { action: "pose" }>,
    canExecute: () => boolean,
  ) => void | Promise<void>,
  delay = 100,
) {
  const clamped = clampPose(pose)
  return setTimeout(() => {
    const canExecute = () => {
      const latest = getSnapshot()
      return isMotorControlAvailable(latest.phase, latest.motor_mode)
    }
    if (!canExecute()) return
    void send({ action: "pose", ...clamped, duration: 0.3 }, canExecute)
  }, delay)
}

export function mergeReachyLogs(
  previous: ReachyLogBuffer,
  incoming: ReachyLogBuffer,
): ReachyLogBuffer {
  const appended = incoming.items
    .filter((item) => item.id > previous.cursor)
    .sort((left, right) => left.id - right.id)
  const cursor = Math.max(
    previous.cursor,
    incoming.cursor,
    appended.at(-1)?.id ?? 0,
  )

  return {
    cursor,
    items: [...previous.items, ...appended].slice(-MAX_LOG_ITEMS),
  }
}
