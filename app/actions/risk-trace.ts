"use server"

import { RiskLevel, WorkOrderStatus } from "@prisma/client"

import { prisma } from "@/lib/prisma"

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

export async function getRiskWorkOrders(): Promise<RiskWorkOrder[]> {
  const orders = await prisma.workOrder.findMany({
    where: {
      riskLevel: { in: [RiskLevel.HIGH, RiskLevel.MEDIUM, RiskLevel.LOW] },
      status: WorkOrderStatus.PENDING, // 只查询待处理的工单
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
}

export async function confirmIntervention(workOrderId: string): Promise<void> {
  if (!workOrderId) return

  await prisma.workOrder.update({
    where: { id: workOrderId },
    data: { status: WorkOrderStatus.IN_PROGRESS },
  })
}

export async function resolveWarning(workOrderId: string): Promise<void> {
  if (!workOrderId) return

  await prisma.workOrder.update({
    where: { id: workOrderId },
    data: { status: WorkOrderStatus.COMPLETED },
  })
}
