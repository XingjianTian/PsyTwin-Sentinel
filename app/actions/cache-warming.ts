"use server"

/**
 * 缓存预热服务
 * 
 * 在应用启动时预加载热点数据到 Redis 缓存
 * 提高首次访问的响应速度
 */

import { prisma } from "@/lib/prisma"
import { cacheSet } from "@/lib/cache"
import { RiskLevel } from "@prisma/client"

/**
 * 预热所有热点数据
 * 
 * 在应用启动时调用，并行加载各类热点数据
 */
export async function warmAllCaches(): Promise<{
  success: boolean
  results: Record<string, { count: number; error?: string }>
}> {
  console.log("[CacheWarming] 开始缓存预热...")
  const startTime = Date.now()

  const results: Record<string, { count: number; error?: string }> = {}

  // 并行预热各类数据
  const warmingTasks = [
    warmStudents().then((r) => (results["students"] = r)),
    warmRiskWorkOrders().then((r) => (results["riskWorkOrders"] = r)),
    warmInterventionRecords().then((r) => (results["interventionRecords"] = r)),
    warmDashboardStats().then((r) => (results["dashboardStats"] = r)),
  ]

  await Promise.allSettled(warmingTasks)

  const duration = Date.now() - startTime
  console.log(`[CacheWarming] 缓存预热完成，耗时 ${duration}ms`)

  return {
    success: true,
    results,
  }
}

/**
 * 预热学生列表数据
 * 
 * 缓存：
 * - 第一页学生列表（默认筛选）
 * - 高风险学生列表
 */
async function warmStudents(): Promise<{ count: number; error?: string }> {
  try {
    // 预热默认学生列表（第一页）
    const defaultStudents = await prisma.student.findMany({
      take: 20,
      include: {
        faculty: { select: { name: true } },
        psychProfile: { select: { overallScore: true } },
      },
      orderBy: { createdAt: "desc" },
    })

    const defaultTotal = await prisma.student.count()

    await cacheSet(
      "students:list:1:20:_:_:_:",
      {
        students: defaultStudents,
        total: defaultTotal,
        page: 1,
        totalPages: Math.ceil(defaultTotal / 20),
      },
      300
    )

    // 预热高风险学生列表
    const highRiskStudents = await prisma.student.findMany({
      where: { riskLevel: RiskLevel.HIGH },
      take: 20,
      include: {
        faculty: { select: { name: true } },
        psychProfile: { select: { overallScore: true } },
      },
      orderBy: { createdAt: "desc" },
    })

    const highRiskTotal = await prisma.student.count({
      where: { riskLevel: RiskLevel.HIGH },
    })

    await cacheSet(
      "students:list:1:20:_:_:_:HIGH",
      {
        students: highRiskStudents,
        total: highRiskTotal,
        page: 1,
        totalPages: Math.ceil(highRiskTotal / 20),
      },
      300
    )

    console.log(`[CacheWarming] 学生列表预热完成: ${defaultStudents.length} 默认 + ${highRiskStudents.length} 高风险`)

    return { count: defaultStudents.length + highRiskStudents.length }
  } catch (error) {
    console.error("[CacheWarming] 学生列表预热失败:", error)
    return { count: 0, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

/**
 * 预热风险工单数据
 */
async function warmRiskWorkOrders(): Promise<{ count: number; error?: string }> {
  try {
    const { WorkOrderStatus } = await import("@prisma/client")
    
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

    const formattedOrders = orders.map((order) => ({
      id: order.id,
      name: order.student.name,
      className: order.className,
      riskType: order.trigger,
      level: order.riskLevel === RiskLevel.HIGH ? "high" : order.riskLevel === RiskLevel.MEDIUM ? "medium" : "low",
      time: new Intl.DateTimeFormat("zh-CN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }).format(order.date),
      summary: order.summary ?? order.detail ?? "暂无摘要",
    }))

    await cacheSet("risk:workorders:pending", formattedOrders, 180)

    console.log(`[CacheWarming] 风险工单预热完成: ${orders.length} 条`)

    return { count: orders.length }
  } catch (error) {
    console.error("[CacheWarming] 风险工单预热失败:", error)
    return { count: 0, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

/**
 * 预热干预记录数据
 */
async function warmInterventionRecords(): Promise<{ count: number; error?: string }> {
  try {
    const { InterventionType } = await import("@prisma/client")
    
    const typeMap: Record<InterventionType, string> = {
      [InterventionType.REGULAR_INTERVIEW]: "定期面谈",
      [InterventionType.CBT_THERAPY]: "CBT治疗",
      [InterventionType.GROUP_COUNSELING]: "团体辅导",
      [InterventionType.CRISIS_INTERVENTION]: "危机干预",
      [InterventionType.INITIAL_ASSESSMENT]: "初次评估",
    }

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
      take: 50,
    })

    const formattedRecords = records.map((record) => ({
      id: record.id,
      name: record.student.name,
      cls: record.student.className,
      type: typeMap[record.type] || record.type,
      counselor: record.counselor,
      duration: record.duration,
      result: record.result,
      status: record.status === "completed" ? "已完成" : record.status === "in_progress" ? "进展中" : "待开始",
      date: new Intl.DateTimeFormat("zh-CN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })
        .format(record.date)
        .replace(/\//g, "-"),
    }))

    await cacheSet("interventions:list:all", formattedRecords, 300)

    console.log(`[CacheWarming] 干预记录预热完成: ${records.length} 条`)

    return { count: records.length }
  } catch (error) {
    console.error("[CacheWarming] 干预记录预热失败:", error)
    return { count: 0, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

/**
 * 预热仪表盘统计数据
 */
async function warmDashboardStats(): Promise<{ count: number; error?: string }> {
  try {
    // 获取各类统计数据
    const [
      totalStudents,
      highRiskCount,
      pendingOrders,
      todayAlerts,
    ] = await Promise.all([
      prisma.student.count(),
      prisma.student.count({ where: { riskLevel: RiskLevel.HIGH } }),
      prisma.workOrder.count({ where: { status: "PENDING" as const } }),
      prisma.alert.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
          },
        },
      }),
    ])

    const stats = {
      totalStudents,
      highRiskCount,
      pendingOrders,
      todayAlerts,
      updatedAt: new Date().toISOString(),
    }

    await cacheSet("dashboard:stats:overview", stats, 120)

    console.log(`[CacheWarming] 仪表盘统计预热完成`)

    return { count: 4 }
  } catch (error) {
    console.error("[CacheWarming] 仪表盘统计预热失败:", error)
    return { count: 0, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

/**
 * 按需预热特定学生的数据
 * 
 * 在学生详情页访问前调用
 */
export async function warmStudentDetail(studentId: string): Promise<boolean> {
  try {
    const student = await prisma.student.findUnique({
      where: { id: studentId },
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

    if (!student) return false

    const studentDetail = {
      ...student,
      birthDate: student.birthDate?.toISOString() || null,
      stats: {
        totalAlerts: student._count.alerts,
        totalInterventions: student._count.interventionRecords,
        totalVRSessions: student._count.vrSessions,
      },
    }

    await cacheSet(`students:detail:${studentId}`, studentDetail, 600)

    console.log(`[CacheWarming] 学生详情预热完成: ${studentId}`)

    return true
  } catch (error) {
    console.error(`[CacheWarming] 学生详情预热失败 ${studentId}:`, error)
    return false
  }
}
