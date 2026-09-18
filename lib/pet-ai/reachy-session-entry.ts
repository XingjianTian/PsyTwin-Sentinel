export type ReachyServiceAvailability = "checking" | "available" | "unavailable"

export type ReachySessionEntryPresentation = {
  canStart: boolean
  reason: string
}

export function getReachySessionEntryPresentation({
  isDemoStudent,
  running,
  availability,
  serviceState,
  serviceError,
}: {
  isDemoStudent: boolean
  running: boolean
  availability: ReachyServiceAvailability
  serviceState?: string
  serviceError?: string
}): ReachySessionEntryPresentation {
  if (!isDemoStudent) {
    return { canStart: false, reason: "首版仅允许测试学生启动实体心宠对话" }
  }
  if (running) {
    return { canStart: false, reason: "当前已有心宠对话正在运行" }
  }
  if (availability === "checking") {
    return { canStart: false, reason: "正在检查 ClawBody 服务状态…" }
  }
  if (availability === "unavailable" || serviceState === "offline" || serviceError) {
    return { canStart: false, reason: "ClawBody 未连接，请先启动 Docker 中的 clawbody-service" }
  }
  return { canStart: true, reason: "" }
}
