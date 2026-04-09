import { NextRequest } from "next/server"
import { successResponse, errorResponse, notFoundError, validationError } from "@/lib/api-response"
import { getCurrentUserId } from "@/lib/pocket-auth"
import { CommentStatus } from "@prisma/client"
import { prisma } from "@/lib/db"

/**
 * GET /api/pocket/student/home/posts/:id/comments
 * 获取帖子评论列表
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await params

    // 验证帖子是否存在
    const post = await prisma.post.findFirst({
      where: { id: postId },
      select: { id: true },
    })

    if (!post) {
      return Response.json(notFoundError("帖子不存在"), { status: 404 })
    }

    // 解析查询参数
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1", 10)
    const limit = parseInt(searchParams.get("limit") || "20", 10)

    const total = await prisma.comment.count({
      where: { postId, status: CommentStatus.ACTIVE },
    })

    const comments = await prisma.comment.findMany({
      where: { postId, status: CommentStatus.ACTIVE },
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

    return Response.json(
      successResponse({
        comments: comments.map(c => ({
          id: c.id,
          content: c.content,
          likeCount: c.likeCount,
          createdAt: c.createdAt.toISOString(),
          author: {
            id: c.author.id,
            name: c.author.name,
            avatar: c.author.avatar,
            nickname: c.author.nickname,
          },
        })),
        total,
        page,
        totalPages: Math.ceil(total / limit),
      })
    )
  } catch (error: any) {
    console.error("获取评论失败:", error)
    return Response.json(errorResponse("获取评论失败"), { status: 500 })
  }
}

/**
 * POST /api/pocket/student/home/posts/:id/comments
 * 发表评论
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getCurrentUserId(request)
    const { id: postId } = await params
    const body = await request.json()
    const { content, parentId } = body

    if (!content || content.trim().length === 0) {
      return Response.json(
        validationError("评论内容不能为空"),
        { status: 400 }
      )
    }

    // 检查帖子是否存在
    const post = await prisma.post.findFirst({
      where: { id: postId },
      select: { id: true },
    })

    if (!post) {
      return Response.json(notFoundError("帖子不存在"), { status: 404 })
    }

    // 创建评论
    const comment = await prisma.comment.create({
      data: {
        postId,
        authorId: userId,
        content: content.trim(),
        parentId: parentId || null,
        likeCount: 0,
        status: CommentStatus.ACTIVE,
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

    // 更新帖子的评论数
    await prisma.post.update({
      where: { id: postId },
      data: { commentCount: { increment: 1 } },
    })

    return Response.json(
      successResponse({
        id: comment.id,
        content: comment.content,
        likeCount: comment.likeCount,
        createdAt: comment.createdAt.toISOString(),
        author: {
          id: comment.author.id,
          name: comment.author.name,
          avatar: comment.author.avatar,
          nickname: comment.author.nickname,
        },
      }, "评论成功")
    )
  } catch (error: any) {
    console.error("发表评论失败:", error)
    return Response.json(errorResponse("发表评论失败"), { status: 500 })
  }
}
