import assert from "node:assert/strict"
import { createRequire } from "node:module"
import { readFile } from "node:fs/promises"
import test from "node:test"

import { NextRequest } from "next/server"
import * as ts from "typescript"

import { middleware } from "../middleware"
import { generateToken } from "./auth"

type AuthRoute = {
  POST(request: NextRequest): Promise<Response>
}

type StoredUser = {
  id: string
  email: string
  name: string
  passwordHash: string
  role: string
  status: string
  avatar: null
}

const TEST_SECRET = "registration-route-test-secret-is-at-least-32-bytes"
const originalJwtEnvironment = {
  NODE_ENV: process.env.NODE_ENV,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_ISSUER: process.env.JWT_ISSUER,
  JWT_AUDIENCE: process.env.JWT_AUDIENCE,
}

function restoreEnvironmentValue(key: keyof typeof originalJwtEnvironment, value: string | undefined) {
  if (value === undefined) delete process.env[key]
  else process.env[key] = value
}

async function evaluateRoute(path: string, dependencies: Record<string, unknown>): Promise<AuthRoute> {
  const source = await readFile(new URL(path, import.meta.url), "utf8")
  const compiled = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  })
  const nodeRequire = createRequire(import.meta.url)
  const testRequire = (specifier: string) => dependencies[specifier] ?? nodeRequire(specifier)
  const evaluatedModule = { exports: {} as AuthRoute }
  const evaluate = new Function("exports", "module", "require", compiled.outputText) as (
    exports: AuthRoute,
    module: { exports: AuthRoute },
    require: (specifier: string) => unknown,
  ) => void
  evaluate(evaluatedModule.exports, evaluatedModule, testRequire)
  return evaluatedModule.exports
}

async function createAuthHarness() {
  let storedUser: StoredUser | null = null
  const databaseCalls: string[] = []
  const hashCalls: string[] = []

  const prisma = {
    teacher: {
      findUnique: async () => {
        databaseCalls.push("teacher.findUnique")
        return null
      },
      count: async () => {
        databaseCalls.push("teacher.count")
        return 0
      },
      create: async ({ data }: { data: Record<string, unknown> }) => {
        databaseCalls.push("teacher.create")
        return { id: "teacher-created", teacherId: data.teacherId, name: data.name, role: data.role }
      },
      update: async () => {
        databaseCalls.push("teacher.update")
        return null
      },
    },
    user: {
      findUnique: async ({ where }: { where: { email: string } }) => {
        databaseCalls.push("user.findUnique")
        return storedUser?.email === where.email ? storedUser : null
      },
      create: async ({ data }: { data: Omit<StoredUser, "id" | "status" | "avatar"> }) => {
        databaseCalls.push("user.create")
        storedUser = { id: "assistant-created", status: "ACTIVE", avatar: null, ...data }
        return storedUser
      },
      update: async () => {
        databaseCalls.push("user.update")
        return storedUser
      },
    },
  }
  const auth = {
    hashPassword: async (password: string) => {
      hashCalls.push(password)
      return `hashed:${password}`
    },
    verifyPassword: async (password: string, passwordHash: string) => passwordHash === `hashed:${password}`,
    generateToken,
  }
  const dependencies = {
    "@/lib/db": { prisma },
    "@/lib/auth": auth,
  }

  return {
    register: await evaluateRoute("../app/api/auth/register/route.ts", dependencies),
    login: await evaluateRoute("../app/api/auth/login/route.ts", dependencies),
    databaseCalls,
    hashCalls,
    getStoredUser: () => storedUser,
  }
}

function jsonRequest(path: string, body: Record<string, unknown>) {
  return new NextRequest(`http://sentinel.local${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
}

function staffToken(role: string) {
  return generateToken({
    userId: `${role.toLowerCase()}-provisioner`,
    email: `${role.toLowerCase()}-provisioner@example.com`,
    role,
    name: `${role} Provisioner`,
  })
}

test.beforeEach(() => {
  process.env.NODE_ENV = "test"
  process.env.JWT_SECRET = TEST_SECRET
  process.env.JWT_ISSUER = "psytwin-sentinel"
  process.env.JWT_AUDIENCE = "psytwin-sentinel"
})

test.after(() => {
  for (const [key, value] of Object.entries(originalJwtEnvironment)) {
    restoreEnvironmentValue(key as keyof typeof originalJwtEnvironment, value)
  }
})

test("public registration defaults to an assistant that can log in but cannot control Reachy", async () => {
  const harness = await createAuthHarness()
  const registration = await harness.register.POST(
    jsonRequest("/api/auth/register", {
      name: "Public Assistant",
      email: "assistant@example.com",
      password: "assistant-password",
    }),
  )
  const registrationBody = (await registration.json()) as { data?: { role?: string } }

  assert.equal(registration.status, 200)
  assert.equal(registrationBody.data?.role, "ASSISTANT")
  assert.equal(harness.getStoredUser()?.role, "ASSISTANT")

  const login = await harness.login.POST(
    jsonRequest("/api/auth/login", {
      email: "assistant@example.com",
      password: "assistant-password",
    }),
  )
  const loginBody = (await login.json()) as { data?: { token?: string } }
  assert.equal(login.status, 200)
  assert.ok(loginBody.data?.token)

  const reachyResponse = await middleware(
    new NextRequest("http://sentinel.local/api/pet-ai/reachy/device", {
      headers: { Authorization: `Bearer ${loginBody.data.token}` },
    }),
  )
  const otherApiResponse = await middleware(
    new NextRequest("http://sentinel.local/api/students", {
      headers: { Authorization: `Bearer ${loginBody.data.token}` },
    }),
  )
  assert.equal(reachyResponse.status, 403)
  assert.equal(otherApiResponse.status, 200)
})

test("public registration rejects caller-supplied operator roles before database access", async () => {
  for (const role of ["TEACHER", "ADMIN", "COUNSELOR"]) {
    const harness = await createAuthHarness()
    const response = await harness.register.POST(
      jsonRequest("/api/auth/register", {
        name: "Privilege Attempt",
        email: `${role.toLowerCase()}@example.com`,
        password: "password",
        role,
      }),
    )

    assert.equal(response.status, 403, role)
    assert.deepEqual(harness.databaseCalls, [], role)
    assert.deepEqual(harness.hashCalls, [], role)
  }
})

test("public registration rejects teacher account creation before database access", async () => {
  const harness = await createAuthHarness()
  const response = await harness.register.POST(
    jsonRequest("/api/auth/register", {
      type: "teacher",
      name: "Teacher Attempt",
      phone: "13800000009",
      password: "password",
    }),
  )

  assert.equal(response.status, 403)
  assert.deepEqual(harness.databaseCalls, [])
  assert.deepEqual(harness.hashCalls, [])
})

test("only administrators can dispatch staff provisioning mutations", async () => {
  const assistantToken = staffToken("ASSISTANT")
  const adminToken = staffToken("ADMIN")
  const mutations = [
    { path: "/api/users", method: "POST" },
    { path: "/api/teachers", method: "POST" },
    { path: "/api/users/user-1", method: "PATCH" },
    { path: "/api/teachers/teacher-1", method: "DELETE" },
  ]

  for (const mutation of mutations) {
    const assistantResponse = await middleware(
      new NextRequest(`http://sentinel.local${mutation.path}`, {
        method: mutation.method,
        headers: { Authorization: `Bearer ${assistantToken}` },
      }),
    )
    const adminResponse = await middleware(
      new NextRequest(`http://sentinel.local${mutation.path}`, {
        method: mutation.method,
        headers: { Authorization: `Bearer ${adminToken}` },
      }),
    )

    assert.equal(assistantResponse.status, 403, `${mutation.method} ${mutation.path}`)
    assert.equal(assistantResponse.headers.get("x-middleware-next"), null)
    assert.equal(adminResponse.status, 200, `${mutation.method} ${mutation.path}`)
    assert.equal(adminResponse.headers.get("x-middleware-next"), "1")
  }
})
