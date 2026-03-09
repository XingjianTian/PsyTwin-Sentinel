"use server"

/**
 * VR 仪表盘相关 Server Actions
 * 
 * 提供 VR 会话记录查询和工单创建功能
 * 
 * 缓存策略：
 * - getDashboardVrRecords: Cache-Aside 模式，TTL 2 分钟（仪表盘数据需要实时性）
 */

import { RiskLevel, WorkOrderStatus } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { cacheAside, cacheDeletePattern } from "@/lib/cache"

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

/**
 * 获取 VR 会话记录（仪表盘展示）
 * 
 * 缓存策略：
 * - 使用 Cache-Aside 模式
 * - 缓存键：vr:dashboard:records
 * - TTL：2 分钟（仪表盘数据需要较好实时性）
 */
export async function getDashboardVrRecords(): Promise<DashboardVrRecord[]> {
  return cacheAside(
    "vr:dashboard:records",
    async () => {
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
    },
    120 // 2 分钟 TTL
  )
}

/**
 * 从 VR 会话创建工单
 * 
 * 写操作后清除 VR 记录缓存
 */
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
        in: [WorkOrderStatus.PENDING, WorkOrderStatus.IN_PROGRESS],
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

  // 清除 VR 记录缓存
  try {
    await cacheDeletePattern("vr:dashboard:*")
    console.log("[Cache] 已清除 VR 仪表盘缓存")
  } catch (error) {
    console.error("[Cache] 清除 VR 缓存失败:", error)
  }
}
