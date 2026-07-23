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
    background: #22c55e;
    box-shadow: 0 0 0 3px color-mix(in srgb, #22c55e 16%, transparent);
  }
  #psytwin-connection-panel {
    position: fixed;
    z-index: 50;
    width: min(25rem, calc(100vw - 2rem));
    padding: 1rem;
    border: 1px solid var(--border, #e4e4e7);
    border-radius: 0.75rem;
    background: var(--popover, #ffffff);
    color: var(--popover-foreground, #18181b);
    box-shadow: 0 6px 8px rgb(0 0 0 / 0.08);
  }
  #psytwin-connection-panel[hidden] { display: none; }
  #psytwin-connection-panel h2 {
    margin: 0 0 0.75rem;
    font-size: 0.9375rem;
    font-weight: 600;
  }
  #psytwin-connection-panel table {
    width: 100%;
    table-layout: fixed;
    border-collapse: collapse;
    font-size: 0.75rem;
  }
  #psytwin-connection-panel th,
  #psytwin-connection-panel td {
    padding: 0.5rem 0.375rem;
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
  #psytwin-connection-panel th:nth-child(1) { width: 23%; }
  #psytwin-connection-panel th:nth-child(2) { width: 43%; }
  #psytwin-connection-panel th:nth-child(3) { width: 34%; }
  #psytwin-connection-panel td:first-child,
  #psytwin-connection-panel td:last-child { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
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
    const serviceUrl = ${JSON.stringify(LIGHTRAG_URL)}
    const statusRows = [
      ['服务地址', 'LightRAG WebUI 与 API', serviceUrl],
      ['模型服务', '阿里云百炼 OpenAI 兼容接口', 'qwen-plus / qwen-turbo'],
      ['向量模型', '文档向量化与语义检索', 'text-embedding-v4'],
      ['图谱入口', '默认加载全局知识图谱', 'label=*'],
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
      trigger.innerHTML = '<span aria-hidden="true"></span><span>连接</span>'

      const panel = document.createElement('section')
      panel.id = 'psytwin-connection-panel'
      panel.hidden = true
      panel.setAttribute('aria-label', '连接状态')

      const title = document.createElement('h2')
      title.textContent = '连接状态'
      const table = document.createElement('table')
      table.innerHTML = '<thead><tr><th>属性</th><th>含义</th><th>值</th></tr></thead>'
      const body = document.createElement('tbody')
      statusRows.forEach((row) => {
        const tr = document.createElement('tr')
        row.forEach((value) => {
          const td = document.createElement('td')
          td.textContent = value
          td.title = value
          tr.appendChild(td)
        })
        body.appendChild(tr)
      })
      table.appendChild(body)
      panel.append(title, table)
      document.body.appendChild(panel)

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

    new MutationObserver(enhanceShell).observe(document.documentElement, { childList: true, subtree: true })
    document.addEventListener('DOMContentLoaded', enhanceShell)
    enhanceShell()
  })()
</script>`

function getTargetUrl(path: string[]) {
  const normalizedPath = path.join("/")
  if (normalizedPath === "webui") {
    return new URL(`${LIGHTRAG_URL.replace(/\/$/, "")}/`)
  }

  return new URL(normalizedPath, `${LIGHTRAG_URL.replace(/\/$/, "")}/`)
}

function createResponseHeaders(source: Headers) {
  const headers = new Headers()
  const contentType = source.get("content-type")

  if (contentType) {
    headers.set("content-type", contentType)
  }

  headers.set("cache-control", "no-store")
  return headers
}

async function proxy(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params
  const targetUrl = getTargetUrl(path)
  targetUrl.search = request.nextUrl.search

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
  })

  const responseHeaders = createResponseHeaders(response.headers)
  const contentType = response.headers.get("content-type") ?? ""

  if (contentType.includes("text/html")) {
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
