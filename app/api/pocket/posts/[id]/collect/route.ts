import { NextRequest } from "next/server"
import { successResponse, errorResponse, notFoundError } from "@/lib/api-response"
import { getCurrentUserId } from "@/lib/pocket-auth"
import { prisma } from "@/lib/db"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getCurrentUserId(request)
    const { id: postId } = await params

    const post = await prisma.post.findFirst({
      where: { id: postId },
      select: { id: true },
    })

    if (!post) {
      return Response.json(notFoundError("帖子不存在"), { status: 404 })
    }

    const existingCollection = await prisma.postCollection.findFirst({
      where: {
        postId_studentId: { postId, studentId: userId },
      },
    })

    if (existingCollection) {
      await prisma.postCollection.delete({
        where: { postId_studentId: { postId, studentId: userId } },
      })
      return Response.json(successResponse({ collected: false }, "取消收藏成功"))
    } else {
      await prisma.postCollection.create({
        data: {
          postId,
          studentId: userId,
          collectedAt: new Date(),
        },
      })
      return Response.json(successResponse({ collected: true }, "收藏成功"))
    }
  } catch (error: any) {
    console.error("收藏操作失败:", error)
    return Response.json(errorResponse(`操作失败: ${error?.message || '未知错误'}`), { status: 500 })
  }
}
