/**
 * 缓存性能监控 API
 * 
 * GET /api/settings/cache/metrics
 * 返回缓存命中率、延迟等指标
 */

import { NextResponse } from "next/server";
import { getCacheMetrics, getRedisStats } from "@/lib/cache-monitor";

export async function GET() {
  try {
    const [appMetrics, redisStats] = await Promise.all([
      Promise.resolve(getCacheMetrics()),
      getRedisStats(),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        application: appMetrics,
        redis: redisStats,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("[API] /api/settings/cache/metrics 错误:", error);
    return NextResponse.json(
      { error: "获取缓存指标失败" },
      { status: 500 }
    );
  }
}
