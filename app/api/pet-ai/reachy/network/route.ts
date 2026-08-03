import { lookup } from "node:dns/promises"

import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

import {
  isPrivateIpv4,
  normalizeReachyNetworkHost,
  normalizeReachyNetworkPort,
  type ReachyNetworkConnection,
} from "@/lib/pet-ai/reachy-network"

export const dynamic = "force-dynamic"

const requestSchema = z.object({
  host: z.string().max(253),
  port: z.number().int().min(1).max(65535).optional(),
}).strict()

const relayResultSchema = z.object({
  service: z.literal("psytwin-reachy-video-relay"),
  running: z.boolean(),
  transport: z.literal("mjpeg"),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  fps: z.number().int().positive(),
  lastFrameAt: z.number().nullable(),
  error: z.string().nullable(),
}).passthrough()

const rpcResponseSchema = z.object({
  jsonrpc: z.literal("2.0"),
  id: z.union([z.string(), z.number()]),
  result: relayResultSchema.optional(),
  error: z.object({ code: z.number(), message: z.string() }).optional(),
})

function json(data: unknown, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: { "Cache-Control": "private, no-store, max-age=0" },
  })
}

function invalidMutationOrigin(request: NextRequest) {
  const origin = request.headers.get("origin")
  if (!origin) return true
  try {
    const allowedOrigins = new Set([request.nextUrl.origin])
    const forwardedHost = request.headers.get("x-forwarded-host")?.split(",", 1)[0]?.trim()
    const requestHost = request.headers.get("host")?.trim() || forwardedHost
    if (requestHost) {
      const forwardedProtocol = request.headers.get("x-forwarded-proto")?.split(",", 1)[0]?.trim()
      const protocol = forwardedProtocol || request.nextUrl.protocol.replace(":", "")
      allowedOrigins.add(new URL(`${protocol}://${requestHost}`).origin)
    }
    return !allowedOrigins.has(new URL(origin).origin)
  } catch {
    return true
  }
}

async function resolvePrivateAddresses(host: string) {
  if (/^\d+(?:\.\d+){3}$/.test(host)) return isPrivateIpv4(host) ? [host] : []
  const results = await lookup(host, { all: true, family: 4 })
  return results.map(({ address }) => address).filter(isPrivateIpv4)
}

function relayHeaders() {
  return {
    "Content-Type": "application/json",
    "X-Relay-Key": process.env.REACHY_RELAY_API_KEY || "dev-only-change-me",
  }
}

function configuredRelayUrl() {
  if (process.env.REACHY_RELAY_URL) return process.env.REACHY_RELAY_URL.replace(/\/$/, "")
  const host = process.env.REACHY_RELAY_HOST?.trim() || "127.0.0.1"
  const port = process.env.REACHY_RELAY_PORT?.trim() || "7862"
  return `http://${host}:${port}`
}

export async function GET(request: NextRequest) {
  if (request.nextUrl.searchParams.get("stream") !== "1") return json({ message: "未指定视频流" }, 400)
  try {
    const upstream = await fetch(`${configuredRelayUrl()}/stream.mjpeg`, {
      cache: "no-store",
      headers: { "X-Relay-Key": process.env.REACHY_RELAY_API_KEY || "dev-only-change-me" },
      signal: request.signal,
    })
    if (!upstream.ok || !upstream.body) return json({ message: "直播主机暂未输出视频" }, 502)
    return new NextResponse(upstream.body, {
      status: 200,
      headers: {
        "Cache-Control": "private, no-store, no-cache, must-revalidate",
        "Content-Type": upstream.headers.get("content-type") || "multipart/x-mixed-replace; boundary=frame",
      },
    })
  } catch {
    return json({ message: "无法连接直播主机视频流" }, 502)
  }
}

export async function POST(request: NextRequest) {
  if (request.headers.get("content-type")?.split(";", 1)[0]?.trim().toLowerCase() !== "application/json") {
    return json({ message: "仅支持 JSON 网络连接请求" }, 415)
  }
  if (invalidMutationOrigin(request)) return json({ message: "网络连接请求来源无效" }, 403)

  const parsed = requestSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return json({ message: "网络连接参数无效" }, 400)

  try {
    const host = normalizeReachyNetworkHost(parsed.data.host)
    const port = normalizeReachyNetworkPort(parsed.data.port)
    const addresses = await resolvePrivateAddresses(host)
    if (addresses.length === 0) return json({ message: "目标地址不在允许的局域网范围内" }, 400)

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 5_000)
    try {
      const response = await fetch(`http://${host}:${port}/rpc`, {
        method: "POST",
        cache: "no-store",
        redirect: "error",
        signal: controller.signal,
        headers: relayHeaders(),
        body: JSON.stringify({ jsonrpc: "2.0", id: "sentinel-connect", method: "stream.start", params: {} }),
      })
      if (!response.ok) return json({ message: `直播主机返回 HTTP ${response.status}` }, 502)

      const rpc = rpcResponseSchema.safeParse(await response.json().catch(() => null))
      if (!rpc.success || !rpc.data.result) return json({ message: rpc.success ? rpc.data.error?.message || "直播主机 RPC 调用失败" : "目标服务不是兼容的 PsyTwin 视频中继" }, 502)
      const status = rpc.data.result

      const connection: ReachyNetworkConnection = {
        host,
        port,
        endpoint: `http://${host}:${port}`,
        running: status.running,
        transport: status.transport,
        width: status.width,
        height: status.height,
        fps: status.fps,
        lastFrameAt: status.lastFrameAt,
        error: status.error,
      }
      return json({ data: connection })
    } finally {
      clearTimeout(timeout)
    }
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return json({ message: "连接超时，请确认直播主机服务已启动且两台电脑处于同一局域网" }, 504)
    }
    const message = error instanceof Error ? error.message : "直播主机连接失败"
    if (/请输入|格式|仅支持|端口/.test(message)) return json({ message }, 400)
    return json({ message: "无法连接直播主机，请检查地址、网络、中继服务和摄像头占用状态" }, 502)
  }
}
