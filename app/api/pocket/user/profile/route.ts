import { NextRequest } from "next/server"
import { successResponse, errorResponse, notFoundError } from "@/lib/api-response"
import { getCurrentUserId } from "@/lib/pocket-auth"
import { prisma } from "@/lib/db"

/**
 * GET /api/pocket/user/profile
 * 获取当前用户的心理档案
 */
export async function GET(request: NextRequest) {
  try {
    const userId = await getCurrentUserId(request)

    const profile = await prisma.psychProfile.findFirst({
      where: { studentId: userId },
      select: {
        id: true,
        adversityQuotient: true,
        emotionalStability: true,
        socialTendency: true,
        stressResistance: true,
        selfAwareness: true,
        empathy: true,
        willpower: true,
        adaptability: true,
        overallScore: true,
        createdAt: true,
      },
    })

    if (!profile) {
      return Response.json(notFoundError("心理档案不存在"), { status: 404 })
    }

    return Response.json(
      successResponse({
        ...profile,
        createdAt: profile.createdAt.toISOString(),
      })
    )
  } catch (error: any) {
    console.error("获取心理档案失败:", error)
    return Response.json(errorResponse("获取心理档案失败"), { status: 500 })
  }
}
