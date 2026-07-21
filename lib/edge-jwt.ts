import { JWT_ALGORITHM, readJwtConfig } from "./jwt-config"
import { validateJwtClaims } from "./jwt-claims"

export type MiddlewareJwtPayload = {
  userId: string
  role: string
}

type JwtHeader = {
  alg?: unknown
  typ?: unknown
}

function decodeBase64Url(value: string): Uint8Array | null {
  if (!value || !/^[A-Za-z0-9_-]+$/.test(value) || value.length % 4 === 1) return null

  try {
    const base64 = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=")
    const decoded = atob(base64)
    const bytes = new Uint8Array(decoded.length)
    for (let index = 0; index < decoded.length; index += 1) {
      bytes[index] = decoded.charCodeAt(index)
    }
    return bytes
  } catch {
    return null
  }
}

function decodeJson<T>(value: string): T | null {
  const bytes = decodeBase64Url(value)
  if (!bytes) return null

  try {
    const decoded = JSON.parse(new TextDecoder().decode(bytes))
    return decoded && typeof decoded === "object" && !Array.isArray(decoded) ? (decoded as T) : null
  } catch {
    return null
  }
}

export async function verifyMiddlewareJwt(token: string): Promise<MiddlewareJwtPayload | null> {
  const config = readJwtConfig()
  if (!config) return null

  const parts = token.split(".")
  if (parts.length !== 3 || parts.some((part) => !part)) return null

  const [encodedHeader, encodedPayload, encodedSignature] = parts
  const header = decodeJson<JwtHeader>(encodedHeader)
  const signature = decodeBase64Url(encodedSignature)
  if (header?.alg !== JWT_ALGORITHM || header.typ !== "JWT" || !signature) return null

  try {
    const subtle = globalThis.crypto?.subtle
    if (!subtle) return null

    const encoder = new TextEncoder()
    const key = await subtle.importKey(
      "raw",
      encoder.encode(config.secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"],
    )
    const validSignature = await subtle.verify(
      "HMAC",
      key,
      signature,
      encoder.encode(`${encodedHeader}.${encodedPayload}`),
    )
    if (!validSignature) return null
  } catch {
    return null
  }

  const claims = validateJwtClaims(decodeJson<unknown>(encodedPayload), config)
  if (!claims) return null

  return { userId: claims.userId, role: claims.role }
}
