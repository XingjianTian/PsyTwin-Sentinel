/**
 * 缓存键管理和失效工具
 * 
 * 提供统一的缓存键生成和失效管理
 */

import { cacheDelete, cacheDeletePattern } from "./cache"

// ========== 缓存键生成器 ==========

export const CacheKeys = {
  // 学生列表
  students: {
    list: (params: {
      page?: number
      limit?: number
      search?: string
      className?: string
      riskLevel?: string
      userRole?: string
    }) => `students:list:${params.page || 1}:${params.limit || 20}:${params.search || ""}:${params.className || ""}:${params.riskLevel || ""}:${params.userRole || ""}`,
    
    detail: (id: string) => `student:${id}:detail`,
    
    interventions: (studentId: string, page?: number, limit?: number) => 
      `student:${studentId}:interventions:${page || 1}:${limit || 20}`,
    
    profile: (id: string) => `student:${id}:profile`,
    
    timeline: (id: string) => `student:${id}:timeline`,
  },
  
  // 统计数据
  stats: {
    dashboard: () => `stats:dashboard`,
    riskDistribution: () => `stats:risk:distribution`,
    interventionStats: () => `stats:intervention`,
  },
  
  // 系统设置
  settings: {
    systemStatus: () => `settings:system:status`,
    cacheInfo: () => `settings:cache:info`,
  },
}

// ========== 缓存失效工具 ==========

/**
 * 学生数据变更时失效相关缓存
 */
export async function invalidateStudentCache(studentId?: string) {
  console.log(`[Cache] 清除学生缓存${studentId ? `: ${studentId}` : "(全部列表)"}`)
  
  if (studentId) {
    // 清除特定学生的所有缓存
    await Promise.all([
      cacheDelete(CacheKeys.students.detail(studentId)),
      cacheDelete(CacheKeys.students.profile(studentId)),
      cacheDelete(CacheKeys.students.timeline(studentId)),
      cacheDeletePattern(`student:${studentId}:interventions:*`),
    ])
  }
  
  // 清除所有学生列表缓存
  await cacheDeletePattern("students:list:*")
  
  // 清除统计数据
  await invalidateStatsCache()
}

/**
 * 干预记录变更时失效相关缓存
 */
export async function invalidateInterventionCache(studentId?: string) {
  console.log(`[Cache] 清除干预记录缓存${studentId ? `: ${studentId}` : ""}`)
  
  if (studentId) {
    // 清除特定学生的干预记录缓存
    await cacheDeletePattern(`student:${studentId}:interventions:*`)
    // 同时清除学生详情（因为干预数量可能变化）
    await cacheDelete(CacheKeys.students.detail(studentId))
  } else {
    // 清除所有干预记录缓存
    await cacheDeletePattern("student:*:interventions:*")
  }
  
  // 清除统计数据
  await cacheDelete(CacheKeys.stats.interventionStats())
}

/**
 * 统计数据变更时失效
 */
export async function invalidateStatsCache() {
  console.log("[Cache] 清除统计数据缓存")
  
  await Promise.all([
    cacheDelete(CacheKeys.stats.dashboard()),
    cacheDelete(CacheKeys.stats.riskDistribution()),
    cacheDelete(CacheKeys.stats.interventionStats()),
  ])
}

/**
 * 系统设置变更时失效
 */
export async function invalidateSettingsCache() {
  console.log("[Cache] 清除系统设置缓存")
  
  await Promise.all([
    cacheDelete(CacheKeys.settings.systemStatus()),
    cacheDelete(CacheKeys.settings.cacheInfo()),
  ])
}
