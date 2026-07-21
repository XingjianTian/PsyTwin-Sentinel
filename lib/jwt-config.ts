export const JWT_ALGORITHM = "HS256" as const
export const DEFAULT_JWT_ISSUER = "psytwin-sentinel"
export const DEFAULT_JWT_AUDIENCE = "psytwin-sentinel"
export const DEVELOPMENT_JWT_SECRET = "your-secret-key-change-in-production-min-32-characters-long"
export const MINIMUM_JWT_SECRET_BYTES = 32

const PRODUCTION_SECRET_PLACEHOLDERS = new Set([
  DEVELOPMENT_JWT_SECRET,
  "replace-with-a-random-secret-of-at-least-32-characters",
])

type JwtEnvironment = Partial<
  Record<"NODE_ENV" | "JWT_SECRET" | "JWT_ISSUER" | "JWT_AUDIENCE", string | undefined>
>

export type JwtConfig = {
  secret: string
  issuer: string
  audience: string
}

export function readJwtConfig(environment: JwtEnvironment = process.env): JwtConfig | null {
  const rawSecret = environment.JWT_SECRET
  const configuredSecret = rawSecret?.trim()
  const isProduction = environment.NODE_ENV === "production"

  if (
    rawSecret !== undefined &&
    (!configuredSecret || new TextEncoder().encode(configuredSecret).byteLength < MINIMUM_JWT_SECRET_BYTES)
  ) {
    return null
  }

  if (isProduction && (!configuredSecret || PRODUCTION_SECRET_PLACEHOLDERS.has(configuredSecret))) {
    return null
  }

  return {
    secret: configuredSecret || DEVELOPMENT_JWT_SECRET,
    issuer: environment.JWT_ISSUER?.trim() || DEFAULT_JWT_ISSUER,
    audience: environment.JWT_AUDIENCE?.trim() || DEFAULT_JWT_AUDIENCE,
  }
}

export function requireJwtConfig(environment: JwtEnvironment = process.env): JwtConfig {
  const config = readJwtConfig(environment)
  if (!config) {
    throw new Error(
      `JWT_SECRET must contain at least ${MINIMUM_JWT_SECRET_BYTES} UTF-8 bytes and must not use a production placeholder`,
    )
  }
  return config
}
