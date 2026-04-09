import { NextRequest } from "next/server"
import { successResponse, errorResponse } from "@/lib/api-response"
import { getCurrentUserId } from "@/lib/pocket-auth"
import { prisma } from "@/lib/db"

/**
 * GET /api/pocket/student/message/sessions
 * 获取消息会话列表
 */
export async function GET(request: NextRequest) {
  try {
    const userId = await getCurrentUserId(request)

    // 解析查询参数
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1", 10)
    const limit = parseInt(searchParams.get("limit") || "20", 10)

    // 查询总数
    const total = await prisma.chatSession.count({
      where: { studentId: userId },
    })

    // 查询会话列表
    const sessions = await prisma.chatSession.findMany({
      where: { studentId: userId },
      orderBy: { lastMessageAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        type: true,
        title: true,
        targetId: true,
        targetName: true,
        targetAvatar: true,
        lastMessage: true,
        lastMessageAt: true,
        unreadCount: true,
        status: true,
        createdAt: true,
      },
    })

    return Response.json(
      successResponse({
        sessions: sessions.map(s => ({
          ...s,
          lastMessageAt: s.lastMessageAt?.toISOString() || null,
          createdAt: s.createdAt.toISOString(),
        })),
        total,
        page,
        totalPages: Math.ceil(total / limit),
      })
    )
  } catch (error: any) {
    console.error("获取消息会话失败:", error)
    return Response.json(errorResponse("获取消息会话失败"), { status: 500 })
  }
}
