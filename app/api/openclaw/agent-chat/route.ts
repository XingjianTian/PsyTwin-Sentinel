import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { agentId, message, token = "123456" } = body

    const response = await fetch("http://localhost:18789/v1/responses", {
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
    
    return NextResponse.json(data)
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
