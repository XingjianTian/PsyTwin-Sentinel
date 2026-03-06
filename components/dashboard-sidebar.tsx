"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
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

interface MenuItem {
  icon: React.ElementType
  label: string
  href: string
}

interface MenuGroup {
  label: string
  items: MenuItem[]
}

const menuGroups: MenuGroup[] = [
  {
    label: "态势分析",
    items: [
      { icon: Globe, label: "全域态势", href: "/dashboard" },
      { icon: ScanSearch, label: "风险溯源", href: "/risk-trace" },
      { icon: Gamepad2, label: "VR端数据", href: "/vr-dashboard" },
    ],
  },
  {
    label: "资源管理",
    items: [
      { icon: DoorOpen, label: "心理咨询室", href: "/consultation-room" },
      { icon: Monitor, label: "设备管理", href: "/device-management" },
      { icon: Activity, label: "多模态数据流", href: "/multimodal" },
    ],
  },
  {
    label: "学生管理",
    items: [
      { icon: Users, label: "学生档案", href: "/students" },
      { icon: FileText, label: "干预记录", href: "/interventions" },
    ],
  },
  {
    label: "系统配置",
    items: [
      { icon: BrainCircuit, label: "AI配置", href: "/ai-config" },
      { icon: Settings, label: "系统设置", href: "/system-settings" },
    ],
  },
]

export function DashboardSidebar() {
  const pathname = usePathname()

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
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
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
                    </Link>
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
