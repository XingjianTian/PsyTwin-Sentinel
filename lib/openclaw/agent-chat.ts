export interface AgentResponse {
  id: string
  object: string
  created_at: number
  status: string
  model: string
  output: Array<{
    type: string
    id: string
    role: string
    content: Array<{
      type: string
      text: string
    }>
    status: string
  }>
  usage?: {
    input_tokens: number
    output_tokens: number
    total_tokens: number
  }
}

export interface AgentChatError {
  error: {
    message: string
    type: string
  }
}

export async function sendAgentRequest(
  agentId: string,
  message: string,
  token: string = "123456"
): Promise<AgentResponse | AgentChatError> {
  const response = await fetch("/api/openclaw/agent-chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      agentId,
      message,
      token,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    return {
      error: {
        message: `HTTP ${response.status}: ${errorText || response.statusText}`,
        type: "http_error",
      },
    }
  }

  return response.json()
}

export function extractResponseText(response: AgentResponse | AgentChatError): string {
  if ("error" in response) {
    return `Error: ${response.error.message}`
  }

  const message = response.output?.[0]
  if (!message) {
    return "No response received"
  }

  const textContent = message.content?.find((c) => c.type === "output_text")
  return textContent?.text || "Empty response"
}
