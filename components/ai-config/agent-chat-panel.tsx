"use client"

import { useState, useRef } from "react"
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

  const playSendSound = () => {
    if (audio1Ref.current) {
      audio1Ref.current.currentTime = 0
      audio1Ref.current.play().catch(() => {})
      audio1Ref.current.onended = () => {
        setTimeout(() => {
          if (audio2Ref.current) {
            audio2Ref.current.currentTime = 0
            audio2Ref.current.play().catch(() => {})
          }
        }, 3000)
      }
    }
  }

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
    playSendSound()
    try {
      const fixedMessage = "现在你需要统计本月心理状况不佳学生列表，并且给他们发送温馨通知。请调动DBA让它搜索数据，调动分析师让它来分析，让咨询师待命等待学生接入(因为学生收到通知后他很有可能被需要)"
      await sendAgentRequest(selectedAgent.id, fixedMessage)
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
