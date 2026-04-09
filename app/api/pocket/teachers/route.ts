import { NextRequest } from "next/server"
import { successResponse, errorResponse } from "@/lib/api-response"
import { TeacherStatus, UserRole } from "@prisma/client"
import { prisma } from "@/lib/db"

/**
 * GET /api/pocket/teachers
 * 获取咨询师列表
 */
export async function GET(request: NextRequest) {
  try {
    // 解析查询参数
    const { searchParams } = new URL(request.url)
    const department = searchParams.get("department")
    const page = parseInt(searchParams.get("page") || "1", 10)
    const limit = parseInt(searchParams.get("limit") || "20", 10)
    
    // 构建查询条件
    const where: any = {
      status: TeacherStatus.ACTIVE,
      role: {
        in: [UserRole.COUNSELOR, UserRole.TEACHER],
      },
    }
    
    if (department) {
      where.department = department
    }
    
    // 查询总数
    const total = await prisma.teacher.count({ where })
    
    // 查询教师列表
    const teachers = await prisma.teacher.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        teacherId: true,
        name: true,
        nickname: true,
        avatar: true,
        department: true,
        title: true,
        qualifications: true,
        workStats: true,
        badges: true,
        role: true,
      },
    })
    
    return Response.json(
      successResponse({
        teachers,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      })
    )
  } catch (error) {
    console.error("获取咨询师列表失败:", error)
    return Response.json(errorResponse("获取咨询师列表失败"), { status: 500 })
  }
}
