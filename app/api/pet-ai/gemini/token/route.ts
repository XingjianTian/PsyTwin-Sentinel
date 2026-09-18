import { NextRequest, NextResponse } from "next/server"
import { GoogleGenAI, Modality } from "@google/genai"
import { z } from "zod"

import { buildPetRuntimeIdentity, DEFAULT_PET_AI_PROFILE, type PetAiProfileInput } from "@/lib/pet-ai/profile"
import { prisma } from "@/lib/prisma"

export const runtime = "nodejs"

const inputSchema = z.object({ studentId: z.string().min(1) })
const defaultModel = "gemini-3.1-flash-live-preview"
const defaultVoice = "Kore"

export async function POST(request: NextRequest) {
  const parsed = inputSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ message: "学生参数无效" }, { status: 400 })

  const demoStudentId = process.env.PET_AI_DEMO_STUDENT_ID || "stu-test"
  if (parsed.data.studentId !== demoStudentId) {
    return NextResponse.json({ message: "Gemini Live 联调仅允许测试学生使用" }, { status: 403 })
  }

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return NextResponse.json({ message: "未配置 GEMINI_API_KEY，暂时无法启动 Gemini Live" }, { status: 503 })
  }

  const pet = await prisma.pet.findFirst({
    where: { ownerId: parsed.data.studentId },
    select: {
      name: true,
      openness: true,
      conscientiousness: true,
      extraversion: true,
      agreeableness: true,
      neuroticism: true,
      aiProfile: { select: { tone: true, responseStyle: true, initiative: true, systemPrompt: true, knowledgeScope: true } },
    },
    orderBy: { createdAt: "asc" },
  })
  if (!pet) return NextResponse.json({ message: "该学生还没有心宠" }, { status: 404 })

  const profile: PetAiProfileInput = pet.aiProfile
    ? {
        ...pet.aiProfile,
        knowledgeScope: Array.isArray(pet.aiProfile.knowledgeScope)
          ? pet.aiProfile.knowledgeScope.filter((item): item is string => typeof item === "string")
          : DEFAULT_PET_AI_PROFILE.knowledgeScope,
      }
    : DEFAULT_PET_AI_PROFILE

  const model = process.env.GEMINI_LIVE_MODEL || defaultModel
  const voice = process.env.GEMINI_LIVE_VOICE || defaultVoice
  const lockedSystemInstruction = [
    buildPetRuntimeIdentity({ petName: pet.name, profile }),
    `OCEAN 性格画像：开放性 ${pet.openness}/100、尽责性 ${pet.conscientiousness}/100、外向性 ${pet.extraversion}/100、亲和性 ${pet.agreeableness}/100、敏感性 ${pet.neuroticism}/100。`,
    "实体动作只表达陪伴和情绪，不代表诊断、命令或保证；面对自伤、伤人或紧急危险信号时，保持轻柔、安静和克制。",
  ].join("\n")

  try {
    const now = Date.now()
    const client = new GoogleGenAI({ apiKey })
    const token = await client.authTokens.create({
      config: {
        uses: 1,
        expireTime: new Date(now + 30 * 60 * 1000).toISOString(),
        newSessionExpireTime: new Date(now + 60 * 1000).toISOString(),
        httpOptions: { apiVersion: "v1alpha" },
        liveConnectConstraints: {
          model,
          config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: voice } } },
            inputAudioTranscription: {},
            outputAudioTranscription: {},
            systemInstruction: lockedSystemInstruction,
          },
        },
        lockAdditionalFields: [],
      },
    })

    if (!token.name) throw new Error("Gemini 未返回临时令牌")
    const personalityInstruction = [
      `OCEAN 性格画像：开放性 ${pet.openness}/100、尽责性 ${pet.conscientiousness}/100、外向性 ${pet.extraversion}/100、亲和性 ${pet.agreeableness}/100、敏感性 ${pet.neuroticism}/100。`,
      "实体动作应服从上述性格：高亲和/高外向更偏向理解、安抚、欢迎和开心；高敏感面对负面情绪时只使用轻柔、安静的动作；高尽责保持动作克制稳定；不要为了展示动作而打断普通对话。",
    ].join("\n")
    return NextResponse.json({
      data: {
        token: token.name,
        model,
        voice,
        systemInstruction: `${lockedSystemInstruction}\n${personalityInstruction}`,
        profileSnapshot: {
          tone: profile.tone,
          responseStyle: profile.responseStyle,
          initiative: profile.initiative,
          knowledgeScope: profile.knowledgeScope,
        },
      },
    })
  } catch (error) {
    console.error("[Gemini Live] 临时令牌创建失败", error)
    return NextResponse.json({ message: "Gemini Live 临时令牌创建失败，请检查 API Key 和模型配置" }, { status: 502 })
  }
}
