import { NextRequest } from "next/server"
import { PrismaClient } from "@prisma/client"
import { successResponse, errorResponse } from "@/lib/api-response"
import { getCurrentUserId } from "@/lib/pocket-auth"
import { toAppointmentDTO } from "@/lib/pocket-dto"

const prisma = new PrismaClient()

/**
 * GET /api/pocket/student/appointment/records
 * 获取我的预约记录列表
 */
export async function GET(request: NextRequest) {
  try {
    const userId = await getCurrentUserId(request)

    // 解析查询参数
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const page = parseInt(searchParams.get("page") || "1", 10)
    const limit = parseInt(searchParams.get("limit") || "20", 10)

    // 构建查询条件
    const where: any = { studentId: userId }
    if (status) {
      where.status = status
    }

    // 查询总数
    const total = await prisma.appointment.count({ where })

    // 查询预约列表
    const appointments = await prisma.appointment.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    })

    return Response.json(
      successResponse({
        records: appointments.map(toAppointmentDTO),
        total,
        page,
        totalPages: Math.ceil(total / limit),
      })
    )
  } catch (error: any) {
    console.error("获取预约记录失败:", error)
    return Response.json(errorResponse("获取预约记录失败"), { status: 500 })
  }
}
