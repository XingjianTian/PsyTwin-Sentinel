import { NextRequest } from "next/server"
import { PrismaClient, NotificationType } from "@prisma/client"
import { successResponse, errorResponse } from "@/lib/api-response"
import { getCurrentUserId } from "@/lib/pocket-auth"

const prisma = new PrismaClient()

/**
 * GET /api/pocket/student/my/notifications
 * 获取当前用户的通知列表
 * 
 * Query Params:
 * - page: 页码，默认 1
 * - limit: 每页数量，默认 20
 * - type: 筛选类型 'system' | 'appointment' | 'warning' | 'chat' | 'post' | 'comment'
 * - isRead: 筛选已读/未读 (boolean)
 */
export async function GET(request: NextRequest) {
  try {
    const userId = await getCurrentUserId(request)

    // 解析查询参数
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1", 10)
    const limit = parseInt(searchParams.get("limit") || "20", 10)
    const type = searchParams.get("type")
    const isRead = searchParams.get("isRead")

    // 构建查询条件
    const where: any = { studentId: userId }

    if (type) {
      const typeMap: Record<string, NotificationType> = {
        system: "SYSTEM",
        appointment: "APPOINTMENT",
        chat: "CHAT",
        warning: "WARNING",
        post: "POST",
        comment: "COMMENT",
      }
      const mappedType = typeMap[type.toLowerCase()]
      if (mappedType) {
        where.type = mappedType
      }
    }

    if (isRead !== null && isRead !== undefined) {
      where.isRead = isRead === "true"
    }

    // 查询未读数量
    const unreadCount = await prisma.studentNotification.count({
      where: {
        studentId: userId,
        isRead: false,
      },
    })

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
        createdAt: true,
      },
    })

    // 格式化响应数据
    const formattedList = notifications.map((n) => ({
      id: n.id,
      type: n.type.toLowerCase(),
      title: n.title,
      content: n.content,
      isRead: n.isRead,
      createdAt: n.createdAt.toISOString(),
      actionUrl: n.actionUrl || undefined,
    }))

    return Response.json(
      successResponse({
        list: formattedList,
        unreadCount,
      }, "获取成功")
    )
  } catch (error: any) {
    console.error("获取通知失败:", error)
    return Response.json(errorResponse("获取通知失败"), { status: 500 })
  }
}

/**
 * POST /api/pocket/student/my/notifications
 * 发送通知给学生（供 Sentinel 内部调用）
 * 
 * Body:
 * - userId: 学生ID
 * - type: 'system' | 'appointment' | 'warning' | 'chat' | 'post' | 'comment'
 * - title: 通知标题
 * - content: 通知内容
 * - actionUrl?: 点击跳转路径
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, type, title, content, actionUrl } = body

    // 验证必填字段
    if (!userId || !type || !title || !content) {
      return Response.json(
        errorResponse("缺少必填字段: userId, type, title, content"),
        { status: 400 }
      )
    }

    // 验证 type 有效性
    const typeMap: Record<string, NotificationType> = {
      system: "SYSTEM",
      appointment: "APPOINTMENT",
      chat: "CHAT",
      warning: "WARNING",
      post: "POST",
      comment: "COMMENT",
    }

    const mappedType = typeMap[type.toLowerCase()]
    if (!mappedType) {
      return Response.json(
        errorResponse("无效的通知类型"),
        { status: 400 }
      )
    }

    // 创建通知
    const notification = await prisma.studentNotification.create({
      data: {
        studentId: userId,
        type: mappedType,
        title,
        content,
        actionUrl: actionUrl || null,
        isRead: false,
      },
    })

    return Response.json(
      successResponse(
        {
          id: notification.id,
          type: notification.type.toLowerCase(),
          title: notification.title,
          content: notification.content,
          isRead: notification.isRead,
          createdAt: notification.createdAt.toISOString(),
          actionUrl: notification.actionUrl || undefined,
        },
        "发送成功"
      )
    )
  } catch (error: any) {
    console.error("发送通知失败:", error)
    return Response.json(errorResponse("发送通知失败"), { status: 500 })
  }
}
