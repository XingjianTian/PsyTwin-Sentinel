"use client"

import {
  Globe,
  ScanSearch,
  Users,
  BrainCircuit,
  BarChart3,
  FileText,
  Settings,
  ChevronDown,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"

const menuGroups = [
  {
    label: "态势分析",
    items: [
      { icon: Globe, label: "全域态势", active: true },
      { icon: ScanSearch, label: "风险溯源", active: false },
      { icon: BarChart3, label: "数据看板", active: false },
    ],
  },
  {
    label: "学生管理",
    items: [
      { icon: Users, label: "学生档案", active: false },
      { icon: FileText, label: "干预记录", active: false },
    ],
  },
  {
    label: "系统配置",
    items: [
      { icon: BrainCircuit, label: "AI配置", active: false },
      { icon: Settings, label: "系统设置", active: false },
    ],
  },
]

export function DashboardSidebar() {
  const [collapsed] = useState(false)

  return (
    <aside
      className={cn(
        "flex h-full flex-col border-r border-border bg-sidebar transition-all",
        collapsed ? "w-16" : "w-56"
      )}
    >
      {/* Menu Groups */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {menuGroups.map((group) => (
          <div key={group.label} className="mb-5">
            {!collapsed && (
              <div className="mb-2 flex items-center gap-1 px-2">
                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {group.label}
                </span>
                <ChevronDown className="h-3 w-3 text-muted-foreground" />
              </div>
            )}
            <ul className="flex flex-col gap-1">
              {group.items.map((item) => (
                <li key={item.label}>
                  <button
                    className={cn(
                      "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                      item.active
                        ? "bg-primary/10 font-medium text-primary"
                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                    )}
                  >
                    <item.icon
                      className={cn(
                        "h-4 w-4 shrink-0",
                        item.active ? "text-primary" : "text-muted-foreground"
                      )}
                    />
                    {!collapsed && <span>{item.label}</span>}
                    {item.active && !collapsed && (
                      <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* Bottom Status */}
      <div className="border-t border-border p-3">
        <div className="flex items-center gap-2 rounded-md bg-secondary/50 px-3 py-2">
          <span className="h-2 w-2 rounded-full bg-success" />
          <span className="text-xs text-muted-foreground">
            {collapsed ? "" : "系统运行正常"}
          </span>
        </div>
      </div>
    </aside>
  )
}
