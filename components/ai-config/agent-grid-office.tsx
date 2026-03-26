"use client"

import { useState } from "react"
import Image from "next/image"
import { getGridVisualization, GRID_POINTS } from "@/lib/openclaw/grid-paths"
import { AgentGridLabel, type AgentGridItem } from "./agent-grid-label"
import { AgentChatPanel } from "./agent-chat-panel"

interface AgentGridOfficeProps {
  agents: AgentGridItem[]
  onSelectAgent?: (agent: AgentGridItem) => void
  showGrid?: boolean
  selectedAgent: AgentGridItem | null
}

export function AgentGridOffice({ agents, onSelectAgent, showGrid = true, selectedAgent }: AgentGridOfficeProps) {
  const grid = getGridVisualization()

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden rounded-xl border border-border bg-card">
      <div className="shrink-0 px-3 py-2">
        <AgentChatPanel selectedAgent={selectedAgent} />
      </div>

      <div className="relative flex-1 items-center justify-center overflow-hidden">
        <div className="relative w-full" style={{ aspectRatio: "16/9", height: "100%" }}>
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

          {agents.length === 0 && (
            <div className="absolute inset-0 z-20 flex items-center justify-center">
              <p className="text-sm text-muted-foreground">等待智能体节点接入...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
