"use server"

import { InterventionType } from "@prisma/client"

import { prisma } from "@/lib/prisma"

export interface InterventionRecordItem {
  id: string
  name: string
  cls: string
  type: string
  counselor: string
  duration: string
  result: string
  status: string
  date: string
}

function mapInterventionType(type: InterventionType): string {
  const typeMap: Record<InterventionType, string> = {
    [InterventionType.REGULAR_INTERVIEW]: "定期面谈",
    [InterventionType.CBT_THERAPY]: "CBT治疗",
    [InterventionType.GROUP_COUNSELING]: "团体辅导",
    [InterventionType.CRISIS_INTERVENTION]: "危机干预",
    [InterventionType.INITIAL_ASSESSMENT]: "初次评估",
  }
  return typeMap[type] || type
}

function mapStatus(status: string): string {
  const statusMap: Record<string, string> = {
    "completed": "已完成",
    "in_progress": "进展中",
    "pending": "待开始",
  }
  return statusMap[status] || status
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

export async function getInterventionRecords(): Promise<InterventionRecordItem[]> {
  const records = await prisma.interventionRecord.findMany({
    include: {
      student: {
        select: {
          name: true,
          className: true,
        },
      },
    },
    orderBy: {
      date: "desc",
    },
  })

  return records.map((record) => ({
    id: record.id,
    name: record.student.name,
    cls: record.student.className,
    type: mapInterventionType(record.type),
    counselor: record.counselor,
    duration: record.duration,
    result: record.result,
    status: mapStatus(record.status),
    date: formatDate(record.date),
  }))
}

// 兼容旧接口名称
export async function getInterventionWorkOrders(): Promise<InterventionRecordItem[]> {
  return getInterventionRecords()
}

export async function setInterventionStatus(recordId: string, status: string): Promise<void> {
  if (!recordId) return

  await prisma.interventionRecord.update({
    where: { id: recordId },
    data: { status },
  })
}

export async function assignInterventionCounselor(recordId: string, counselor: string): Promise<void> {
  if (!recordId || !counselor.trim()) return

  await prisma.interventionRecord.update({
    where: { id: recordId },
    data: { counselor: counselor.trim() },
  })
}
