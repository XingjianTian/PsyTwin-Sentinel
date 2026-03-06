import { NextResponse } from "next/server"
import { getStudentInterventions } from "@/app/actions/students"

/**
 * GET /api/students/[id]/interventions
 * 
 * 获取学生干预记录
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
    
    const result = await getStudentInterventions(id, page, limit)
    return NextResponse.json(result)
  } catch (error) {
    console.error("[API] Failed to fetch interventions:", error)
    return NextResponse.json(
      { error: "Failed to fetch interventions" },
      { status: 500 }
    )
  }
}
