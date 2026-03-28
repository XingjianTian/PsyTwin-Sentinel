import { NextRequest, NextResponse } from "next/server"
import { readFileSync, writeFileSync } from "fs"
import { execSync } from "child_process"

const OPENCLAW_CONFIG_PATH = "/Users/txj/Projects/PsyTwin/PsyTwin-OpenClaw/data/openclaw.json"

function reloadGateway() {
  try {
    execSync("docker exec openclaw-gateway openclaw config reload", { timeout: 10000 })
  } catch (reloadError) {
    console.warn("OpenClaw reload 可能需要手动执行:", reloadError)
  }
}

export async function GET() {
  try {
    const configPath = process.env.OPENCLAW_CONFIG_PATH || OPENCLAW_CONFIG_PATH
    const configData = JSON.parse(readFileSync(configPath, "utf-8"))

    const agents = configData.agents.list.map((a: any) => ({
      id: a.id,
      name: a.name || a.id,
      theme: a.identity?.theme || "",
    }))

    return NextResponse.json({ success: true, agents })
  } catch (error) {
    console.error("读取 Agent 配置失败:", error)
    return NextResponse.json({ success: false, message: "读取失败" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, agentId, theme, name } = body

    const configPath = process.env.OPENCLAW_CONFIG_PATH || OPENCLAW_CONFIG_PATH
    const configData = JSON.parse(readFileSync(configPath, "utf-8"))

    // 新增 Agent
    if (action === "add") {
      if (!name) {
        return NextResponse.json({ success: false, message: "缺少 Agent 名称" }, { status: 400 })
      }
      const id = name.toLowerCase().replace(/\s+/g, "-")
      if (configData.agents.list.find((a: any) => a.id === id)) {
        return NextResponse.json({ success: false, message: "Agent 已存在" }, { status: 409 })
      }
      configData.agents.list.push({
        id,
        name,
        identity: { theme: "" },
      })
      writeFileSync(configPath, JSON.stringify(configData, null, 2), "utf-8")
      reloadGateway()
      return NextResponse.json({ success: true, message: `已添加 Agent: ${name}`, id })
    }

    // 更新已有 Agent
    if (!agentId || !theme) {
      return NextResponse.json({ success: false, message: "缺少 agentId 或 theme" }, { status: 400 })
    }

    const agentIndex = configData.agents.list.findIndex((a: any) => a.id === agentId)
    if (agentIndex === -1) {
      configData.agents.list.push({
        id: agentId,
        name: name || agentId,
        identity: { theme },
      })
    } else {
      if (!configData.agents.list[agentIndex].identity) {
        configData.agents.list[agentIndex].identity = {}
      }
      configData.agents.list[agentIndex].identity.theme = theme
    }

    writeFileSync(configPath, JSON.stringify(configData, null, 2), "utf-8")
    reloadGateway()

    return NextResponse.json({ success: true, message: "Agent 配置已更新并重载" })
  } catch (error) {
    console.error("更新 Agent 配置失败:", error)
    return NextResponse.json({ success: false, message: "更新失败" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { agentId } = await request.json()

    if (!agentId) {
      return NextResponse.json({ success: false, message: "缺少 agentId" }, { status: 400 })
    }

    const configPath = process.env.OPENCLAW_CONFIG_PATH || OPENCLAW_CONFIG_PATH
    const configData = JSON.parse(readFileSync(configPath, "utf-8"))

    const agentIndex = configData.agents.list.findIndex((a: any) => a.id === agentId)
    if (agentIndex === -1) {
      return NextResponse.json({ success: false, message: `未找到 Agent: ${agentId}` }, { status: 404 })
    }

    const deleted = configData.agents.list.splice(agentIndex, 1)[0]
    writeFileSync(configPath, JSON.stringify(configData, null, 2), "utf-8")
    reloadGateway()

    return NextResponse.json({ success: true, message: `已删除 Agent: ${deleted.name || agentId}` })
  } catch (error) {
    console.error("删除 Agent 失败:", error)
    return NextResponse.json({ success: false, message: "删除失败" }, { status: 500 })
  }
}
