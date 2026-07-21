import { NextRequest } from "next/server"

const LIGHTRAG_URL =
  process.env.LIGHTRAG_API_URL ??
  process.env.NEXT_PUBLIC_LIGHTRAG_WEBUI_URL ??
  "http://42.121.14.189:9621"
const LIGHTRAG_API_KEY = process.env.LIGHTRAG_API_KEY ?? "psytwin-local-rag-key"

const EMBED_BOOTSTRAP = `
<style id="psytwin-lightrag-shell">
  [data-psytwin-hidden="true"] { display: none !important; }
  [data-psytwin-placeholder="true"] { visibility: hidden !important; }
  header {
    display: grid !important;
    grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
    align-items: center;
  }
  header > div:first-child {
    min-width: 0 !important;
    width: auto !important;
  }
  header > div:nth-child(2) { grid-column: 2; }
  header > nav:last-child {
    grid-column: 3;
    width: auto !important;
    justify-self: end;
  }
  header [role="tablist"] {
    min-height: 2.5rem;
    gap: 0.375rem;
  }
  header [role="tab"] {
    min-height: 2.25rem;
    padding: 0.5rem 1rem !important;
    font-size: 1rem;
    line-height: 1.25rem;
  }
</style>
<script>
  (() => {
    const hideBranding = () => {
      document.querySelectorAll('a[href*="github.com"]').forEach((element) => {
        element.setAttribute('data-psytwin-hidden', 'true')
      })

      document.querySelectorAll('header a, header button').forEach((element) => {
        const text = (element.textContent || '').trim()
        if (/^LightRAG(?:\\s|$)/i.test(text)) {
          element.setAttribute('data-psytwin-hidden', 'true')
        }
      })

      document.querySelectorAll('header span').forEach((element) => {
        const text = (element.textContent || '').trim()
        if (/^v\\d+(?:\\.\\d+){1,3}(?:\\/\\d+)?$/.test(text)) {
          element.setAttribute('data-psytwin-hidden', 'true')
        }
      })

      const redundantBrand = document.querySelector('header > div:first-child')
      if (redundantBrand?.textContent?.includes('心理学知识库')) {
        redundantBrand.setAttribute('data-psytwin-placeholder', 'true')
      }

      document.querySelectorAll('header div').forEach((element) => {
        const text = (element.textContent || '').trim()
        if (text === 'Login Free' || text === '无需登陆' || text === '无需登录') {
          element.setAttribute('data-psytwin-hidden', 'true')
        }
      })
    }

    new MutationObserver(hideBranding).observe(document.documentElement, { childList: true, subtree: true })
    document.addEventListener('DOMContentLoaded', hideBranding)
    hideBranding()
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
