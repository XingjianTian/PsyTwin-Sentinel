import assert from "node:assert/strict"
import test from "node:test"

import { NextRequest } from "next/server"

import { GET } from "../app/api/lightrag-proxy/[...path]/route"

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
