import { NextRequest } from "next/server"

import { prisma } from "@/lib/db"
import { errorResponse, notFoundError, successResponse } from "@/lib/api-response"
import { getCurrentUserId } from "@/lib/pocket-auth"

/**
 * PUT /api/pocket/student/my/notifications/:id/read
 * 标记通知为已读
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getCurrentUserId(request)
    const { id } = await params

    const notification = await prisma.studentNotification.findFirst({
      where: {
        id,
        studentId: userId,
      },
      select: {
        id: true,
        isRead: true,
      },
    })

    if (!notification) {
      return Response.json(notFoundError("通知不存在"), { status: 404 })
    }

    if (!notification.isRead) {
      await prisma.studentNotification.update({
        where: { id },
        data: {
          isRead: true,
          readAt: new Date(),
        },
      })
    }

    return Response.json(successResponse(null, "操作成功"))
  } catch (error) {
    console.error("标记通知已读失败:", error)
    return Response.json(errorResponse("操作失败"), { status: 500 })
  }
}
