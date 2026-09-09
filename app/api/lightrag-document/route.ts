import path from "node:path"

import { NextRequest } from "next/server"

const LIGHTRAG_URL =
  process.env.LIGHTRAG_API_URL ??
  process.env.NEXT_PUBLIC_LIGHTRAG_WEBUI_URL ??
  "http://42.121.14.189:9621"
const LIGHTRAG_API_KEY = process.env.LIGHTRAG_API_KEY ?? "psytwin-local-rag-key"

type LightRagDocument = {
  file_path: string
  content_summary: string
}

type DocumentsResponse = {
  documents?: LightRagDocument[]
}

function isSafeMarkdownFile(file: string) {
  return file.length <= 255 && path.basename(file) === file && /\.md$/i.test(file)
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;")
}

function renderInlineMarkdown(value: string) {
  return escapeHtml(value)
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\[([^\]]+)]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
}

function renderMarkdown(markdown: string) {
  const blocks: string[] = []
  let paragraph: string[] = []
  let listType: "ul" | "ol" | null = null
  let code: string[] | null = null

  const flushParagraph = () => {
    if (!paragraph.length) return
    blocks.push(`<p>${renderInlineMarkdown(paragraph.join(" "))}</p>`)
    paragraph = []
  }
  const closeList = () => {
    if (!listType) return
    blocks.push(`</${listType}>`)
    listType = null
  }

  for (const line of markdown.replace(/\r\n?/g, "\n").split("\n")) {
    if (line.trim().startsWith("```")) {
      flushParagraph()
      closeList()
      if (code) {
        blocks.push(`<pre><code>${escapeHtml(code.join("\n"))}</code></pre>`)
        code = null
      } else {
        code = []
      }
      continue
    }
    if (code) {
      code.push(line)
      continue
    }

    const heading = line.match(/^(#{1,4})\s+(.+)$/)
    const unorderedItem = line.match(/^\s*[-*]\s+(.+)$/)
    const orderedItem = line.match(/^\s*\d+[.)]\s+(.+)$/)
    const quote = line.match(/^>\s?(.+)$/)

    if (heading) {
      flushParagraph()
      closeList()
      const level = heading[1].length
      blocks.push(`<h${level}>${renderInlineMarkdown(heading[2])}</h${level}>`)
    } else if (unorderedItem || orderedItem) {
      flushParagraph()
      const nextType = unorderedItem ? "ul" : "ol"
      if (listType !== nextType) {
        closeList()
        blocks.push(`<${nextType}>`)
        listType = nextType
      }
      blocks.push(`<li>${renderInlineMarkdown((unorderedItem ?? orderedItem)![1])}</li>`)
    } else if (quote) {
      flushParagraph()
      closeList()
      blocks.push(`<blockquote>${renderInlineMarkdown(quote[1])}</blockquote>`)
    } else if (/^\s*---+\s*$/.test(line)) {
      flushParagraph()
      closeList()
      blocks.push("<hr>")
    } else if (!line.trim()) {
      flushParagraph()
      closeList()
    } else {
      closeList()
      paragraph.push(line.trim())
    }
  }

  flushParagraph()
  closeList()
  if (code) blocks.push(`<pre><code>${escapeHtml(code.join("\n"))}</code></pre>`)
  return blocks.join("\n")
}

function renderDocumentPage(file: string, markdown: string) {
  const safeFile = escapeHtml(file)
  const content = renderMarkdown(markdown)

  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="light">
  <title>${safeFile} - 心图心理学知识库</title>
  <style>
    :root { color-scheme: light; --primary: #7c3aed; --ink: #18181b; --muted: #71717a; --border: #e4e4e7; --surface: #fff; --background: #f7f7f8; }
    * { box-sizing: border-box; }
    html { background: var(--background); }
    body { margin: 0; color: var(--ink); background: var(--background); font-family: "Noto Sans SC", "Microsoft YaHei", system-ui, sans-serif; font-size: 16px; line-height: 1.8; }
    .topbar { position: sticky; top: 0; z-index: 10; height: 68px; border-bottom: 1px solid var(--border); background: rgb(255 255 255 / 94%); backdrop-filter: blur(10px); }
    .topbar-inner { width: min(1120px, calc(100% - 40px)); height: 100%; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; gap: 24px; }
    .brand { display: flex; align-items: center; gap: 12px; min-width: 0; color: var(--ink); text-decoration: none; }
    .brand img { width: 38px; height: 38px; border-radius: 50%; object-fit: cover; }
    .brand-title { font-size: 16px; font-weight: 700; white-space: nowrap; }
    .brand-title span { color: var(--primary); letter-spacing: .04em; }
    .back { display: inline-flex; align-items: center; gap: 8px; min-height: 38px; padding: 0 14px; border: 1px solid var(--border); border-radius: 8px; color: #3f3f46; background: var(--surface); font-size: 14px; font-weight: 600; text-decoration: none; }
    .back:hover { border-color: #c4b5fd; color: var(--primary); background: #faf8ff; }
    .back:focus-visible, article a:focus-visible { outline: 2px solid var(--primary); outline-offset: 3px; }
    main { width: min(920px, calc(100% - 40px)); margin: 46px auto 80px; }
    .document-meta { display: flex; align-items: center; gap: 10px; margin-bottom: 18px; color: var(--muted); font-size: 13px; }
    .type { display: inline-flex; align-items: center; gap: 6px; padding: 3px 9px; border-radius: 999px; color: #6d28d9; background: #f3e8ff; font-weight: 650; }
    .filename { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; }
    article { padding: 48px 58px 64px; border: 1px solid var(--border); border-radius: 14px; background: var(--surface); box-shadow: 0 4px 8px rgb(24 24 27 / 5%); }
    article h1 { margin: 0 0 30px; font-size: clamp(28px, 4vw, 38px); line-height: 1.3; letter-spacing: -.025em; text-wrap: balance; }
    article h2 { margin: 42px 0 14px; padding-bottom: 10px; border-bottom: 1px solid var(--border); font-size: 23px; line-height: 1.4; text-wrap: balance; }
    article h3 { margin: 32px 0 10px; font-size: 19px; line-height: 1.5; }
    article h4 { margin: 28px 0 8px; font-size: 16px; }
    article p { margin: 0 0 18px; color: #3f3f46; text-wrap: pretty; }
    article ul, article ol { margin: 8px 0 22px; padding-left: 1.5em; color: #3f3f46; }
    article li { margin: 7px 0; padding-left: 4px; }
    article li::marker { color: var(--primary); font-weight: 700; }
    article strong { color: var(--ink); font-weight: 700; }
    article a { color: #6d28d9; text-decoration-thickness: 1px; text-underline-offset: 3px; }
    article code { padding: 2px 6px; border-radius: 5px; color: #6d28d9; background: #f5f3ff; font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: .9em; }
    article pre { overflow-x: auto; margin: 24px 0; padding: 18px 20px; border-radius: 10px; color: #e4e4e7; background: #27272a; line-height: 1.65; }
    article pre code { padding: 0; color: inherit; background: transparent; }
    article blockquote { margin: 24px 0; padding: 14px 18px; border: 1px solid #ddd6fe; border-radius: 9px; color: #4c1d95; background: #faf5ff; }
    article hr { height: 1px; margin: 36px 0; border: 0; background: var(--border); }
    footer { margin-top: 22px; color: var(--muted); font-size: 13px; text-align: center; }
    @media (max-width: 640px) { .topbar-inner, main { width: min(100% - 24px, 920px); } .brand-title { font-size: 14px; } article { padding: 30px 22px 42px; } main { margin-top: 26px; } article h2 { margin-top: 34px; } }
    @media print { .topbar, .document-meta, footer { display: none; } body { background: #fff; } main { width: 100%; margin: 0; } article { padding: 0; border: 0; box-shadow: none; } }
  </style>
</head>
<body>
  <header class="topbar">
    <div class="topbar-inner">
      <a class="brand" href="/ai-config?tab=rag">
        <img src="/psytwin-logo.jpg" alt="心图 PsyTwin logo">
        <div class="brand-title">心图<span>PsyTwin</span> · 心理学知识库</div>
      </a>
      <a class="back" href="/ai-config?tab=rag" aria-label="返回心理学知识库">← 返回知识库</a>
    </div>
  </header>
  <main>
    <div class="document-meta"><span class="type">Markdown 文档</span><span class="filename">${safeFile}</span></div>
    <article>${content}</article>
    <footer>内容来源于心图 PsyTwin 心理学知识库</footer>
  </main>
</body>
</html>`
}

export async function GET(request: NextRequest) {
  const file = request.nextUrl.searchParams.get("file")?.trim() ?? ""
  if (!isSafeMarkdownFile(file)) {
    return Response.json({ error: "无效的 Markdown 文件名" }, { status: 400 })
  }

  let response: Response
  try {
    response = await fetch(`${LIGHTRAG_URL.replace(/\/$/, "")}/documents/paginated`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": LIGHTRAG_API_KEY,
      },
      body: JSON.stringify({
        page: 1,
        page_size: 200,
        sort_field: "file_path",
        sort_direction: "asc",
      }),
      cache: "no-store",
    })
  } catch {
    return Response.json({ error: "暂时无法连接知识库服务" }, { status: 502 })
  }

  if (!response.ok) {
    return Response.json({ error: "暂时无法读取知识库文档" }, { status: 502 })
  }

  const data = (await response.json()) as DocumentsResponse
  const document = data.documents?.find((item) => path.basename(item.file_path) === file)

  if (!document) {
    return Response.json({ error: "未找到对应的知识库文档" }, { status: 404 })
  }

  return new Response(renderDocumentPage(file, document.content_summary), {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store",
      "x-content-type-options": "nosniff",
    },
  })
}
