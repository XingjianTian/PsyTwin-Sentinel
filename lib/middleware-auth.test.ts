import assert from "node:assert/strict"
import { createHmac } from "node:crypto"
import test from "node:test"

import { NextRequest } from "next/server"

import { middleware } from "../middleware"
import { generateToken, verifyToken } from "./auth"

const TEST_SECRET = "test-only-jwt-secret-that-is-at-least-32-characters"
const TEST_ISSUER = "psytwin-sentinel"
const TEST_AUDIENCE = "psytwin-sentinel"
const PLACEHOLDER_SECRET = "your-secret-key-change-in-production-min-32-characters-long"
const originalJwtEnvironment = {
  NODE_ENV: process.env.NODE_ENV,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_ISSUER: process.env.JWT_ISSUER,
  JWT_AUDIENCE: process.env.JWT_AUDIENCE,
}

function encodeJson(value: unknown): string {
  return Buffer.from(JSON.stringify(value)).toString("base64url")
}

function restoreEnvironmentValue(key: keyof typeof originalJwtEnvironment, value: string | undefined) {
  if (value === undefined) {
    delete process.env[key]
  } else {
    process.env[key] = value
  }
}

function configureTestJwt() {
  process.env.NODE_ENV = "test"
  process.env.JWT_SECRET = TEST_SECRET
  process.env.JWT_ISSUER = TEST_ISSUER
  process.env.JWT_AUDIENCE = TEST_AUDIENCE
}

function jwtPayload(overrides: Record<string, unknown> = {}) {
  const now = Math.floor(Date.now() / 1000)
  return {
    userId: "teacher-1",
    email: "teacher@example.com",
    role: "TEACHER",
    name: "Test Teacher",
    iss: TEST_ISSUER,
    aud: TEST_AUDIENCE,
    iat: now,
    exp: now + 3600,
    ...overrides,
  }
}

function signToken(
  payloadOverrides: Record<string, unknown> = {},
  headerOverrides: Record<string, unknown> = {},
  secret = TEST_SECRET,
): string {
  const header = encodeJson({ alg: "HS256", typ: "JWT", ...headerOverrides })
  const payload = encodeJson(jwtPayload(payloadOverrides))
  const signature = createHmac("sha256", secret).update(`${header}.${payload}`).digest("base64url")
  return `${header}.${payload}.${signature}`
}

function reachyRequest(token?: string, transport: "bearer" | "cookie" = "bearer") {
  const headers = new Headers()
  if (token && transport === "bearer") headers.set("Authorization", `Bearer ${token}`)
  if (token && transport === "cookie") headers.set("Cookie", `token=${token}`)
  return new NextRequest("http://sentinel.local/api/pet-ai/reachy/device", { headers })
}

test.beforeEach(configureTestJwt)
test.after(() => {
  for (const [key, value] of Object.entries(originalJwtEnvironment)) {
    restoreEnvironmentValue(key as keyof typeof originalJwtEnvironment, value)
  }
})

test("physical Reachy controls reject a forged three-part JWT", async () => {
  const forgedToken = [
    encodeJson({ alg: "HS256", typ: "JWT" }),
    encodeJson(jwtPayload({ userId: "attacker", role: "ADMIN" })),
    "forged-signature",
  ].join(".")

  const response = await middleware(reachyRequest(forgedToken))

  assert.equal(response.status, 401)
})

test("physical Reachy controls reject an unsigned three-part JWT", async () => {
  const unsignedToken = [
    encodeJson({ alg: "none", typ: "JWT" }),
    encodeJson(jwtPayload({ userId: "attacker", role: "ADMIN" })),
    "unsigned",
  ].join(".")

  const response = await middleware(reachyRequest(unsignedToken))

  assert.equal(response.status, 401)
})

test("middleware rejects a JWT whose payload was tampered after signing", async () => {
  const parts = signToken().split(".")
  parts[1] = encodeJson(jwtPayload({ userId: "attacker", role: "ADMIN" }))

  const response = await middleware(reachyRequest(parts.join(".")))

  assert.equal(response.status, 401)
})

test("middleware rejects a JWT whose signature was tampered", async () => {
  const parts = signToken().split(".")
  parts[2] = `${parts[2].startsWith("a") ? "b" : "a"}${parts[2].slice(1)}`

  const response = await middleware(reachyRequest(parts.join(".")))

  assert.equal(response.status, 401)
})

test("middleware rejects an expired JWT", async () => {
  const response = await middleware(reachyRequest(signToken({ exp: Math.floor(Date.now() / 1000) - 1 })))

  assert.equal(response.status, 401)
})

test("middleware rejects a JWT before its not-before time", async () => {
  const response = await middleware(reachyRequest(signToken({ nbf: Math.floor(Date.now() / 1000) + 60 })))

  assert.equal(response.status, 401)
})

test("middleware rejects JWTs from the wrong issuer", async () => {
  const response = await middleware(reachyRequest(signToken({ iss: "attacker" })))

  assert.equal(response.status, 401)
})

test("middleware rejects JWTs for the wrong audience", async () => {
  const response = await middleware(reachyRequest(signToken({ aud: "attacker" })))

  assert.equal(response.status, 401)
})

test("middleware rejects malformed JWTs", async () => {
  const response = await middleware(reachyRequest("not-json.not-json.not-a-signature"))

  assert.equal(response.status, 401)
})

test("middleware accepts a valid Bearer JWT and forwards its identity", async () => {
  const response = await middleware(reachyRequest(signToken()))

  assert.equal(response.status, 200)
  assert.equal(response.headers.get("x-middleware-request-x-user-id"), "teacher-1")
  assert.equal(response.headers.get("x-middleware-request-x-user-role"), "TEACHER")
})

test("middleware accepts a valid JWT from the session cookie", async () => {
  const response = await middleware(reachyRequest(signToken(), "cookie"))

  assert.equal(response.status, 200)
  assert.equal(response.headers.get("x-middleware-request-x-user-id"), "teacher-1")
  assert.equal(response.headers.get("x-middleware-request-x-user-role"), "TEACHER")
})

test("tokens issued by the login auth utility use the middleware JWT policy", async () => {
  const token = generateToken({
    userId: "teacher-1",
    email: "teacher@example.com",
    role: "TEACHER",
    name: "Test Teacher",
  })
  const [encodedHeader, encodedPayload] = token.split(".")
  const header = JSON.parse(Buffer.from(encodedHeader, "base64url").toString())
  const payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString())

  assert.deepEqual(header, { alg: "HS256", typ: "JWT" })
  assert.equal(payload.iss, TEST_ISSUER)
  assert.equal(payload.aud, TEST_AUDIENCE)
  assert.equal((await middleware(reachyRequest(token))).status, 200)
  assert.equal(verifyToken(token)?.userId, "teacher-1")
})

test("middleware fails closed when the production JWT secret is missing", async () => {
  process.env.NODE_ENV = "production"
  delete process.env.JWT_SECRET

  const response = await middleware(reachyRequest(signToken()))

  assert.equal(response.status, 401)
})

test("middleware fails closed when production uses the placeholder JWT secret", async () => {
  process.env.NODE_ENV = "production"
  process.env.JWT_SECRET = PLACEHOLDER_SECRET

  const response = await middleware(reachyRequest(signToken({}, {}, PLACEHOLDER_SECRET)))

  assert.equal(response.status, 401)
})

test("token issuance fails closed when the production JWT secret is missing", () => {
  process.env.NODE_ENV = "production"
  delete process.env.JWT_SECRET

  assert.throws(
    () =>
      generateToken({
        userId: "teacher-1",
        email: "teacher@example.com",
        role: "TEACHER",
        name: "Test Teacher",
      }),
    /JWT_SECRET/,
  )
})

test("token issuance fails closed when production uses the placeholder JWT secret", () => {
  process.env.NODE_ENV = "production"
  process.env.JWT_SECRET = PLACEHOLDER_SECRET

  assert.throws(
    () =>
      generateToken({
        userId: "teacher-1",
        email: "teacher@example.com",
        role: "TEACHER",
        name: "Test Teacher",
      }),
    /JWT_SECRET/,
  )
})

test("public routes remain accessible without a JWT", async () => {
  const response = await middleware(new NextRequest("http://sentinel.local/login"))

  assert.equal(response.status, 200)
})
