import { NextRequest, NextResponse } from "next/server"

import { getStudentPetSnapshot } from "@/app/actions/pet-snapshot"
import { buildDemoConversations, buildStableOceanPersonality, DEMO_PET_NAME } from "@/lib/pet-ai/demo-data"
import { DEFAULT_PET_AI_PROFILE, petAiProfileInputSchema } from "@/lib/pet-ai/profile"
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
      conversations: isDemoStudent ? [] : buildDemoConversations(studentId, petSnapshot.name),
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
