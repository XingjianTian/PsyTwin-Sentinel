"use client"

import { useState } from "react"
import Image from "next/image"
import { getGridVisualization, GRID_POINTS } from "@/lib/openclaw/grid-paths"
import { AgentGridLabel, type AgentGridItem } from "./agent-grid-label"

interface AgentGridOfficeProps {
  agents: AgentGridItem[]
  onSelectAgent?: (agent: AgentGridItem) => void
}

export function AgentGridOffice({ agents, onSelectAgent }: AgentGridOfficeProps) {
  const [showGrid, setShowGrid] = useState(true)
  const grid = getGridVisualization()

  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-xl border border-border bg-muted/30">
      <div className="relative w-full" style={{ aspectRatio: "16/9", maxHeight: "100%" }}>
        <Image
          src="/map.jpg"
          alt="Office Map"
          fill
          className="object-contain"
          style={{ zIndex: 0 }}
          priority
        />

        <div className="absolute inset-0" style={{ zIndex: 1 }}>
          {showGrid && (
            <svg
              className="absolute inset-0 h-full w-full pointer-events-none"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              {grid.horizontal.map((line, i) => (
                <line
                  key={`h-${i}`}
                  x1={line.x1}
                  y1={line.y1}
                  x2={line.x2}
                  y2={line.y2}
                  stroke="hsl(var(--border))"
                  strokeWidth="0.3"
                  strokeDasharray="2,1.5"
                  strokeOpacity="0.5"
                />
              ))}
              {grid.vertical.map((line, i) => (
                <line
                  key={`v-${i}`}
                  x1={line.x1}
                  y1={line.y1}
                  x2={line.x2}
                  y2={line.y2}
                  stroke="hsl(var(--border))"
                  strokeWidth="0.3"
                  strokeDasharray="2,1.5"
                  strokeOpacity="0.5"
                />
              ))}
              {GRID_POINTS.map((point) => (
                <circle
                  key={point.id}
                  cx={point.x}
                  cy={point.y}
                  r="1"
                  fill="hsl(var(--muted-foreground))"
                  fillOpacity="0.3"
                  stroke="hsl(var(--border))"
                  strokeWidth="0.3"
                />
              ))}
            </svg>
          )}

          <div className="absolute inset-0">
            {agents.map((agent) => (
              <AgentGridLabel
                key={agent.id}
                agent={agent}
                onClick={() => onSelectAgent?.(agent)}
                isSelected={false}
              />
            ))}
          </div>
        </div>

        <div className="absolute right-2 top-2 z-20">
          <button
            onClick={() => setShowGrid((v) => !v)}
            className="rounded border border-border bg-background/80 px-2 py-1 text-[10px] text-muted-foreground backdrop-blur-sm hover:bg-muted transition-colors"
          >
            {showGrid ? "🔲 隐藏网格" : "⊞ 显示网格"}
          </button>
        </div>

        {agents.length === 0 && (
          <div className="absolute inset-0 z-20 flex items-center justify-center">
            <p className="text-sm text-muted-foreground">等待智能体节点接入...</p>
          </div>
        )}
      </div>
    </div>
  )
}
