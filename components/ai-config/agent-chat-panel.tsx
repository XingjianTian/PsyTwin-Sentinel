"use client"

import { useState, useRef } from "react"
import { Send, Loader2 } from "lucide-react"
import Image from "next/image"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AGENT_DESCRIPTIONS } from "@/lib/openclaw/agents.config"
import { sendAgentRequest } from "@/lib/openclaw/agent-chat"
import { OPENCLAW_COMPLEX_DEMO_MESSAGE } from "@/lib/openclaw/demo-script"
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
  main: "/agents-icons/psytwin.jpg",
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
  const audio1Ref = useRef<HTMLAudioElement | null>(null)
  const audio2Ref = useRef<HTMLAudioElement | null>(null)

  const playStartSound = () => {
    if (audio1Ref.current) {
      audio1Ref.current.currentTime = 0
      audio1Ref.current.play().catch(() => {})
    }
  }

  const playCompletedSound = () => {
    if (audio2Ref.current) {
      audio2Ref.current.currentTime = 0
      audio2Ref.current.play().catch(() => {})
    }
  }

  const handleSend = async () => {
    if (!selectedAgent || !message.trim() || isLoading) return

    setIsLoading(true)
    playStartSound()
    try {
      const response = await sendAgentRequest(selectedAgent.id, OPENCLAW_COMPLEX_DEMO_MESSAGE)
      if (!("error" in response)) {
        playCompletedSound()
      }
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
      <div className="flex h-14 items-center justify-center rounded-lg border border-border bg-card">
        <p className="text-xs text-muted-foreground">点击 Agent 小人选择对话对象</p>
      </div>
    )
  }

  const avatarPath = getAgentAvatar(selectedAgent.id)
  const agentColor = selectedAgent.color || "#64748b"

  return (
    <div className="relative group w-full">
      <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-orange-500/20 rounded-xl blur opacity-60 group-hover:opacity-80 transition duration-500" />
      <div className="relative flex items-center gap-3 rounded-xl border border-purple-500/30 bg-gradient-to-b from-card to-muted/20 p-3 shadow-lg w-full">
        <div
          className="relative flex shrink-0 items-center justify-center overflow-hidden rounded-xl shadow-md"
          style={{
            width: 44,
            height: 44,
            background: `linear-gradient(135deg, ${agentColor}25, ${agentColor}10)`,
            border: `2px solid ${agentColor}60`,
            boxShadow: `0 0 12px ${agentColor}30`,
          }}
        >
          {avatarPath ? (
            <Image
              src={avatarPath}
              alt={selectedAgent.name}
              width={44}
              height={44}
              className="rounded-xl object-cover"
            />
          ) : (
            <span className="text-lg">{selectedAgent.emoji || "🤖"}</span>
          )}
        </div>

        <div className="flex flex-col flex-1 min-w-0 gap-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold" style={{ color: agentColor }}>
              {selectedAgent.name}
            </span>
          </div>
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="输入指令..."
            className="h-9 text-sm flex-1 bg-background/80 backdrop-blur-sm rounded-lg"
            disabled={isLoading}
          />
        </div>

        <Button
          onClick={handleSend}
          disabled={!message.trim() || isLoading}
          size="sm"
          className="h-10 w-10 p-0 rounded-xl shadow-md transition-all hover:scale-105"
          style={{
            background: `linear-gradient(135deg, ${agentColor}, ${agentColor}cc)`,
            boxShadow: `0 4px 12px ${agentColor}40`,
          }}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>
      <audio ref={audio1Ref} src="/audio/send.mp3" preload="auto" />
      <audio ref={audio2Ref} src="/audio/send2.mp3" preload="auto" />
    </div>
  )
}
