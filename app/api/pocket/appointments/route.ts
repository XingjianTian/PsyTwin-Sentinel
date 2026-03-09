import { NextRequest } from "next/server"
import { PrismaClient, AppointmentStatus } from "@prisma/client"
const prisma = new PrismaClient()
import { successResponse, errorResponse, validationError } from "@/lib/api-response"
import { getCurrentUserId } from "@/lib/pocket-auth"
import { 
  toAppointmentDTO, 
  toTimeSlot, 
  CreateAppointmentRequest,
  AppointmentQueryParams 
} from "@/lib/pocket-dto"

/**
 * GET /api/pocket/appointments
 * 获取当前学生的预约列表
 */
export async function GET(request: NextRequest) {
  try {
    const userId = await getCurrentUserId(request)
    
    // 解析查询参数
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status") as AppointmentStatus | null
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
    
    // 转换为 DTO
    const appointmentDTOs = appointments.map(toAppointmentDTO)
    
    return Response.json(
      successResponse({
        appointments: appointmentDTOs,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      })
    )
  } catch (error) {
    console.error("获取预约列表失败:", error)
    return Response.json(errorResponse("获取预约列表失败"), { status: 500 })
  }
}

/**
 * POST /api/pocket/appointments
 * 创建预约
 */
export async function POST(request: NextRequest) {
  try {
    const userId = await getCurrentUserId(request)
    
    // 解析请求体
    const body: CreateAppointmentRequest = await request.json()
    
    // 验证必填字段
    if (!body.type || !body.date || !body.startTime || !body.endTime) {
      return Response.json(
        validationError("缺少必填字段: type, date, startTime, endTime"),
        { status: 400 }
      )
    }
    
    // 转换 time_slot
    const timeSlot = toTimeSlot(body.startTime, body.endTime)
    
    // 创建预约
    const appointment = await prisma.appointment.create({
      data: {
        studentId: userId,
        teacherId: body.teacherId || null,
        roomId: body.roomId || null,
        type: body.type,
        date: new Date(body.date),
        timeSlot,
        status: AppointmentStatus.PENDING,
        reason: body.reason || null,
        cancelReason: null,
        meetingLink: null,
        feedbackScore: null,
        feedbackContent: null,
      },
    })
    
    return Response.json(
      successResponse(
        toAppointmentDTO(appointment),
        "预约创建成功"
      ),
      { status: 201 }
    )
  } catch (error) {
    console.error("创建预约失败:", error)
    return Response.json(errorResponse("创建预约失败"), { status: 500 })
  }
}
