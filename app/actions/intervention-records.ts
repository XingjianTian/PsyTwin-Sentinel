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

// 干预记录详情接口 - 关联 InterventionDetail 表
export interface InterventionRecordDetail extends InterventionRecordItem {
  detail: {
    // 干预前评估
    preMood?: string | null
    preAnxietyLevel?: number | null
    preDepressionLevel?: number | null
    preStressLevel?: number | null
    mainIssues?: string | null
    riskLevel?: string | null
    riskAssessment?: string | null
    // 干预过程
    sessionContent?: string | null
    techniquesUsed: string[]
    studentEngagement?: string | null
    keyPoints?: string | null
    emotionalChanges?: string | null
    // 干预效果
    postMood?: string | null
    postAnxietyLevel?: number | null
    postDepressionLevel?: number | null
    postStressLevel?: number | null
    improvementScore?: number | null
    breakthroughPoints?: string | null
    unfinishedIssues?: string | null
    // 后续建议
    followUpActions?: string | null
    nextAppointment?: string | null
    referrals?: string | null
    recommendations?: string | null
    // 其他
    privateNotes?: string | null
    attachments: string[]
    createdAt: string
    updatedAt: string
  } | null
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

// 获取干预记录详情
export async function getInterventionRecordDetail(recordId: string): Promise<InterventionRecordDetail | null> {
  if (!recordId) return null

  const record = await prisma.interventionRecord.findUnique({
    where: { id: recordId },
    include: {
      student: {
        select: {
          name: true,
          className: true,
        },
      },
      detail: true,
    },
  })

  if (!record) return null

  return {
    id: record.id,
    name: record.student.name,
    cls: record.student.className,
    type: mapInterventionType(record.type),
    counselor: record.counselor,
    duration: record.duration,
    result: record.result,
    status: mapStatus(record.status),
    date: formatDate(record.date),
    detail: record.detail ? {
      // 干预前评估
      preMood: record.detail.preMood,
      preAnxietyLevel: record.detail.preAnxietyLevel,
      preDepressionLevel: record.detail.preDepressionLevel,
      preStressLevel: record.detail.preStressLevel,
      mainIssues: record.detail.mainIssues,
      riskLevel: record.detail.riskLevel,
      riskAssessment: record.detail.riskAssessment,
      // 干预过程
      sessionContent: record.detail.sessionContent,
      techniquesUsed: record.detail.techniquesUsed || [],
      studentEngagement: record.detail.studentEngagement,
      keyPoints: record.detail.keyPoints,
      emotionalChanges: record.detail.emotionalChanges,
      // 干预效果
      postMood: record.detail.postMood,
      postAnxietyLevel: record.detail.postAnxietyLevel,
      postDepressionLevel: record.detail.postDepressionLevel,
      postStressLevel: record.detail.postStressLevel,
      improvementScore: record.detail.improvementScore,
      breakthroughPoints: record.detail.breakthroughPoints,
      unfinishedIssues: record.detail.unfinishedIssues,
      // 后续建议
      followUpActions: record.detail.followUpActions,
      nextAppointment: record.detail.nextAppointment ? formatDate(record.detail.nextAppointment) : null,
      referrals: record.detail.referrals,
      recommendations: record.detail.recommendations,
      // 其他
      privateNotes: record.detail.privateNotes,
      attachments: record.detail.attachments || [],
      createdAt: formatDate(record.detail.createdAt),
      updatedAt: formatDate(record.detail.updatedAt),
    } : null,
  }
}
