import assert from "node:assert/strict"
import { createRequire } from "node:module"
import { readFile } from "node:fs/promises"
import test from "node:test"
import * as ts from "typescript"

type UpstreamCall = { service: "host" | "clawbody"; path: string; init?: RequestInit & { longRunning?: boolean } }

type DeviceRouteHarness = {
  GET(request: unknown): Promise<Response>
  POST(request: unknown): Promise<Response>
}

class HostUnavailable extends Error {}
class ClawBodyUnavailable extends Error {}

const SAME_ORIGIN_JSON_HEADERS = {
  "Content-Type": "application/json",
  Origin: "http://sentinel.local",
}

function upstreamDeviceStatus() {
  return {
    phase: "ready",
    operation_id: "op-7",
    serial_port: "COM5",
    daemon_owned: true,
    daemon_pid: 123,
    daemon_version: "1.2.3",
    daemon_state: "running",
    motor_mode: "stiff",
    media: { camera: "ready", microphone: "ready", speaker: "ready", input_volume: 50, output_volume: 60 },
    clawbody_reachable: true,
    error: null,
  }
}

async function loadDeviceRoute(
  responder: (call: UpstreamCall) => unknown | Promise<unknown>,
): Promise<{ route: DeviceRouteHarness; NextRequest: new (input: string | URL, init?: RequestInit) => unknown; calls: UpstreamCall[] }> {
  const source = await readFile(new URL("../../app/api/pet-ai/reachy/device/route.ts", import.meta.url), "utf8")
  const compiled = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  })
  const nodeRequire = createRequire(import.meta.url)
  const calls: UpstreamCall[] = []
  const request = (service: UpstreamCall["service"]) => async (path: string, init?: UpstreamCall["init"]) => {
    const call = { service, path, init }
    calls.push(call)
    return responder(call)
  }
  const testRequire = (specifier: string) => {
    if (specifier === "@/lib/pet-ai/host-bridge-client") {
      return {
        isHostBridgeUnavailable: (error: unknown) => error instanceof HostUnavailable,
        requestHostBridge: request("host"),
      }
    }
    if (specifier === "@/lib/pet-ai/clawbody-client") {
      return {
        isClawBodyUnavailable: (error: unknown) => error instanceof ClawBodyUnavailable,
        requestClawBody: request("clawbody"),
      }
    }
    return nodeRequire(specifier)
  }
  const evaluatedModule = { exports: {} as DeviceRouteHarness }
  const evaluate = new Function("exports", "module", "require", compiled.outputText) as (
    exports: DeviceRouteHarness,
    module: { exports: DeviceRouteHarness },
    require: (specifier: string) => unknown,
  ) => void
  evaluate(evaluatedModule.exports, evaluatedModule, testRequire)
  return {
    route: evaluatedModule.exports,
    NextRequest: nodeRequire("next/server").NextRequest,
    calls,
  }
}

test("ClawBody defaults to the single Docker service on port 7860", async () => {
  const source = await readFile(new URL("./clawbody-client.ts", import.meta.url), "utf8")
  assert.match(source, /http:\/\/127\.0\.0\.1:7860/)
  assert.doesNotMatch(source, /127\.0\.0\.1:7862/)
})

test("student detail API returns the persisted OCEAN pet personality", async () => {
  const source = await readFile(new URL("../../app/api/pet-ai/students/[studentId]/route.ts", import.meta.url), "utf8")

  for (const field of ["openness", "conscientiousness", "extraversion", "agreeableness", "neuroticism"]) {
    assert.match(source, new RegExp(field))
  }
  assert.match(source, /personality/)
  assert.match(source, /buildStableOceanPersonality/)
  assert.match(source, /every\(\(value\) => value === 50\)/)
  assert.match(source, /\/pet\/pocket-main-pet\.png/)
  assert.match(source, /buildDemoConversations\(studentId, petSnapshot\.name, student\.riskLevel\)/)
})

test("Gemini Live sync persists messages, marks their source, and reuses risk work-order sync", async () => {
  const syncSource = await readFile(new URL("../../app/api/pet-ai/gemini/sync/route.ts", import.meta.url), "utf8")
  const detailSource = await readFile(new URL("../../app/api/pet-ai/students/[studentId]/route.ts", import.meta.url), "utf8")

  assert.match(syncSource, /syncReachyConversation/)
  assert.match(syncSource, /syncReachyRiskWorkOrders/)
  assert.match(syncSource, /cbtCard: \{ source: "gemini-live" \}/)
  assert.match(syncSource, /classifyMessageRisk/)
  assert.match(syncSource, /仅测试学生可以同步 Gemini Live 实时对话/)
  assert.match(detailSource, /source: isGeminiLive \? "gemini-live" as const : "reachy" as const/)
})

test("Reachy defaults to the Pocket test student", async () => {
  const sessionSource = await readFile(new URL("../../app/api/pet-ai/reachy/session/route.ts", import.meta.url), "utf8")
  const listSource = await readFile(new URL("../../app/api/pet-ai/students/route.ts", import.meta.url), "utf8")

  assert.match(sessionSource, /stu-test/)
  assert.match(sessionSource, /测试学生/)
  assert.match(listSource, /stu-test/)
})

test("Pocket test student is pinned, renamed, and reads persisted physical-pet history", async () => {
  const listSource = await readFile(new URL("../../app/api/pet-ai/students/route.ts", import.meta.url), "utf8")
  const detailSource = await readFile(new URL("../../app/api/pet-ai/students/[studentId]/route.ts", import.meta.url), "utf8")
  const viewSource = await readFile(new URL("../../components/views/pet-ai-management-view.tsx", import.meta.url), "utf8")
  const snapshotSource = await readFile(new URL("../../app/actions/pet-snapshot.ts", import.meta.url), "utf8")

  assert.match(listSource, /prioritizeDemoStudent/)
  assert.match(listSource, /DEMO_PET_NAME/)
  assert.match(detailSource, /DEMO_PET_NAME/)
  assert.match(snapshotSource, /const demoStudentId = process\.env\.PET_AI_DEMO_STUDENT_ID \|\| "stu-test"/)
  assert.match(snapshotSource, /const desiredName = pet\.ownerId === demoStudentId \? DEMO_PET_NAME : pet\.name/)
  assert.match(detailSource, /buildPetLiveChatSessionId/)
  assert.match(detailSource, /chatMessage\.findMany/)
  assert.match(viewSource, /自动保存在这里/)
})

test("Reachy routes load the persisted profile instead of trusting browser identity", async () => {
  const sessionSource = await readFile(new URL("../../app/api/pet-ai/reachy/session/route.ts", import.meta.url), "utf8")
  const testSource = await readFile(new URL("../../app/api/pet-ai/reachy/test/route.ts", import.meta.url), "utf8")
  const viewSource = await readFile(new URL("../../components/views/pet-ai-management-view.tsx", import.meta.url), "utf8")

  assert.match(sessionSource, /buildPetRuntimeIdentity/)
  assert.match(sessionSource, /aiProfile/)
  assert.match(testSource, /buildPetRuntimeIdentity/)
  assert.doesNotMatch(sessionSource, /identity:\s*z\.string/)
  assert.doesNotMatch(viewSource, /identity:\s*profile\.systemPrompt/)
  assert.doesNotMatch(viewSource, /tone:\s*profile\.tone/)
})

test("Reachy status proxies the two-layer event cursor", async () => {
  const statusSource = await readFile(new URL("../../app/api/pet-ai/reachy/status/route.ts", import.meta.url), "utf8")
  assert.match(statusSource, /eventAfter/)
  assert.match(statusSource, /\/v1\/events\?after=/)
  assert.match(statusSource, /events/)
  assert.match(statusSource, /syncReachyRiskWorkOrders/)
  assert.match(statusSource, /workOrderSync/)
  assert.match(statusSource, /syncReachyConversation/)
  assert.match(statusSource, /conversationSync/)
})

test("only the Pocket test student can clear persisted physical-pet conversations", async () => {
  const routeSource = await readFile(new URL("../../app/api/pet-ai/students/[studentId]/conversations/route.ts", import.meta.url), "utf8")
  const viewSource = await readFile(new URL("../../components/views/pet-ai-management-view.tsx", import.meta.url), "utf8")

  assert.match(routeSource, /studentId !== demoStudentId/)
  assert.match(routeSource, /status: 403/)
  assert.match(routeSource, /chatSession\.deleteMany/)
  assert.match(viewSource, /detail\?\.isDemoStudent && detail\.conversations\.length > 0/)
  assert.match(viewSource, /清空测试学生的对话记录/)
})

test("Reachy device API exposes only the protected typed proxy surface", async () => {
  const routeSource = await readFile(new URL("../../app/api/pet-ai/reachy/device/route.ts", import.meta.url), "utf8")
  const middlewareSource = await readFile(new URL("../../middleware.ts", import.meta.url), "utf8")

  assert.match(routeSource, /z\.discriminatedUnion\("action"/)
  assert.match(routeSource, /\.strict\(\)/)
  for (const path of [
    "/v1/device/status",
    "/v1/device/discover",
    "/v1/device/logs?after=",
    "/v1/device/start",
    "/v1/device/stop",
    "/v1/device/restart",
    "/v1/device/action",
    "/v1/device/processing",
    "/v1/device/choreography",
    "/v1/device/pose",
    "/v1/device/volume",
    "/v1/status",
    "/v1/session/stop",
  ]) {
    assert.match(routeSource, new RegExp(path.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")))
  }
  assert.match(routeSource, /Promise\.all/)
  assert.match(routeSource, /Cache-Control.*no-store/)
  assert.doesNotMatch(routeSource, /HOST_BRIDGE_(?:URL|API_KEY)/)
  assert.doesNotMatch(routeSource, /NEXT_PUBLIC_HOST_BRIDGE/)
  const publicRoutesSource = middlewareSource.match(/const publicRoutes = \[([\s\S]*?)\];/)?.[1]
  assert.ok(publicRoutesSource)
  assert.doesNotMatch(publicRoutesSource, /["']\/api\/pet-ai/)
})

test("Reachy device GET aggregates hardware, discovery, logs, and ClawBody status", async () => {
  const status = {
    phase: "ready",
    operation_id: "op-7",
    serial_port: "COM5",
    daemon_owned: true,
    daemon_pid: 123,
    daemon_version: "1.2.3",
    daemon_state: "running",
    motor_mode: "stiff",
    media: { camera: "ready", microphone: "ready", speaker: "ready", input_volume: 60, output_volume: 70 },
    clawbody_reachable: false,
    error: null,
  }
  const devices = [{ port: "COM5", label: "Reachy Mini Lite (COM5)", vid: "1A86", pid: "55D3" }]
  const logs = { cursor: 8, items: [{ id: 8, level: "info", message: "ready", created_at: "now" }] }
  const session = { running: true, student_id: "stu-test", state: "running", error: null }
  const { route, NextRequest, calls } = await loadDeviceRoute(({ path }) => {
    if (path === "/v1/device/status") return status
    if (path === "/v1/device/discover") return devices
    if (path === "/v1/device/logs?after=7") return logs
    if (path === "/v1/status") return session
    throw new Error(`unexpected path: ${path}`)
  })

  const response = await route.GET(new NextRequest("http://sentinel.local/api/pet-ai/reachy/device?after=7"))

  assert.equal(response.status, 200)
  assert.match(response.headers.get("cache-control") || "", /no-store/)
  assert.deepEqual(await response.json(), {
    data: { ...status, clawbody_reachable: true, session, devices, logs },
  })
  assert.deepEqual(calls.map(({ service, path }) => `${service}:${path}`), [
    "host:/v1/device/status",
    "host:/v1/device/discover",
    "host:/v1/device/logs?after=7",
    "clawbody:/v1/status",
  ])
})

test("Reachy device GET keeps hardware available when ClawBody is offline", async () => {
  const { route, NextRequest } = await loadDeviceRoute(({ service, path }) => {
    if (service === "clawbody") throw new ClawBodyUnavailable("service key must not leak")
    if (path === "/v1/device/status") {
      return {
        phase: "offline", operation_id: null, serial_port: null, daemon_owned: false, daemon_pid: null,
        daemon_version: null, daemon_state: null, motor_mode: null,
        media: { camera: "unknown", microphone: "unknown", speaker: "unknown", input_volume: null, output_volume: null },
        clawbody_reachable: false, error: null,
      }
    }
    if (path === "/v1/device/discover") return []
    if (path === "/v1/device/logs?after=0") return { cursor: 0, items: [] }
    throw new Error(`unexpected path: ${path}`)
  })

  const response = await route.GET(new NextRequest("http://sentinel.local/api/pet-ai/reachy/device?after=not-a-cursor"))
  const body = await response.json()

  assert.equal(response.status, 200)
  assert.equal(body.data.clawbody_reachable, false)
  assert.deepEqual(body.data.session, { state: "offline" })
  assert.doesNotMatch(JSON.stringify(body), /service key must not leak/)
})

test("Reachy device GET keeps hardware available when ClawBody returns an HTTP error", async () => {
  const { route, NextRequest } = await loadDeviceRoute(({ service, path }) => {
    if (service === "clawbody") {
      const error = new Error("ClawBody 500 password=top-secret") as Error & { status?: number }
      error.status = 500
      throw error
    }
    if (path === "/v1/device/status") {
      return {
        phase: "offline", operation_id: null, serial_port: null, daemon_owned: false, daemon_pid: null,
        daemon_version: null, daemon_state: null, motor_mode: null,
        media: { camera: "unknown", microphone: "unknown", speaker: "unknown", input_volume: null, output_volume: null },
        clawbody_reachable: false, error: null,
      }
    }
    if (path === "/v1/device/discover") return []
    if (path === "/v1/device/logs?after=0") return { cursor: 0, items: [] }
    throw new Error(`unexpected path: ${path}`)
  })

  const response = await route.GET(new NextRequest("http://sentinel.local/api/pet-ai/reachy/device"))
  const body = await response.json()

  assert.equal(response.status, 200)
  assert.equal(body.data.clawbody_reachable, false)
  assert.deepEqual(body.data.session, { state: "offline" })
  assert.doesNotMatch(JSON.stringify(body), /top-secret|password/)
})

test("Reachy device GET strips unexpected nested upstream fields", async () => {
  const { route, NextRequest } = await loadDeviceRoute(({ path }) => {
    if (path === "/v1/device/status") {
      return {
        phase: "ready", operation_id: null, serial_port: "COM5", daemon_owned: true, daemon_pid: 123,
        daemon_version: "1.2.3", daemon_state: "running", motor_mode: "stiff",
        media: {
          camera: "ready", microphone: "ready", speaker: "ready", input_volume: 50, output_volume: 60,
          device_key: "media-secret",
        },
        clawbody_reachable: true,
        error: {
          code: "none",
          phase: "ready",
          message: "Authorization: Bearer status-message-secret",
          detail: "HOST_BRIDGE_API_KEY=status-detail-secret",
          traceback: "error-secret",
        },
      }
    }
    if (path === "/v1/device/discover") {
      return [{ port: "COM5", label: "Reachy", vid: "1A86", pid: "55D3", executable: "device-secret" }]
    }
    if (path === "/v1/device/logs?after=0") {
      return {
        cursor: 1,
        items: [{ id: 1, level: "info", message: "password=log-message-secret", created_at: "now", context: "log-secret" }],
      }
    }
    if (path === "/v1/status") {
      return {
        running: true,
        student_id: "stu-test",
        state: "running",
        error: "X-Service-Key: session-error-secret",
        service_key: "session-secret",
      }
    }
    throw new Error(`unexpected path: ${path}`)
  })

  const response = await route.GET(new NextRequest("http://sentinel.local/api/pet-ai/reachy/device"))
  const body = await response.json()

  assert.equal(response.status, 200)
  assert.doesNotMatch(
    JSON.stringify(body),
    /media-secret|error-secret|device-secret|log-secret|session-secret|status-message-secret|status-detail-secret|log-message-secret|session-error-secret/,
  )
})

test("Reachy device POST projects and redacts successful Host Bridge status payloads", async () => {
  const { route, NextRequest } = await loadDeviceRoute(() => ({
    ...upstreamDeviceStatus(),
    host_bridge_key: "post-top-secret",
    media: { ...upstreamDeviceStatus().media, api_key: "post-media-secret" },
    error: {
      code: "daemon_warning",
      phase: "ready",
      message: "Authorization: Bearer post-message-secret",
      detail: "password=post-detail-secret",
      traceback: "post-traceback-secret",
    },
  }))
  const response = await route.POST(new NextRequest("http://sentinel.local/api/pet-ai/reachy/device", {
    method: "POST",
    headers: SAME_ORIGIN_JSON_HEADERS,
    body: JSON.stringify({ action: "start", serialPort: "COM5" }),
  }))
  const body = await response.json()

  assert.equal(response.status, 200)
  assert.deepEqual(Object.keys(body.data).sort(), [
    "clawbody_reachable", "daemon_owned", "daemon_pid", "daemon_state", "daemon_version", "error", "media",
    "motor_mode", "operation_id", "phase", "serial_port",
  ])
  assert.deepEqual(Object.keys(body.data.media).sort(), [
    "camera", "input_volume", "microphone", "output_volume", "speaker",
  ])
  assert.deepEqual(Object.keys(body.data.error).sort(), ["code", "detail", "message", "phase"])
  assert.doesNotMatch(
    JSON.stringify(body),
    /post-top-secret|post-media-secret|post-message-secret|post-detail-secret|post-traceback-secret/,
  )
})

test("Reachy device POST rejects malformed successful Host Bridge status payloads", async () => {
  const { route, NextRequest } = await loadDeviceRoute(() => ({
    ...upstreamDeviceStatus(),
    phase: "shelling_out",
    detail: "HOST_BRIDGE_API_KEY=invalid-payload-secret",
  }))
  const response = await route.POST(new NextRequest("http://sentinel.local/api/pet-ai/reachy/device", {
    method: "POST",
    headers: SAME_ORIGIN_JSON_HEADERS,
    body: JSON.stringify({ action: "restart" }),
  }))
  const body = await response.json()

  assert.equal(response.status, 502)
  assert.equal(body.message, "心宠设备控制请求失败")
  assert.doesNotMatch(JSON.stringify(body), /invalid-payload-secret|HOST_BRIDGE_API_KEY/)
})

test("Reachy discover and stop POST results use exact safe response contracts", async () => {
  const discoverHarness = await loadDeviceRoute(() => [
    { port: "COM5", label: "Reachy", vid: "1A86", pid: "55D3", api_key: "discover-result-secret" },
  ])
  const discoverResponse = await discoverHarness.route.POST(new discoverHarness.NextRequest(
    "http://sentinel.local/api/pet-ai/reachy/device",
    {
      method: "POST",
      headers: SAME_ORIGIN_JSON_HEADERS,
      body: JSON.stringify({ action: "discover" }),
    },
  ))
  const discoverBody = await discoverResponse.json()
  assert.deepEqual(discoverBody, {
    data: [{ port: "COM5", label: "Reachy", vid: "1A86", pid: "55D3" }],
  })

  const stopHarness = await loadDeviceRoute(({ path }) => {
    if (path === "/v1/status") return { running: false, state: "idle" }
    if (path === "/v1/device/stop") {
      return { ...upstreamDeviceStatus(), host_bridge_key: "stop-result-secret" }
    }
    throw new Error(`unexpected path: ${path}`)
  })
  const stopResponse = await stopHarness.route.POST(new stopHarness.NextRequest(
    "http://sentinel.local/api/pet-ai/reachy/device",
    {
      method: "POST",
      headers: SAME_ORIGIN_JSON_HEADERS,
      body: JSON.stringify({ action: "stop" }),
    },
  ))
  const stopBody = await stopResponse.json()
  assert.deepEqual(Object.keys(stopBody.data.device).sort(), [
    "clawbody_reachable", "daemon_owned", "daemon_pid", "daemon_state", "daemon_version", "error", "media",
    "motor_mode", "operation_id", "phase", "serial_port",
  ])
  assert.doesNotMatch(JSON.stringify({ discoverBody, stopBody }), /result-secret/)
})

test("Reachy device GET reports an unavailable Host Bridge without leaking transport details", async () => {
  const { route, NextRequest } = await loadDeviceRoute(({ service }) => {
    if (service === "host") throw new HostUnavailable("HOST_BRIDGE_API_KEY=top-secret")
    return { running: false, state: "idle" }
  })

  const response = await route.GET(new NextRequest("http://sentinel.local/api/pet-ai/reachy/device"))
  const body = await response.json()

  assert.equal(response.status, 503)
  assert.equal(body.message, "心宠设备控制桥未运行")
  assert.match(response.headers.get("cache-control") || "", /no-store/)
  assert.doesNotMatch(JSON.stringify(body), /top-secret|HOST_BRIDGE_API_KEY/)
})

test("Reachy device POST rejects unknown and extra command fields before proxying", async () => {
  for (const body of [
    { action: "shell", command: "whoami" },
    { action: "discover", command: "whoami" },
    { action: "start", serialPort: "C:/robot.exe" },
    { action: "volume", target: "speaker", volume: 50, key: "secret" },
    { action: "choreography", kind: "emotion", move: "../../wake_up" },
    { action: "choreography", kind: "music", move: "loving1" },
    { action: "pose", headPitch: 0, headRoll: 0, headYaw: 66, bodyYaw: 0, leftAntenna: 0, rightAntenna: 0, duration: 1 },
  ]) {
    const { route, NextRequest, calls } = await loadDeviceRoute(() => {
      throw new Error("upstream must not run")
    })
    const response = await route.POST(new NextRequest("http://sentinel.local/api/pet-ai/reachy/device", {
      method: "POST",
      headers: SAME_ORIGIN_JSON_HEADERS,
      body: JSON.stringify(body),
    }))

    assert.equal(response.status, 400)
    assert.deepEqual(calls, [])
    assert.match(response.headers.get("cache-control") || "", /no-store/)
  }
})

test("Reachy device POST rejects cross-origin cookie mutations before proxying", async () => {
  const { route, NextRequest, calls } = await loadDeviceRoute(() => {
    throw new Error("upstream must not run")
  })
  const response = await route.POST(new NextRequest("http://sentinel.local/api/pet-ai/reachy/device", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: "token=valid-middleware-session",
      Origin: "https://attacker.example",
    },
    body: JSON.stringify({ action: "discover" }),
  }))

  assert.equal(response.status, 403)
  assert.deepEqual(calls, [])
})

test("Reachy device POST rejects non-JSON mutations before parsing or proxying", async () => {
  const { route, NextRequest, calls } = await loadDeviceRoute(() => {
    throw new Error("upstream must not run")
  })
  const response = await route.POST(new NextRequest("http://sentinel.local/api/pet-ai/reachy/device", {
    method: "POST",
    headers: {
      "Content-Type": "text/plain",
      Cookie: "token=valid-middleware-session",
      Origin: "http://sentinel.local",
    },
    body: JSON.stringify({ action: "discover" }),
  }))

  assert.equal(response.status, 415)
  assert.deepEqual(calls, [])
})

test("Reachy device POST rejects a missing Origin for cookie mutations", async () => {
  const { route, NextRequest, calls } = await loadDeviceRoute(() => {
    throw new Error("upstream must not run")
  })
  const response = await route.POST(new NextRequest("http://sentinel.local/api/pet-ai/reachy/device", {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: "token=valid-middleware-session" },
    body: JSON.stringify({ action: "discover" }),
  }))

  assert.equal(response.status, 403)
  assert.deepEqual(calls, [])
})

test("Reachy device POST accepts same-origin cookie and originless Bearer mutations", async () => {
  const headerSets: HeadersInit[] = [
    {
      "Content-Type": "application/json; charset=utf-8",
      Cookie: "token=valid-middleware-session",
      Origin: "http://sentinel.local",
    },
    {
      "Content-Type": "application/json",
      Authorization: "Bearer validated-by-middleware",
    },
  ]
  for (const headers of headerSets) {
    const { route, NextRequest, calls } = await loadDeviceRoute(() => [
      { port: "COM5", label: "Reachy", vid: "1A86", pid: "55D3" },
    ])
    const response = await route.POST(new NextRequest("http://sentinel.local/api/pet-ai/reachy/device", {
      method: "POST",
      headers,
      body: JSON.stringify({ action: "discover" }),
    }))

    assert.equal(response.status, 200)
    assert.deepEqual(calls.map(({ path }) => path), ["/v1/device/discover"])
  }
})

test("Reachy device POST accepts the browser host when the dev server listens on 0.0.0.0", async () => {
  const { route, NextRequest, calls } = await loadDeviceRoute(() => [
    { port: "COM5", label: "Reachy", vid: "1A86", pid: "55D3" },
  ])
  const response = await route.POST(new NextRequest("http://0.0.0.0:3000/api/pet-ai/reachy/device", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: "token=valid-middleware-session",
      Host: "localhost:3000",
      Origin: "http://localhost:3000",
    },
    body: JSON.stringify({ action: "discover" }),
  }))

  assert.equal(response.status, 200)
  assert.equal(calls.length, 1)
})

test("Reachy start and restart use only their fixed routes and 60-second client mode", async () => {
  for (const { action, input, body } of [
    { action: "start", input: { action: "start", serialPort: "COM5" }, body: { serial_port: "COM5" } },
    { action: "restart", input: { action: "restart" }, body: {} },
  ] as const) {
    const { route, NextRequest, calls } = await loadDeviceRoute(() => ({ ...upstreamDeviceStatus(), phase: "starting" }))
    const response = await route.POST(new NextRequest("http://sentinel.local/api/pet-ai/reachy/device", {
      method: "POST",
      headers: SAME_ORIGIN_JSON_HEADERS,
      body: JSON.stringify(input),
    }))

    assert.equal(response.status, 200)
    assert.deepEqual(calls, [{
      service: "host",
      path: `/v1/device/${action}`,
      init: { method: "POST", body: JSON.stringify(body), longRunning: true },
    }])
  }
})

test("Reachy typed actions translate browser fields to exact Host Bridge bodies", async () => {
  const commands = [
    {
      input: { action: "device_action", deviceAction: "center" },
      path: "/v1/device/action",
      body: { action: "center" },
    },
    {
      input: { action: "choreography", kind: "emotion", move: "loving1" },
      path: "/v1/device/choreography",
      body: { kind: "emotion", move: "loving1" },
    },
    {
      input: { action: "choreography", kind: "emotion", move: "loving1", playSound: false },
      path: "/v1/device/choreography",
      body: { kind: "emotion", move: "loving1", play_sound: false },
    },
    {
      input: { action: "pose", headPitch: 1, headRoll: 2, headYaw: 3, bodyYaw: 4, leftAntenna: 0.5, rightAntenna: -0.5, duration: 1 },
      path: "/v1/device/pose",
      body: { head_pitch: 1, head_roll: 2, head_yaw: 3, body_yaw: 4, left_antenna: 0.5, right_antenna: -0.5, duration: 1 },
    },
    {
      input: { action: "volume", target: "microphone", volume: 65 },
      path: "/v1/device/volume",
      body: { target: "microphone", volume: 65 },
    },
  ]

  for (const command of commands) {
    const { route, NextRequest, calls } = await loadDeviceRoute(() => upstreamDeviceStatus())
    const response = await route.POST(new NextRequest("http://sentinel.local/api/pet-ai/reachy/device", {
      method: "POST",
      headers: SAME_ORIGIN_JSON_HEADERS,
      body: JSON.stringify(command.input),
    }))

    assert.equal(response.status, 200)
    assert.deepEqual(calls, [{
      service: "host",
      path: command.path,
      init: { method: "POST", body: JSON.stringify(command.body) },
    }])
  }
})

test("Reachy stop ends an active ClawBody session before stopping the device", async () => {
  const { route, NextRequest, calls } = await loadDeviceRoute(({ path }) => {
    if (path === "/v1/status") return { running: true, student_id: "stu-test", state: "running" }
    if (path === "/v1/session/stop") return { running: false, state: "idle" }
    if (path === "/v1/device/stop") return { ...upstreamDeviceStatus(), phase: "offline" }
    throw new Error(`unexpected path: ${path}`)
  })

  const response = await route.POST(new NextRequest("http://sentinel.local/api/pet-ai/reachy/device", {
    method: "POST",
    headers: SAME_ORIGIN_JSON_HEADERS,
    body: JSON.stringify({ action: "stop" }),
  }))

  assert.equal(response.status, 200)
  assert.deepEqual(calls.map(({ service, path }) => `${service}:${path}`), [
    "clawbody:/v1/status",
    "clawbody:/v1/session/stop",
    "host:/v1/device/stop",
  ])
  const body = await response.json()
  assert.equal(body.data.sessionStopped, true)
  assert.equal(body.data.device.phase, "offline")
})

test("Reachy stop skips session stop when no ClawBody session is running", async () => {
  const { route, NextRequest, calls } = await loadDeviceRoute(({ path }) => {
    if (path === "/v1/status") return { running: false, state: "idle" }
    if (path === "/v1/device/stop") return { ...upstreamDeviceStatus(), phase: "offline" }
    throw new Error(`unexpected path: ${path}`)
  })

  const response = await route.POST(new NextRequest("http://sentinel.local/api/pet-ai/reachy/device", {
    method: "POST",
    headers: SAME_ORIGIN_JSON_HEADERS,
    body: JSON.stringify({ action: "stop" }),
  }))

  assert.equal(response.status, 200)
  assert.deepEqual(calls.map(({ path }) => path), ["/v1/status", "/v1/device/stop"])
  const body = await response.json()
  assert.equal(body.data.sessionStopped, false)
  assert.equal(body.data.device.phase, "offline")
})

test("Reachy stop still stops hardware exactly once when ClawBody status fails", async () => {
  const { route, NextRequest, calls } = await loadDeviceRoute(({ path }) => {
    if (path === "/v1/status") throw new Error("Authorization: Bearer status-secret")
    if (path === "/v1/device/stop") return { ...upstreamDeviceStatus(), phase: "offline" }
    throw new Error(`unexpected path: ${path}`)
  })

  const response = await route.POST(new NextRequest("http://sentinel.local/api/pet-ai/reachy/device", {
    method: "POST",
    headers: SAME_ORIGIN_JSON_HEADERS,
    body: JSON.stringify({ action: "stop" }),
  }))
  const body = await response.json()

  assert.equal(response.status, 200)
  assert.deepEqual(calls.map(({ service, path }) => `${service}:${path}`), [
    "clawbody:/v1/status",
    "host:/v1/device/stop",
  ])
  assert.equal(calls.filter(({ path }) => path === "/v1/device/stop").length, 1)
  assert.equal(body.data.sessionStopped, false)
  assert.deepEqual(body.data.warnings, [{
    code: "clawbody_status_unavailable",
    message: "未能确认当前 ClawBody 会话状态；已继续停止设备",
  }])
  assert.doesNotMatch(JSON.stringify(body), /status-secret|Bearer|Authorization/)
})

test("Reachy stop still stops hardware exactly once when session stop fails", async () => {
  const { route, NextRequest, calls } = await loadDeviceRoute(({ path }) => {
    if (path === "/v1/status") return { running: true, student_id: "stu-test", state: "running" }
    if (path === "/v1/session/stop") throw new Error("X-Service-Key: session-secret")
    if (path === "/v1/device/stop") return { ...upstreamDeviceStatus(), phase: "offline" }
    throw new Error(`unexpected path: ${path}`)
  })

  const response = await route.POST(new NextRequest("http://sentinel.local/api/pet-ai/reachy/device", {
    method: "POST",
    headers: SAME_ORIGIN_JSON_HEADERS,
    body: JSON.stringify({ action: "stop" }),
  }))
  const body = await response.json()

  assert.equal(response.status, 200)
  assert.deepEqual(calls.map(({ service, path }) => `${service}:${path}`), [
    "clawbody:/v1/status",
    "clawbody:/v1/session/stop",
    "host:/v1/device/stop",
  ])
  assert.equal(calls.filter(({ path }) => path === "/v1/device/stop").length, 1)
  assert.equal(body.data.sessionStopped, false)
  assert.deepEqual(body.data.warnings, [{
    code: "clawbody_session_stop_failed",
    message: "学生会话停止请求失败；已继续停止设备",
  }])
  assert.doesNotMatch(JSON.stringify(body), /session-secret|X-Service-Key/)
})

test("Reachy device POST returns bounded upstream errors without exposing secrets", async () => {
  const { route, NextRequest } = await loadDeviceRoute(() => {
    throw new Error("Authorization: Bearer top-secret")
  })
  const response = await route.POST(new NextRequest("http://sentinel.local/api/pet-ai/reachy/device", {
    method: "POST",
    headers: SAME_ORIGIN_JSON_HEADERS,
    body: JSON.stringify({ action: "discover" }),
  }))
  const body = await response.json()

  assert.equal(response.status, 502)
  assert.equal(body.message, "心宠设备控制请求失败")
  assert.doesNotMatch(JSON.stringify(body), /top-secret|Bearer/)
})
