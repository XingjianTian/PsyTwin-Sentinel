import { NextRequest } from "next/server"
import { PrismaClient } from "@prisma/client"
import { successResponse, errorResponse, notFoundError, validationError } from "@/lib/api-response"
import { getCurrentUserId } from "@/lib/pocket-auth"
import { toAppointmentDTO, UpdateAppointmentRequest } from "@/lib/pocket-dto"

const prisma = new PrismaClient()

/**
 * GET /api/pocket/appointments/:id
 * 获取预约详情
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getCurrentUserId(request)
    const { id } = await params
    
    // 查询预约
    const appointment = await prisma.appointment.findFirst({
      where: {
        id,
        studentId: userId, // 只能查看自己的预约
      },
    })
    
    if (!appointment) {
      return Response.json(notFoundError("预约不存在"), { status: 404 })
    }
    
    return Response.json(successResponse(toAppointmentDTO(appointment)))
  } catch (error: any) {
    console.error("获取预约详情失败:", error)
    return Response.json(errorResponse("获取预约详情失败"), { status: 500 })
  }
}

/**
 * PATCH /api/pocket/appointments/:id
 * 更新预约（取消、评价等）
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getCurrentUserId(request)
    const { id } = await params
    
    // 检查预约是否存在且属于当前用户
    const existingAppointment = await prisma.appointment.findFirst({
      where: {
        id,
        studentId: userId,
      },
    })
    
    if (!existingAppointment) {
      return Response.json(notFoundError("预约不存在"), { status: 404 })
    }
    
    // 解析请求体
    const body: UpdateAppointmentRequest = await request.json()
    
    // 构建更新数据
    const updateData: any = {}
    
    if (body.status !== undefined) {
      updateData.status = body.status
    }
    
    if (body.cancelReason !== undefined) {
      updateData.cancelReason = body.cancelReason
    }
    
    if (body.meetingLink !== undefined) {
      updateData.meetingLink = body.meetingLink
    }
    
    if (body.feedbackScore !== undefined) {
      // 验证评分范围 1-5
      if (body.feedbackScore < 1 || body.feedbackScore > 5) {
        return Response.json(
          validationError("评价分数必须在 1-5 之间"),
          { status: 400 }
        )
      }
      updateData.feedbackScore = body.feedbackScore
    }
    
    if (body.feedbackContent !== undefined) {
      updateData.feedbackContent = body.feedbackContent
    }
    
    // 更新预约
    const appointment = await prisma.appointment.update({
      where: { id },
      data: updateData,
    })
    
    return Response.json(
      successResponse(toAppointmentDTO(appointment), "预约更新成功")
    )
  } catch (error: any) {
    console.error("更新预约失败:", error)
    return Response.json(errorResponse("更新预约失败"), { status: 500 })
  }
}
