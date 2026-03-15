"use client"

import { useState } from "react"
import { Send, Loader2 } from "lucide-react"
import Image from "next/image"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AGENT_DESCRIPTIONS } from "@/lib/openclaw/agents.config"
import { sendAgentRequest, extractResponseText } from "@/lib/openclaw/agent-chat"
import type { AgentGridItem } from "./agent-grid-label"

interface AgentChatPanelProps {
  selectedAgent: AgentGridItem | null
}

const AGENT_AVATAR_MAP: Record<string, string> = {
  analyst: "/agents-icons/Analyst.png",
  collector: "/agents-icons/Collector.png",
  dba: "/agents-icons/DBA.png",
  relayer: "/agents-icons/Relayer.png",
  therapist: "/agents-icons/Therapist.png",
  main: "/agents-icons/main.png",
}

function getAgentAvatar(agentId: string): string | null {
  const directMatch = AGENT_AVATAR_MAP[agentId.toLowerCase()]
  if (directMatch) return directMatch

  for (const [key, path] of Object.entries(AGENT_AVATAR_MAP)) {
    if (agentId.toLowerCase().includes(key)) {
      return path
    }
  }

  return null
}

export function AgentChatPanel({ selectedAgent }: AgentChatPanelProps) {
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSend = async () => {
    if (!selectedAgent || !message.trim() || isLoading) return

    setIsLoading(true)
    try {
      await sendAgentRequest(selectedAgent.id, message.trim())
      setMessage("")
    } catch (error) {
      console.error("发送失败:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleSend()
    }
  }

  if (!selectedAgent) {
    return (
      <div className="flex h-20 items-center justify-center rounded-xl border border-border bg-card">
        <p className="text-sm text-muted-foreground">点击 Agent 小人选择对话对象</p>
      </div>
    )
  }

  const avatarPath = getAgentAvatar(selectedAgent.id)
  const description = AGENT_DESCRIPTIONS[selectedAgent.id] || selectedAgent.role || "智能体"
  const agentColor = selectedAgent.color || "#64748b"

  return (
    <div className="rounded-xl border border-border bg-card p-3">
      <div className="flex items-center gap-3">
        <div
          className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg"
          style={{
            background: `linear-gradient(135deg, ${agentColor}33, ${agentColor}0d)`,
            border: `2px solid ${agentColor}`,
          }}
        >
          {avatarPath ? (
            <Image
              src={avatarPath}
              alt={selectedAgent.name}
              width={40}
              height={40}
              className="rounded-md object-cover"
            />
          ) : (
            <span className="text-lg">{selectedAgent.emoji || "🤖"}</span>
          )}
        </div>
        
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h4 className="truncate text-sm font-semibold" style={{ color: agentColor }}>
              {selectedAgent.name}
            </h4>
            <span className="truncate text-xs text-muted-foreground">{description}</span>
          </div>
          <div className="mt-1.5 flex gap-2">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="输入以发送任务..."
              className="h-8 text-sm"
              disabled={isLoading}
            />
            <Button
              onClick={handleSend}
              disabled={!message.trim() || isLoading}
              size="sm"
              className="h-8 px-3"
              style={{
                background: `linear-gradient(135deg, ${agentColor}, ${agentColor}dd)`,
              }}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
