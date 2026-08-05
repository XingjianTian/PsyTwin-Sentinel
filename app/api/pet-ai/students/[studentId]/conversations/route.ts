import { NextResponse } from "next/server"

import { buildPetLiveChatSessionId } from "@/lib/pet-ai/reachy-conversation"
import { prisma } from "@/lib/prisma"

type Context = { params: Promise<{ studentId: string }> }

export async function DELETE(_request: Request, context: Context) {
  const { studentId } = await context.params
  const demoStudentId = process.env.PET_AI_DEMO_STUDENT_ID || "stu-test"
  if (studentId !== demoStudentId) {
    return NextResponse.json({ message: "仅测试学生可以清空实体心宠对话记录" }, { status: 403 })
  }

  const pet = await prisma.pet.findFirst({
    where: { ownerId: studentId },
    select: { id: true },
    orderBy: { createdAt: "asc" },
  })
  if (!pet) return NextResponse.json({ message: "测试学生还没有心宠" }, { status: 404 })

  const sessionId = buildPetLiveChatSessionId(studentId, pet.id)
  const deletedMessages = await prisma.chatMessage.count({ where: { sessionId } })
  await prisma.chatSession.deleteMany({ where: { id: sessionId, studentId } })

  return NextResponse.json({ data: { deleted: deletedMessages }, message: "对话记录已清空" })
}
