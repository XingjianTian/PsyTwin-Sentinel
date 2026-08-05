import { NextRequest, NextResponse } from "next/server"

import { getStudentPetSnapshot } from "@/app/actions/pet-snapshot"
import { buildDemoConversations, buildStableOceanPersonality, DEMO_PET_NAME } from "@/lib/pet-ai/demo-data"
import { DEFAULT_PET_AI_PROFILE, petAiProfileInputSchema } from "@/lib/pet-ai/profile"
import { buildPetLiveChatSessionId } from "@/lib/pet-ai/reachy-conversation"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

type Context = { params: Promise<{ studentId: string }> }

export async function GET(_request: NextRequest, context: Context) {
  const { studentId } = await context.params
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    select: { id: true, name: true, studentNo: true, className: true, riskLevel: true, mbti: true, psychProfile: true },
  })
  if (!student) return NextResponse.json({ message: "学生不存在" }, { status: 404 })

  const demoStudentId = process.env.PET_AI_DEMO_STUDENT_ID || "stu-test"
  const isDemoStudent = studentId === demoStudentId
  const petSnapshot = await getStudentPetSnapshot(studentId)
  if (isDemoStudent && petSnapshot.name !== DEMO_PET_NAME) {
    await prisma.pet.update({ where: { id: petSnapshot.id }, data: { name: DEMO_PET_NAME } })
  }
  let personality = await prisma.pet.findUnique({
    where: { id: petSnapshot.id },
    select: { openness: true, conscientiousness: true, extraversion: true, agreeableness: true, neuroticism: true },
  })
  if (personality && Object.values(personality).every((value) => value === 50)) {
    personality = await prisma.pet.update({
      where: { id: petSnapshot.id },
      data: buildStableOceanPersonality(studentId),
      select: { openness: true, conscientiousness: true, extraversion: true, agreeableness: true, neuroticism: true },
    })
  }
  const profile = await prisma.petAiProfile.findUnique({ where: { petId: petSnapshot.id } })
  const aiProfile = profile
    ? { tone: profile.tone, responseStyle: profile.responseStyle, initiative: profile.initiative, systemPrompt: profile.systemPrompt, knowledgeScope: profile.knowledgeScope }
    : DEFAULT_PET_AI_PROFILE
  const liveMessages = isDemoStudent
    ? (await prisma.chatMessage.findMany({
        where: { sessionId: buildPetLiveChatSessionId(studentId, petSnapshot.id) },
        orderBy: { createdAt: "desc" },
        take: 200,
        select: { id: true, senderId: true, content: true, emotionTag: true, cbtCard: true, createdAt: true },
      })).reverse()
    : []

  return NextResponse.json({
    data: {
      student,
      pet: {
        ...petSnapshot,
        name: isDemoStudent ? DEMO_PET_NAME : petSnapshot.name,
        imageSrc: studentId === demoStudentId ? "/pet/pocket-main-pet.png" : petSnapshot.imageSrc,
        personality,
      },
      aiProfile,
      conversations: isDemoStudent
        ? liveMessages.map((message) => {
            const isGeminiLive = typeof message.cbtCard === "object"
              && message.cbtCard !== null
              && !Array.isArray(message.cbtCard)
              && (message.cbtCard as { source?: unknown }).source === "gemini-live"
            return {
              id: message.id,
              role: message.senderId === studentId ? "student" : "pet",
              content: message.content,
              createdAt: message.createdAt.toISOString(),
              topic: isGeminiLive ? "Gemini Live 实时对话" : "实体心宠联调",
              demo: false,
              riskLevel: message.emotionTag || "LOW",
              source: isGeminiLive ? "gemini-live" as const : "reachy" as const,
            }
          })
        : buildDemoConversations(studentId, petSnapshot.name, student.riskLevel),
      isDemoStudent,
    },
  })
}

export async function PUT(request: NextRequest, context: Context) {
  const { studentId } = await context.params
  const parsed = petAiProfileInputSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ message: "性格配置不完整", issues: parsed.error.flatten() }, { status: 400 })

  const pet = await prisma.pet.findFirst({ where: { ownerId: studentId }, select: { id: true } })
  if (!pet) return NextResponse.json({ message: "该学生还没有心宠" }, { status: 404 })

  const profile = await prisma.petAiProfile.upsert({
    where: { petId: pet.id },
    create: { petId: pet.id, ...parsed.data },
    update: parsed.data,
  })
  return NextResponse.json({ data: profile, message: "性格配置已保存" })
}
