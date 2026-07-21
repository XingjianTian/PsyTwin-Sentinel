import type {
  ReachyDeviceCommand,
  ReachyDevicePhase,
  ReachyDeviceSnapshot,
} from "./reachy-device"

export const MAX_LOG_ITEMS = 300

export type ReachyLogBuffer = ReachyDeviceSnapshot["logs"]

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
  send: (command: Extract<ReachyDeviceCommand, { action: "pose" }>) => void | Promise<void>,
  delay = 100,
) {
  const clamped = clampPose(pose)
  return setTimeout(() => {
    const latest = getSnapshot()
    if (!isMotorControlAvailable(latest.phase, latest.motor_mode)) return
    void send({ action: "pose", ...clamped, duration: 0.3 })
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
