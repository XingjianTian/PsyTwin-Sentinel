"use server"

import { RiskLevel, WorkOrderStatus } from "@prisma/client"

import { prisma } from "@/lib/prisma"

export interface InterventionWorkOrder {
  id: string
  name: string
  cls: string
  trigger: string
  riskLevel: "高危" | "中危" | "低危"
  method: string
  counselor: string
  status: "已结案" | "跟进中" | "待分配" | "干预中"
  date: string
  detail: string
}

function mapRiskLevel(level: RiskLevel): InterventionWorkOrder["riskLevel"] {
  if (level === RiskLevel.HIGH) return "高危"
  if (level === RiskLevel.MEDIUM) return "中危"
  return "低危"
}

function mapStatus(status: WorkOrderStatus): InterventionWorkOrder["status"] {
  if (status === WorkOrderStatus.COMPLETED) return "已结案"
  if (status === WorkOrderStatus.FOLLOWING) return "跟进中"
  if (status === WorkOrderStatus.IN_PROGRESS) return "干预中"
  return "待分配"
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
    .format(date)
    .replace(/\//g, "-")
}

export async function getInterventionWorkOrders(): Promise<InterventionWorkOrder[]> {
  const orders = await prisma.workOrder.findMany({
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
    cls: order.className,
    trigger: order.trigger,
    riskLevel: mapRiskLevel(order.riskLevel),
    method: order.method,
    counselor: order.counselor,
    status: mapStatus(order.status),
    date: formatDate(order.date),
    detail: order.detail ?? order.summary ?? "暂无记录",
  }))
}

export async function setInterventionStatus(workOrderId: string, status: WorkOrderStatus): Promise<void> {
  if (!workOrderId) return

  await prisma.workOrder.update({
    where: { id: workOrderId },
    data: { status },
  })
}

export async function assignInterventionCounselor(workOrderId: string, counselor: string): Promise<void> {
  if (!workOrderId || !counselor.trim()) return

  await prisma.workOrder.update({
    where: { id: workOrderId },
    data: {
      counselor: counselor.trim(),
      status: WorkOrderStatus.FOLLOWING,
    },
  })
}
