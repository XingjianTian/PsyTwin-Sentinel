import { NextRequest, NextResponse } from "next/server"

const OPENCLAW_URL = process.env.OPENCLAW_GATEWAY_URL || "http://127.0.0.1:18789"

export async function POST(request: NextRequest) {
  try {
    const { prompt, agentName } = await request.json()

    if (!prompt || prompt.trim().length < 5) {
      return NextResponse.json(
        { success: false, message: "prompt 太短，无法补充" },
        { status: 400 }
      )
    }

    const systemPrompt = `你是一个专业的 AI Agent Prompt 工程助手。你的任务是将用户提供的简短描述扩展成完整的专业 Agent 配置 prompt。

请根据以下规则扩展：
1. 【角色定位】明确 Agent 的身份、职责和专业领域
2. 【核心职责】列出 3-5 条具体职责
3. 【回应策略】描述该角色应有的对话风格和回应方式
4. 【知识边界】说明该角色能做什么、不能做什么
5. 【安全策略】涉及敏感内容时的处理方式（如有）

要求：
- 输出纯文本，不要 markdown 格式
- 用中文回复
- prompt 应当专业、清晰、可操作
- 总长度严格控制在 300 字以内

用户提供的简短描述：
${prompt}${agentName ? `\n\nAgent 名称：${agentName}` : ""}`

    const response = await fetch(`${OPENCLAW_URL}/v1/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENCLAW_TOKEN || "123456"}`,
      },
      body: JSON.stringify({
        model: "main",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: "请补充这个 Agent Prompt" },
        ],
        temperature: 0.7,
        max_tokens: 300,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      return NextResponse.json(
        { success: false, message: `OpenClaw 请求失败: ${response.status} - ${error}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content || ""

    return NextResponse.json({
      success: true,
      enhanced: content,
    })
  } catch (error) {
    console.error("[AI Enhance] Error:", error)
    return NextResponse.json(
      { success: false, message: "AI 补充失败" },
      { status: 500 }
    )
  }
}