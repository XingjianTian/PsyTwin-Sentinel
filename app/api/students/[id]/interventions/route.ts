import { NextResponse } from "next/server"
import { getStudentInterventions } from "@/app/actions/students"
import { cacheAside } from "@/lib/cache"

// 缓存时间：10分钟
const CACHE_TTL = 600

/**
 * GET /api/students/[id]/interventions
 * 
 * 获取学生干预记录（带缓存）
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    
    // 生成缓存键
    const cacheKey = `student:${id}:interventions:${page}:${limit}`
    
    // 使用 Cache-Aside 模式
    const result = await cacheAside(
      cacheKey,
      async () => {
        console.log(`[Cache] 干预记录缓存未命中: studentId=${id}, page=${page}`)
        return await getStudentInterventions(id, page, limit)
      },
      CACHE_TTL
    )
    
    return NextResponse.json(result)
  } catch (error) {
    console.error("[API] Failed to fetch interventions:", error)
    return NextResponse.json(
      { error: "Failed to fetch interventions" },
      { status: 500 }
    )
  }
}
