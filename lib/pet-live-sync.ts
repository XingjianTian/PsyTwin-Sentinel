export const DEFAULT_POCKET_SCENE_ID = "bedroom"

export const POCKET_PET_ANIMATION_FRAMES = [
  "/pet/pocket-live/frames/000_eef1e56dfae4dd8b436c47ebea8d33bc_0.png",
  "/pet/pocket-live/frames/282_eef1e56dfae4dd8b436c47ebea8d33bc_7.png",
  "/pet/pocket-live/frames/046_eef1e56dfae4dd8b436c47ebea8d33bc_14.png",
  "/pet/pocket-live/frames/124_eef1e56dfae4dd8b436c47ebea8d33bc_21.png",
  "/pet/pocket-live/frames/201_eef1e56dfae4dd8b436c47ebea8d33bc_28.png",
  "/pet/pocket-live/frames/244_eef1e56dfae4dd8b436c47ebea8d33bc_35.png",
  "/pet/pocket-live/frames/252_eef1e56dfae4dd8b436c47ebea8d33bc_42.png",
  "/pet/pocket-live/frames/259_eef1e56dfae4dd8b436c47ebea8d33bc_49.png",
  "/pet/pocket-live/frames/267_eef1e56dfae4dd8b436c47ebea8d33bc_56.png",
  "/pet/pocket-live/frames/275_eef1e56dfae4dd8b436c47ebea8d33bc_63.png",
  "/pet/pocket-live/frames/283_eef1e56dfae4dd8b436c47ebea8d33bc_70.png",
  "/pet/pocket-live/frames/290_eef1e56dfae4dd8b436c47ebea8d33bc_77.png",
  "/pet/pocket-live/frames/298_eef1e56dfae4dd8b436c47ebea8d33bc_84.png",
  "/pet/pocket-live/frames/306_eef1e56dfae4dd8b436c47ebea8d33bc_91.png",
  "/pet/pocket-live/frames/313_eef1e56dfae4dd8b436c47ebea8d33bc_98.png",
  "/pet/pocket-live/frames/008_eef1e56dfae4dd8b436c47ebea8d33bc_105.png",
  "/pet/pocket-live/frames/016_eef1e56dfae4dd8b436c47ebea8d33bc_112.png",
  "/pet/pocket-live/frames/023_eef1e56dfae4dd8b436c47ebea8d33bc_119.png",
  "/pet/pocket-live/frames/031_eef1e56dfae4dd8b436c47ebea8d33bc_126.png",
  "/pet/pocket-live/frames/039_eef1e56dfae4dd8b436c47ebea8d33bc_133.png",
  "/pet/pocket-live/frames/047_eef1e56dfae4dd8b436c47ebea8d33bc_140.png",
  "/pet/pocket-live/frames/054_eef1e56dfae4dd8b436c47ebea8d33bc_147.png",
  "/pet/pocket-live/frames/062_eef1e56dfae4dd8b436c47ebea8d33bc_154.png",
  "/pet/pocket-live/frames/070_eef1e56dfae4dd8b436c47ebea8d33bc_161.png",
  "/pet/pocket-live/frames/077_eef1e56dfae4dd8b436c47ebea8d33bc_168.png",
  "/pet/pocket-live/frames/085_eef1e56dfae4dd8b436c47ebea8d33bc_175.png",
  "/pet/pocket-live/frames/093_eef1e56dfae4dd8b436c47ebea8d33bc_182.png",
  "/pet/pocket-live/frames/100_eef1e56dfae4dd8b436c47ebea8d33bc_189.png",
  "/pet/pocket-live/frames/108_eef1e56dfae4dd8b436c47ebea8d33bc_196.png",
  "/pet/pocket-live/frames/117_eef1e56dfae4dd8b436c47ebea8d33bc_203.png",
  "/pet/pocket-live/frames/125_eef1e56dfae4dd8b436c47ebea8d33bc_210.png",
  "/pet/pocket-live/frames/132_eef1e56dfae4dd8b436c47ebea8d33bc_217.png",
  "/pet/pocket-live/frames/140_eef1e56dfae4dd8b436c47ebea8d33bc_224.png",
  "/pet/pocket-live/frames/148_eef1e56dfae4dd8b436c47ebea8d33bc_231.png",
  "/pet/pocket-live/frames/155_eef1e56dfae4dd8b436c47ebea8d33bc_238.png",
  "/pet/pocket-live/frames/163_eef1e56dfae4dd8b436c47ebea8d33bc_245.png",
  "/pet/pocket-live/frames/171_eef1e56dfae4dd8b436c47ebea8d33bc_252.png",
  "/pet/pocket-live/frames/178_eef1e56dfae4dd8b436c47ebea8d33bc_259.png",
  "/pet/pocket-live/frames/186_eef1e56dfae4dd8b436c47ebea8d33bc_266.png",
  "/pet/pocket-live/frames/194_eef1e56dfae4dd8b436c47ebea8d33bc_273.png",
  "/pet/pocket-live/frames/202_eef1e56dfae4dd8b436c47ebea8d33bc_280.png",
  "/pet/pocket-live/frames/209_eef1e56dfae4dd8b436c47ebea8d33bc_287.png",
  "/pet/pocket-live/frames/217_eef1e56dfae4dd8b436c47ebea8d33bc_294.png",
  "/pet/pocket-live/frames/226_eef1e56dfae4dd8b436c47ebea8d33bc_301.png",
  "/pet/pocket-live/frames/233_eef1e56dfae4dd8b436c47ebea8d33bc_308.png",
] as const

const POCKET_SCENE_NAMES: Record<string, string> = {
  amusement_park: "游乐园",
  arcade: "游戏厅",
  bedroom: "卧室",
  bonfire_area: "篝火营地",
  cafe: "咖啡馆",
  cafeteria: "食堂",
  cinema: "电影院",
  crystal_cave: "水晶洞穴",
  deep_forest: "森林深处",
  dormitory: "宿舍",
  fairy_lake: "精灵湖",
  garden: "花园",
  hammock_area: "吊床休息区",
  kitchen: "厨房",
  library: "图书馆",
  mushroom_village: "蘑菇村落",
  picnic_lawn: "野餐草坪",
  playground: "操场",
  psychological_room: "心理咨询室",
  star_meadow: "星光草地",
  stream_side: "溪流边",
  study_room: "书房",
  supermarket: "超市",
  teaching_building: "教学楼",
  viewing_platform: "观景台",
}

export interface PocketScenePresentation {
  sceneId: string
  sceneName: string
  sceneBackgroundSrc: string
}

export interface PocketPetLiveUpdate extends Partial<PocketScenePresentation> {
  mood?: number
  energy?: number
  sociability?: number
  activity?: string
  stateVersion?: number
  updatedAt?: number
  logs?: PocketPetLiveLog[]
  demoConversation?: PocketPetDemoConversation | null
}

export interface PocketPetDemoConversation {
  active: boolean
  phase: string
  speaker?: "main" | "companion"
  text?: string
  companion: {
    id: string
    name: string
  }
}

export interface PocketPetLiveLog {
  id: string
  date: string
  time: string
  timestamp?: number
  type: "scene_change" | "event" | "status_change" | "activity"
  title: string
  detail: string
  sceneId: string
  sceneName: string
  mood?: number
  energy?: number
  sociability?: number
}

export function buildPocketPetWebSocketBaseUrl(host?: string) {
  const normalizedHost = host?.trim() || "127.0.0.1"
  return `ws://${normalizedHost}:13002/ws/pet`
}

export function buildPocketPetWebSocketUrl(baseUrl: string, userId: string) {
  const url = new URL(baseUrl)
  url.searchParams.set("userId", userId)
  url.searchParams.set("clientType", "sentinel")
  return url.toString()
}

export function mergePocketPetLiveLogs(
  currentLogs: PocketPetLiveLog[] | undefined,
  incomingLogs: PocketPetLiveLog[],
) {
  const uniqueLogs = new Map<string, PocketPetLiveLog>()
  for (const log of [...incomingLogs, ...(currentLogs || [])]) {
    if (!uniqueLogs.has(log.id)) uniqueLogs.set(log.id, log)
  }

  return Array.from(uniqueLogs.values())
    .sort((left, right) => (right.timestamp || 0) - (left.timestamp || 0))
    .slice(0, 6)
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function finiteNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined
}

function metricValue(value: unknown) {
  const number = finiteNumber(value)
  return number === undefined ? undefined : Math.max(0, Math.min(100, number))
}

function nonEmptyString(value: unknown) {
  return typeof value === "string" && value.trim() ? value : undefined
}

const SHANGHAI_TIME_ZONE = "Asia/Shanghai"
const FUTURE_LOG_TOLERANCE_MS = 5 * 60 * 1000

function formatShanghaiDate(timestamp: number) {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: SHANGHAI_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(timestamp))
}

function formatShanghaiTime(timestamp: number) {
  return new Intl.DateTimeFormat("zh-CN", {
    timeZone: SHANGHAI_TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(new Date(timestamp))
}

function parseShanghaiWallClock(date: string, time: string) {
  const timestamp = Date.parse(`${date}T${time}:00+08:00`)
  return Number.isFinite(timestamp) ? timestamp : undefined
}

function parsePocketActivityLogs(
  activityLog: unknown,
  fallbackSceneId: string,
  referenceTime?: number,
): PocketPetLiveLog[] | undefined {
  if (!isRecord(activityLog)) return undefined

  const parsedLogs: Array<PocketPetLiveLog & { hasAuthoritativeTimestamp?: boolean }> = []
  let currentSceneId = fallbackSceneId
  const datedEntries = Object.entries(activityLog).sort(([left], [right]) =>
    left.localeCompare(right),
  )

  for (const [date, entries] of datedEntries) {
    if (!Array.isArray(entries)) continue

    const sortedEntries = entries
      .map((entry, index) => ({ entry, index }))
      .sort((left, right) => {
        const leftTime = isRecord(left.entry) ? nonEmptyString(left.entry.time) || "" : ""
        const rightTime = isRecord(right.entry) ? nonEmptyString(right.entry.time) || "" : ""
        return leftTime.localeCompare(rightTime)
      })

    for (const { entry, index } of sortedEntries) {
      if (!isRecord(entry)) continue
      const time = nonEmptyString(entry.time)
      const rawType = nonEmptyString(entry.type)
      if (!time || !rawType) continue

      if (rawType === "scene_change") {
        currentSceneId = nonEmptyString(entry.scene) || currentSceneId
      }

      const scene = getPocketScenePresentation(currentSceneId)
      const mood = metricValue(entry.mood)
      const energy = metricValue(entry.energy)
      const sociability = metricValue(entry.social)
      const description = nonEmptyString(entry.desc)
      const type: PocketPetLiveLog["type"] =
        rawType === "scene_change" || rawType === "event" || rawType === "status_change"
          ? rawType
          : "activity"

      let title = description || "心宠活动"
      let detail = `发生地点：${scene.sceneName}`

      if (type === "scene_change") {
        title = `前往${scene.sceneName}`
        detail = `心宠的位置已同步到${scene.sceneName}。`
      } else if (type === "status_change") {
        title = "状态更新"
        const metrics = [
          mood === undefined ? null : `心情 ${mood}`,
          energy === undefined ? null : `能量 ${energy}`,
          sociability === undefined ? null : `社交 ${sociability}`,
        ].filter(Boolean)
        detail = metrics.length > 0
          ? `在${scene.sceneName}活动，${metrics.join(" · ")}`
          : `在${scene.sceneName}活动，状态发生变化`
      }

      const authoritativeTimestamp = finiteNumber(entry.timestamp)
      const timestamp = authoritativeTimestamp ?? parseShanghaiWallClock(date, time)
      parsedLogs.push({
        id: `${date}-${time}-${authoritativeTimestamp ?? index}`,
        date,
        time,
        ...(timestamp === undefined ? {} : { timestamp }),
        ...(authoritativeTimestamp === undefined ? {} : { hasAuthoritativeTimestamp: true }),
        type,
        title,
        detail,
        sceneId: scene.sceneId,
        sceneName: scene.sceneName,
        ...(mood === undefined ? {} : { mood }),
        ...(energy === undefined ? {} : { energy }),
        ...(sociability === undefined ? {} : { sociability }),
      })
    }
  }

  const newestLegacyTimestamp = parsedLogs.reduce(
    (latest, log) => log.hasAuthoritativeTimestamp
      ? latest
      : Math.max(latest, log.timestamp || 0),
    0,
  )
  const futureOffset = referenceTime !== undefined
    && newestLegacyTimestamp > referenceTime + FUTURE_LOG_TOLERANCE_MS
    ? Math.ceil((newestLegacyTimestamp - referenceTime) / (60 * 60 * 1000)) * 60 * 60 * 1000
    : 0

  return parsedLogs
    .map((log) => {
      const { hasAuthoritativeTimestamp, ...publicLog } = log
      if (hasAuthoritativeTimestamp || !futureOffset || log.timestamp === undefined) return publicLog
      const timestamp = log.timestamp - futureOffset
      return {
        ...publicLog,
        date: formatShanghaiDate(timestamp),
        time: formatShanghaiTime(timestamp),
        timestamp,
      }
    })
    .sort((left, right) => (left.timestamp || 0) - (right.timestamp || 0))
    .slice(-6)
    .reverse()
}

export function getPocketScenePresentation(sceneId: string): PocketScenePresentation {
  const knownSceneName = POCKET_SCENE_NAMES[sceneId]

  return {
    sceneId,
    sceneName: knownSceneName || sceneId,
    sceneBackgroundSrc: `/pet/pocket-live/scenes/${knownSceneName ? sceneId : DEFAULT_POCKET_SCENE_ID}.png`,
  }
}

export function parsePocketPetStatusMessage(
  rawMessage: unknown,
  currentStateVersion = -1,
): PocketPetLiveUpdate | null {
  let message = rawMessage

  if (typeof rawMessage === "string") {
    try {
      message = JSON.parse(rawMessage)
    } catch {
      return null
    }
  }

  if (!isRecord(message) || message.type !== "pet_status" || !isRecord(message.payload)) {
    return null
  }

  const payload = message.payload
  if (!isRecord(payload.status)) return null

  const stateVersion = finiteNumber(payload.stateVersion)
  if (stateVersion !== undefined && stateVersion < currentStateVersion) return null

  const status = payload.status
  const update: PocketPetLiveUpdate = {}
  const mood = metricValue(status.mood)
  const energy = metricValue(status.energy)
  const sociability = metricValue(status.social)
  const sceneId = nonEmptyString(status.sceneId)
  const activity = nonEmptyString(status.activity)
  const updatedAt = finiteNumber(payload.updatedAt)
  const logs = parsePocketActivityLogs(
    status.activityLog,
    sceneId || DEFAULT_POCKET_SCENE_ID,
    updatedAt,
  )
  const demoConversation = isRecord(status.demoConversation)
    && status.demoConversation.active === true
    && isRecord(status.demoConversation.companion)
    ? {
        active: true,
        phase: nonEmptyString(status.demoConversation.phase) || "meeting",
        ...(status.demoConversation.speaker === "main"
          || status.demoConversation.speaker === "companion"
          ? { speaker: status.demoConversation.speaker }
          : {}),
        ...(nonEmptyString(status.demoConversation.text)
          ? { text: nonEmptyString(status.demoConversation.text) }
          : {}),
        companion: {
          id: nonEmptyString(status.demoConversation.companion.id) || "demo_companion",
          name: nonEmptyString(status.demoConversation.companion.name) || "小暖",
        },
      } satisfies PocketPetDemoConversation
    : null

  if (mood !== undefined) update.mood = mood
  if (energy !== undefined) update.energy = energy
  if (sociability !== undefined) update.sociability = sociability
  if (sceneId) Object.assign(update, getPocketScenePresentation(sceneId))
  if (activity) update.activity = activity
  if (stateVersion !== undefined) update.stateVersion = stateVersion
  if (updatedAt !== undefined) update.updatedAt = updatedAt
  if (logs) update.logs = logs
  if (Object.hasOwn(status, "demoConversation")) {
    update.demoConversation = demoConversation
  }

  return update
}
