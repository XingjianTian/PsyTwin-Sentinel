"use client"

import { useState } from "react"
import { getGridVisualization, GRID_POINTS } from "@/lib/openclaw/grid-paths"
import { AgentGridLabel, type AgentGridItem } from "./agent-grid-label"

interface AgentGridOfficeProps {
  agents: AgentGridItem[]
}

export function AgentGridOffice({ agents }: AgentGridOfficeProps) {
  const [showGrid, setShowGrid] = useState(true)
  const grid = getGridVisualization()

  return (
    <div
      className="relative w-full h-full overflow-hidden rounded-xl border border-border bg-muted/20"
      style={{ height: "100%", minHeight: "300px" }}
    >
      {/* 田字格网格线 SVG */}
      {showGrid && (
        <svg
          className="absolute inset-0 h-full w-full pointer-events-none"
          style={{ zIndex: 1 }}
        >
          {/* 网格横线 */}
          {grid.horizontal.map((line, i) => (
            <line
              key={`h-${i}`}
              x1={`${line.x1}%`}
              y1={`${line.y1}%`}
              x2={`${line.x2}%`}
              y2={`${line.y2}%`}
              stroke="hsl(var(--border))"
              strokeWidth="1.5"
              strokeDasharray="6,4"
              strokeOpacity="0.5"
            />
          ))}
          {/* 网格竖线 */}
          {grid.vertical.map((line, i) => (
            <line
              key={`v-${i}`}
              x1={`${line.x1}%`}
              y1={`${line.y1}%`}
              x2={`${line.x2}%`}
              y2={`${line.y2}%`}
              stroke="hsl(var(--border))"
              strokeWidth="1.5"
              strokeDasharray="6,4"
              strokeOpacity="0.5"
            />
          ))}
          {/* 9个交叉点 */}
          {GRID_POINTS.map((point) => (
            <circle
              key={point.id}
              cx={`${point.x}%`}
              cy={`${point.y}%`}
              r="3"
              fill="hsl(var(--muted-foreground))"
              fillOpacity="0.3"
              stroke="hsl(var(--border))"
              strokeWidth="1"
            />
          ))}
        </svg>
      )}

      {/* Agent 标签层 */}
      <div className="absolute inset-0" style={{ zIndex: 10 }}>
        {agents.map((agent) => (
          <AgentGridLabel key={agent.id} agent={agent} />
        ))}
      </div>

      {/* 右上角：显示/隐藏网格 */}
      <div className="absolute right-3 top-3 z-20">
        <button
          onClick={() => setShowGrid((v) => !v)}
          className="rounded border border-border bg-background/80 px-2 py-1 text-[10px] text-muted-foreground backdrop-blur-sm hover:bg-muted transition-colors"
        >
          {showGrid ? "🔲 隐藏网格" : "⊞ 显示网格"}
        </button>
      </div>

      {/* 底部状态栏 */}
      <div className="absolute bottom-3 left-3 right-3 z-20">
        <div className="rounded border border-border/50 bg-background/70 px-3 py-1.5 backdrop-blur-sm">
          <p className="text-center text-[9px] text-muted-foreground">
            🤖 {agents.length} 个智能体节点 · 田字格 3×3 网格 · 实时活动可视化
          </p>
        </div>
      </div>

      {/* 空状态 */}
      {agents.length === 0 && (
        <div className="absolute inset-0 z-20 flex items-center justify-center">
          <p className="text-sm text-muted-foreground">等待智能体节点接入...</p>
        </div>
      )}
    </div>
  )
}
