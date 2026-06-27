"use server"

import { prisma } from "@/lib/prisma"
import { getPetVariantAppearance } from "@/lib/pet-appearance.mjs"

export interface StudentPetSnapshot {
  id: string
  studentId: string
  studentName?: string
  studentClass?: string
  studentNo?: string
  name: string
  imageSrc: string
  species: string
  color: string
  accessory: string
  expression: string
  mood: number
  energy: number
  sociability: number
  activity: string
  scene: string
  schedule: string
  state: string
  metricChanges: {
    mood: number
    energy: number
    sociability: number
  }
  notes: Array<{ title: string; detail: string; tone: "good" | "calm" | "watch" }>
  logs: Array<{
    id: string
    time: string
    source: "小程序" | "Unity"
    title: string
    detail: string
    tone: "pocket" | "unity" | "diary" | "calm"
    mood?: number
    energy?: number
    sociability?: number
  }>
}

const petNames = ["小芯", "小安", "可乐", "奶茶", "球球", "墨墨"]
const petColors = ["雪白", "浅蓝", "奶油白", "薄荷绿", "月光银"]
const petAccessories = ["蓝色水手帽", "星星领巾", "圆框护目镜", "轻便背包", "铃铛挂饰"]
const petExpressions = ["平静", "好奇", "开心", "专注", "有点困"]
const petVariantSources = Array.from(
  { length: 20 },
  (_, index) => `/pet/variants/pet-${String(index + 1).padStart(2, "0")}.png`,
)
const petAssetVersion = "20260609-bottom-base-v3"

const activityLabels: Record<string, string> = {
  IDLE: "安静观察",
  WALKING: "在奇幻森林散步",
  RUNNING: "轻快跑动",
  EATING: "补充能量",
  SLEEPING: "安静休息",
  PLAYING: "和 AI 心宠打招呼",
  BATHING: "整理自己",
  GROOMING: "整理小背包",
  SOCIALIZING: "接近 AI 心宠同伴",
  EXPLORING: "观察树影变化",
  RESTING: "能量恢复",
  WORKING: "专注完成任务",
  STUDYING: "浏览心情日记",
  EXERCISING: "做轻量活动",
}

const sceneLabels: Record<string, string> = {
  fantasy_forest: "奇幻森林",
  campus_library: "图书馆",
  school_map: "校园地图",
  calm_room: "安静休息室",
}

function hashString(value: string) {
  return value.split("").reduce((acc, char) => {
    return (acc * 31 + char.charCodeAt(0)) >>> 0
  }, 7)
}

function pick<T>(items: T[], seed: number, offset = 0) {
  return items[(seed + offset) % items.length]
}

function bounded(seed: number, offset: number, min: number, max: number) {
  return min + ((seed * (offset + 17)) % (max - min + 1))
}

function getState(mood: number, energy: number, sociability: number, isSleeping: boolean) {
  if (isSleeping) return "安静休息"
  if (mood < 58) return "需要关注"
  if (energy < 58) return "能量恢复中"
  if (sociability >= 60) return "愿意互动"
  return "情绪舒展"
}

function buildNotes(mood: number, energy: number, sociability: number) {
  return [
    {
      title: mood >= 70 ? "状态稳定" : "情绪待观察",
      detail: mood >= 70 ? "心情值处于较舒展区间" : "心情值低于平稳区间，建议结合心墙内容继续观察",
      tone: mood >= 70 ? "good" as const : "watch" as const,
    },
    {
      title: energy >= 72 ? "能量充足" : "能量恢复",
      detail: energy >= 72 ? "当前适合探索和轻社交" : "当前更偏向安静休息与低刺激互动",
      tone: energy >= 72 ? "good" as const : "calm" as const,
    },
    {
      title: sociability >= 60 ? "愿意互动" : "社交半径收缩",
      detail: sociability >= 60 ? "愿意接近 AI 心宠同伴" : "更喜欢保持自己的活动半径",
      tone: sociability >= 60 ? "good" as const : "watch" as const,
    },
  ]
}

function formatTime(value: Date) {
  return value.toLocaleTimeString("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Shanghai",
  })
}

function readSociability(metadata: unknown) {
  if (metadata && typeof metadata === "object" && "sociability" in metadata) {
    const value = Number((metadata as { sociability?: unknown }).sociability)
    return Number.isFinite(value) ? value : undefined
  }
  return undefined
}

function toSnapshot(pet: Awaited<ReturnType<typeof findPet>>, student?: StudentInfo): StudentPetSnapshot {
  if (!pet) {
    throw new Error("Pet not found")
  }

  const seed = hashString(`${pet.id}:${pet.species}:${pet.color || ""}:${pet.name}`)
  const variantSource = pick(petVariantSources, seed)
  const variantAppearance = getPetVariantAppearance(variantSource)
  const activity = pet.currentActivityName || activityLabels[pet.currentActivityType] || "安静观察"
  const scene = sceneLabels[pet.currentScene || ""] || pet.currentScene || "奇幻森林"
  const schedule = pet.isSleeping ? "睡眠休息" : pet.controlState === "USER_CONTROLLED" ? "学生互动" : "自由活动"
  const state = getState(pet.mood, pet.energy, pet.sociability, pet.isSleeping)
  const previousDiary = pet.diaryEntries[1] || pet.diaryEntries[0]
  const previousMood = previousDiary?.mood ?? pet.mood
  const previousEnergy = previousDiary?.energy ?? pet.energy
  const previousSociability = readSociability(previousDiary?.metadata) ?? pet.sociability
  const diaryLogs = pet.diaryEntries.map((entry) => ({
    id: entry.id,
    time: formatTime(entry.createdAt),
    source: "小程序" as const,
    title: entry.title,
    detail: entry.content || "学生端记录了一次心宠状态变化。",
    tone: "diary" as const,
    mood: entry.mood ?? undefined,
    energy: entry.energy ?? undefined,
    sociability: readSociability(entry.metadata),
  }))
  const eventLogs = pet.events.map((event) => ({
    id: event.id,
    time: formatTime(event.startedAt),
    source: event.category === "ENVIRONMENTAL" ? "Unity" as const : "小程序" as const,
    title: event.name,
    detail: event.description || "心宠系统记录了一次行为事件。",
    tone: event.category === "ENVIRONMENTAL" ? "unity" as const : "pocket" as const,
  }))

  return {
    id: pet.id,
    studentId: pet.ownerId,
    studentName: student?.name || pet.owner.name,
    studentClass: student?.className || pet.owner.className,
    studentNo: student?.studentNo || pet.owner.studentNo,
    name: pet.name,
    imageSrc: `${variantSource}?v=${petAssetVersion}`,
    species: pet.species,
    color: variantAppearance.color || pet.color || pick(petColors, seed, 1),
    accessory: pet.accessories[0] || pick(petAccessories, seed, 2),
    expression: pet.expression || pick(petExpressions, seed, 3),
    mood: pet.mood,
    energy: pet.energy,
    sociability: pet.sociability,
    activity,
    scene,
    schedule,
    state,
    metricChanges: {
      mood: pet.mood - previousMood,
      energy: pet.energy - previousEnergy,
      sociability: pet.sociability - previousSociability,
    },
    notes: buildNotes(pet.mood, pet.energy, pet.sociability),
    logs: [...diaryLogs, ...eventLogs]
      .sort((a, b) => b.time.localeCompare(a.time))
      .slice(0, 6),
  }
}

interface StudentInfo {
  id: string
  name: string
  className: string
  studentNo: string
}

async function findPet(studentId: string) {
  return prisma.pet.findFirst({
    where: { ownerId: studentId },
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          className: true,
          studentNo: true,
        },
      },
      diaryEntries: {
        orderBy: { createdAt: "desc" },
        take: 6,
      },
      events: {
        orderBy: { startedAt: "desc" },
        take: 6,
      },
    },
    orderBy: { createdAt: "asc" },
  })
}

async function ensurePetHistory(pet: NonNullable<Awaited<ReturnType<typeof findPet>>>) {
  if (pet.diaryEntries.length === 0) {
    const seed = hashString(`${pet.id}:diary`)
    const now = Date.now()
    const diaryEntries = Array.from({ length: 4 }, (_, index) => {
      const distance = 4 - index
      const mood = Math.max(1, Math.min(100, pet.mood - bounded(seed, index + 1, -6, 8)))
      const energy = Math.max(1, Math.min(100, pet.energy - bounded(seed, index + 5, -7, 6)))
      const sociability = Math.max(1, Math.min(100, pet.sociability - bounded(seed, index + 9, -5, 7)))

      return {
        petId: pet.id,
        type: "DAILY" as const,
        title: index === 0 ? "今日状态更新" : `${distance}小时前状态记录`,
        content:
          index === 0
            ? "心宠状态完成一次同步，心情、能量与社交值出现轻微变化。"
            : "学生端记录了一次心宠活动后的状态快照。",
        mood,
        energy,
        metadata: { sociability },
        createdAt: new Date(now - distance * 60 * 60 * 1000),
      }
    })

    await prisma.petDiaryEntry.createMany({ data: diaryEntries })
  }

  if (pet.events.length === 0) {
    const seed = hashString(`${pet.id}:events`)
    const now = Date.now()
    await prisma.petEvent.createMany({
      data: [
        {
          petId: pet.id,
          type: "ACTIVITY",
          category: "BEHAVIOR",
          name: pick(["整理心宠背包", "查看心宠商店", "完成轻量互动"], seed, 1),
          description: "学生端触发心宠行为，状态数值随互动发生小幅变化。",
          status: "COMPLETED",
          startedAt: new Date(now - 45 * 60 * 1000),
          endedAt: new Date(now - 42 * 60 * 1000),
          duration: 3,
        },
        {
          petId: pet.id,
          type: "ENVIRONMENT_CHANGE",
          category: "ENVIRONMENTAL",
          name: "切换活动场景",
          description: "心宠从主场景切换到奇幻森林，活动节律重新计算。",
          status: "COMPLETED",
          startedAt: new Date(now - 2 * 60 * 60 * 1000),
          endedAt: new Date(now - 116 * 60 * 1000),
          duration: 4,
        },
        {
          petId: pet.id,
          type: "MOOD_CHANGE",
          category: "HEALTH",
          name: "状态波动记录",
          description: "系统检测到心情与能量指标出现变化，已写入学生端日志。",
          status: "COMPLETED",
          startedAt: new Date(now - 3 * 60 * 60 * 1000),
          endedAt: new Date(now - 178 * 60 * 1000),
          duration: 2,
        },
      ],
    })
  }
}

async function ensurePet(student: StudentInfo) {
  const existing = await findPet(student.id)
  if (existing) return existing

  const seed = hashString(`${student.id}:${student.studentNo}:${student.name}`)
  return prisma.pet.create({
    data: {
      id: `pet-${student.id}`,
      ownerId: student.id,
      name: pick(petNames, seed),
      species: "DOG",
      color: pick(petColors, seed, 1),
      accessories: [pick(petAccessories, seed, 2)],
      expression: pick(petExpressions, seed, 3),
      mood: bounded(seed, 1, 58, 86),
      energy: bounded(seed, 2, 52, 90),
      sociability: bounded(seed, 3, 34, 76),
      currentScene: "fantasy_forest",
      currentActivityType: "EXPLORING",
      currentActivityName: pick(activityLabelsList, seed, 4),
      isOnline: true,
    },
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          className: true,
          studentNo: true,
        },
      },
    },
  })
}

const activityLabelsList = Object.values(activityLabels)

export async function getStudentPetSnapshot(studentId: string): Promise<StudentPetSnapshot> {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    select: {
      id: true,
      name: true,
      className: true,
      studentNo: true,
    },
  })

  if (!student) {
    throw new Error("Student not found")
  }

  const pet = await ensurePet(student)
  await ensurePetHistory(pet)
  const petWithHistory = await findPet(student.id)
  return toSnapshot(petWithHistory, student)
}

export async function getStudentPetSnapshots(studentIds: string[]): Promise<Record<string, StudentPetSnapshot>> {
  const uniqueIds = Array.from(new Set(studentIds)).filter(Boolean)
  if (uniqueIds.length === 0) return {}

  const students = await prisma.student.findMany({
    where: { id: { in: uniqueIds } },
    select: {
      id: true,
      name: true,
      className: true,
      studentNo: true,
    },
  })

  const snapshots: Record<string, StudentPetSnapshot> = {}
  for (const student of students) {
    const pet = await ensurePet(student)
    await ensurePetHistory(pet)
    const petWithHistory = await findPet(student.id)
    snapshots[student.id] = toSnapshot(petWithHistory, student)
  }

  return snapshots
}
