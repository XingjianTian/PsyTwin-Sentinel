import { NextRequest } from "next/server"
import { successResponse, errorResponse, notFoundError } from "@/lib/api-response"
import { getCurrentUserId } from "@/lib/pocket-auth"
import { prisma } from "@/lib/db"

/**
 * POST /api/pocket/student/home/posts/:id/like
 * 点赞/取消点赞帖子
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getCurrentUserId(request)
    const { id: postId } = await params

    const post = await prisma.post.findFirst({
      where: { id: postId },
      select: { id: true, likeCount: true },
    })

    if (!post) {
      return Response.json(notFoundError("帖子不存在"), { status: 404 })
    }

    const existingLike = await prisma.postLike.findFirst({
      where: {
        postId_studentId: { postId, studentId: userId },
      },
    })

    if (existingLike) {
      // 取消点赞
      await prisma.$transaction([
        prisma.postLike.delete({
          where: { postId_studentId: { postId, studentId: userId } },
        }),
        prisma.post.update({
          where: { id: postId },
          data: { likeCount: { decrement: 1 } },
        }),
      ])
      return Response.json(successResponse({ liked: false }, "取消点赞成功"))
    } else {
      // 添加点赞
      await prisma.$transaction([
        prisma.postLike.create({
          data: { postId, studentId: userId },
        }),
        prisma.post.update({
          where: { id: postId },
          data: { likeCount: { increment: 1 } },
        }),
      ])
      return Response.json(successResponse({ liked: true }, "点赞成功"))
    }
  } catch (error: any) {
    console.error("点赞操作失败:", error)
    return Response.json(errorResponse("操作失败"), { status: 500 })
  }
}
