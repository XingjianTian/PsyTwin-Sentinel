import assert from "node:assert/strict"
import test from "node:test"

import { renderToStaticMarkup } from "react-dom/server"

import { RagKnowledgeBaseView } from "../components/ai-config/rag-knowledge-base-view"

test("knowledge base view renders only the full-width LightRAG console", () => {
  const html = renderToStaticMarkup(<RagKnowledgeBaseView />)

  assert.match(html, /id="lightrag-console"/)
  assert.match(html, /h-full w-full border-0/)
  assert.doesNotMatch(html, />已接入</)
  assert.doesNotMatch(html, />文档管理</)
  assert.doesNotMatch(html, />连接状态</)
})
