import { NextRequest } from "next/server"
import { successResponse, errorResponse } from "@/lib/api-response"
import { getCurrentUser } from "@/lib/pocket-auth"

/**
 * GET /api/pocket/auth/me
 * 获取当前用户信息
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)

    if (!user) {
      return Response.json(
        errorResponse("用户不存在", 1004),
        { status: 404 }
      )
    }

    return Response.json(
      successResponse(user, "获取用户信息成功")
    )
  } catch (error) {
    console.error("获取用户信息失败:", error)
    return Response.json(errorResponse("获取用户信息失败"), { status: 500 })
  }
}
