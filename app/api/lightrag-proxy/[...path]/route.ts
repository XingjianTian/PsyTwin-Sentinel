import { NextRequest } from "next/server"

const LIGHTRAG_URL =
  process.env.LIGHTRAG_API_URL ??
  process.env.NEXT_PUBLIC_LIGHTRAG_WEBUI_URL ??
  "http://42.121.14.189:9621"
const LIGHTRAG_API_KEY = process.env.LIGHTRAG_API_KEY ?? "psytwin-local-rag-key"

const EMBED_BOOTSTRAP = `
<style id="psytwin-lightrag-shell">
  [data-psytwin-hidden="true"] { display: none !important; }
  header[data-psytwin-shell="true"] {
    display: grid !important;
    grid-template-columns: minmax(max-content, 1fr) auto minmax(2.5rem, 1fr);
    align-items: center;
    column-gap: 1rem;
  }
  #psytwin-knowledge-brand {
    grid-column: 1;
    display: flex;
    align-items: center;
    gap: 0.625rem;
    min-width: 0;
    color: var(--foreground, #18181b);
    font-size: 0.9375rem;
    font-weight: 600;
    line-height: 1.25rem;
  }
  #psytwin-knowledge-brand > span:first-child {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 2rem;
    height: 2rem;
    flex: 0 0 auto;
    border-radius: 0.5rem;
    background: color-mix(in srgb, var(--primary, #7c3aed) 12%, transparent);
    color: var(--primary, #7c3aed);
  }
  #psytwin-knowledge-brand svg { width: 1rem; height: 1rem; }
  #psytwin-tab-container { grid-column: 2; }
  header[data-psytwin-shell="true"] > nav:last-child {
    grid-column: 3;
    width: auto !important;
    justify-self: end;
  }
  header[data-psytwin-shell="true"] [role="tablist"] {
    min-height: 2.5rem;
    gap: 0.375rem;
  }
  header[data-psytwin-shell="true"] [role="tab"],
  #psytwin-connection-trigger {
    min-height: 2.25rem;
    padding: 0.5rem 1rem !important;
    font-size: 1rem;
    line-height: 1.25rem;
  }
  #psytwin-connection-trigger {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    border: 0;
    border-radius: 0.375rem;
    background: transparent;
    color: var(--muted-foreground, #71717a);
    font-family: inherit;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 160ms ease-out, color 160ms ease-out;
  }
  #psytwin-connection-trigger:hover,
  #psytwin-connection-trigger[aria-expanded="true"] {
    background: var(--accent, #f4f4f5);
    color: var(--accent-foreground, #18181b);
  }
  #psytwin-connection-trigger:focus-visible {
    outline: 2px solid var(--ring, #8b5cf6);
    outline-offset: 2px;
  }
  #psytwin-connection-trigger > span:first-child {
    width: 0.5rem;
    height: 0.5rem;
    border-radius: 999px;
    background: #a1a1aa;
    box-shadow: 0 0 0 3px color-mix(in srgb, #a1a1aa 16%, transparent);
  }
  #psytwin-connection-trigger[data-configured="true"] > span:first-child {
    background: #22c55e;
    box-shadow: 0 0 0 3px color-mix(in srgb, #22c55e 16%, transparent);
  }
  #psytwin-connection-panel {
    position: fixed;
    z-index: 50;
    width: min(30rem, calc(100vw - 2rem));
    padding: 0.875rem;
    border: 1px solid var(--border, #e4e4e7);
    border-radius: 0.75rem;
    background: var(--popover, #ffffff);
    color: var(--popover-foreground, #18181b);
    box-shadow: 0 6px 8px rgb(0 0 0 / 0.08);
  }
  #psytwin-connection-panel[hidden] { display: none; }
  #psytwin-connection-panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: 0.625rem;
  }
  #psytwin-connection-panel h2 {
    margin: 0;
    font-size: 0.9375rem;
    font-weight: 600;
  }
  #psytwin-config-refresh {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    min-height: 2rem;
    padding: 0.375rem 0.625rem;
    border: 1px solid var(--border, #e4e4e7);
    border-radius: 0.375rem;
    background: transparent;
    color: var(--foreground, #18181b);
    font: inherit;
    font-size: 0.75rem;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 160ms ease-out, border-color 160ms ease-out, color 160ms ease-out;
  }
  #psytwin-config-refresh:hover { background: var(--accent, #f4f4f5); }
  #psytwin-config-refresh:focus-visible { outline: 2px solid var(--ring, #8b5cf6); outline-offset: 2px; }
  #psytwin-config-refresh[data-configured="true"] { border-color: color-mix(in srgb, #22c55e 44%, var(--border, #e4e4e7)); color: #15803d; }
  #psytwin-config-refresh svg { width: 0.875rem; height: 0.875rem; }
  #psytwin-connection-panel table {
    width: 100%;
    table-layout: fixed;
    border-collapse: collapse;
    font-size: 0.6875rem;
  }
  #psytwin-connection-panel th,
  #psytwin-connection-panel td {
    padding: 0.3125rem 0.375rem;
    border-bottom: 1px solid color-mix(in srgb, var(--border, #e4e4e7) 70%, transparent);
    text-align: left;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  #psytwin-connection-panel tr:last-child td { border-bottom: 0; }
  #psytwin-connection-panel th {
    color: var(--muted-foreground, #71717a);
    font-weight: 500;
  }
  #psytwin-connection-panel th:first-child { width: 46%; }
  #psytwin-connection-panel td:last-child { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; color: var(--foreground, #18181b); }
  #psytwin-connection-panel td:last-child:empty::after { content: ' '; }
  a[data-psytwin-reference-link="true"] {
    color: var(--primary, #7c3aed);
    font-weight: 500;
    text-decoration: underline;
    text-decoration-thickness: 1px;
    text-underline-offset: 0.2em;
  }
  a[data-psytwin-reference-link="true"]:hover {
    color: color-mix(in srgb, var(--primary, #7c3aed) 78%, #000);
  }
  a[data-psytwin-reference-link="true"]:focus-visible {
    border-radius: 0.125rem;
    outline: 2px solid var(--ring, #8b5cf6);
    outline-offset: 2px;
  }
  @media (max-width: 800px) {
    header[data-psytwin-shell="true"] {
      grid-template-columns: 1fr auto;
      row-gap: 0.5rem;
    }
    #psytwin-knowledge-brand { grid-column: 1; }
    header[data-psytwin-shell="true"] > nav:last-child { grid-column: 2; }
    #psytwin-tab-container {
      grid-column: 1 / -1;
      grid-row: 2;
      justify-self: center;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    #psytwin-connection-trigger { transition: none; }
  }
</style>
<script>
  (() => {
    const ragConfiguration = [
      ['文本模型', 'LLM_MODEL', 'qwen-plus'],
      ['模型并发', 'MAX_ASYNC_LLM', '4'],
      ['模型超时', 'LLM_TIMEOUT', '24'],
      ['视觉模型', 'VLM_LLM_MODEL', 'qwen-plus'],
      ['视觉处理', 'VLM_PROCESS_ENABLE', 'false'],
      ['向量模型', 'EMBEDDING_MODEL', 'text-embedding-v4'],
      ['向量维度', 'EMBEDDING_DIM', '1024'],
      ['令牌上限', 'EMBEDDING_TOKEN_LIMIT', '8192'],
      ['Base64 向量', 'EMBEDDING_USE_BASE64', 'false'],
      ['向量批量', 'EMBEDDING_BATCH_NUM', '32'],
      ['重排序绑定', 'RERANK_BINDING', 'null'],
      ['实体 JSON', 'ENTITY_EXTRACTION_USE_JSON', 'true'],
      ['插入并发', 'MAX_PARALLEL_INSERT', '3'],
    ]

    const hideUpstreamBranding = (header, tabContainer) => {
      document.querySelectorAll('a[href*="github.com"]').forEach((element) => {
        element.setAttribute('data-psytwin-hidden', 'true')
      })

      header.querySelectorAll('a, button').forEach((element) => {
        if (element.id === 'psytwin-connection-trigger') return
        const text = (element.textContent || '').trim()
        if (/^LightRAG(?:\\s|$)/i.test(text)) {
          element.setAttribute('data-psytwin-hidden', 'true')
        }
      })

      header.querySelectorAll('span').forEach((element) => {
        const text = (element.textContent || '').trim()
        if (/^v\\d+(?:\\.\\d+){1,3}(?:\\/\\d+)?$/.test(text)) {
          element.setAttribute('data-psytwin-hidden', 'true')
        }
      })

      const upstreamBrand = Array.from(header.children).find((element) =>
        element.id !== 'psytwin-knowledge-brand' &&
        element !== tabContainer &&
        !element.matches('nav') &&
        (element.textContent || '').trim()
      )
      if (upstreamBrand) {
        upstreamBrand.setAttribute('data-psytwin-hidden', 'true')
      }

      header.querySelectorAll('div').forEach((element) => {
        const text = (element.textContent || '').trim()
        if (text === 'Login Free' || text === '无需登陆' || text === '无需登录') {
          element.setAttribute('data-psytwin-hidden', 'true')
        }
      })
    }

    const positionPanel = (trigger, panel) => {
      const triggerRect = trigger.getBoundingClientRect()
      const panelWidth = Math.min(400, window.innerWidth - 32)
      const left = Math.min(
        window.innerWidth - panelWidth - 16,
        Math.max(16, triggerRect.right - panelWidth)
      )
      panel.style.left = left + 'px'
      panel.style.top = triggerRect.bottom + 8 + 'px'
    }

    const createBrand = () => {
      const brand = document.createElement('div')
      brand.id = 'psytwin-knowledge-brand'
      brand.innerHTML = '<span aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="8" ry="3"></ellipse><path d="M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5"></path><path d="M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6"></path></svg></span><span>心图心理学知识库</span>'
      return brand
    }

    const createConnectionControl = () => {
      const trigger = document.createElement('button')
      trigger.id = 'psytwin-connection-trigger'
      trigger.type = 'button'
      trigger.setAttribute('aria-expanded', 'false')
      trigger.setAttribute('aria-controls', 'psytwin-connection-panel')
      trigger.innerHTML = '<span aria-hidden="true"></span><span>未配置</span>'

      const panel = document.createElement('section')
      panel.id = 'psytwin-connection-panel'
      panel.hidden = true
      panel.setAttribute('aria-label', 'RAG 配置属性')

      const panelHeader = document.createElement('div')
      panelHeader.id = 'psytwin-connection-panel-header'
      const title = document.createElement('h2')
      title.textContent = 'RAG 配置属性'
      const refreshButton = document.createElement('button')
      refreshButton.id = 'psytwin-config-refresh'
      refreshButton.type = 'button'
      refreshButton.innerHTML = '<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 11a8.1 8.1 0 0 0-15.5-2M4 5v4h4"></path><path d="M4 13a8.1 8.1 0 0 0 15.5 2M20 19v-4h-4"></path></svg><span>刷新配置</span>'
      const table = document.createElement('table')
      table.innerHTML = '<thead><tr><th>配置项</th><th>当前值</th></tr></thead>'
      const body = document.createElement('tbody')
      ragConfiguration.forEach((row) => {
        const tr = document.createElement('tr')
        const label = document.createElement('td')
        label.textContent = row[1]
        label.title = row[0]
        const value = document.createElement('td')
        value.dataset.value = row[2]
        tr.append(label, value)
        body.appendChild(tr)
      })
      table.appendChild(body)
      panelHeader.append(title, refreshButton)
      panel.append(panelHeader, table)
      document.body.appendChild(panel)

      refreshButton.addEventListener('click', () => {
        panel.querySelectorAll('[data-value]').forEach((cell) => {
          cell.textContent = cell.dataset.value || ''
        })
        refreshButton.dataset.configured = 'true'
        refreshButton.innerHTML = '<span aria-hidden="true">✓</span><span>配置完成</span>'
        trigger.dataset.configured = 'true'
        trigger.querySelector('span:last-child').textContent = '已配置'
      })

      trigger.addEventListener('click', () => {
        const willOpen = panel.hidden
        panel.hidden = !willOpen
        trigger.setAttribute('aria-expanded', String(willOpen))
        if (willOpen) positionPanel(trigger, panel)
      })
      document.addEventListener('pointerdown', (event) => {
        if (panel.hidden || trigger.contains(event.target) || panel.contains(event.target)) return
        panel.hidden = true
        trigger.setAttribute('aria-expanded', 'false')
      })
      document.addEventListener('keydown', (event) => {
        if (event.key !== 'Escape' || panel.hidden) return
        panel.hidden = true
        trigger.setAttribute('aria-expanded', 'false')
        trigger.focus()
      })
      window.addEventListener('resize', () => {
        if (!panel.hidden) positionPanel(trigger, panel)
      })

      return trigger
    }

    const enhanceShell = () => {
      const header = document.querySelector('header')
      const tablist = header?.querySelector('[role="tablist"]')
      if (!header || !tablist) return
      const tabContainer = Array.from(header.children).find((element) => element.contains(tablist)) || tablist

      header.setAttribute('data-psytwin-shell', 'true')
      tabContainer.id = 'psytwin-tab-container'
      hideUpstreamBranding(header, tabContainer)

      if (!header.querySelector('#psytwin-knowledge-brand')) {
        header.prepend(createBrand())
      }
      if (!tablist.querySelector('#psytwin-connection-trigger')) {
        tablist.appendChild(createConnectionControl())
      }
    }

    const enhanceReferenceLinks = () => {
      document.querySelectorAll('li').forEach((item) => {
        if (item.querySelector('[data-psytwin-reference-link="true"]')) return

        const text = item.textContent || ''
        const match = text.match(/^\\s*\\[\\d+\\]\\s+([^\\\\/\\s]+\\.md)\\s*$/i)
        if (!match) return

        const walker = document.createTreeWalker(item, NodeFilter.SHOW_TEXT)
        let node
        while ((node = walker.nextNode())) {
          const value = node.nodeValue || ''
          const index = value.indexOf(match[1])
          if (index === -1) continue

          const link = document.createElement('a')
          link.dataset.psytwinReferenceLink = 'true'
          link.href = '/knowledge-document?file=' + encodeURIComponent(match[1])
          link.target = '_blank'
          link.rel = 'noopener noreferrer'
          link.title = '在新标签页查看 ' + match[1]
          link.textContent = match[1]

          const before = document.createTextNode(value.slice(0, index))
          const after = document.createTextNode(value.slice(index + match[1].length))
          node.parentNode?.replaceChild(after, node)
          after.parentNode?.insertBefore(link, after)
          link.parentNode?.insertBefore(before, link)
          break
        }
      })
    }

    const enhanceWebUi = () => {
      enhanceShell()
      enhanceReferenceLinks()
    }

    let enhanceScheduled = false
    const scheduleEnhanceWebUi = () => {
      if (enhanceScheduled) return
      enhanceScheduled = true
      requestAnimationFrame(() => {
        enhanceScheduled = false
        enhanceWebUi()
      })
    }

    const observer = new MutationObserver(scheduleEnhanceWebUi)
    if (document.documentElement) {
      observer.observe(document.documentElement, { childList: true, subtree: true })
    } else {
      document.addEventListener('DOMContentLoaded', () => {
        observer.observe(document.documentElement, { childList: true, subtree: true })
      }, { once: true })
    }
    document.addEventListener('DOMContentLoaded', scheduleEnhanceWebUi)
    scheduleEnhanceWebUi()
  })()
</script>`

function getTargetUrl(path: string[]) {
  const normalizedPath = path.join("/")
  if (normalizedPath === "webui") {
    return new URL(`${LIGHTRAG_URL.replace(/\/$/, "")}/`)
  }

  return new URL(normalizedPath, `${LIGHTRAG_URL.replace(/\/$/, "")}/`)
}

function createResponseHeaders(source: Headers, options: { isHtml: boolean; isStaticAsset: boolean }) {
  const headers = new Headers()
  const contentType = source.get("content-type")

  if (contentType) {
    headers.set("content-type", contentType)
  }

  if (options.isStaticAsset) {
    headers.set("cache-control", "public, max-age=31536000, immutable")
    const etag = source.get("etag")
    const lastModified = source.get("last-modified")
    if (etag) headers.set("etag", etag)
    if (lastModified) headers.set("last-modified", lastModified)
  } else {
    headers.set("cache-control", options.isHtml ? "private, no-cache" : "no-store")
  }
  return headers
}

async function proxy(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params
  const targetUrl = getTargetUrl(path)
  targetUrl.search = request.nextUrl.search
  const isStaticAsset = request.method === "GET" && path[0] === "webui" && path[1] === "assets"

  const headers = new Headers()
  const requestContentType = request.headers.get("content-type")
  if (requestContentType) {
    headers.set("content-type", requestContentType)
  }
  headers.set("x-api-key", LIGHTRAG_API_KEY)

  const response = await fetch(targetUrl, {
    method: request.method,
    headers,
    body: request.method === "GET" || request.method === "HEAD" ? undefined : request.body,
    // The external LightRAG service is the source of truth; this route only supplies same-origin access.
    // @ts-expect-error Required by Node fetch when forwarding a ReadableStream body.
    duplex: "half",
    cache: isStaticAsset ? "force-cache" : "no-store",
    next: isStaticAsset ? { revalidate: 31_536_000 } : undefined,
  })

  const contentType = response.headers.get("content-type") ?? ""
  const isHtml = contentType.includes("text/html")
  const responseHeaders = createResponseHeaders(response.headers, { isHtml, isStaticAsset })

  if (isHtml) {
    const sourceHtml = await response.text()
    const isSwaggerDocument = path[0] === "docs"
    const html = (isSwaggerDocument
      ? sourceHtml
          .replaceAll('"/static/swagger-ui/', '"/api/lightrag-proxy/static/swagger-ui/')
          .replace("url: '/openapi.json'", "url: '/api/lightrag-proxy/openapi.json'")
          .replace(
            "window.location.origin + '/docs/oauth2-redirect'",
            "window.location.origin + '/api/lightrag-proxy/docs/oauth2-redirect'"
          )
      : sourceHtml
          .replace("<head>", '<head><base href="/api/lightrag-proxy/webui/">')
          .replace(
            'window.__LIGHTRAG_CONFIG__ = {"apiPrefix": "", "webuiPrefix": "/webui/"};',
            'window.__LIGHTRAG_CONFIG__ = {"apiPrefix": "/api/lightrag-proxy", "webuiPrefix": "/api/lightrag-proxy/webui/"};'
          ))
      .replace("</head>", `${EMBED_BOOTSTRAP}</head>`)

    return new Response(html, { status: response.status, headers: responseHeaders })
  }

  return new Response(response.body, { status: response.status, headers: responseHeaders })
}

export const GET = proxy
export const POST = proxy
export const PUT = proxy
export const PATCH = proxy
export const DELETE = proxy
