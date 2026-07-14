export const DIARY_WRITING_SCENES = ["dormitory", "library"] as const

const DIARY_PROBABILITY = 0.4
const EVENING_START_HOUR = 20
const EVENING_END_HOUR = 23

export function shouldTriggerDiary({
  sceneId,
  hour,
  randomValue = Math.random(),
  alreadyWritten = false,
  alreadyWrittenToday = false,
}: {
  sceneId?: string | null
  hour: number
  randomValue?: number
  alreadyWritten?: boolean
  alreadyWrittenToday?: boolean
}) {
  if (alreadyWritten || alreadyWrittenToday) return false
  if (!sceneId || !DIARY_WRITING_SCENES.includes(sceneId as (typeof DIARY_WRITING_SCENES)[number])) return false
  if (hour < EVENING_START_HOUR || hour > EVENING_END_HOUR) return false

  return randomValue < DIARY_PROBABILITY
}

export function formatDateKey(dateInput: Date | string) {
  const date = dateInput instanceof Date ? dateInput : new Date(dateInput)
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, "0")
  const day = `${date.getDate()}`.padStart(2, "0")

  return `${year}-${month}-${day}`
}

export function buildRandomDiaryCreatedAt({
  dateKey,
  hourRandomValue = Math.random(),
  minuteRandomValue = Math.random(),
}: {
  dateKey: string
  hourRandomValue?: number
  minuteRandomValue?: number
}) {
  const hour = 20 + Math.floor(hourRandomValue * 4)
  const minute = 7 + Math.floor(minuteRandomValue * 52)

  return new Date(`${dateKey}T${`${hour}`.padStart(2, "0")}:${`${minute}`.padStart(2, "0")}:00+08:00`)
}

export function pickRandomDiaryCount(randomValue = Math.random()) {
  return 4 + Math.floor(Math.max(0, Math.min(0.999999, randomValue)) * 5)
}

export function buildRandomDiarySchedule({ dateKey, count, randomValues = [] }: {
  dateKey: string
  count: number
  randomValues?: number[]
}) {
  const safeCount = Math.max(0, Math.min(8, Math.floor(count)))
  const slots = new Set<number>()
  const totalSlots = 16 * 60

  for (let index = 0; index < safeCount; index += 1) {
    const randomValue = randomValues[index] ?? Math.random()
    let slot = Math.floor(Math.max(0, Math.min(0.999999, randomValue)) * totalSlots)
    while (slots.has(slot)) {
      slot = (slot + 1) % totalSlots
    }
    slots.add(slot)
  }

  return [...slots]
    .sort((left, right) => left - right)
    .map((slot) => {
      const hour = 8 + Math.floor(slot / 60)
      const minute = slot % 60
      return new Date(`${dateKey}T${`${hour}`.padStart(2, "0")}:${`${minute}`.padStart(2, "0")}:00+08:00`)
    })
}

export function getMissingDiaryDates({
  lastOnlineAt,
  now = new Date(),
  existingDates = [],
  maxDays = 7,
}: {
  lastOnlineAt?: string | Date | null
  now?: Date
  existingDates?: string[]
  maxDays?: number
}) {
  if (!lastOnlineAt) return []

  const existing = new Set(existingDates)
  const cursor = new Date(lastOnlineAt)
  cursor.setHours(0, 0, 0, 0)

  const today = new Date(now)
  today.setHours(0, 0, 0, 0)

  const dates: string[] = []

  while (cursor < today) {
    const key = formatDateKey(cursor)
    if (!existing.has(key)) {
      dates.push(key)
    }
    cursor.setDate(cursor.getDate() + 1)
  }

  return dates.slice(-maxDays)
}
