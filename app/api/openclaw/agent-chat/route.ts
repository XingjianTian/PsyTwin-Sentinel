import { NextRequest, NextResponse } from "next/server"
import { getOpenClawGatewayConfig } from "@/lib/openclaw/config"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { agentId, message, token = "123456" } = body

    // 从环境变量读取配置，而非硬编码
    const { url: gatewayUrl } = getOpenClawGatewayConfig()
    const targetUrl = gatewayUrl || "http://localhost:18789"

    const response = await fetch(`${targetUrl}/v1/responses`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "x-openclaw-agent-id": agentId,
      },
      body: JSON.stringify({
        model: `openclaw:${agentId}`,
        input: message,
        user: "psytwin",
      }),
    })

    const data = await response.json()
    
    // 添加 CORS headers，允许跨域访问（开发环境）
    return NextResponse.json(data, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, x-openclaw-agent-id",
        "Access-Control-Max-Age": "86400",
      },
    })
  } catch (error) {
    console.error("Agent chat proxy error:", error)
    return NextResponse.json(
      {
        error: {
          message: error instanceof Error ? error.message : "请求失败",
          type: "proxy_error",
        },
      },
      { status: 500 }
    )
  }
}

// 处理 OPTIONS 预检请求
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, x-openclaw-agent-id",
      "Access-Control-Max-Age": "86400",
    },
  })
}
