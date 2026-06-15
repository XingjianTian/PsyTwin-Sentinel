import { NextRequest } from "next/server"

import { successResponse, errorResponse } from "@/lib/api-response"
import { getCurrentUserId } from "@/lib/pocket-auth"
import { formatDateKey } from "@/lib/pet-diary-core"
import { createPetDiaryEntry, getPetDiaryForDate } from "@/lib/pet-diary-service"

export async function POST(request: NextRequest) {
  try {
    const userId = await getCurrentUserId(request)
    const body = await request.json().catch(() => ({}))
    const dateKey = body?.date || formatDateKey(new Date())
    const sceneId = body?.sceneId || "dormitory"
    const entry = await createPetDiaryEntry({ userId, dateKey, sceneId })
    const diary = await getPetDiaryForDate(userId, dateKey)

    return Response.json(
      successResponse({
        entry,
        entries: diary.entries,
        diaryDataMap: diary.diaryDataMap,
      }, "测试日记读取成功"),
    )
  } catch (error: any) {
    console.error("测试读取心宠日记失败:", error)
    return Response.json(errorResponse(error?.message || "测试读取心宠日记失败"), { status: 500 })
  }
}
