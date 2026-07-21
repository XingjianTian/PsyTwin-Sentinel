export const JWT_ALGORITHM = "HS256" as const
export const DEFAULT_JWT_ISSUER = "psytwin-sentinel"
export const DEFAULT_JWT_AUDIENCE = "psytwin-sentinel"
export const DEVELOPMENT_JWT_SECRET = "your-secret-key-change-in-production-min-32-characters-long"

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
  const configuredSecret = environment.JWT_SECRET?.trim()
  const isProduction = environment.NODE_ENV === "production"

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
    throw new Error("JWT_SECRET must be configured with a non-placeholder value in production")
  }
  return config
}
