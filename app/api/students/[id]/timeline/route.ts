import { NextResponse } from "next/server"
import { getStudentTimeline } from "@/app/actions/students"

/**
 * GET /api/students/[id]/timeline
 * 
 * 获取学生生命周期事件
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get("limit") || "50")
    
    const events = await getStudentTimeline(id, limit)
    return NextResponse.json({ events })
  } catch (error) {
    console.error("[API] Failed to fetch timeline:", error)
    return NextResponse.json(
      { error: "Failed to fetch timeline" },
      { status: 500 }
    )
  }
}
