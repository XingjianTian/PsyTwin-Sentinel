import { MessageStatus, MessageType, SessionType } from "@prisma/client"

import { buildPetLiveChatSessionId, extractReachyConversationCandidates } from "@/lib/pet-ai/reachy-conversation"
import { prisma } from "@/lib/prisma"

export async function syncReachyConversation({
  studentId,
  transcript,
}: {
  studentId: string
  transcript: unknown
}) {
  const candidates = extractReachyConversationCandidates({ studentId, transcript })
  if (candidates.length === 0) return { created: 0, sessionId: null }

  const pet = await prisma.pet.findFirst({
    where: { ownerId: studentId },
    select: { id: true, name: true },
    orderBy: { createdAt: "asc" },
  })
  if (!pet) return { created: 0, sessionId: null }

  const sessionId = buildPetLiveChatSessionId(studentId, pet.id)
  await prisma.chatSession.upsert({
    where: { id: sessionId },
    create: {
      id: sessionId,
      studentId,
      type: SessionType.AI,
      title: `与${pet.name}的实体心宠对话`,
      targetId: `physical-pet:${pet.id}`,
      targetName: pet.name,
      targetAvatar: null,
    },
    update: {
      title: `与${pet.name}的实体心宠对话`,
      targetName: pet.name,
      targetAvatar: null,
    },
  })

  const result = await prisma.chatMessage.createMany({
    data: candidates.map((candidate) => ({
      id: candidate.id,
      sessionId,
      senderId: candidate.role === "student" ? studentId : pet.id,
      type: MessageType.TEXT,
      content: candidate.content,
      seq: candidate.seq,
      emotionTag: candidate.riskLevel,
      status: MessageStatus.SENT,
      isRead: true,
      createdAt: candidate.createdAt,
    })),
    skipDuplicates: true,
  })

  if (result.count > 0) {
    const latest = await prisma.chatMessage.findFirst({
      where: { sessionId },
      orderBy: { createdAt: "desc" },
      select: { content: true, createdAt: true },
    })
    if (latest) {
      await prisma.chatSession.update({
        where: { id: sessionId },
        data: { lastMessage: latest.content.slice(0, 500), lastMessageAt: latest.createdAt },
      })
    }
  }

  return { created: result.count, sessionId }
}
