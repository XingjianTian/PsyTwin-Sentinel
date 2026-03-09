"use server"

/**
 * 风险追踪相关 Server Actions
 * 
 * 提供风险工单的查询和处理功能
 * 
 * 缓存策略：
 * - getRiskWorkOrders: Cache-Aside 模式，TTL 3 分钟（高风险数据需要较频繁更新）
 * - 写操作后自动清除相关缓存
 */

import { RiskLevel, WorkOrderStatus } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { cacheAside, cacheDeletePattern } from "@/lib/cache"

export interface RiskWorkOrder {
  id: string
  name: string
  className: string
  riskType: string
  level: "high" | "medium" | "low"
  time: string
  summary: string
}

function mapRiskLevel(level: RiskLevel): RiskWorkOrder["level"] {
  if (level === RiskLevel.HIGH) return "high"
  if (level === RiskLevel.MEDIUM) return "medium"
  return "low"
}

function formatOrderTime(date: Date): string {
  return new Intl.DateTimeFormat("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date)
}

/**
 * 获取风险工单列表
 * 
 * 缓存策略：
 * - 使用 Cache-Aside 模式
 * - 缓存键：risk:workorders:pending
 * - TTL：3 分钟（风险数据需要较频繁更新）
 */
export async function getRiskWorkOrders(): Promise<RiskWorkOrder[]> {
  return cacheAside(
    "risk:workorders:pending",
    async () => {
      const orders = await prisma.workOrder.findMany({
        where: {
          riskLevel: { in: [RiskLevel.HIGH, RiskLevel.MEDIUM, RiskLevel.LOW] },
          status: WorkOrderStatus.PENDING,
        },
        include: {
          student: {
            select: {
              name: true,
            },
          },
        },
        orderBy: {
          date: "desc",
        },
      })

      return orders.map((order) => ({
        id: order.id,
        name: order.student.name,
        className: order.className,
        riskType: order.trigger,
        level: mapRiskLevel(order.riskLevel),
        time: formatOrderTime(order.date),
        summary: order.summary ?? order.detail ?? "暂无摘要",
      }))
    },
    180 // 3 分钟 TTL
  )
}

/**
 * 确认干预
 * 
 * 写操作后清除风险工单缓存
 */
export async function confirmIntervention(workOrderId: string): Promise<void> {
  if (!workOrderId) return

  await prisma.workOrder.update({
    where: { id: workOrderId },
    data: { status: WorkOrderStatus.IN_PROGRESS },
  })

  // 清除缓存
  await invalidateRiskWorkOrderCache()
}

/**
 * 解决预警
 * 
 * 写操作后清除风险工单缓存
 */
export async function resolveWarning(workOrderId: string): Promise<void> {
  if (!workOrderId) return

  await prisma.workOrder.update({
    where: { id: workOrderId },
    data: { status: WorkOrderStatus.COMPLETED },
  })

  // 清除缓存
  await invalidateRiskWorkOrderCache()
}

/**
 * 清除风险工单缓存
 */
export async function invalidateRiskWorkOrderCache(): Promise<void> {
  try {
    await cacheDeletePattern("risk:workorders:*")
    console.log("[Cache] 已清除风险工单缓存")
  } catch (error) {
    console.error("[Cache] 清除风险工单缓存失败:", error)
  }
}
