/**
 * 缓存性能监控
 * 
 * 监控缓存命中率和性能指标
 */

import { getRedis } from "./redis";

interface CacheMetrics {
  hits: number
  misses: number
  total: number
  hitRate: string
  avgLatency: number
  lastReset: Date
}

// 内存中的性能指标（会在应用重启时丢失，生产环境应该用 Redis 持久化）
let metrics: CacheMetrics = {
  hits: 0,
  misses: 0,
  total: 0,
  hitRate: "0.0%",
  avgLatency: 0,
  lastReset: new Date(),
}

let totalLatency = 0

/**
 * 记录缓存命中
 */
export function recordCacheHit(latency: number) {
  metrics.hits++
  metrics.total++
  totalLatency += latency
  updateMetrics()
}

/**
 * 记录缓存未命中
 */
export function recordCacheMiss(latency: number) {
  metrics.misses++
  metrics.total++
  totalLatency += latency
  updateMetrics()
}

/**
 * 更新指标计算
 */
function updateMetrics() {
  if (metrics.total > 0) {
    metrics.hitRate = ((metrics.hits / metrics.total) * 100).toFixed(1) + "%"
    metrics.avgLatency = Math.round(totalLatency / metrics.total)
  }
}

/**
 * 获取缓存性能指标
 */
export function getCacheMetrics(): CacheMetrics {
  return { ...metrics }
}

/**
 * 重置性能指标
 */
export function resetCacheMetrics() {
  metrics = {
    hits: 0,
    misses: 0,
    total: 0,
    hitRate: "0.0%",
    avgLatency: 0,
    lastReset: new Date(),
  }
  totalLatency = 0
}

/**
 * 获取 Redis 服务器统计信息
 */
export async function getRedisStats() {
  const redis = getRedis()
  
  try {
    const info = await redis.info()
    const stats: Record<string, string> = {}
    
    info.split("\r\n").forEach((line) => {
      if (line.includes(":")) {
        const [key, value] = line.split(":")
        stats[key] = value
      }
    })
    
    return {
      // 连接信息
      version: stats["redis_version"],
      mode: stats["redis_mode"],
      uptime: parseInt(stats["uptime_in_seconds"] || "0"),
      
      // 内存使用
      usedMemory: stats["used_memory_human"],
      peakMemory: stats["used_memory_peak_human"],
      
      // 性能指标
      totalConnections: parseInt(stats["total_connections_received"] || "0"),
      totalCommands: parseInt(stats["total_commands_processed"] || "0"),
      
      // 命中率
      keyspaceHits: parseInt(stats["keyspace_hits"] || "0"),
      keyspaceMisses: parseInt(stats["keyspace_misses"] || "0"),
      hitRate: calculateHitRate(stats),
      
      // 键数量
      keys: await redis.dbsize(),
      
      // 客户端连接数
      connectedClients: parseInt(stats["connected_clients"] || "0"),
    }
  } catch (error) {
    console.error("[CacheMonitor] 获取 Redis 统计失败:", error)
    return null
  }
}

/**
 * 计算缓存命中率
 */
function calculateHitRate(stats: Record<string, string>): string {
  const hits = parseInt(stats["keyspace_hits"] || "0")
  const misses = parseInt(stats["keyspace_misses"] || "0")
  const total = hits + misses
  
  if (total === 0) return "0.0%"
  return ((hits / total) * 100).toFixed(1) + "%"
}

/**
 * 格式化运行时间
 */
export function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  
  const parts = []
  if (days > 0) parts.push(`${days}天`)
  if (hours > 0) parts.push(`${hours}小时`)
  if (minutes > 0) parts.push(`${minutes}分钟`)
  
  return parts.join("") || "刚刚"
}
