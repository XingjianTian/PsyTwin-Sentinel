/**
 * 系统设置 Server Actions
 * 
 * 提供系统状态监控、缓存管理等功能
 * - 获取真实系统状态（CPU、内存、数据库、Redis）
 * - 缓存管理（清理、统计）
 * - 数据库状态检测
 */

"use server";

import { checkRedisHealth, getRedis } from "@/lib/redis";
import { getCacheInfo, cacheFlush } from "@/lib/cache";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

/**
 * 获取系统状态
 * 包含：系统信息、数据库连接、Redis 状态、资源使用
 */
export async function getSystemStatus() {
  try {
    // 1. 获取 Redis 状态
    const redisHealth = await checkRedisHealth();
    
    // 2. 获取缓存信息
    const cacheInfo = await getCacheInfo();
    
    // 3. 检查 PostgreSQL 连接
    let dbStatus = { connected: false, latency: -1 };
    try {
      const dbStart = Date.now();
      await prisma.$queryRaw`SELECT 1`;
      dbStatus = {
        connected: true,
        latency: Date.now() - dbStart,
      };
    } catch (error) {
      console.error("[SystemStatus] PostgreSQL 连接失败:", error);
    }
    
    // 4. 获取系统资源信息（Node.js 进程信息）
    const memUsage = process.memoryUsage();
    const systemResources = {
      memory: {
        used: Math.round(memUsage.heapUsed / 1024 / 1024), // MB
        total: Math.round(memUsage.heapTotal / 1024 / 1024), // MB
        usage: Math.round((memUsage.heapUsed / memUsage.heapTotal) * 100),
      },
      uptime: formatUptime(process.uptime()),
    };
    
    return {
      success: true,
      data: {
        platform: {
          name: "心图PsyTwin-校园心理健康数字孪生管理平台",
          version: process.env.npm_package_version || "v0.2.0",
          nodeVersion: process.version,
        },
        database: {
          postgresql: {
            connected: dbStatus.connected,
            latency: dbStatus.latency,
            lastBackup: null, // TODO: 从配置表读取
          },
        },
        redis: {
          connected: redisHealth.connected,
          latency: redisHealth.latency,
          hitRate: cacheInfo.hitRate,
          memory: cacheInfo.memory,
          keys: cacheInfo.keys,
        },
        resources: systemResources,
        timestamp: new Date().toISOString(),
      },
    };
  } catch (error) {
    console.error("[SystemStatus] 获取失败:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "获取系统状态失败",
    };
  }
}

/**
 * 获取缓存统计信息
 */
export async function getCacheStats() {
  try {
    const cacheInfo = await getCacheInfo();
    
    return {
      success: true,
      data: {
        keys: cacheInfo.keys,
        memory: cacheInfo.memory,
        hitRate: cacheInfo.hitRate,
        timestamp: new Date().toISOString(),
      },
    };
  } catch (error) {
    console.error("[CacheStats] 获取失败:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "获取缓存统计失败",
    };
  }
}

/**
 * 清理所有缓存
 */
export async function clearAllCache() {
  try {
    await cacheFlush();
    
    revalidatePath("/system-settings");
    
    return {
      success: true,
      message: "缓存已清空",
    };
  } catch (error) {
    console.error("[ClearCache] 失败:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "清理缓存失败",
    };
  }
}

/**
 * 测试 Redis 连接
 */
export async function testRedisConnection() {
  try {
    const redis = getRedis();
    await redis.ping();
    
    return {
      success: true,
      message: "Redis 连接正常",
    };
  } catch (error) {
    console.error("[TestRedis] 失败:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Redis 连接失败",
    };
  }
}

/**
 * 格式化运行时间
 */
function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (days > 0) {
    return `${days}天${hours}小时${minutes}分钟`;
  }
  if (hours > 0) {
    return `${hours}小时${minutes}分钟`;
  }
  return `${minutes}分钟`;
}
