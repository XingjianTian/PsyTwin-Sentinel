import type { ReachyDeviceCommand } from "./reachy-device"

const lifecycleWarningMessages = {
  clawbody_status_unavailable: "未能确认当前 ClawBody 会话状态；设备已继续停止。",
  clawbody_session_stop_failed: "学生会话停止请求失败；设备已继续停止。",
} as const

export type ReachyLifecycleWarningCode = keyof typeof lifecycleWarningMessages

export type ReachyLifecycleWarning = {
  code: ReachyLifecycleWarningCode
  message: string
}

function isLifecycleWarningCode(value: unknown): value is ReachyLifecycleWarningCode {
  return typeof value === "string"
    && Object.prototype.hasOwnProperty.call(lifecycleWarningMessages, value)
}

export function getReachyLifecycleWarningUpdate(
  command: ReachyDeviceCommand,
  responseData: unknown,
): ReachyLifecycleWarning[] | null {
  if (command.action === "start" || command.action === "restart") return []
  if (command.action !== "stop") return null

  if (!responseData || typeof responseData !== "object") return []
  const warnings = "warnings" in responseData && Array.isArray(responseData.warnings)
    ? responseData.warnings
    : []
  const codes = new Set<ReachyLifecycleWarningCode>()
  for (const warning of warnings) {
    if (!warning || typeof warning !== "object" || !("code" in warning)) continue
    if (isLifecycleWarningCode(warning.code)) codes.add(warning.code)
  }

  return [...codes].map((code) => ({ code, message: lifecycleWarningMessages[code] }))
}
