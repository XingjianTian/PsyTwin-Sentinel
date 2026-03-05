"use server"

import { RiskLevel, WorkOrderStatus } from "@prisma/client"

import { prisma } from "@/lib/prisma"

export interface WorkOrderDetail {
  id: string
  studentName: string
  studentNo: string
  className: string
  trigger: string
  riskLevel: "高危" | "中危" | "低危"
  method: string
  counselor: string
  status: "已结案" | "跟进中" | "待分配" | "干预中"
  date: string
  detail: string
  summary: string
}

function mapRiskLevel(level: RiskLevel): WorkOrderDetail["riskLevel"] {
  if (level === RiskLevel.HIGH) return "高危"
  if (level === RiskLevel.MEDIUM) return "中危"
  return "低危"
}

function mapStatus(status: WorkOrderStatus): WorkOrderDetail["status"] {
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
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
    .format(date)
    .replace(/\//g, "-")
}

export async function getWorkOrderDetail(workOrderId: string): Promise<WorkOrderDetail | null> {
  if (!workOrderId) return null

  const order = await prisma.workOrder.findUnique({
    where: { id: workOrderId },
    include: {
      student: {
        select: {
          name: true,
          studentNo: true,
        },
      },
    },
  })

  if (!order) return null

  return {
    id: order.id,
    studentName: order.student.name,
    studentNo: order.student.studentNo,
    className: order.className,
    trigger: order.trigger,
    riskLevel: mapRiskLevel(order.riskLevel),
    method: order.method,
    counselor: order.counselor,
    status: mapStatus(order.status),
    date: formatDate(order.date),
    detail: order.detail ?? "暂无详情",
    summary: order.summary ?? "暂无摘要",
  }
}

export async function updateWorkOrderStatus(workOrderId: string, status: WorkOrderStatus): Promise<void> {
  if (!workOrderId) return

  await prisma.workOrder.update({
    where: { id: workOrderId },
    data: { status },
  })
}
