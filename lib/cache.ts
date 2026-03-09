/**
 * 缓存工具函数
 * 
 * 提供统一的缓存操作接口，支持：
 * - 基础缓存操作（get/set/delete）
 * - 自动序列化/反序列化
 * - TTL 过期控制
 * - 缓存模式（Cache-Aside, Write-Through）
 * - 批量操作
 */

import { getRedis } from "./redis";
import { recordCacheHit, recordCacheMiss } from "./cache-monitor";

// 默认缓存时间（秒）
const DEFAULT_TTL = 300; // 5分钟

// 缓存键前缀
const CACHE_PREFIX = "psytwin:";

/**
 * 生成带前缀的缓存键
 */
function generateKey(key: string): string {
  return `${CACHE_PREFIX}${key}`;
}

/**
 * 获取缓存值
 * @param key 缓存键
 * @returns 缓存值或 null
 */
export async function cacheGet<T>(key: string): Promise<T | null> {
  const redis = getRedis();
  const fullKey = generateKey(key);
  
  try {
    const value = await redis.get(fullKey);
    if (!value) return null;
    
    return JSON.parse(value) as T;
  } catch (error) {
    console.error(`[Cache] 获取失败 [${key}]:`, error);
    return null;
  }
}

/**
 * 设置缓存值
 * @param key 缓存键
 * @param value 缓存值
 * @param ttl 过期时间（秒），默认 300 秒
 */
export async function cacheSet<T>(
  key: string,
  value: T,
  ttl: number = DEFAULT_TTL
): Promise<void> {
  const redis = getRedis();
  const fullKey = generateKey(key);
  
  try {
    const serialized = JSON.stringify(value);
    await redis.setex(fullKey, ttl, serialized);
  } catch (error) {
    console.error(`[Cache] 设置失败 [${key}]:`, error);
  }
}

/**
 * 删除缓存
 * @param key 缓存键
 */
export async function cacheDelete(key: string): Promise<void> {
  const redis = getRedis();
  const fullKey = generateKey(key);
  
  try {
    await redis.del(fullKey);
  } catch (error) {
    console.error(`[Cache] 删除失败 [${key}]:`, error);
  }
}

/**
 * 批量删除缓存（支持通配符）
 * @param pattern 匹配模式，如 "students:*"
 */
export async function cacheDeletePattern(pattern: string): Promise<void> {
  const redis = getRedis();
  const fullPattern = generateKey(pattern);
  
  try {
    const keys = await redis.keys(fullPattern);
    if (keys.length > 0) {
      await redis.del(...keys);
      console.log(`[Cache] 批量删除 ${keys.length} 个键`);
    }
  } catch (error) {
    console.error(`[Cache] 批量删除失败 [${pattern}]:`, error);
  }
}

/**
 * 清空所有缓存
 */
export async function cacheFlush(): Promise<void> {
  const redis = getRedis();
  
  try {
    // 只删除带前缀的键
    const keys = await redis.keys(`${CACHE_PREFIX}*`);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
    console.log(`[Cache] 已清空 ${keys.length} 个缓存键`);
  } catch (error) {
    console.error("[Cache] 清空失败:", error);
  }
}

/**
 * 获取缓存信息
 */
export async function getCacheInfo(): Promise<{
  keys: number;
  memory: string;
  hitRate: string;
}> {
  const redis = getRedis();
  
  try {
    const keys = await redis.dbsize();
    const info = await redis.info("memory");
    const stats = await redis.info("stats");
    
    // 解析内存使用
    const memoryMatch = info.match(/used_memory_human:(.+)/);
    const memory = memoryMatch ? memoryMatch[1].trim() : "0B";
    
    // 解析命中率
    const hitsMatch = stats.match(/keyspace_hits:(\d+)/);
    const missesMatch = stats.match(/keyspace_misses:(\d+)/);
    const hits = hitsMatch ? parseInt(hitsMatch[1]) : 0;
    const misses = missesMatch ? parseInt(missesMatch[1]) : 0;
    const total = hits + misses;
    const hitRate = total > 0 ? ((hits / total) * 100).toFixed(1) + "%" : "0.0%";
    
    return { keys, memory, hitRate };
  } catch (error) {
    console.error("[Cache] 获取信息失败:", error);
    return { keys: 0, memory: "0B", hitRate: "0.0%" };
  }
}

/**
 * Cache-Aside 模式：先读缓存，未命中则读数据库并写入缓存
 * @param key 缓存键
 * @param fetcher 数据获取函数
 * @param ttl 过期时间
 */
export async function cacheAside<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = DEFAULT_TTL
): Promise<T> {
  const start = Date.now();
  
  // 1. 尝试从缓存读取
  const cached = await cacheGet<T>(key);
  if (cached !== null) {
    const latency = Date.now() - start;
    recordCacheHit(latency);
    console.log(`[Cache] 命中: ${key} (${latency}ms)`);
    return cached;
  }
  
  // 2. 缓存未命中，从数据库获取
  console.log(`[Cache] 未命中: ${key}，从数据库获取`);
  const data = await fetcher();
  
  // 3. 写入缓存
  await cacheSet(key, data, ttl);
  
  const latency = Date.now() - start;
  recordCacheMiss(latency);
  console.log(`[Cache] 已写入: ${key} (总耗时 ${latency}ms)`);
  
  return data;
}
