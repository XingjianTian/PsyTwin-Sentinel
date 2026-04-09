import { NextRequest } from "next/server"
import { successResponse, errorResponse } from "@/lib/api-response"
import { getCurrentUserId } from "@/lib/pocket-auth"
import { PostStatus } from "@prisma/client"
import { prisma } from "@/lib/db"

/**
 * GET /api/pocket/student/home/feed
 * 获取心墙动态流（首页）
 */
export async function GET(request: NextRequest) {
  try {
    const userId = await getCurrentUserId(request)

    // 解析查询参数
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1", 10)
    const limit = parseInt(searchParams.get("limit") || "20", 10)

    // 构建查询条件 - 公开的帖子
    const where: any = {
      status: PostStatus.ACTIVE,
      isAnonymous: false, // 广场：非匿名帖子
    }

    // 查询帖子列表
    const posts = await prisma.post.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatar: true,
            nickname: true,
            role: true,
            facultyId: true,
          },
        },
      },
    })

    // 获取所有需要的 faculty 信息
    const facultyIds = [...new Set(posts.map(p => p.author.facultyId).filter(Boolean))]
    const faculties = facultyIds.length > 0 
      ? await prisma.faculty.findMany({
          where: { id: { in: facultyIds } },
          select: { id: true, name: true },
        })
      : []
    const facultyMap = new Map(faculties.map(f => [f.id, f.name]))

    // 获取当前用户的点赞和收藏状态
    const postIds = posts.map(p => p.id)

    const [likedPosts, collectedPosts] = await Promise.all([
      prisma.postLike.findMany({
        where: {
          postId: { in: postIds },
          studentId: userId,
        },
        select: { postId: true },
      }),
      prisma.postCollection.findMany({
        where: {
          postId: { in: postIds },
          studentId: userId,
        },
        select: { postId: true },
      }),
    ])

    const likedPostIds = new Set(likedPosts.map(p => p.postId))
    const collectedPostIds = new Set(collectedPosts.map(p => p.postId))

    // 组装响应数据 - 符合前端期望的结构
    const feedItems = posts.map(post => ({
      id: post.id,
      author: post.isAnonymous ? {
        id: "anonymous",
        nickname: "匿名用户",
        avatar: null,
        role: "student",
        department: null,
      } : {
        id: post.author.id,
        nickname: post.author.nickname || post.author.name,
        avatar: post.author.avatar,
        role: post.author.role || "student",
        department: post.author.facultyId ? facultyMap.get(post.author.facultyId) : null,
      },
      content: {
        text: post.content,
        images: post.images || [],
        location: post.location || null,
        isAnonymous: post.isAnonymous,
      },
      stats: {
        likeCount: post.likeCount,
        commentCount: post.commentCount,
        shareCount: 0, // 分享功能暂未实现
      },
      isLiked: likedPostIds.has(post.id),
      isCollected: collectedPostIds.has(post.id),
      createdAt: post.createdAt.toISOString(),
      riskScore: post.riskScore,
    }))

    // 获取秘密树洞帖子（匿名帖子）
    const secretPosts = await prisma.post.findMany({
      where: {
        status: PostStatus.ACTIVE,
        isAnonymous: true,
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    })

    const secretItems = secretPosts.map(post => ({
      id: post.id,
      author: {
        id: "anonymous",
        nickname: "匿名的你",
        avatar: null,
        role: "student",
        department: null,
      },
      content: {
        text: post.content,
        images: post.images || [],
        location: post.location || null,
        isAnonymous: true,
      },
      stats: {
        likeCount: post.likeCount,
        commentCount: post.commentCount,
        shareCount: 0,
      },
      isLiked: likedPostIds.has(post.id),
      isCollected: collectedPostIds.has(post.id),
      createdAt: post.createdAt.toISOString(),
      riskScore: post.riskScore,
    }))

    return Response.json(
      successResponse({
        // follow: 关注的人的帖子（暂时返回全部公开帖子）
        follow: feedItems,
        // square: 广场帖子（全部公开帖子）
        square: feedItems,
        // secret: 秘密树洞（匿名帖子）
        secret: secretItems,
      })
    )
  } catch (error: any) {
    console.error("获取动态流失败:", error)
    return Response.json(errorResponse("获取动态流失败"), { status: 500 })
  }
}
