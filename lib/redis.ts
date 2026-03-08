/**
 * Redis 客户端连接配置
 * 
 * 提供全局 Redis 连接实例，支持以下特性：
 * - 连接池管理
 * - 自动重连
 * - 密码认证
 * - 健康检查
 */

import Redis from "ioredis";

// Redis 连接配置
const redisConfig = {
  host: process.env.REDIS_HOST || "localhost",
  port: parseInt(process.env.REDIS_PORT || "6379"),
  password: process.env.REDIS_PASSWORD || undefined,
  db: parseInt(process.env.REDIS_DB || "0"),
  
  // 连接池配置
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  
  // 重连策略
  retryStrategy: (times: number) => {
    const delay = Math.min(times * 50, 2000);
    console.log(`[Redis] 重连尝试 ${times}，延迟 ${delay}ms`);
    return delay;
  },
  
  // 连接超时
  connectTimeout: 10000,
  
  // 保持连接
  keepAlive: 30000,
};

// 全局 Redis 实例
let redis: Redis | null = null;

/**
 * 获取 Redis 客户端实例
 * 使用单例模式，确保全局只有一个连接
 */
export function getRedis(): Redis {
  if (!redis) {
    redis = new Redis(redisConfig);
    
    // 连接事件监听
    redis.on("connect", () => {
      console.log("[Redis] 连接成功");
    });
    
    redis.on("ready", () => {
      console.log("[Redis] 准备就绪");
    });
    
    redis.on("error", (err) => {
      console.error("[Redis] 错误:", err.message);
    });
    
    redis.on("close", () => {
      console.log("[Redis] 连接关闭");
    });
    
    redis.on("reconnecting", () => {
      console.log("[Redis] 正在重连...");
    });
  }
  
  return redis;
}

/**
 * 检查 Redis 连接状态
 */
export async function checkRedisHealth(): Promise<{
  connected: boolean;
  latency: number;
  info?: Record<string, string>;
}> {
  const client = getRedis();
  const start = Date.now();
  
  try {
    await client.ping();
    const latency = Date.now() - start;
    
    // 获取 Redis 信息
    const info = await client.info();
    const infoObj: Record<string, string> = {};
    
    info.split("\r\n").forEach((line) => {
      if (line.includes(":")) {
        const [key, value] = line.split(":");
        infoObj[key] = value;
      }
    });
    
    return {
      connected: true,
      latency,
      info: {
        version: infoObj["redis_version"],
        mode: infoObj["redis_mode"],
        uptime: infoObj["uptime_in_seconds"],
        connectedClients: infoObj["connected_clients"],
        usedMemory: infoObj["used_memory_human"],
        hitRate: calculateHitRate(infoObj),
      },
    };
  } catch (error) {
    console.error("[Redis] 健康检查失败:", error);
    return {
      connected: false,
      latency: -1,
    };
  }
}

/**
 * 计算缓存命中率
 */
function calculateHitRate(info: Record<string, string>): string {
  const hits = parseInt(info["keyspace_hits"] || "0");
  const misses = parseInt(info["keyspace_misses"] || "0");
  const total = hits + misses;
  
  if (total === 0) return "0.0%";
  return ((hits / total) * 100).toFixed(1) + "%";
}

/**
 * 关闭 Redis 连接
 */
export async function closeRedis(): Promise<void> {
  if (redis) {
    await redis.quit();
    redis = null;
    console.log("[Redis] 连接已关闭");
  }
}

// 默认导出 Redis 实例
export default getRedis();
