"use server"

/**
 * 学生档案相关 Server Actions
 * 
 * 提供学生列表、详情、生命周期事件、干预记录等数据的查询
 */

import { prisma } from "@/lib/prisma"
import { RiskLevel, Prisma } from "@prisma/client"

// 注意：常量配置已迁移到 lib/student-config.ts
// 导入方式：import { riskLevelConfig, interventionTypeLabels } from "@/lib/student-config"

// 学生列表查询参数
export interface GetStudentsParams {
  page?: number
  limit?: number
  search?: string
  className?: string
  facultyId?: string
  riskLevel?: RiskLevel
}

// 学生列表返回结果
export interface GetStudentsResult {
  students: Array<{
    id: string
    name: string
    studentNo: string
    className: string
    faculty: { name: string } | null
    riskLevel: string
    mbti: string | null
    gender: string | null
    psychProfile: {
      overallScore: number
    } | null
  }>
  total: number
  page: number
  totalPages: number
}

/**
 * 获取学生列表（支持分页、搜索、筛选）
 */
export async function getStudents(params: GetStudentsParams = {}): Promise<GetStudentsResult> {
  const { page = 1, limit = 20, search, className, facultyId, riskLevel } = params

  // 构建查询条件
  const where: Prisma.StudentWhereInput = {
    AND: [
      search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { studentNo: { contains: search, mode: "insensitive" } },
            ],
          }
        : {},
      className ? { className } : {},
      facultyId ? { facultyId } : {},
      riskLevel ? { riskLevel } : {},
    ],
  }

  // 并行查询数据和总数
  const [students, total] = await Promise.all([
    prisma.student.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        faculty: { select: { name: true } },
        psychProfile: { select: { overallScore: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.student.count({ where }),
  ])

  return {
    students,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  }
}

// 学生详情返回类型
export interface StudentDetail {
  id: string
  name: string
  studentNo: string
  className: string
  gender: string | null
  birthDate: string | null
  mbti: string | null
  riskLevel: string
  faculty: {
    id: string
    name: string
  } | null
  psychProfile: {
    adversityQuotient: number
    emotionalStability: number
    socialTendency: number
    stressResistance: number
    selfAwareness: number
    empathy: number
    willpower: number
    adaptability: number
    overallScore: number
  } | null
  stats: {
    totalAlerts: number
    totalInterventions: number
    totalVRSessions: number
  }
}

/**
 * 获取单个学生完整信息
 */
export async function getStudentDetail(id: string): Promise<StudentDetail> {
  const student = await prisma.student.findUnique({
    where: { id },
    include: {
      faculty: { select: { id: true, name: true } },
      psychProfile: true,
      _count: {
        select: {
          alerts: true,
          interventionRecords: true,
          vrSessions: true,
        },
      },
    },
  })

  if (!student) {
    throw new Error("Student not found")
  }

  return {
    ...student,
    birthDate: student.birthDate?.toISOString() || null,
    stats: {
      totalAlerts: student._count.alerts,
      totalInterventions: student._count.interventionRecords,
      totalVRSessions: student._count.vrSessions,
    },
  }
}

// 生命周期事件类型
export interface TimelineEvent {
  id: string
  date: string
  title: string
  description: string
  status: "success" | "warning" | "active"
}

/**
 * 获取学生生命周期事件
 */
export async function getStudentTimeline(
  studentId: string,
  limit = 50
): Promise<TimelineEvent[]> {
  const events = await prisma.timelineEvent.findMany({
    where: { studentId },
    orderBy: { date: "desc" },
    take: limit,
  })

  return events.map((event) => ({
    ...event,
    status: event.status as "success" | "warning" | "active",
  }))
}

// 干预记录类型
export interface InterventionRecord {
  id: string
  date: string
  type: string
  counselor: string
  duration: string
  result: string
  status: string
}

/**
 * 获取学生干预记录
 */
export async function getStudentInterventions(
  studentId: string,
  page = 1,
  limit = 20
): Promise<{ data: InterventionRecord[]; total: number }> {
  const [data, total] = await Promise.all([
    prisma.interventionRecord.findMany({
      where: { studentId },
      orderBy: { date: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.interventionRecord.count({ where: { studentId } }),
  ])

  return {
    data: data.map((record) => ({
      ...record,
      date: record.date.toISOString(),
    })),
    total,
  }
}
