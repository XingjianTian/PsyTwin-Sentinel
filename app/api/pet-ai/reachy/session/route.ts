import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

import { isClawBodyUnavailable, requestClawBody } from "@/lib/pet-ai/clawbody-client"
import { buildPetRuntimeIdentity, DEFAULT_PET_AI_PROFILE, type PetAiProfileInput } from "@/lib/pet-ai/profile"
import { prisma } from "@/lib/prisma"

const inputSchema = z.object({
  action: z.enum(["start", "stop"]),
  studentId: z.string().min(1),
})

export async function POST(request: NextRequest) {
  const parsed = inputSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ message: "会话参数无效" }, { status: 400 })
  const demoStudentId = process.env.PET_AI_DEMO_STUDENT_ID || "stu-test"
  if (parsed.data.action === "start" && parsed.data.studentId !== demoStudentId) {
    return NextResponse.json({ message: "首版仅允许测试学生绑定实体 Reachy" }, { status: 403 })
  }
  try {
    let identity = ""
    if (parsed.data.action === "start") {
      const pet = await prisma.pet.findFirst({
        where: { ownerId: parsed.data.studentId },
        select: { name: true, aiProfile: { select: { tone: true, responseStyle: true, initiative: true, systemPrompt: true, knowledgeScope: true } } },
        orderBy: { createdAt: "asc" },
      })
      if (!pet) return NextResponse.json({ message: "该学生还没有心宠" }, { status: 404 })
      const profile: PetAiProfileInput = pet.aiProfile
        ? { ...pet.aiProfile, knowledgeScope: Array.isArray(pet.aiProfile.knowledgeScope) ? pet.aiProfile.knowledgeScope.filter((item): item is string => typeof item === "string") : DEFAULT_PET_AI_PROFILE.knowledgeScope }
        : DEFAULT_PET_AI_PROFILE
      identity = buildPetRuntimeIdentity({ petName: pet.name, profile })
    }
    const data = await requestClawBody(`/v1/session/${parsed.data.action}`, {
      method: "POST",
      body: JSON.stringify({ student_id: parsed.data.studentId, identity }),
    })
    return NextResponse.json({ data })
  } catch (error) {
    const status = isClawBodyUnavailable(error) ? 503 : ((error as Error & { status?: number }).status || 502)
    return NextResponse.json({ message: (error as Error).message }, { status })
  }
}
