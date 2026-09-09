export function getPetSyncUrl(environment: NodeJS.ProcessEnv = process.env) {
  const explicitUrl = environment.PET_SYNC_URL?.trim()
  if (explicitUrl) return explicitUrl.replace(/\/$/, "")

  const host = environment.NEXT_PUBLIC_PET_SYNC_HOST?.trim() || "127.0.0.1"
  return `http://${host}:13002`
}

export type PetHelpEventInput = {
  sourceId: string
  title: string
  description: string
  category?: "emotion" | "study" | "social"
  severity?: "high" | "medium" | "low"
  deadline?: number
}

type PetHelpEventResponse = {
  code?: number
  message?: string
  data?: { event?: { id?: string }; created?: boolean }
}

export async function sendPetHelpEvent(
  event: PetHelpEventInput,
  request: typeof fetch = fetch,
) {
  const response = await request(`${getPetSyncUrl()}/api/pet/events/notify`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Pet-Sync-Key": process.env.PET_SYNC_INTERNAL_KEY || "psytwin-pet-sync-local",
    },
    body: JSON.stringify({
      userId: process.env.PET_SYNC_DEMO_USER_ID || "demo_pet",
      event,
    }),
  })

  const payload = (await response.json().catch(() => ({}))) as PetHelpEventResponse
  if (!response.ok || payload.code !== 0 || !payload.data?.event?.id) {
    throw new Error(payload.message || `心宠求助事件发送失败（HTTP ${response.status}）`)
  }

  return { id: payload.data.event.id, created: payload.data.created === true }
}
