"use client"

import { useState } from "react"
import { Send, Loader2 } from "lucide-react"
import Image from "next/image"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AGENT_DESCRIPTIONS } from "@/lib/openclaw/agents.config"
import { sendAgentRequest } from "@/lib/openclaw/agent-chat"
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

    const trimmedMessage = message.trim()

    if (selectedAgent.id === "main" && trimmedMessage.includes("发送温馨通知")) {
      setIsLoading(true)
      try {
        await fetch("/api/pocket/notifications/broadcast", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "notification",
            title: "💚 温馨提醒",
            content: "亲爱的同学，最近学习压力大吗？如果感到焦虑或疲惫，可以来和我们的线上咨询师聊聊天，也可以预约没课的时间来线下体验VR游戏和AI咨询服务哦 🌟",
          }),
        })
      } catch (error) {
        console.error("发送温馨通知失败:", error)
      }
    }

    setIsLoading(true)
    try {
      await sendAgentRequest(selectedAgent.id, trimmedMessage)
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
      <div className="flex h-12 items-center justify-center rounded-lg border border-border bg-card">
        <p className="text-xs text-muted-foreground">点击 Agent 小人选择对话对象</p>
      </div>
    )
  }

  const avatarPath = getAgentAvatar(selectedAgent.id)
  const agentColor = selectedAgent.color || "#64748b"

  return (
    <div className="relative group">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 rounded-lg blur opacity-30 group-hover:opacity-50 transition duration-1000 group-hover:duration-200 animate-pulse" />
      <div className="relative flex items-center gap-2 rounded-lg border border-purple-200 dark:border-purple-800 bg-card p-2 shadow-lg">
        <div
          className="relative flex shrink-0 items-center justify-center overflow-hidden rounded-md"
          style={{
            width: 28,
            height: 28,
            background: `linear-gradient(135deg, ${agentColor}33, ${agentColor}0d)`,
            border: `2px solid ${agentColor}`,
          }}
        >
          {avatarPath ? (
            <Image
              src={avatarPath}
              alt={selectedAgent.name}
              width={28}
              height={28}
              className="rounded-sm object-cover"
            />
          ) : (
            <span className="text-xs">{selectedAgent.emoji || "🤖"}</span>
          )}
        </div>

        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={`向 ${selectedAgent.name} 发送任务...`}
          className="h-7 text-xs flex-1 bg-transparent"
          disabled={isLoading}
        />
        <Button
          onClick={handleSend}
          disabled={!message.trim() || isLoading}
          size="sm"
          className="h-7 w-7 p-0"
          style={{
            background: `linear-gradient(135deg, ${agentColor}, ${agentColor}dd)`,
          }}
        >
          {isLoading ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <Send className="h-3 w-3" />
          )}
        </Button>
      </div>
    </div>
  )
}
