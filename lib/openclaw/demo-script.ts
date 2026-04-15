import { prisma } from "@/lib/prisma"
import { AGENTS } from "@/lib/openclaw/agents.config"
import { OPENCLAW_EVENTS, openClawEventBus } from "@/lib/openclaw/event-bus"

const db = prisma as any

export const OPENCLAW_COMPLEX_DEMO_MESSAGE =
  "现在你需要统计本月心理状况不佳学生列表，并且给他们发送温馨通知。请调动DBA让它搜索数据，调动分析师让它来分析，让咨询师待命等待学生接入(因为学生收到通知后他很有可能被需要)"

const DEMO_TASK_TITLE = "本月心理状况不佳学生筛查与温馨通知联动"
const DEMO_TASK_DETAIL = "演示模式：检索学生名单、生成风险分析、准备通知话术并安排咨询师待命。"
const DEMO_NOTIFICATION_TARGET_PHONE = "13800138001"
const DEMO_NOTIFICATION_TITLE = "💚 温馨提醒"
const DEMO_NOTIFICATION_CONTENT =
  "亲爱的小明，最近学习压力大吗？如果感到焦虑或疲惫，可以来和我们的线上咨询师聊聊天，也可以预约没课的时间来线下体验VR游戏和AI咨询服务哦。"

type DemoContext = {
  requestId: string
  agentId: string
}

type WorkflowEventInput = {
  requestId: string
  taskId?: string
  agentId?: string
  type: string
  state?: string
  message: string
  payload?: Record<string, unknown>
}

function nowTime(date = new Date()) {
  return date.toLocaleTimeString("zh-CN", { hour12: false })
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function getAgentMeta(agentId?: string | null) {
  if (!agentId) {
    return {
      name: "系统",
      color: "#64748b",
    }
  }

  const meta = AGENTS[agentId as keyof typeof AGENTS]
  return {
    name: meta?.name || agentId,
    color: meta?.color || "#64748b",
  }
}

function toRequestPayload(item: any) {
  const agentMeta = getAgentMeta(item.assignedAgentId)
  return {
    id: item.id,
    runId: item.runId,
    content: item.content,
    state: item.state.toLowerCase(),
    assignedTo: item.assignedAgentId,
    agentName: agentMeta.name,
    agentColor: agentMeta.color,
    createdAt: item.createdAt.getTime(),
    completedAt: item.completedAt?.getTime() || null,
    result: item.result,
  }
}

function toTaskPayload(item: any) {
  const agentMeta = getAgentMeta(item.assignedAgentId)
  return {
    id: item.id,
    requestId: item.requestId,
    title: item.title,
    detail: item.detail,
    status: item.status.toLowerCase(),
    assignedAgent: item.assignedAgentId,
    agentName: agentMeta.name,
    createdAt: item.createdAt.getTime(),
    startedAt: item.startedAt?.getTime() || null,
    completedAt: item.completedAt?.getTime() || null,
    result: item.result,
  }
}

// 演示模式要同时驱动数据库快照和 SSE 事件流，保证右侧动态区域与真实链路保持一致。
async function emitWorkflowEvent(input: WorkflowEventInput) {
  const eventTime = new Date()
  const event = await db.openClawEvent.create({
    data: {
      requestId: input.requestId,
      taskId: input.taskId,
      agentId: input.agentId,
      type: input.type,
      state: input.state,
      message: input.message,
      payload: input.payload,
      eventTime,
    },
  })

  const agentMeta = getAgentMeta(input.agentId)
  await openClawEventBus.emit(OPENCLAW_EVENTS.WORKFLOW_EVENT, {
    id: event.id,
    requestId: input.requestId,
    taskId: input.taskId,
    agentId: input.agentId,
    agentName: agentMeta.name,
    agentColor: agentMeta.color,
    state: input.state?.toLowerCase() || "in_progress",
    message: input.message,
    time: nowTime(eventTime),
    timestamp: eventTime.getTime(),
    type: input.type,
    payload: input.payload,
  })
}

async function updateRequestState(
  requestId: string,
  data: {
    state: string
    assignedAgentId?: string | null
    startedAt?: Date | null
    completedAt?: Date | null
    result?: string | null
  }
) {
  const item = await db.openClawRequest.update({
    where: { id: requestId },
    data,
  })

  await openClawEventBus.emit(OPENCLAW_EVENTS.REQUEST_UPDATE, toRequestPayload(item))
  return item
}

async function upsertTaskState(
  requestId: string,
  data: {
    status: string
    assignedAgentId?: string | null
    startedAt?: Date | null
    completedAt?: Date | null
    result?: string | null
  }
) {
  const task = await db.openClawTask.upsert({
    where: { requestId },
    create: {
      requestId,
      title: DEMO_TASK_TITLE,
      detail: DEMO_TASK_DETAIL,
      status: data.status,
      assignedAgentId: data.assignedAgentId || "main",
      startedAt: data.startedAt || null,
      completedAt: data.completedAt || null,
      result: data.result || null,
    },
    update: {
      title: DEMO_TASK_TITLE,
      detail: DEMO_TASK_DETAIL,
      status: data.status,
      assignedAgentId: data.assignedAgentId,
      startedAt: data.startedAt,
      completedAt: data.completedAt,
      result: data.result,
    },
  })

  await openClawEventBus.emit(OPENCLAW_EVENTS.TASK_UPDATE, toTaskPayload(task))
  return task
}

async function createDemoNotifications() {
  const student = await db.student.findFirst({
    where: { phone: DEMO_NOTIFICATION_TARGET_PHONE },
    select: { id: true, name: true, phone: true },
  })

  if (!student) {
    return {
      count: 0,
      studentName: null,
      studentPhone: DEMO_NOTIFICATION_TARGET_PHONE,
    }
  }

  await db.studentNotification.create({
    data: {
      studentId: student.id,
      type: "SYSTEM",
      title: DEMO_NOTIFICATION_TITLE,
      content: DEMO_NOTIFICATION_CONTENT,
      actionUrl: "",
      isRead: false,
    },
  })

  return {
    count: 1,
    studentName: student.name,
    studentPhone: student.phone,
  }
}

export function isOpenClawDemoRequest(agentId: string, message: string) {
  return agentId === "main" && message.trim() === OPENCLAW_COMPLEX_DEMO_MESSAGE
}

export async function runOpenClawDemoWorkflow({ requestId, agentId }: DemoContext) {
  const startedAt = new Date()

  await sleep(1600)
  await updateRequestState(requestId, {
    state: "ANALYZING",
    startedAt,
    assignedAgentId: agentId,
  })
  await emitWorkflowEvent({
    requestId,
    agentId: "main",
    type: "lifecycle.start",
    state: "analyzing",
    message: "小芯已完成任务拆解，准备联动 DBA、分析师和咨询师执行本轮演示流程。",
  })

  await sleep(1800)
  const task = await upsertTaskState(requestId, {
    status: "PENDING",
    assignedAgentId: "main",
    startedAt,
  })
  await updateRequestState(requestId, {
    state: "TASK_CREATED",
    assignedAgentId: "main",
    startedAt,
  })
  await emitWorkflowEvent({
    requestId,
    taskId: task.id,
    agentId: "main",
    type: "dispatch.created",
    state: "in_progress",
    message: "已创建联动任务：先检索本月心理波动名单，再输出风险摘要，最后准备温馨通知与咨询接入。",
  })

  await sleep(1800)
  await upsertTaskState(requestId, {
    status: "ASSIGNED",
    assignedAgentId: "DBA",
    startedAt,
  })
  await updateRequestState(requestId, {
    state: "ASSIGNED",
    assignedAgentId: "DBA",
    startedAt,
  })
  await emitWorkflowEvent({
    requestId,
    taskId: task.id,
    agentId: "main",
    type: "dispatch.start",
    state: "in_progress",
    message: "第一阶段已下发给 DBA，正在检索本月心理状况不佳学生名单与基础画像。",
  })

  await sleep(2600)
  await emitWorkflowEvent({
    requestId,
    taskId: task.id,
    agentId: "DBA",
    type: "subagent.response",
    state: "completed",
    message: "DBA 回传：已筛出 10 名心理波动明显学生，其中 4 名连续 7 天睡眠质量偏低，3 名近期压力指数持续高于阈值，名单与基础画像已整理完成。",
  })

  await sleep(2200)
  await upsertTaskState(requestId, {
    status: "IN_PROGRESS",
    assignedAgentId: "Analyst",
    startedAt,
  })
  await updateRequestState(requestId, {
    state: "IN_PROGRESS",
    assignedAgentId: "Analyst",
    startedAt,
  })
  await emitWorkflowEvent({
    requestId,
    taskId: task.id,
    agentId: "Analyst",
    type: "subagent.response",
    state: "completed",
    message: "分析师回传：已完成风险分层，高关注 3 人、中关注 4 人、持续观察 3 人，建议本轮先发送温馨通知，并为高关注学生预留人工复核入口。",
  })

  await sleep(2200)
  await emitWorkflowEvent({
    requestId,
    taskId: task.id,
    agentId: "Therapist",
    type: "subagent.response",
    state: "completed",
    message: "咨询师回传：温馨通知话术与接待预案已准备完毕，线上咨询师已待命，若学生收到通知后主动接入，可立即进入初筛问答与预约引导。",
  })

  await sleep(1200)
  const notificationResult = await createDemoNotifications()
  await emitWorkflowEvent({
    requestId,
    taskId: task.id,
    agentId: "Therapist",
    type: "pocket.completed",
    state: "completed",
    message:
      notificationResult.count > 0
        ? `温馨通知已写入数据库，已向 ${notificationResult.studentName || "目标学生"}（${notificationResult.studentPhone}）创建 1 条未读通知，可直接用于小程序侧演示。`
        : `未找到手机号为 ${notificationResult.studentPhone} 的学生，通知写库步骤已跳过。`,
    payload: {
      notificationCount: notificationResult.count,
      studentPhone: notificationResult.studentPhone,
      studentName: notificationResult.studentName,
    },
  })

  await sleep(1600)
  await updateRequestState(requestId, {
    state: "REVIEWING",
    assignedAgentId: "main",
    startedAt,
  })
  await emitWorkflowEvent({
    requestId,
    taskId: task.id,
    agentId: "main",
    type: "lifecycle.review",
    state: "analyzing",
    message: "小芯正在汇总子代理结果，生成演示版总览结论并同步到指挥中心。",
  })

  const finalResponse = `收到，演示链路已按预设流程完成。\n\n🛡️ **PsyTwin 全链路任务执行中（演示脚本）**\n\n| 子系统 | 状态 | 结果 |\n|--------|------|------|\n| **DBA** | ✅ 已完成 | 已筛出 10 名心理波动明显学生 |\n| **分析师** | ✅ 已完成 | 完成高 / 中 / 观察三级风险分层 |\n| **咨询师** | ✅ 已待命 | 通知话术、接待预案与小明通知写库已完成 |\n\n**演示结论**\n- 建议先批量发送温馨通知，观察学生是否主动接入。\n- 对高关注学生保留人工复核窗口，必要时直接转入咨询师跟进。\n- 本轮演示会在结束阶段固定向手机号 ${notificationResult.studentPhone} 的学生追加 1 条未读 student_notifications 记录，便于小程序侧直接展示。\n- 当前页面动态为演示脚本驱动，适合现场展示，不依赖真实网关即时响应。\n\n如果需要，我可以继续模拟“学生收到通知后接入咨询师”的下一段演示。`

  const completedAt = new Date()
  await upsertTaskState(requestId, {
    status: "COMPLETED",
    assignedAgentId: "main",
    startedAt,
    completedAt,
    result: finalResponse.slice(0, 200),
  })
  await updateRequestState(requestId, {
    state: "COMPLETED",
    assignedAgentId: "main",
    startedAt,
    completedAt,
    result: finalResponse.slice(0, 200),
  })
  await emitWorkflowEvent({
    requestId,
    taskId: task.id,
    agentId: "main",
    type: "response.completed",
    state: "completed",
    message:
      notificationResult.count > 0
        ? `演示任务已完成：名单检索、风险分析与小明通知写库已全部收敛，本轮已向 ${notificationResult.studentPhone} 写入 1 条通知。`
        : `演示任务已完成，但未找到手机号 ${notificationResult.studentPhone} 对应学生，通知未写入。`,
  })

  return finalResponse
}
