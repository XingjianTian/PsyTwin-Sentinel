import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

import { requestClawBody, isClawBodyUnavailable } from "@/lib/pet-ai/clawbody-client"
import { buildPetRuntimeIdentity, DEFAULT_PET_AI_PROFILE, type PetAiProfileInput } from "@/lib/pet-ai/profile"
import { prisma } from "@/lib/prisma"

const inputSchema = z.object({ studentId: z.string().min(1), message: z.string().trim().min(1).max(1000) })

export async function POST(request: NextRequest) {
  const parsed = inputSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ message: "请输入有效的测试内容" }, { status: 400 })
  try {
    const pet = await prisma.pet.findFirst({
      where: { ownerId: parsed.data.studentId },
      select: { name: true, aiProfile: { select: { tone: true, responseStyle: true, initiative: true, systemPrompt: true, knowledgeScope: true } } },
      orderBy: { createdAt: "asc" },
    })
    if (!pet) return NextResponse.json({ message: "该学生还没有心宠" }, { status: 404 })
    const profile: PetAiProfileInput = pet.aiProfile
      ? { ...pet.aiProfile, knowledgeScope: Array.isArray(pet.aiProfile.knowledgeScope) ? pet.aiProfile.knowledgeScope.filter((item): item is string => typeof item === "string") : DEFAULT_PET_AI_PROFILE.knowledgeScope }
      : DEFAULT_PET_AI_PROFILE
    const identity = buildPetRuntimeIdentity({ petName: pet.name, profile })
    const response = await requestClawBody<{ response: string }>("/v1/text/respond", { method: "POST", body: JSON.stringify({ student_id: parsed.data.studentId, message: parsed.data.message, identity }) })
    return NextResponse.json({ data: { mode: "live", response: response.response } })
  } catch (error) {
    const status = isClawBodyUnavailable(error) ? 503 : ((error as Error & { status?: number }).status || 502)
    return NextResponse.json({ message: (error as Error).message }, { status })
  }
}
