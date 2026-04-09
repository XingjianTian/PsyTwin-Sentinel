import { NextRequest } from "next/server"
import { successResponse, errorResponse, validationError } from "@/lib/api-response"
import { getCurrentUserId } from "@/lib/pocket-auth"
import { PostStatus } from "@prisma/client"
import { prisma } from "@/lib/db"

/**
 * GET /api/pocket/posts
 * 获取心墙动态流
 */
export async function GET(request: NextRequest) {
  try {
    const userId = await getCurrentUserId(request)
    
    // 解析查询参数
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1", 10)
    const limit = parseInt(searchParams.get("limit") || "20", 10)
    const tag = searchParams.get("tag")
    
    // 构建查询条件
    const where: any = {
      status: PostStatus.ACTIVE,
    }
    
    if (tag) {
      where.tags = { has: tag }
    }
    
    // 查询总数
    const total = await prisma.post.count({ where })
    
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
          },
        },
      },
    })
    
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
    
    // 组装响应数据
    const postsWithStatus = posts.map(post => ({
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
      author: post.isAnonymous ? null : {
        id: post.author.id,
        name: post.author.name,
        avatar: post.author.avatar,
        nickname: post.author.nickname,
      },
      isLiked: likedPostIds.has(post.id),
      isCollected: collectedPostIds.has(post.id),
    }))
    
    return Response.json(
      successResponse({
        posts: postsWithStatus,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      })
    )
  } catch (error: any) {
    console.error("获取动态流失败:", error)
    return Response.json(errorResponse(`获取动态流失败: ${error?.message || '未知错误'}`), { status: 500 })
  }
}

/**
 * POST /api/pocket/posts
 * 发布新帖子
 */
export async function POST(request: NextRequest) {
  try {
    const userId = await getCurrentUserId(request)
    
    const body = await request.json()
    const { content, images, location, isAnonymous, tags } = body
    
    // 验证必填字段
    if (!content || content.trim().length === 0) {
      return Response.json(
        validationError("帖子内容不能为空"),
        { status: 400 }
      )
    }
    
    // 创建帖子
    const post = await prisma.post.create({
      data: {
        authorId: userId,
        content: content.trim(),
        images: images || [],
        location: location || null,
        isAnonymous: isAnonymous || false,
        tags: tags || [],
        likeCount: 0,
        commentCount: 0,
        viewCount: 0,
        status: PostStatus.ACTIVE,
        riskScore: null,
      },
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
        createdAt: post.createdAt.toISOString(),
        author: post.isAnonymous ? null : post.author,
        isLiked: false,
        isCollected: false,
      }, "发布成功")
    )
  } catch (error: any) {
    console.error("发布帖子失败:", error)
    return Response.json(errorResponse("发布帖子失败"), { status: 500 })
  }
}
