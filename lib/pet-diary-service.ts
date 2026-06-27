import { DiaryEntryType, PetSpecies, Prisma } from "@prisma/client"

import { prisma } from "@/lib/db"
import {
  buildRandomDiaryCreatedAt,
  formatDateKey,
  getMissingDiaryDates,
  shouldTriggerDiary,
} from "@/lib/pet-diary-core"
import { petDiaryTemplates } from "@/prisma/pet-diary-templates"

type DiaryMetadata = {
  source: "template_library"
  templateSlug: string
  sceneId: string
  dateKey: string
  writtenBy: "server"
}

function getDateRange(dateKey: string) {
  const start = new Date(`${dateKey}T00:00:00+08:00`)
  const end = new Date(start)
  end.setDate(end.getDate() + 1)

  return { start, end }
}

function getEntryDateKey(entry: { createdAt: Date }) {
  return formatDateKey(entry.createdAt)
}

function formatTime(date: Date) {
  return date.toLocaleTimeString("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Shanghai",
  })
}

function getMetadata(entry: { metadata: Prisma.JsonValue | null }): Partial<DiaryMetadata> {
  if (!entry.metadata || typeof entry.metadata !== "object" || Array.isArray(entry.metadata)) {
    return {}
  }

  return entry.metadata as Partial<DiaryMetadata>
}

export function mapPetDiaryEntry(entry: {
  id: string
  type: DiaryEntryType
  title: string
  content: string | null
  mood: number | null
  energy: number | null
  metadata: Prisma.JsonValue | null
  createdAt: Date
}) {
  const metadata = getMetadata(entry)

  return {
    id: entry.id,
    time: formatTime(entry.createdAt),
    type: "DB_DIARY",
    title: entry.title,
    content: entry.content || "",
    sceneId: metadata.sceneId || "unknown",
    dateKey: metadata.dateKey || getEntryDateKey(entry),
    mood: entry.mood,
    energy: entry.energy,
    source: "template_library",
    templateSlug: metadata.templateSlug || "",
    createdAt: entry.createdAt.toISOString(),
  }
}

export function buildDiaryDataMap(entries: Awaited<ReturnType<typeof findPetDiaryEntries>>) {
  return entries.reduce<Record<string, ReturnType<typeof mapPetDiaryEntry>[]>>((map, entry) => {
    const item = mapPetDiaryEntry(entry)
    const key = item.dateKey
    map[key] = map[key] || []
    map[key].push(item)
    return map
  }, {})
}

export async function ensurePetDiaryTemplates() {
  const count = await prisma.petDiaryTemplate.count()
  if (count >= petDiaryTemplates.length) return count

  for (const template of petDiaryTemplates) {
    await prisma.petDiaryTemplate.upsert({
      where: { slug: template.slug },
      update: {
        title: template.title,
        content: template.content,
        sceneHint: template.sceneHint,
        tone: template.tone,
        active: true,
      },
      create: template,
    })
  }

  return petDiaryTemplates.length
}

export async function resolvePetForUser(userId: string) {
  const student =
    (await prisma.student.findUnique({
      where: { id: userId },
      select: { id: true },
    })) ||
    (await prisma.student.findFirst({
      orderBy: { createdAt: "asc" },
      select: { id: true },
    }))

  if (!student) {
    throw new Error("未找到可关联的学生用户，无法创建心宠日记")
  }

  const existingPet = await prisma.pet.findFirst({
    where: { ownerId: student.id },
    orderBy: { createdAt: "asc" },
  })

  if (existingPet) return existingPet

  return prisma.pet.create({
    data: {
      ownerId: student.id,
      name: "小心宠",
      species: PetSpecies.DOG,
      currentScene: "dormitory",
    },
  })
}

async function findPetDiaryEntries(petId: string, dateKey?: string) {
  const where: Prisma.PetDiaryEntryWhereInput = {
    petId,
    type: DiaryEntryType.DAILY,
    metadata: {
      path: ["source"],
      equals: "template_library",
    },
  }

  if (dateKey) {
    const { start, end } = getDateRange(dateKey)
    where.createdAt = {
      gte: start,
      lt: end,
    }
  }

  return prisma.petDiaryEntry.findMany({
    where,
    orderBy: { createdAt: "asc" },
  })
}

async function pickRandomDiaryTemplate(sceneId: string) {
  await ensurePetDiaryTemplates()

  const where = {
    active: true,
    OR: [{ sceneHint: sceneId }, { sceneHint: null }],
  }
  const count = await prisma.petDiaryTemplate.count({ where })
  const skip = count > 0 ? Math.floor(Math.random() * count) : 0

  return prisma.petDiaryTemplate.findFirst({
    where,
    orderBy: { slug: "asc" },
    skip,
  })
}

export async function getPetDiaryForDate(userId: string, dateKey = formatDateKey(new Date())) {
  const pet = await resolvePetForUser(userId)
  const entries = await findPetDiaryEntries(pet.id, dateKey)

  return {
    dateKey,
    entries: entries.map(mapPetDiaryEntry),
    diaryDataMap: buildDiaryDataMap(entries),
  }
}

export async function createPetDiaryEntry({
  userId,
  dateKey = formatDateKey(new Date()),
  sceneId = "dormitory",
}: {
  userId: string
  dateKey?: string
  sceneId?: string
}) {
  const pet = await resolvePetForUser(userId)
  const template = await pickRandomDiaryTemplate(sceneId)

  if (!template) {
    throw new Error("心宠日记模板库为空")
  }

  const entry = await prisma.petDiaryEntry.create({
    data: {
      petId: pet.id,
      type: DiaryEntryType.DAILY,
      title: template.title,
      content: template.content,
      mood: pet.mood,
      energy: pet.energy,
      createdAt: buildRandomDiaryCreatedAt({ dateKey }),
      metadata: {
        source: "template_library",
        templateSlug: template.slug,
        sceneId,
        dateKey,
        writtenBy: "server",
      } satisfies DiaryMetadata,
    },
  })

  return mapPetDiaryEntry(entry)
}

export async function maybeCreatePetDiary({
  userId,
  sceneId,
  dateKey = formatDateKey(new Date()),
  hour = new Date().getHours(),
}: {
  userId: string
  sceneId?: string | null
  dateKey?: string
  hour?: number
}) {
  const pet = await resolvePetForUser(userId)
  const existingEntries = await findPetDiaryEntries(pet.id, dateKey)
  const triggered = shouldTriggerDiary({
    sceneId,
    hour,
    alreadyWrittenToday: existingEntries.length > 0,
  })

  if (!triggered) {
    return {
      triggered: false,
      entry: null,
      entries: existingEntries.map(mapPetDiaryEntry),
      diaryDataMap: buildDiaryDataMap(existingEntries),
    }
  }

  const entry = await createPetDiaryEntry({
    userId,
    dateKey,
    sceneId: sceneId || "dormitory",
  })
  const entries = await findPetDiaryEntries(pet.id, dateKey)

  return {
    triggered: true,
    entry,
    entries: entries.map(mapPetDiaryEntry),
    diaryDataMap: buildDiaryDataMap(entries),
  }
}

export async function backfillMissingPetDiaries({
  userId,
  lastOnlineAt,
  maxDays = 7,
}: {
  userId: string
  lastOnlineAt?: string | null
  maxDays?: number
}) {
  const pet = await resolvePetForUser(userId)
  const existingEntries = await findPetDiaryEntries(pet.id)
  const existingDates = Array.from(new Set(existingEntries.map(getEntryDateKey)))
  const missingDates = getMissingDiaryDates({
    lastOnlineAt,
    existingDates,
    maxDays,
  })

  const generated = []

  for (const dateKey of missingDates) {
    generated.push(
      await createPetDiaryEntry({
        userId,
        dateKey,
        sceneId: Math.random() < 0.5 ? "dormitory" : "library",
      }),
    )
  }

  const allEntries = await findPetDiaryEntries(pet.id)

  return {
    generatedDates: generated.map((entry) => entry.dateKey),
    entries: generated,
    diaryDataMap: buildDiaryDataMap(allEntries),
  }
}
