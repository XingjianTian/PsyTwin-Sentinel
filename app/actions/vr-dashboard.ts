"use server"

import { RiskLevel, WorkOrderStatus } from "@prisma/client"

import { prisma } from "@/lib/prisma"

export interface DashboardVrRecord {
  id: string
  name: string
  cls: string
  scene: string
  duration: string
  before: string
  after: string
  result: "positive" | "neutral"
}

export async function getDashboardVrRecords(): Promise<DashboardVrRecord[]> {
  const sessions = await prisma.vRSession.findMany({
    include: {
      student: { select: { id: true, name: true, className: true } },
      scene: { select: { name: true } },
    },
    orderBy: {
      sessionAt: "desc",
    },
    take: 20,
  })

  return sessions.map((session) => ({
    id: session.id,
    name: session.student.name,
    cls: session.student.className,
    scene: session.scene.name,
    duration: session.duration,
    before: session.emotionBefore,
    after: session.emotionAfter,
    result: session.result === "POSITIVE" ? "positive" : "neutral",
  }))
}

export async function createWorkOrderFromVrSession(sessionId: string): Promise<void> {
  if (!sessionId) return

  const session = await prisma.vRSession.findUnique({
    where: { id: sessionId },
    include: {
      student: { select: { id: true, className: true } },
      scene: { select: { name: true } },
    },
  })

  if (!session) return

  const existing = await prisma.workOrder.findFirst({
    where: {
      studentId: session.student.id,
      trigger: `VR会话复盘：${session.scene.name}`,
      status: {
        in: [WorkOrderStatus.PENDING, WorkOrderStatus.FOLLOWING, WorkOrderStatus.IN_PROGRESS],
      },
    },
  })

  if (existing) return

  await prisma.workOrder.create({
    data: {
      studentId: session.student.id,
      className: session.student.className,
      trigger: `VR会话复盘：${session.scene.name}`,
      riskLevel: session.result === "POSITIVE" ? RiskLevel.LOW : RiskLevel.MEDIUM,
      method: "线下谈话",
      counselor: "刘芳",
      status: WorkOrderStatus.PENDING,
      date: new Date(),
      detail: `来源于VR记录：体验前${session.emotionBefore}，体验后${session.emotionAfter}`,
      summary: "请辅导员复盘VR干预效果并安排后续跟进",
    },
  })
}
