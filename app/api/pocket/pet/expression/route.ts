import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

import { requestHostBridge } from "@/lib/pet-ai/host-bridge-client"

export const dynamic = "force-dynamic"

const requestSchema = z.object({ expression: z.literal("sad") }).strict()

export async function POST(request: NextRequest) {
  const parsed = requestSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ code: 400, message: "表情请求参数无效", data: null }, { status: 400 })
  }

  try {
    await requestHostBridge("/v1/device/choreography", {
      method: "POST",
      body: JSON.stringify({ kind: "emotion", move: "sad1" }),
    })

    return NextResponse.json({
      code: 0,
      message: "心宠表情请求已发送",
      data: { expression: parsed.data.expression },
    })
  } catch {
    return NextResponse.json({ code: 502, message: "心宠设备暂时不可用", data: null }, { status: 502 })
  }
}
