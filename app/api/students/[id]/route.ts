import { NextResponse } from "next/server"
import { getStudentDetail } from "@/app/actions/students"

/**
 * GET /api/students/[id]
 * 
 * 获取单个学生详细信息
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const student = await getStudentDetail(id)
    return NextResponse.json(student)
  } catch (error) {
    console.error("[API] Failed to fetch student detail:", error)
    
    if (error instanceof Error && error.message === "Student not found") {
      return NextResponse.json(
        { error: "Student not found" },
        { status: 404 }
      )
    }
    
    return NextResponse.json(
      { error: "Failed to fetch student detail" },
      { status: 500 }
    )
  }
}
