import { NextRequest, NextResponse } from "next/server"
import { getStudents } from "@/app/actions/students"

/**
 * GET /api/students
 * 
 * Query Parameters:
 * - page: 页码 (默认: 1)
 * - limit: 每页数量 (默认: 20)
 * - search: 搜索关键字 (姓名/学号)
 * - className: 班级筛选
 * - riskLevel: 风险等级筛选 (HIGH/MEDIUM/LOW)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const search = searchParams.get("search") || undefined
    const className = searchParams.get("className") || undefined
    const riskLevel = searchParams.get("riskLevel") as "HIGH" | "MEDIUM" | "LOW" | undefined

    const result = await getStudents({
      page,
      limit,
      search,
      className,
      riskLevel,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("[API] Failed to fetch students:", error)
    return NextResponse.json(
      { error: "Failed to fetch students" },
      { status: 500 }
    )
  }
}
