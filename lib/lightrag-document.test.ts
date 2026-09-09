import assert from "node:assert/strict"
import test from "node:test"

import { NextRequest } from "next/server"

import { GET } from "../app/api/lightrag-document/route"

test("serves a matched LightRAG Markdown document inline", async (t) => {
  t.mock.method(globalThis, "fetch", async () =>
    Response.json({
      documents: [
        {
          file_path: "08_authoritative_sources.md",
          content_summary: "# 权威来源\n\n文档正文",
        },
      ],
    })
  )

  const response = await GET(
    new NextRequest("http://localhost:3000/api/lightrag-document?file=08_authoritative_sources.md")
  )

  assert.equal(response.status, 200)
  assert.equal(response.headers.get("content-type"), "text/html; charset=utf-8")
  const html = await response.text()
  assert.match(html, /心图<span>PsyTwin<\/span> · 心理学知识库/)
  assert.match(html, /<h1>权威来源<\/h1>/)
  assert.match(html, /<p>文档正文<\/p>/)
  assert.match(html, /08_authoritative_sources\.md/)
})

test("rejects paths and non-Markdown files", async () => {
  for (const file of ["../secret.md", "notes.txt", ""]) {
    const response = await GET(
      new NextRequest(`http://localhost:3000/api/lightrag-document?file=${encodeURIComponent(file)}`)
    )
    assert.equal(response.status, 400)
  }
})
