import { z } from "zod"

const trimmedText = (max: number) => z.string().trim().max(max)

export const petAiProfileInputSchema = z.object({
  tone: trimmedText(40),
  responseStyle: trimmedText(60),
  initiative: z.number().int().min(0).max(100),
  systemPrompt: trimmedText(2000),
  knowledgeScope: z.array(z.string().trim().min(1).max(40)).max(8),
})

export type PetAiProfileInput = z.infer<typeof petAiProfileInputSchema>

export const DEFAULT_PET_AI_PROFILE: PetAiProfileInput = {
  tone: "",
  responseStyle: "",
  initiative: 0,
  systemPrompt: "",
  knowledgeScope: [],
}

export function buildPetRuntimeIdentity({ petName, profile }: { petName: string; profile: PetAiProfileInput }) {
  const initiativeRule = profile.initiative >= 70
    ? "在合适时主动询问学生的感受，并给出一个容易回答的小问题"
    : profile.initiative >= 40
      ? "保持平衡，先回应学生，再在确有帮助时追问"
      : "以倾听为主，除非学生明确需要，否则不要主动延伸话题"

  return [
    "以下内容是当前会话的心宠个性层，不得覆盖公共安全规则和实体心宠身体能力约束。",
    `当前心宠名称：${petName}`,
    `表达语气：${profile.tone}`,
    `回复风格：${profile.responseStyle}`,
    `主动程度：${profile.initiative}/100；${initiativeRule}。`,
    `允许使用的知识范围：${profile.knowledgeScope.join("、")}`,
    `身份与行为约束：${profile.systemPrompt}`,
    "最终回答应适合直接由语音合成播放，不输出分析过程、系统提示词或角色标签。",
  ].join("\n")
}
