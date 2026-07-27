"use client"

import { useEffect, useRef, useState } from "react"
import { Database } from "lucide-react"
import { Spinner } from "@/components/ui/spinner"

const LIGHTRAG_EMBED_URL = "/api/lightrag-proxy/webui/"
const READY_TIMEOUT_MS = 15_000

export function RagKnowledgeBaseView() {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [frameLoaded, setFrameLoaded] = useState(false)
  const [ready, setReady] = useState(false)
  const [slow, setSlow] = useState(false)

  useEffect(() => {
    if (!frameLoaded || ready) return

    const checkReady = () => {
      try {
        if (iframeRef.current?.contentDocument?.querySelector('header [role="tablist"]')) {
          setReady(true)
        }
      } catch {
        // The embedded console is same-origin through the proxy during normal operation.
      }
    }

    checkReady()
    const interval = window.setInterval(checkReady, 100)
    const timeout = window.setTimeout(() => setSlow(true), READY_TIMEOUT_MS)

    return () => {
      window.clearInterval(interval)
      window.clearTimeout(timeout)
    }
  }, [frameLoaded, ready])

  return (
    <div className="relative h-[calc(100dvh-6.5rem)] min-h-[32rem] overflow-hidden rounded-xl bg-background">
      {!ready ? (
        <div
          className="absolute inset-0 z-10 flex items-center justify-center bg-background"
          role="status"
          aria-live="polite"
        >
          <div className="flex max-w-sm flex-col items-center px-6 text-center">
            <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              {slow ? <Database className="size-6" /> : <Spinner className="size-6 motion-reduce:animate-none" />}
            </div>
            <p className="text-sm font-semibold text-foreground">
              {slow ? "知识库服务仍在连接" : "正在加载心理学知识库"}
            </p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              {slow
                ? "远程知识库响应较慢，页面会在连接完成后自动显示。"
                : "首次载入需要获取管理台资源，后续打开会使用本地缓存。"}
            </p>
          </div>
        </div>
      ) : null}
      <iframe
        ref={iframeRef}
        id="lightrag-console"
        title="LightRAG 心理学知识库管理台"
        src={LIGHTRAG_EMBED_URL}
        className="h-full w-full border-0 bg-background"
        sandbox="allow-same-origin allow-scripts allow-forms allow-downloads allow-popups allow-popups-to-escape-sandbox"
        onLoad={() => setFrameLoaded(true)}
      />
    </div>
  )
}
