import { NextRequest } from "next/server"

import { successResponse, errorResponse } from "@/lib/api-response"
import { getCurrentUserId } from "@/lib/pocket-auth"
import { formatDateKey } from "@/lib/pet-diary-core"
import { maybeCreatePetDiary } from "@/lib/pet-diary-service"

export async function POST(request: NextRequest) {
  try {
    const userId = await getCurrentUserId(request)
    const body = await request.json().catch(() => ({}))
    const result = await maybeCreatePetDiary({
      userId,
      sceneId: body?.sceneId,
      dateKey: body?.date || formatDateKey(new Date()),
      hour: typeof body?.hour === "number" ? body.hour : new Date().getHours(),
    })

    return Response.json(successResponse(result))
  } catch (error: any) {
    console.error("触发心宠日记失败:", error)
    return Response.json(errorResponse(error?.message || "触发心宠日记失败"), { status: 500 })
  }
}
