import { NextRequest } from "next/server"

import { prisma } from "@/lib/db"
import { successResponse, errorResponse } from "@/lib/api-response"
import { getCurrentUserId } from "@/lib/pocket-auth"

export async function PUT(request: NextRequest) {
  try {
    const userId = await getCurrentUserId(request)

    const result = await prisma.studentNotification.updateMany({
      where: {
        studentId: userId,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    })

    return Response.json(
      successResponse({
        updatedCount: result.count,
      }, `已标记 ${result.count} 条通知为已读`)
    )
  } catch (error: any) {
    console.error("标记全部通知已读失败:", error)
    return Response.json(errorResponse("操作失败"), { status: 500 })
  }
}
