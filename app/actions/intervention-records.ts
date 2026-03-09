"use server"

/**
 * 干预记录相关 Server Actions
 * 
 * 提供干预记录的查询、状态更新、辅导员分配等功能
 * 
 * 缓存策略：
 * - getInterventionRecords: Cache-Aside 模式，TTL 5 分钟
 * - getInterventionRecordDetail: Cache-Aside 模式，TTL 10 分钟
 * - 写操作后自动清除相关缓存
 */

import { InterventionType } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { cacheAside, cacheDelete, cacheDeletePattern } from "@/lib/cache"

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

/**
 * 获取所有干预记录列表
 * 
 * 缓存策略：
 * - 使用 Cache-Aside 模式
 * - 缓存键：interventions:list:all
 * - TTL：5 分钟
 */
export async function getInterventionRecords(): Promise<InterventionRecordItem[]> {
  return cacheAside(
    "interventions:list:all",
    async () => {
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
    },
    300 // 5 分钟 TTL
  )
}

// 兼容旧接口名称
export async function getInterventionWorkOrders(): Promise<InterventionRecordItem[]> {
  return getInterventionRecords()
}

/**
 * 更新干预记录状态
 * 
 * 写操作后自动清除相关缓存，确保数据一致性
 */
export async function setInterventionStatus(recordId: string, status: string): Promise<void> {
  if (!recordId) return

  await prisma.interventionRecord.update({
    where: { id: recordId },
    data: { status },
  })

  // 清除缓存，确保下次读取获取最新数据
  await invalidateInterventionCache(recordId)
}

/**
 * 分配干预辅导员
 * 
 * 写操作后自动清除相关缓存
 */
export async function assignInterventionCounselor(recordId: string, counselor: string): Promise<void> {
  if (!recordId || !counselor.trim()) return

  await prisma.interventionRecord.update({
    where: { id: recordId },
    data: { counselor: counselor.trim() },
  })

  // 清除缓存
  await invalidateInterventionCache(recordId)
}

/**
 * 获取干预记录详情
 * 
 * 缓存策略：
 * - 使用 Cache-Aside 模式
 * - 缓存键：interventions:detail:{recordId}
 * - TTL：10 分钟（详情数据变动较少）
 */
export async function getInterventionRecordDetail(recordId: string): Promise<InterventionRecordDetail | null> {
  if (!recordId) return null

  return cacheAside(
    `interventions:detail:${recordId}`,
    async () => {
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
    },
    600 // 10 分钟 TTL
  )
}

/**
 * 清除干预记录相关缓存
 * 
 * @param recordId 记录ID（可选，不提供则清除列表缓存）
 */
export async function invalidateInterventionCache(recordId?: string): Promise<void> {
  try {
    if (recordId) {
      // 清除特定记录的缓存
      await Promise.all([
        cacheDelete(`interventions:detail:${recordId}`),
        cacheDelete("interventions:list:all"),
      ])
      console.log(`[Cache] 已清除干预记录 ${recordId} 的缓存`)
    } else {
      // 清除所有干预记录缓存
      await cacheDeletePattern("interventions:*")
      console.log("[Cache] 已清除所有干预记录缓存")
    }
  } catch (error) {
    console.error("[Cache] 清除干预记录缓存失败:", error)
  }
}
