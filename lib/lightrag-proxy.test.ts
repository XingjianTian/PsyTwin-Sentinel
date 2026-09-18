import assert from "node:assert/strict"
import test from "node:test"

import { NextRequest } from "next/server"

import { GET } from "../app/api/lightrag-proxy/[...path]/route"
import { MOCK_QUERY_ANSWER } from "../lib/lightrag-mock-answer"

function postTo(route: string) {
  return {
    request: new NextRequest(`http://localhost:3000/api/lightrag-proxy/${route}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ query: "心理危机干预", mode: "mix" }),
    }),
    context: { params: Promise.resolve({ path: route.split("/") }) },
  }
}

function withMockDisabled<T>(run: () => Promise<T>): Promise<T> {
  const previous = process.env.LIGHTRAG_QUERY_MOCK
  process.env.LIGHTRAG_QUERY_MOCK = "off"
  return run().finally(() => {
    if (previous === undefined) {
      delete process.env.LIGHTRAG_QUERY_MOCK
    } else {
      process.env.LIGHTRAG_QUERY_MOCK = previous
    }
  })
}

test("Swagger document routes all assets and endpoints through the LightRAG proxy", async () => {
  const request = new NextRequest("http://localhost:3000/api/lightrag-proxy/docs?theme=dark")
  const response = await GET(request, {
    params: Promise.resolve({ path: ["docs"] }),
  })
  const html = await response.text()

  assert.match(html, /href="\/api\/lightrag-proxy\/static\/swagger-ui\/swagger-ui\.css"/)
  assert.match(html, /src="\/api\/lightrag-proxy\/static\/swagger-ui\/swagger-ui-bundle\.js"/)
  assert.match(html, /url: '\/api\/lightrag-proxy\/openapi\.json'/)
  assert.match(html, /window\.location\.origin \+ '\/api\/lightrag-proxy\/docs\/oauth2-redirect'/)
})

test("embedded WebUI moves PsyTwin branding and connection status into the primary navigation", async () => {
  const request = new NextRequest("http://localhost:3000/api/lightrag-proxy/webui")
  const response = await GET(request, {
    params: Promise.resolve({ path: ["webui"] }),
  })
  const html = await response.text()

  assert.match(html, /header\[data-psytwin-shell="true"\] \[role="tab"\]/)
  assert.match(html, /font-size: 1rem/)
  assert.match(html, /id = 'psytwin-knowledge-brand'/)
  assert.match(html, />心图心理学知识库</)
  assert.match(html, /id = 'psytwin-connection-trigger'/)
  assert.match(html, /trigger\.innerHTML = '<span aria-hidden="true"><\/span><span>[^<]+<\/span>'/)
  assert.match(html, /panel\.setAttribute\('aria-label', '[^']+'\)/)
  assert.match(html, /tablist\.appendChild\(createConnectionControl\(\)\)/)
  assert.match(html, /data-psytwin-reference-link/)
  assert.match(html, /\/knowledge-document\?file=/)
  assert.match(html, /enhanceReferenceLinks/)
  assert.match(html, /无需登陆/)
})

test("演示模式下 /query 直接返回固定回答，不触达上游", async (t) => {
  const upstream = t.mock.method(globalThis, "fetch", async () => {
    throw new Error("演示模式不应访问上游")
  })

  const { request, context } = postTo("query")
  const response = await GET(request, context)

  assert.equal(response.status, 200)
  assert.equal(upstream.mock.callCount(), 0)
  assert.deepEqual(await response.json(), { response: MOCK_QUERY_ANSWER })
})

test("演示模式下 /query/stream 以 NDJSON 逐段推送固定回答", async (t) => {
  const upstream = t.mock.method(globalThis, "fetch", async () => {
    throw new Error("演示模式不应访问上游")
  })

  const { request, context } = postTo("query/stream")
  const response = await GET(request, context)

  assert.equal(response.status, 200)
  assert.equal(response.headers.get("content-type"), "application/x-ndjson; charset=utf-8")
  assert.equal(upstream.mock.callCount(), 0)

  const lines = (await response.text())
    .split("\n")
    .filter((line) => line.trim().length > 0)
    .map((line) => JSON.parse(line) as { response: string })

  assert.ok(lines.length > 1, "应拆成多段推送，以模拟真实检索的输出节奏")
  assert.equal(lines.map((line) => line.response).join("").trim(), MOCK_QUERY_ANSWER.trim())
})

test("固定回答的 References 文件名满足可点击链接的匹配规则", () => {
  // 与 EMBED_BOOTSTRAP 注入的 enhanceReferenceLinks() 保持同一套规则
  const linkableListItem = /^\s*\[\d+\]\s+([^\/\s]+\.md)\s*$/i

  const referenceLines = MOCK_QUERY_ANSWER.split("\n")
    .map((line) => line.trim())
    .filter((line) => /^-\s*\[\d+\]/.test(line))

  assert.ok(referenceLines.length > 0, "References 列表不应为空")

  for (const line of referenceLines) {
    const fileName = line.replace(/^-\s*/, "")
    assert.match(fileName, linkableListItem, `引用行无法被链接化: ${line}`)
  }

  assert.match(MOCK_QUERY_ANSWER, /References/)
})

test("开关关闭时 /query 恢复向上游透传", async (t) => {
  const upstream = t.mock.method(globalThis, "fetch", async () =>
    Response.json({ response: "来自上游的真实回答" })
  )

  await withMockDisabled(async () => {
    const { request, context } = postTo("query")
    const response = await GET(request, context)

    assert.equal(upstream.mock.callCount(), 1, "关闭开关后应真实转发")
    assert.deepEqual(await response.json(), { response: "来自上游的真实回答" })
  })
})

test("更具体的相邻路径 query/data 不被演示模式拦截", async (t) => {
  const upstream = t.mock.method(globalThis, "fetch", async () =>
    Response.json({ hit: "upstream" })
  )

  const { request, context } = postTo("query/data")
  const response = await GET(request, context)

  assert.equal(upstream.mock.callCount(), 1, "query/data 不属于拦截范围，应透传")
  assert.deepEqual(await response.json(), { hit: "upstream" })
})
