import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import test from "node:test"
import * as ts from "typescript"

import {
  getReachyPhasePresentation,
  type ReachyDevicePhase,
} from "./reachy-device"

type HostBridgeClient = {
  HostBridgeUnavailableError: new () => Error
  isHostBridgeUnavailable(error: unknown): boolean
  requestHostBridge<T>(path: string, init?: RequestInit & { longRunning?: boolean }): Promise<T>
}

type CapturedTimer = {
  callback: () => void
  cleared: boolean
  delay: number
}

async function loadHostBridgeClient(): Promise<HostBridgeClient> {
  const source = await readFile(new URL("./host-bridge-client.ts", import.meta.url), "utf8")
  const compiled = ts.transpileModule(source.replace(/^import "server-only"\r?\n/, ""), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  })
  const evaluatedModule = { exports: {} as HostBridgeClient }
  const evaluate = new Function("exports", "module", compiled.outputText) as (
    exports: HostBridgeClient,
    module: { exports: HostBridgeClient },
  ) => void

  evaluate(evaluatedModule.exports, evaluatedModule)
  return evaluatedModule.exports
}

async function withHostBridgeHarness(
  fetchImplementation: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>,
  run: (client: HostBridgeClient, timers: CapturedTimer[]) => Promise<void>,
) {
  const originalFetch = globalThis.fetch
  const originalSetTimeout = globalThis.setTimeout
  const originalClearTimeout = globalThis.clearTimeout
  const originalHostBridgeUrl = process.env.HOST_BRIDGE_URL
  const originalHostBridgeKey = process.env.HOST_BRIDGE_API_KEY
  const timers: CapturedTimer[] = []

  delete process.env.HOST_BRIDGE_URL
  process.env.HOST_BRIDGE_API_KEY = "host-bridge-test-key"
  globalThis.fetch = fetchImplementation as typeof fetch
  globalThis.setTimeout = ((callback: () => void, delay?: number) => {
    timers.push({ callback, cleared: false, delay: delay ?? 0 })
    return timers.length as unknown as ReturnType<typeof setTimeout>
  }) as typeof setTimeout
  globalThis.clearTimeout = ((handle: ReturnType<typeof setTimeout>) => {
    const timer = timers[Number(handle) - 1]
    if (timer) timer.cleared = true
  }) as typeof clearTimeout

  try {
    await run(await loadHostBridgeClient(), timers)
  } finally {
    globalThis.fetch = originalFetch
    globalThis.setTimeout = originalSetTimeout
    globalThis.clearTimeout = originalClearTimeout
    if (originalHostBridgeUrl === undefined) delete process.env.HOST_BRIDGE_URL
    else process.env.HOST_BRIDGE_URL = originalHostBridgeUrl
    if (originalHostBridgeKey === undefined) delete process.env.HOST_BRIDGE_API_KEY
    else process.env.HOST_BRIDGE_API_KEY = originalHostBridgeKey
  }
}

test("device phases have stable Chinese presentation", () => {
  assert.deepEqual(getReachyPhasePresentation("healthchecking"), {
    label: "健康检查",
    tone: "progress",
  })
  assert.equal(getReachyPhasePresentation("ready").label, "设备就绪")
})

test("every device phase has a browser-safe presentation", () => {
  const phases: ReachyDevicePhase[] = [
    "offline",
    "discovering",
    "starting",
    "connecting",
    "healthchecking",
    "loading_apps",
    "ready",
    "stopping",
    "error",
  ]

  for (const phase of phases) {
    const presentation = getReachyPhasePresentation(phase)
    assert.ok(presentation.label.length > 0)
    assert.ok(["neutral", "progress", "success", "danger"].includes(presentation.tone))
  }
})

test("Host Bridge stays server-only on loopback", async () => {
  const source = await readFile(new URL("./host-bridge-client.ts", import.meta.url), "utf8")
  assert.match(source, /^import "server-only"/)
  assert.match(source, /http:\/\/127\.0\.0\.1:7861/)
  assert.match(source, /X-Host-Bridge-Key/)
  assert.doesNotMatch(source, /NEXT_PUBLIC_HOST_BRIDGE/)
})

test("Host Bridge only exposes its fixed device API surface", async () => {
  const source = await readFile(new URL("./host-bridge-client.ts", import.meta.url), "utf8")

  for (const path of [
    '"/v1/device/status"',
    '"/v1/device/discover"',
    '"/v1/device/logs"',
    '"/v1/device/start"',
    '"/v1/device/stop"',
    '"/v1/device/restart"',
    '"/v1/device/action"',
    '"/v1/device/choreography"',
    '"/v1/device/pose"',
    '"/v1/device/volume"',
  ]) {
    assert.match(source, new RegExp(path.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")))
  }
})

test("Host Bridge rejects paths outside its fixed device API surface", async () => {
  const source = await readFile(new URL("./host-bridge-client.ts", import.meta.url), "utf8")

  assert.match(source, /function isHostBridgePath/)
  assert.match(source, /path\.startsWith\("\/v1\/device\/logs\?after="\)/)
})

test("Host Bridge rejects an invalid path before making a request", async () => {
  await withHostBridgeHarness(
    async () => {
      throw new Error("fetch must not run")
    },
    async (client, timers) => {
      await assert.rejects(
        client.requestHostBridge("/v1/device/untrusted"),
        /Unsupported Host Bridge path/,
      )
      assert.equal(timers.length, 0)
    },
  )
})

test("Host Bridge sends the server-only key and clears the normal timeout", async () => {
  let requestedUrl = ""
  let requestHeaders: HeadersInit | undefined

  await withHostBridgeHarness(
    async (input, init) => {
      requestedUrl = String(input)
      requestHeaders = init?.headers
      return new Response(JSON.stringify({ phase: "offline" }), { status: 200 })
    },
    async (client, timers) => {
      const response = await client.requestHostBridge<{ phase: string }>("/v1/device/status")

      assert.deepEqual(response, { phase: "offline" })
      assert.equal(requestedUrl, "http://127.0.0.1:7861/v1/device/status")
      assert.equal(new Headers(requestHeaders).get("X-Host-Bridge-Key"), "host-bridge-test-key")
      assert.equal(timers[0]?.delay, 10_000)
      assert.equal(timers[0]?.cleared, true)
    },
  )
})

test("Host Bridge preserves daemon HTTP errors instead of treating them as unavailable", async () => {
  await withHostBridgeHarness(
    async () => new Response(JSON.stringify({ detail: "Reachy daemon rejected the request" }), { status: 502 }),
    async (client) => {
      await assert.rejects(client.requestHostBridge("/v1/device/status"), (error: unknown) => {
        assert.equal(error instanceof client.HostBridgeUnavailableError, false)
        assert.equal(client.isHostBridgeUnavailable(error), false)
        assert.equal((error as Error & { status?: number }).message, "Reachy daemon rejected the request")
        assert.equal((error as Error & { status?: number }).status, 502)
        return true
      })
    },
  )
})

test("Host Bridge normalizes transport failures as unavailable", async () => {
  await withHostBridgeHarness(
    async () => {
      throw new TypeError("network down")
    },
    async (client) => {
      await assert.rejects(client.requestHostBridge("/v1/device/status"), (error: unknown) => {
        assert.equal(error instanceof client.HostBridgeUnavailableError, true)
        assert.equal(client.isHostBridgeUnavailable(error), true)
        return true
      })
    },
  )
})

test("Host Bridge uses and clears the long-running abort timeout", async () => {
  let abortObserved = false

  await withHostBridgeHarness(
    async (_input, init) => new Promise<Response>((_resolve, reject) => {
      init?.signal?.addEventListener("abort", () => {
        abortObserved = true
        reject(new DOMException("request aborted", "AbortError"))
      })
    }),
    async (client, timers) => {
      const request = client.requestHostBridge("/v1/device/start", { longRunning: true, method: "POST" })

      assert.equal(timers[0]?.delay, 60_000)
      timers[0]?.callback()
      await assert.rejects(request, client.HostBridgeUnavailableError)
      assert.equal(abortObserved, true)
      assert.equal(timers[0]?.cleared, true)
    },
  )
})
