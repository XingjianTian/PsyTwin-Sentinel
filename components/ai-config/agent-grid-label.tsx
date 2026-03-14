"use client"

import { motion, useAnimation } from "framer-motion"
import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import {
  getRandomSpawnPoint,
  getNextTargetPoint,
  GRID_POINTS,
  type GridPoint,
} from "@/lib/openclaw/grid-paths"

export type AgentGridItem = {
  id: string
  name: string
  role?: string
  emoji?: string
  color?: string
  isOnline?: boolean
}
// Agent ID 到头像图片的映射
const AGENT_AVATAR_MAP: Record<string, string> = {
  "analyst": "/agents-icons/Analyst.png",
  "collector": "/agents-icons/Collector.png",
  "dba": "/agents-icons/DBA.png",
  "relayer": "/agents-icons/Relayer.png",
  "therapist": "/agents-icons/Therapist.png",
  "main": "/agents-icons/main.png",
}

// 根据 agent ID 获取头像路径
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

// Agent 头像组件
function AgentAvatar({ agent }: { agent: AgentGridItem }) {
  const [imgError, setImgError] = useState(false)
  const avatarPath = getAgentAvatar(agent.id)
  
  if (avatarPath && !imgError) {
    return (
      <Image
        src={avatarPath}
        alt={agent.name}
        width={36}
        height={36}
        className="rounded-md object-cover"
        onError={() => setImgError(true)}
      />
    )
  }
  
  return (
    <span className="relative z-10 select-none text-lg">
      {agent.emoji || agent.name?.[0] || agent.id[0]}
    </span>
  )
}

export function AgentGridLabel({ agent }: { agent: AgentGridItem }) {
  // const controls = useAnimation()
  const [currentPoint, setCurrentPoint] = useState<GridPoint | null>(null)
  const [targetPointId, setTargetPointId] = useState<number | null>(null)
  const [isMoving, setIsMoving] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setCurrentPoint(getRandomSpawnPoint())
  }, [agent.id])
  const [moveDuration, setMoveDuration] = useState(3)

  const moveToNext = useCallback(async () => {
    if (isMoving || !currentPoint) return
    setIsMoving(true)

    const next = getNextTargetPoint(currentPoint.id)
    setTargetPointId(next.id)
    
    // 计算移动方向决定动画时长
    const currentPos = GRID_POINTS[currentPoint.id]
    const nextPos = GRID_POINTS[next.id]
    const isHorizontal = currentPos.y === nextPos.y
    const duration = isHorizontal ? 5 : 3 // 横向5秒，纵向3秒
    setMoveDuration(duration)
    
    // 等待动画完成
    await new Promise(r => setTimeout(r, duration * 1000))
    setCurrentPoint(next)
    setTargetPointId(null)
    setIsMoving(false)
  }, [currentPoint, isMoving])

  useEffect(() => {
    if (!currentPoint) return
    let active = true

    const loop = async () => {
      while (active) {
        await new Promise((r) => setTimeout(r, 1000 + Math.random() * 2000))
        if (!active) break
        await moveToNext()
      }
    }

    const timer = setTimeout(loop, 500 + Math.random() * 1500)
    return () => {
      active = false
      clearTimeout(timer)
    }
  }, [currentPoint, moveToNext])

  if (!mounted || !currentPoint) return null

  const pos = GRID_POINTS[currentPoint.id]
  const agentColor = agent.color || "#64748b"

  return (
    // 外层 div 负责居中定位
    <div
      className="absolute"
      style={{
        left: `${pos.x}%`,
        top: `${pos.y}%`,
        transform: "translate(-50%, -50%)",
      }}
    >
      {/* 内层 motion.div 负责动画 */}
      <motion.div
        className="cursor-pointer"
        layout
        initial={{ opacity: 0, scale: 0.5 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ 
          opacity: { duration: 0.4 }, 
          scale: { duration: 0.4 },
          layout: { duration: moveDuration, ease: "easeInOut" }
        }}
        whileHover={{ scale: 1.1 }}
      >
        <div className="relative">
          {/* 在线状态指示点 - 左上角 */}
          <motion.div
            className="absolute -top-1 -left-1 z-10 h-2.5 w-2.5 rounded-full border border-background"
            style={{
              background: isMoving ? "#f59e0b" : "#22c55e",
              boxShadow: `0 0 6px ${isMoving ? "#f59e0b" : "#22c55e"}`,
            }}
            animate={isMoving ? { scale: [1, 1.4, 1] } : { scale: 1 }}
            transition={{ duration: 0.5, repeat: isMoving ? Infinity : 0 }}
          />

          {/* 名称和状态标签 - 紧贴头像下方 */}
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-center whitespace-nowrap z-20">
            <div className="rounded px-1 py-0.5 bg-white border border-black/20 shadow-sm">
              <div className="text-[9px] font-semibold text-black leading-tight">
                {agent.name}
              </div>
              <div className="text-[8px] text-gray-500 leading-tight">
                {isMoving ? "移动中..." : (agent.role || "Agent")}
              </div>
            </div>
          </div>

          {/* Agent 卡片主体 */}
          <motion.div
            animate={isMoving ? { y: [0, -4, 0] } : { y: 0 }}
            transition={{ duration: 0.6, repeat: isMoving ? Infinity : 0, ease: "easeInOut" }}
          >
            <div
              className="relative flex h-9 w-9 items-center justify-center rounded-lg text-base sm:h-10 sm:w-10 overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${agentColor}33, ${agentColor}0d)`,
                border: `2px solid ${agentColor}`,
                boxShadow: isMoving
                  ? `0 0 20px ${agentColor}55, 0 4px 12px rgba(0,0,0,0.2)`
                  : `0 0 10px ${agentColor}33, 0 2px 8px rgba(0,0,0,0.15)`,
              }}
            >
              <AgentAvatar agent={agent} />

              {/* 移动时的光扫效果 */}
              {isMoving && (
                <motion.div
                  className="absolute inset-0 rounded-xl pointer-events-none"
                  style={{
                    background: `linear-gradient(90deg, transparent, ${agentColor}22, transparent)`,
                  }}
                  animate={{ x: ["-100%", "100%"] }}
                  transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                />
              )}
            </div>
          </motion.div>

          {/* 位置 ID（调试信息） */}
          <div
            className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-[8px] opacity-30"
            style={{ color: agentColor }}
          >
            {isMoving && targetPointId !== null
              ? `${currentPoint.id}→${targetPointId}`
              : `P${currentPoint.id}`}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
