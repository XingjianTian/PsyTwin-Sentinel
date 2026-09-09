export type ReachyDevicePhase =
  | "offline"
  | "discovering"
  | "starting"
  | "connecting"
  | "healthchecking"
  | "loading_apps"
  | "ready"
  | "stopping"
  | "error"

export type ReachyDeviceCommand =
  | { action: "discover" }
  | { action: "start"; serialPort?: string }
  | { action: "stop" }
  | { action: "restart" }
  | {
      action: "device_action"
      deviceAction: "wake_up" | "goto_sleep" | "center" | "antenna_test" | "test_sound"
    }
  | { action: "processing"; enabled: boolean }
  | {
      action: "choreography"
      kind: "emotion" | "dance" | "music"
      move: string
      playSound?: boolean
    }
  | {
      action: "pose"
      headPitch: number
      headRoll: number
      headYaw: number
      bodyYaw: number
      leftAntenna: number
      rightAntenna: number
      duration: number
    }
  | { action: "volume"; target: "speaker" | "microphone"; volume: number }

export type ReachyDeviceSnapshot = {
  phase: ReachyDevicePhase
  operation_id: string | null
  serial_port: string | null
  daemon_owned: boolean
  daemon_pid: number | null
  daemon_version: string | null
  daemon_state: string | null
  motor_mode: string | null
  media: {
    camera: string
    microphone: string
    speaker: string
    input_volume: number | null
    output_volume: number | null
  }
  clawbody_reachable: boolean
  session: { running?: boolean; student_id?: string | null; state?: string; error?: string | null }
  devices: Array<{ port: string; label: string; vid: string; pid: string }>
  logs: { cursor: number; items: Array<{ id: number; level: string; message: string; created_at: string }> }
  error: { code: string; phase: ReachyDevicePhase; message: string; detail?: string | null } | null
}

export type ReachyPhaseTone = "neutral" | "progress" | "success" | "danger"

const reachyPhasePresentation = {
  offline: { label: "设备离线", tone: "neutral" },
  discovering: { label: "发现设备", tone: "progress" },
  starting: { label: "正在启动", tone: "progress" },
  connecting: { label: "正在连接", tone: "progress" },
  healthchecking: { label: "健康检查", tone: "progress" },
  loading_apps: { label: "加载应用", tone: "progress" },
  ready: { label: "设备就绪", tone: "success" },
  stopping: { label: "正在停止", tone: "progress" },
  error: { label: "设备错误", tone: "danger" },
} satisfies Record<ReachyDevicePhase, { label: string; tone: ReachyPhaseTone }>

export function getReachyPhasePresentation(phase: ReachyDevicePhase) {
  return reachyPhasePresentation[phase]
}
