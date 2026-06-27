import type { RAGResult } from "@/lib/rag"

export type OpenClawRagSearch = (query: string, topK: number) => Promise<RAGResult>

export type OpenClawRagSource = {
  id: string
  preview: string
  similarity?: number
}

export type OpenClawRagPayload = {
  input: string
  hitCount: number
  sources: OpenClawRagSource[]
  error?: string
}

const DEFAULT_TOP_K = 5
const MAX_CONTEXT_CHARS = 6000
const DEFAULT_LIGHTRAG_URL = "http://localhost:9621"
const DEFAULT_LIGHTRAG_API_KEY = "psytwin-local-rag-key"

type LightRagReference = {
  reference_id?: string
  file_path?: string
  content?: string[]
}

type LightRagQueryResponse = {
  response?: string
  references?: LightRagReference[]
}

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, "")
}

function getLightRagBaseUrl() {
  return trimTrailingSlash(
    process.env.LIGHTRAG_API_URL ||
      process.env.NEXT_PUBLIC_LIGHTRAG_WEBUI_URL ||
      DEFAULT_LIGHTRAG_URL
  )
}

function getLightRagApiKey() {
  return (
    process.env.LIGHTRAG_API_KEY ||
    process.env.NEXT_PUBLIC_LIGHTRAG_API_KEY_HINT ||
    DEFAULT_LIGHTRAG_API_KEY
  )
}

export async function searchLightRagContext(
  query: string,
  topK: number,
  options: {
    baseUrl?: string
    apiKey?: string
    fetchImpl?: typeof fetch
  } = {}
): Promise<RAGResult> {
  const baseUrl = trimTrailingSlash(options.baseUrl || getLightRagBaseUrl())
  const apiKey = options.apiKey || getLightRagApiKey()
  const fetchImpl = options.fetchImpl || fetch

  const response = await fetchImpl(`${baseUrl}/query`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": apiKey,
    },
    body: JSON.stringify({
      query,
      mode: process.env.LIGHTRAG_QUERY_MODE || "mix",
      only_need_context: true,
      include_references: true,
      include_chunk_content: true,
      top_k: topK,
      chunk_top_k: topK,
      max_total_tokens: Number(process.env.LIGHTRAG_MAX_CONTEXT_TOKENS || 3000),
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`LightRAG query failed: ${response.status} ${errorText}`)
  }

  const data = (await response.json()) as LightRagQueryResponse
  const context = data.response?.trim() || ""
  const chunks = (data.references || []).map((reference, index) => ({
    id: reference.reference_id || `lightrag-${index + 1}`,
    content: (reference.content || []).join("\n\n") || reference.file_path || context,
    metadata: {
      source: "lightrag",
      referenceId: reference.reference_id,
      filePath: reference.file_path,
    },
    similarity: undefined,
  }))

  if (chunks.length === 0 && context) {
    chunks.push({
      id: "lightrag-context",
      content: context,
      metadata: { source: "lightrag" },
      similarity: undefined,
    })
  }

  return {
    chunks,
    context,
    totalChunks: chunks.length,
  }
}

function clipText(text: string, maxLength: number) {
  if (text.length <= maxLength) return text
  return `${text.slice(0, maxLength).trimEnd()}\n...[truncated]`
}

export function formatOpenClawRagInput(message: string, ragResult: RAGResult): string {
  if (ragResult.totalChunks <= 0 || !ragResult.context.trim()) {
    return message
  }

  const context = clipText(ragResult.context, MAX_CONTEXT_CHARS)

  return `[PSYTWIN_RAG_CONTEXT]
The following snippets come from the PsyTwin Sentinel RAG vector knowledge base.
Use them only when they are relevant to the user's question. Do not invent sources.

${context}
[/PSYTWIN_RAG_CONTEXT]

用户原始问题:
${message}`
}

export async function buildOpenClawRagPayload(
  message: string,
  options: {
    topK?: number
    search?: OpenClawRagSearch
  } = {}
): Promise<OpenClawRagPayload> {
  const topK = options.topK ?? DEFAULT_TOP_K
  const search = options.search ?? searchLightRagContext

  try {
    const ragResult = await search(message, topK)
    return {
      input: formatOpenClawRagInput(message, ragResult),
      hitCount: ragResult.totalChunks,
      sources: ragResult.chunks.map((chunk) => ({
        id: chunk.id,
        preview: clipText(chunk.content.replace(/\s+/g, " ").trim(), 200),
        similarity: chunk.similarity,
      })),
    }
  } catch (error) {
    const messageText = error instanceof Error ? error.message : "RAG search failed"
    console.warn("[OpenClaw] RAG context search failed:", messageText)
    return {
      input: message,
      hitCount: 0,
      sources: [],
      error: messageText,
    }
  }
}
