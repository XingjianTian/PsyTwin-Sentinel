import { NextRequest } from "next/server"
import { PrismaClient } from "@prisma/client"
import { successResponse, errorResponse, notFoundError } from "@/lib/api-response"
import { getCurrentUserId } from "@/lib/pocket-auth"

const prisma = new PrismaClient()

/**
 * PATCH /api/pocket/notifications/:id
 * 标记通知为已读
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getCurrentUserId(request)
    const { id } = await params

    // 检查通知是否存在且属于当前用户
    const notification = await prisma.studentNotification.findFirst({
      where: {
        id,
        studentId: userId,
      },
    })

    if (!notification) {
      return Response.json(notFoundError("通知不存在"), { status: 404 })
    }

    // 标记为已读
    const updated = await prisma.studentNotification.update({
      where: { id },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    })

    return Response.json(
      successResponse({
        id: updated.id,
        isRead: updated.isRead,
        readAt: updated.readAt?.toISOString(),
      }, "标记已读成功")
    )
  } catch (error: any) {
    console.error("标记通知已读失败:", error)
    return Response.json(errorResponse("操作失败"), { status: 500 })
  }
}
