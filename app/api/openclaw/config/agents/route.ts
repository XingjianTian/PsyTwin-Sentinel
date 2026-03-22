import { NextRequest, NextResponse } from "next/server"
import { readFileSync, writeFileSync } from "fs"
import { execSync } from "child_process"

const OPENCLAW_CONFIG_PATH = "/Users/txj/Projects/PsyTwin/PsyTwin-OpenClaw/data/openclaw.json"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { agentId, theme } = body

    if (!agentId || !theme) {
      return NextResponse.json({ success: false, message: "缺少 agentId 或 theme" }, { status: 400 })
    }

    const configPath = process.env.OPENCLAW_CONFIG_PATH || OPENCLAW_CONFIG_PATH
    const configData = JSON.parse(readFileSync(configPath, "utf-8"))

    const agentIndex = configData.agents.list.findIndex((a: any) => a.id === agentId)
    if (agentIndex === -1) {
      return NextResponse.json({ success: false, message: `未找到 Agent: ${agentId}` }, { status: 404 })
    }

    if (!configData.agents.list[agentIndex].identity) {
      configData.agents.list[agentIndex].identity = {}
    }
    configData.agents.list[agentIndex].identity.theme = theme

    writeFileSync(configPath, JSON.stringify(configData, null, 2), "utf-8")

    try {
      execSync("docker exec openclaw-gateway openclaw config reload", { timeout: 10000 })
    } catch (reloadError) {
      console.warn("OpenClaw reload 可能需要手动执行:", reloadError)
    }

    return NextResponse.json({ success: true, message: "Agent 配置已更新并重载" })
  } catch (error) {
    console.error("更新 Agent 配置失败:", error)
    return NextResponse.json({ success: false, message: "更新失败" }, { status: 500 })
  }
}
