"use client"

const LIGHTRAG_EMBED_URL = "/api/lightrag-proxy/webui/"

export function RagKnowledgeBaseView() {
  return (
    <div className="h-[calc(100dvh-6.5rem)] min-h-[32rem] overflow-hidden rounded-xl bg-background">
      <iframe
        id="lightrag-console"
        title="LightRAG 心理学知识库管理台"
        src={LIGHTRAG_EMBED_URL}
        className="h-full w-full border-0 bg-background"
        sandbox="allow-same-origin allow-scripts allow-forms allow-downloads"
      />
    </div>
  )
}
