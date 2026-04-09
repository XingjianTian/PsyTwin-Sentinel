import { NextRequest } from "next/server"
import { successResponse, errorResponse, notFoundError } from "@/lib/api-response"
import { getCurrentUserId } from "@/lib/pocket-auth"
import { prisma } from "@/lib/db"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getCurrentUserId(request)
    const { id } = await params

    const post = await prisma.post.findFirst({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatar: true,
            nickname: true,
          },
        },
      },
    })

    if (!post) {
      return Response.json(notFoundError("帖子不存在"), { status: 404 })
    }

    const [liked, collected] = await Promise.all([
      prisma.postLike.findFirst({
        where: {
          postId_studentId: { postId: id, studentId: userId },
        },
      }),
      prisma.postCollection.findFirst({
        where: {
          postId_studentId: { postId: id, studentId: userId },
        },
      }),
    ])

    return Response.json(
      successResponse({
        id: post.id,
        content: post.content,
        images: post.images,
        location: post.location,
        isAnonymous: post.isAnonymous,
        tags: post.tags,
        likeCount: post.likeCount,
        commentCount: post.commentCount,
        viewCount: post.viewCount,
        riskScore: post.riskScore,
        createdAt: post.createdAt.toISOString(),
        author: post.isAnonymous ? null : post.author,
        isLiked: !!liked,
        isCollected: !!collected,
      })
    )
  } catch (error: any) {
    console.error("获取帖子详情失败:", error)
    return Response.json(errorResponse(`获取帖子详情失败: ${error?.message || '未知错误'}`), { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getCurrentUserId(request)
    const { id } = await params

    const post = await prisma.post.findFirst({
      where: { id, authorId: userId },
    })

    if (!post) {
      return Response.json(notFoundError("帖子不存在"), { status: 404 })
    }

    await prisma.post.update({
      where: { id },
      data: { status: "DELETED" },
    })

    return Response.json(successResponse(null, "删除成功"))
  } catch (error: any) {
    console.error("删除帖子失败:", error)
    return Response.json(errorResponse("删除帖子失败"), { status: 500 })
  }
}
