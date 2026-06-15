import { NextRequest } from "next/server"

import { successResponse, errorResponse } from "@/lib/api-response"
import { getCurrentUserId } from "@/lib/pocket-auth"
import { formatDateKey } from "@/lib/pet-diary-core"
import { getPetDiaryForDate } from "@/lib/pet-diary-service"

export async function GET(request: NextRequest) {
  try {
    const userId = await getCurrentUserId(request)
    const { searchParams } = new URL(request.url)
    const dateKey = searchParams.get("date") || formatDateKey(new Date())
    const result = await getPetDiaryForDate(userId, dateKey)

    return Response.json(successResponse(result))
  } catch (error: any) {
    console.error("获取心宠日记失败:", error)
    return Response.json(errorResponse(error?.message || "获取心宠日记失败"), { status: 500 })
  }
}
