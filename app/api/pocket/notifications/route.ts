import { NextRequest } from "next/server"
import { PrismaClient } from "@prisma/client"
import { successResponse, errorResponse } from "@/lib/api-response"
import { getCurrentUserId } from "@/lib/pocket-auth"

const prisma = new PrismaClient()

/**
 * GET /api/pocket/notifications
 * 获取当前用户的通知列表
 */
export async function GET(request: NextRequest) {
  try {
    const userId = await getCurrentUserId(request)

    // 解析查询参数
    const { searchParams } = new URL(request.url)
    const isRead = searchParams.get("isRead")
    const page = parseInt(searchParams.get("page") || "1", 10)
    const limit = parseInt(searchParams.get("limit") || "20", 10)

    // 构建查询条件
    const where: any = { studentId: userId }

    if (isRead !== null) {
      where.isRead = isRead === "true"
    }

    // 查询总数
    const total = await prisma.studentNotification.count({ where })

    // 查询通知列表
    const notifications = await prisma.studentNotification.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        type: true,
        title: true,
        content: true,
        actionUrl: true,
        isRead: true,
        readAt: true,
        createdAt: true,
      },
    })

    return Response.json(
      successResponse({
        notifications: notifications.map(n => ({
          ...n,
          readAt: n.readAt?.toISOString() || null,
          createdAt: n.createdAt.toISOString(),
        })),
        total,
        page,
        totalPages: Math.ceil(total / limit),
      })
    )
  } catch (error: any) {
    console.error("获取通知失败:", error)
    return Response.json(errorResponse("获取通知失败"), { status: 500 })
  }
}
