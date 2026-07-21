import type { JwtConfig } from "./jwt-config"

export type ValidatedJwtClaims = Record<string, unknown> & {
  userId: string
  role: string
  iss: string
  aud: string
  iat: number
  exp: number
  nbf?: number
}

function isNumericDate(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && Number.isInteger(value)
}

export function validateJwtClaims(
  value: unknown,
  config: Pick<JwtConfig, "issuer" | "audience">,
  now = Math.floor(Date.now() / 1000),
): ValidatedJwtClaims | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null

  const claims = value as Record<string, unknown>
  if (
    typeof claims.userId !== "string" ||
    claims.userId.length === 0 ||
    typeof claims.role !== "string" ||
    claims.role.length === 0 ||
    claims.iss !== config.issuer ||
    claims.aud !== config.audience ||
    !isNumericDate(claims.iat) ||
    !isNumericDate(claims.exp) ||
    now >= claims.exp ||
    (claims.nbf !== undefined && (!isNumericDate(claims.nbf) || now < claims.nbf))
  ) {
    return null
  }

  return claims as ValidatedJwtClaims
}
