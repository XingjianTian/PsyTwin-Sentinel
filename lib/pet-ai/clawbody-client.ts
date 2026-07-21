const serviceUrl = () => (process.env.CLAWBODY_SERVICE_URL || "http://127.0.0.1:7860").replace(/\/$/, "")

export class ClawBodyUnavailableError extends Error {
  constructor(message = "心宠设备服务暂不可用") {
    super(message)
    this.name = "ClawBodyUnavailableError"
  }
}

export async function requestClawBody<T>(path: string, init?: RequestInit): Promise<T> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 5000)
  try {
    const response = await fetch(`${serviceUrl()}${path}`, {
      ...init,
      cache: "no-store",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        "X-Service-Key": process.env.CLAWBODY_SERVICE_KEY || "psytwin-clawbody-local",
        ...init?.headers,
      },
    })
    const payload = await response.json().catch(() => ({}))
    if (!response.ok) {
      const error = new Error(payload.detail || payload.message || "心宠设备服务请求失败")
      ;(error as Error & { status?: number }).status = response.status
      throw error
    }
    return payload as T
  } catch (error) {
    if ((error as Error & { status?: number }).status) throw error
    throw new ClawBodyUnavailableError()
  } finally {
    clearTimeout(timeout)
  }
}

export function isClawBodyUnavailable(error: unknown) {
  return error instanceof ClawBodyUnavailableError
}
