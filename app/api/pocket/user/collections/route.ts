import { NextRequest } from "next/server"
import { PrismaClient } from "@prisma/client"
import { successResponse, errorResponse } from "@/lib/api-response"
import { getCurrentUserId } from "@/lib/pocket-auth"

const prisma = new PrismaClient()

/**
 * GET /api/pocket/user/collections
 * 获取当前用户收藏的帖子
 */
export async function GET(request: NextRequest) {
  try {
    const userId = await getCurrentUserId(request)

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1", 10)
    const limit = parseInt(searchParams.get("limit") || "20", 10)

    const total = await prisma.postCollection.count({
      where: { studentId: userId },
    })

    const collections = await prisma.postCollection.findMany({
      where: { studentId: userId },
      orderBy: { collectedAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        post: {
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
        },
      },
    })

    return Response.json(
      successResponse({
        collections: collections.map(c => ({
          id: c.id,
          collectedAt: c.collectedAt.toISOString(),
          post: {
            id: c.post.id,
            content: c.post.content,
            images: c.post.images,
            location: c.post.location,
            isAnonymous: c.post.isAnonymous,
            tags: c.post.tags,
            likeCount: c.post.likeCount,
            commentCount: c.post.commentCount,
            viewCount: c.post.viewCount,
            createdAt: c.post.createdAt.toISOString(),
            author: c.post.isAnonymous ? null : c.post.author,
          },
        })),
        total,
        page,
        totalPages: Math.ceil(total / limit),
      })
    )
  } catch (error: any) {
    console.error("获取我的收藏失败:", error)
    return Response.json(errorResponse("获取我的收藏失败"), { status: 500 })
  }
}
