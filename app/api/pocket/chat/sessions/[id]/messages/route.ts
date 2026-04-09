import { NextRequest } from "next/server"
import { successResponse, errorResponse, notFoundError } from "@/lib/api-response"
import { getCurrentUserId } from "@/lib/pocket-auth"
import { prisma } from "@/lib/db"

/**
 * GET /api/pocket/chat/sessions/:id/messages
 * 获取聊天会话的消息列表
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getCurrentUserId(request)
    const { id: sessionId } = await params

    // 验证会话是否属于当前用户
    const session = await prisma.chatSession.findFirst({
      where: {
        id: sessionId,
        studentId: userId,
      },
    })

    if (!session) {
      return Response.json(notFoundError("会话不存在"), { status: 404 })
    }

    // 解析查询参数
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1", 10)
    const limit = parseInt(searchParams.get("limit") || "50", 10)

    // 查询消息总数
    const total = await prisma.chatMessage.count({
      where: { sessionId },
    })

    // 查询消息列表
    const messages = await prisma.chatMessage.findMany({
      where: { sessionId },
      orderBy: { createdAt: "asc" },
      skip: (page - 1) * limit,
      take: limit,
    })

    return Response.json(
      successResponse({
        messages: messages.map(m => ({
          id: m.id,
          senderId: m.senderId,
          type: m.type,
          content: m.content,
          emotionTag: m.emotionTag,
          status: m.status,
          isRead: m.isRead,
          seq: m.seq,
          createdAt: m.createdAt.toISOString(),
        })),
        total,
        page,
        totalPages: Math.ceil(total / limit),
      })
    )
  } catch (error: any) {
    console.error("获取消息失败:", error)
    return Response.json(errorResponse("获取消息失败"), { status: 500 })
  }
}
