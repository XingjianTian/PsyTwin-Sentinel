import { NextRequest } from "next/server"

import { successResponse, errorResponse } from "@/lib/api-response"
import { getCurrentUserId } from "@/lib/pocket-auth"
import { backfillMissingPetDiaries } from "@/lib/pet-diary-service"

export async function POST(request: NextRequest) {
  try {
    const userId = await getCurrentUserId(request)
    const body = await request.json().catch(() => ({}))
    const result = await backfillMissingPetDiaries({
      userId,
      lastOnlineAt: body?.lastOnlineAt,
      maxDays: typeof body?.maxDays === "number" ? body.maxDays : 7,
    })

    return Response.json(successResponse(result, "离线心宠日记补全完成"))
  } catch (error: any) {
    console.error("补全离线心宠日记失败:", error)
    return Response.json(errorResponse(error?.message || "补全离线心宠日记失败"), { status: 500 })
  }
}
