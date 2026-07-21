import assert from "node:assert/strict"
import test from "node:test"

import { renderToStaticMarkup } from "react-dom/server"

import { RagKnowledgeBaseView } from "../components/ai-config/rag-knowledge-base-view"

test("knowledge base header uses one concise product title", () => {
  const html = renderToStaticMarkup(<RagKnowledgeBaseView />)

  assert.match(html, />心图心理学知识库</)
  assert.doesNotMatch(html, />心理学知识库管理台</)
  assert.equal((html.match(/>心图心理学知识库</g) ?? []).length, 1)
})
