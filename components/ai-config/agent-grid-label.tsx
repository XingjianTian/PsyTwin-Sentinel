"use client"

import { motion, useAnimation } from "framer-motion"
import { useState, useEffect, useCallback } from "react"
import {
  getRandomSpawnPoint,
  getNextTargetPoint,
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

// 格点坐标映射（百分比）
const POINT_MAP: Record<number, { x: number; y: number }> = {
  0: { x: 25, y: 75 }, 1: { x: 50, y: 75 }, 2: { x: 75, y: 75 },
  3: { x: 25, y: 50 }, 4: { x: 50, y: 50 }, 5: { x: 75, y: 50 },
  6: { x: 25, y: 25 }, 7: { x: 50, y: 25 }, 8: { x: 75, y: 25 },
}

export function AgentGridLabel({ agent }: { agent: AgentGridItem }) {
  const controls = useAnimation()
  const [currentPoint, setCurrentPoint] = useState<GridPoint | null>(null)
  const [targetPointId, setTargetPointId] = useState<number | null>(null)
  const [isMoving, setIsMoving] = useState(false)
  const [mounted, setMounted] = useState(false)

  // 挂载后初始化（避免 SSR 不一致）
  useEffect(() => {
    setMounted(true)
    setCurrentPoint(getRandomSpawnPoint())
  }, [agent.id])

  const moveToNext = useCallback(async () => {
    if (isMoving || !currentPoint) return
    setIsMoving(true)

    const next = getNextTargetPoint(currentPoint.id)
    setTargetPointId(next.id)

    await controls.start({
      left: `${next.x}%`,
      top: `${next.y}%`,
      transition: { duration: 3, ease: "easeInOut" },
    })

    setCurrentPoint(next)
    setTargetPointId(null)
    setIsMoving(false)
  }, [currentPoint, isMoving, controls])

  // 自动移动循环
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

  const pos = POINT_MAP[currentPoint.id]
  const agentColor = agent.color || "#64748b"

  return (
    <motion.div
      className="absolute cursor-pointer"
      style={{
        left: `${pos.x}%`,
        top: `${pos.y}%`,
        transform: "translate(-50%, -50%)",
      }}
      animate={controls}
      initial={{ opacity: 0, scale: 0.5 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ opacity: { duration: 0.4 }, scale: { duration: 0.4 } }}
      whileHover={{ scale: 1.1 }}
    >
      <div className="relative">
        {/* 在线状态指示点 */}
        <motion.div
          className="absolute -top-1 -right-1 z-10 h-2.5 w-2.5 rounded-full border border-background"
          style={{
            background: isMoving ? "#f59e0b" : "#22c55e",
            boxShadow: `0 0 6px ${isMoving ? "#f59e0b" : "#22c55e"}`,
          }}
          animate={isMoving ? { scale: [1, 1.4, 1] } : { scale: 1 }}
          transition={{ duration: 0.5, repeat: isMoving ? Infinity : 0 }}
        />

        {/* Agent 卡片主体 */}
        <motion.div
          animate={isMoving ? { y: [0, -4, 0] } : { y: 0 }}
          transition={{ duration: 0.6, repeat: isMoving ? Infinity : 0, ease: "easeInOut" }}
        >
          <div
            className="relative flex h-9 w-9 items-center justify-center rounded-lg text-base sm:h-10 sm:w-10"
            style={{
              background: `linear-gradient(135deg, ${agentColor}33, ${agentColor}0d)`,
              border: `2px solid ${agentColor}`,
              boxShadow: isMoving
                ? `0 0 20px ${agentColor}55, 0 4px 12px rgba(0,0,0,0.2)`
                : `0 0 10px ${agentColor}33, 0 2px 8px rgba(0,0,0,0.15)`,
            }}
          >
            <span className="relative z-10 select-none">
              {agent.emoji || agent.name?.[0] || agent.id[0]}
            </span>

            {/* 移动时的光扫效果（轻柔，非赛博风） */}
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

          {/* 站立平台 */}
          <div
            className="mx-auto -mt-0.5 h-1.5 w-9 rounded-sm sm:w-10"
            style={{
              background: `linear-gradient(180deg, ${agentColor}22, transparent)`,
              border: `1px solid ${agentColor}22`,
            }}
          />
        </motion.div>

        {/* 名称标签 */}
        <div className="mt-1 text-center">
          <div
            className="inline-block rounded px-1.5 py-0.5 text-[9px] font-semibold whitespace-nowrap"
            style={{
              background: `${agentColor}18`,
              border: `1px solid ${agentColor}`,
              color: agentColor,
            }}
          >
            {agent.name}
          </div>
          <div className="mt-0.5 text-[8px] opacity-60" style={{ color: agentColor }}>
            {isMoving ? "移动中..." : (agent.role || "Agent")}
          </div>
        </div>

        {/* 位置 ID（调试信息，低调显示） */}
        <div
          className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[8px] opacity-30"
          style={{ color: agentColor }}
        >
          {isMoving && targetPointId !== null
            ? `${currentPoint.id}→${targetPointId}`
            : `P${currentPoint.id}`}
        </div>
      </div>
    </motion.div>
  )
}
