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

test("embedded WebUI removes redundant header copy and enlarges primary navigation tabs", async () => {
  const request = new NextRequest("http://localhost:3000/api/lightrag-proxy/webui")
  const response = await GET(request, {
    params: Promise.resolve({ path: ["webui"] }),
  })
  const html = await response.text()

  assert.match(html, /header \[role="tab"\]/)
  assert.match(html, /font-size: 1rem/)
  assert.match(html, /grid-template-columns: minmax\(0, 1fr\) auto minmax\(0, 1fr\)/)
  assert.match(html, /header > nav:last-child/)
  assert.match(html, /header > div:first-child/)
  assert.match(html, /\[data-psytwin-placeholder="true"\] \{ visibility: hidden !important; \}/)
  assert.match(html, /redundantBrand\.setAttribute\('data-psytwin-placeholder', 'true'\)/)
  assert.match(html, /无需登陆/)
})
