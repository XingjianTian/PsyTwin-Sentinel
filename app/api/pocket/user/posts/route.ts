import { NextRequest } from "next/server"
import { successResponse, errorResponse } from "@/lib/api-response"
import { getCurrentUserId } from "@/lib/pocket-auth"
import { prisma } from "@/lib/db"

/**
 * GET /api/pocket/user/posts
 * 获取当前用户发布的帖子
 */
export async function GET(request: NextRequest) {
  try {
    const userId = await getCurrentUserId(request)

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1", 10)
    const limit = parseInt(searchParams.get("limit") || "20", 10)

    const total = await prisma.post.count({
      where: { authorId: userId },
    })

    const posts = await prisma.post.findMany({
      where: { authorId: userId },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        content: true,
        images: true,
        location: true,
        isAnonymous: true,
        tags: true,
        likeCount: true,
        commentCount: true,
        viewCount: true,
        status: true,
        createdAt: true,
      },
    })

    return Response.json(
      successResponse({
        posts: posts.map(p => ({
          ...p,
          createdAt: p.createdAt.toISOString(),
        })),
        total,
        page,
        totalPages: Math.ceil(total / limit),
      })
    )
  } catch (error: any) {
    console.error("获取我的帖子失败:", error)
    return Response.json(errorResponse("获取我的帖子失败"), { status: 500 })
  }
}
