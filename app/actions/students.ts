"use server"

/**
 * 学生档案相关 Server Actions
 * 
 * 提供学生列表、详情、生命周期事件、干预记录等数据的查询
 * 
 * 缓存策略：
 * - getStudents: Cache-Aside 模式，TTL 5 分钟
 * - getStudentDetail: Cache-Aside 模式，TTL 10 分钟
 * - getStudentTimeline: Cache-Aside 模式，TTL 3 分钟
 * - getStudentInterventions: Cache-Aside 模式，TTL 5 分钟
 */

import { prisma } from "@/lib/prisma"
import { RiskLevel, Prisma } from "@prisma/client"
import { cacheAside, cacheDelete, cacheDeletePattern } from "@/lib/cache"

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
 * 
 * 缓存策略：
 * - 使用 Cache-Aside 模式
 * - 缓存键：students:list:{page}:{limit}:{search}:{className}:{facultyId}:{riskLevel}
 * - TTL：5 分钟
 * - 搜索条件变化时自动生成不同缓存键
 */
export async function getStudents(params: GetStudentsParams = {}): Promise<GetStudentsResult> {
  const { page = 1, limit = 20, search, className, facultyId, riskLevel } = params

  // 生成缓存键
  const cacheKey = `students:list:${page}:${limit}:${search || "_"}:${className || "_"}:${facultyId || "_"}:${riskLevel || "_"}`

  return cacheAside(
    cacheKey,
    async () => {
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
    },
    300 // 5 分钟 TTL
  )
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
 * 
 * 缓存策略：
 * - 使用 Cache-Aside 模式
 * - 缓存键：students:detail:{id}
 * - TTL：10 分钟（学生详情变动较少）
 * - 更新学生信息时需手动清除缓存
 */
export async function getStudentDetail(id: string): Promise<StudentDetail> {
  const cacheKey = `students:detail:${id}`

  return cacheAside(
    cacheKey,
    async () => {
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
    },
    600 // 10 分钟 TTL
  )
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
 * 
 * 缓存策略：
 * - 使用 Cache-Aside 模式
 * - 缓存键：students:timeline:{studentId}:{limit}
 * - TTL：3 分钟（时间线数据可能较频繁更新）
 */
export async function getStudentTimeline(
  studentId: string,
  limit = 50
): Promise<TimelineEvent[]> {
  const cacheKey = `students:timeline:${studentId}:${limit}`

  return cacheAside(
    cacheKey,
    async () => {
      const events = await prisma.timelineEvent.findMany({
        where: { studentId },
        orderBy: { date: "desc" },
        take: limit,
      })

      return events.map((event) => ({
        ...event,
        status: event.status as "success" | "warning" | "active",
      }))
    },
    180 // 3 分钟 TTL
  )
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
 * 
 * 缓存策略：
 * - 使用 Cache-Aside 模式
 * - 缓存键：students:interventions:{studentId}:{page}:{limit}
 * - TTL：5 分钟
 */
export async function getStudentInterventions(
  studentId: string,
  page = 1,
  limit = 20
): Promise<{ data: InterventionRecord[]; total: number }> {
  const cacheKey = `students:interventions:${studentId}:${page}:${limit}`

  return cacheAside(
    cacheKey,
    async () => {
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
    },
    300 // 5 分钟 TTL
  )
}

/**
 * 清除学生相关缓存
 * 
 * 在学生数据更新时调用，确保数据一致性
 * 
 * @param studentId 学生ID（可选，不提供则清除所有学生列表缓存）
 */
export async function invalidateStudentCache(studentId?: string): Promise<void> {
  try {
    if (studentId) {
      // 清除特定学生的缓存
      await Promise.all([
        cacheDelete(`students:detail:${studentId}`),
        cacheDeletePattern(`students:timeline:${studentId}:*`),
        cacheDeletePattern(`students:interventions:${studentId}:*`),
      ])
      console.log(`[Cache] 已清除学生 ${studentId} 的缓存`)
    } else {
      // 清除所有学生列表缓存（保留详情缓存）
      await cacheDeletePattern("students:list:*")
      console.log("[Cache] 已清除所有学生列表缓存")
    }
  } catch (error) {
    console.error("[Cache] 清除缓存失败:", error)
  }
}

/**
 * 清除所有学生相关缓存
 * 
 * 用于批量操作或数据同步后
 */
export async function invalidateAllStudentCache(): Promise<void> {
  try {
    await cacheDeletePattern("students:*")
    console.log("[Cache] 已清除所有学生相关缓存")
  } catch (error) {
    console.error("[Cache] 清除所有缓存失败:", error)
  }
}
