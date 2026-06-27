import assert from "node:assert/strict"
import { test } from "node:test"

import {
  buildOpenClawRagPayload,
  formatOpenClawRagInput,
  searchLightRagContext,
  type OpenClawRagSearch,
} from "./rag-context"

test("formatOpenClawRagInput prepends retrieved knowledge and preserves the original question", () => {
  const input = formatOpenClawRagInput("如何处理学生睡眠障碍？", {
    chunks: [
      {
        id: "chunk-1",
        content: "睡眠障碍干预应先评估作息、压力源和持续时间。",
        metadata: { documentId: "doc-1" },
        similarity: 0.82,
      },
    ],
    context: "[1] 睡眠障碍干预应先评估作息、压力源和持续时间。",
    totalChunks: 1,
  })

  assert.match(input, /PSYTWIN_RAG_CONTEXT/)
  assert.match(input, /睡眠障碍干预应先评估作息/)
  assert.match(input, /用户原始问题/)
  assert.match(input, /如何处理学生睡眠障碍/)
})

test("formatOpenClawRagInput returns the original message when no chunks are retrieved", () => {
  const input = formatOpenClawRagInput("你好", {
    chunks: [],
    context: "",
    totalChunks: 0,
  })

  assert.equal(input, "你好")
})

test("buildOpenClawRagPayload returns original input when search fails", async () => {
  const search: OpenClawRagSearch = async () => {
    throw new Error("search unavailable")
  }

  const payload = await buildOpenClawRagPayload("测试消息", { search })

  assert.equal(payload.input, "测试消息")
  assert.equal(payload.hitCount, 0)
  assert.equal(payload.error, "search unavailable")
})

test("searchLightRagContext requests context-only results from LightRAG", async () => {
  let requestedUrl = ""
  let requestedBody: Record<string, unknown> = {}
  let requestedApiKey = ""

  const fetchImpl: typeof fetch = async (url, init) => {
    requestedUrl = String(url)
    requestedBody = JSON.parse(String(init?.body))
    requestedApiKey = String((init?.headers as Record<string, string>)["X-API-Key"])

    return new Response(
      JSON.stringify({
        response: "Document Chunks\n[1] 睡眠障碍干预应先评估压力源。",
        references: [
          {
            reference_id: "1",
            file_path: "sleep.md",
            content: ["睡眠障碍干预应先评估压力源。"],
          },
        ],
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    )
  }

  const result = await searchLightRagContext("学生睡眠障碍如何干预？", 3, {
    baseUrl: "http://rag.local",
    apiKey: "local-key",
    fetchImpl,
  })

  assert.equal(requestedUrl, "http://rag.local/query")
  assert.equal(requestedApiKey, "local-key")
  assert.equal(requestedBody.only_need_context, true)
  assert.equal(requestedBody.mode, "mix")
  assert.equal(requestedBody.chunk_top_k, 3)
  assert.equal(result.totalChunks, 1)
  assert.equal(result.chunks[0].metadata.filePath, "sleep.md")
  assert.match(result.context, /睡眠障碍干预/)
})
