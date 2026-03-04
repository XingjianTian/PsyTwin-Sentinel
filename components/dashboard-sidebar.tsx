"use client"

import {
  Globe,
  ScanSearch,
  Users,
  BrainCircuit,
  Gamepad2,
  FileText,
  Settings,
  ChevronDown,
  DoorOpen,
  Monitor,
  Activity,
} from "lucide-react"
import { cn } from "@/lib/utils"

export type PageKey = "全域态势" | "风险溯源" | "VR端数据" | "学生档案" | "干预记录" | "AI配置" | "系统设置" | "心理咨询室" | "设备管理" | "多模态数据流"

const menuGroups = [
  {
    label: "态势分析",
    items: [
      { icon: Globe, label: "全域态势" as PageKey },
      { icon: ScanSearch, label: "风险溯源" as PageKey },
      { icon: Gamepad2, label: "VR端数据" as PageKey },
    ],
  },
  {
    label: "资源管理",
    items: [
      { icon: DoorOpen, label: "心理咨询室" as PageKey },
      { icon: Monitor, label: "设备管理" as PageKey },
      { icon: Activity, label: "多模态数据流" as PageKey },
    ],
  },
  {
    label: "学生管理",
    items: [
      { icon: Users, label: "学生档案" as PageKey },
      { icon: FileText, label: "干预记录" as PageKey },
    ],
  },
  {
    label: "系统配置",
    items: [
      { icon: BrainCircuit, label: "AI配置" as PageKey },
      { icon: Settings, label: "系统设置" as PageKey },
    ],
  },
]

interface DashboardSidebarProps {
  activePage: PageKey
  onPageChange: (page: PageKey) => void
}

export function DashboardSidebar({ activePage, onPageChange }: DashboardSidebarProps) {
  return (
    <aside className="flex h-full w-56 flex-col border-r border-border bg-sidebar">
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {menuGroups.map((group) => (
          <div key={group.label} className="mb-5">
            <div className="mb-2 flex items-center gap-1 px-2">
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {group.label}
              </span>
              <ChevronDown className="h-3 w-3 text-muted-foreground" />
            </div>
            <ul className="flex flex-col gap-1">
              {group.items.map((item) => {
                const isActive = item.label === activePage
                return (
                  <li key={item.label}>
                    <button
                      onClick={() => onPageChange(item.label)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                        isActive
                          ? "bg-primary/10 font-medium text-primary"
                          : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                      )}
                    >
                      <item.icon
                        className={cn(
                          "h-4 w-4 shrink-0",
                          isActive ? "text-primary" : "text-muted-foreground"
                        )}
                      />
                      <span>{item.label}</span>
                      {isActive && (
                        <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />
                      )}
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-border p-3">
        <div className="flex items-center gap-2 rounded-md bg-secondary/50 px-3 py-2">
          <span className="h-2 w-2 rounded-full bg-success" />
          <span className="text-xs text-muted-foreground">系统运行正常</span>
        </div>
      </div>
    </aside>
  )
}
