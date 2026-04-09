import { NextRequest } from "next/server"
import { NotificationType } from "@prisma/client"

import { prisma } from "@/lib/db"
import { errorResponse, successResponse } from "@/lib/api-response"
import { getCurrentUserId } from "@/lib/pocket-auth"

const TYPE_QUERY_MAP: Record<string, NotificationType> = {
  system: "SYSTEM",
  appointment: "APPOINTMENT",
  warning: "WARNING",
  chat: "CHAT",
  post: "POST",
  comment: "COMMENT",
}

function normalizeNotificationType(type: NotificationType): "system" | "warning" | "appointment" {
  if (type === "WARNING") return "warning"
  if (type === "APPOINTMENT") return "appointment"
  return "system"
}

/**
 * GET /api/pocket/student/my/notifications
 * 获取当前用户的通知列表
 */
export async function GET(request: NextRequest) {
  try {
    const userId = await getCurrentUserId(request)
    const { searchParams } = new URL(request.url)
    const page = Math.max(Number.parseInt(searchParams.get("page") || "1", 10), 1)
    const limit = Math.max(Number.parseInt(searchParams.get("limit") || "20", 10), 1)
    const type = searchParams.get("type")
    const isRead = searchParams.get("isRead")

    const where: {
      studentId: string
      type?: NotificationType
      isRead?: boolean
    } = {
      studentId: userId,
    }

    if (type) {
      const mappedType = TYPE_QUERY_MAP[type.toLowerCase()]
      if (mappedType) {
        where.type = mappedType
      }
    }

    if (isRead === "true" || isRead === "false") {
      where.isRead = isRead === "true"
    }

    const [notifications, unreadCount] = await Promise.all([
      prisma.studentNotification.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          title: true,
          content: true,
          type: true,
          isRead: true,
          createdAt: true,
          actionUrl: true,
        },
      }),
      prisma.studentNotification.count({
        where: {
          studentId: userId,
          isRead: false,
        },
      }),
    ])

    return Response.json(
      successResponse(
        {
          list: notifications.map((item) => ({
            id: item.id,
            title: item.title,
            content: item.content,
            type: normalizeNotificationType(item.type),
            isRead: item.isRead,
            createdAt: item.createdAt.toISOString(),
            actionUrl: item.actionUrl || "",
          })),
          unreadCount,
        },
        "获取成功"
      )
    )
  } catch (error) {
    console.error("获取通知失败:", error)
    return Response.json(errorResponse("获取通知失败"), { status: 500 })
  }
}

/**
 * POST /api/pocket/student/my/notifications
 * 发送通知给学生（供服务端内部调用）
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, type, title, content, actionUrl } = body

    if (!userId || !type || !title || !content) {
      return Response.json(errorResponse("缺少必填字段: userId, type, title, content"), { status: 400 })
    }

    const mappedType = TYPE_QUERY_MAP[String(type).toLowerCase()]
    if (!mappedType) {
      return Response.json(errorResponse("无效的通知类型"), { status: 400 })
    }

    const notification = await prisma.studentNotification.create({
      data: {
        studentId: userId,
        type: mappedType,
        title,
        content,
        actionUrl: actionUrl || "",
        isRead: false,
      },
      select: {
        id: true,
        title: true,
        content: true,
        type: true,
        isRead: true,
        createdAt: true,
        actionUrl: true,
      },
    })

    return Response.json(
      successResponse(
        {
          id: notification.id,
          title: notification.title,
          content: notification.content,
          type: normalizeNotificationType(notification.type),
          isRead: notification.isRead,
          createdAt: notification.createdAt.toISOString(),
          actionUrl: notification.actionUrl || "",
        },
        "发送成功"
      )
    )
  } catch (error) {
    console.error("发送通知失败:", error)
    return Response.json(errorResponse("发送通知失败"), { status: 500 })
  }
}
