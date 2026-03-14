"use client"

import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { useState, Suspense } from "react"
import {
  Globe,
  ScanSearch,
  Users,
  BrainCircuit,
  Database,
  Workflow,
  Gamepad2,
  FileText,
  Settings,
  ChevronDown,
  ChevronRight,
  DoorOpen,
  Monitor,
  Activity,
  Cpu,
  Cloud,
  Shield,
  Bell,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface MenuItem {
  icon: React.ElementType
  label: string
  href: string
}

interface SubMenuItem {
  icon: React.ElementType
  label: string
  href: string
}

interface MenuGroup {
  label: string
  items: (MenuItem | { label: string; icon: React.ElementType; href: string; subItems: SubMenuItem[] })[]
}

const menuGroups: MenuGroup[] = [
  {
    label: "态势分析",
    items: [
      { icon: Globe, label: "全域态势", href: "/dashboard" },
      { icon: ScanSearch, label: "风险溯源", href: "/risk-trace" },
      { icon: Gamepad2, label: "VR感知干预", href: "/vr-dashboard" },
    ],
  },
  {
    label: "资源管理",
    items: [
      { icon: Activity, label: "多模态数据流", href: "/multimodal" },
      { icon: DoorOpen, label: "疗愈空间管理", href: "/consultation-room" },
      { icon: Monitor, label: "硬件设备管理", href: "/device-management" },
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
      {
        icon: BrainCircuit,
        label: "AI配置",
        href: "/ai-config",
        subItems: [
          { icon: Workflow, label: "OpenClaw 编排", href: "/ai-config?tab=openclaw" },
          { icon: Database, label: "RAG 向量知识库", href: "/ai-config?tab=rag" },
          { icon: BrainCircuit, label: "模型与策略中心", href: "/ai-config?tab=strategy" },
        ],
      },
      { 
        icon: Settings, 
        label: "系统设置", 
        href: "/system-settings",
        subItems: [
          { icon: Cpu, label: "基础设置", href: "/system-settings?tab=basic" },
          { icon: Users, label: "用户管理", href: "/system-settings?tab=users" },
          { icon: Cloud, label: "数据同步", href: "/system-settings?tab=sync" },
          { icon: Shield, label: "安全策略", href: "/system-settings?tab=security" },
          { icon: Bell, label: "通知管理", href: "/system-settings?tab=notifications" },
        ]
      },
    ],
  },
]

function NestedSubMenuInner({ 
  icon: Icon,
  label,
  subItems, 
  isExpanded, 
  onToggle,
  pathname
}: { 
  icon: React.ElementType
  label: string
  subItems: SubMenuItem[]
  isExpanded: boolean
  onToggle: () => void
  pathname: string
}) {
  const searchParams = useSearchParams()
  const isActiveParent = pathname === "/system-settings"
    || pathname === "/ai-config"
  
  return (
    <div className="flex flex-col">
      <button
        onClick={onToggle}
        className={cn(
          "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
          isActiveParent
            ? "bg-primary/10 font-medium text-primary"
            : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
        )}
      >
        <Icon
          className={cn(
            "h-4 w-4 shrink-0",
            isActiveParent ? "text-primary" : "text-muted-foreground"
          )}
        />
        <span>{label}</span>
        {isExpanded ? (
          <ChevronDown className="ml-auto h-3.5 w-3.5" />
        ) : (
          <ChevronRight className="ml-auto h-3.5 w-3.5" />
        )}
      </button>
      
      {isExpanded && (
        <ul className="mt-1 ml-4 flex flex-col gap-1 border-l border-border pl-2">
          {subItems.map((item) => {
            const itemPath = item.href.split('?')[0]
            const itemSearch = item.href.includes('?') ? item.href.split('?')[1] : ''
            const currentSearch = searchParams.toString()
            const isActive = pathname === itemPath && currentSearch === itemSearch
            
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
      )}
    </div>
  )
}

function NestedSubMenu(props: { 
  icon: React.ElementType
  label: string
  subItems: SubMenuItem[]
  isExpanded: boolean
  onToggle: () => void
  pathname: string
}) {
  return (
    <Suspense fallback={
      <button className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-sidebar-foreground/70">
        <props.icon className="h-4 w-4 shrink-0" />
        <span>{props.label}</span>
        <ChevronRight className="ml-auto h-3.5 w-3.5" />
      </button>
    }>
      <NestedSubMenuInner {...props} />
    </Suspense>
  )
}

export function DashboardSidebar() {
  const pathname = usePathname()
  const [expandedSettings, setExpandedSettings] = useState(true)
  const [expandedAiConfig, setExpandedAiConfig] = useState(true)

  return (
    <aside className="flex h-full w-64 flex-col border-r border-border bg-sidebar">
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
                // 检查是否是系统设置（带次级菜单）
                if ('subItems' in item) {
                  const isAiConfig = item.href === "/ai-config"
                  return (
                    <li key={item.href}>
                      <NestedSubMenu
                        icon={item.icon}
                        label={item.label}
                        subItems={item.subItems}
                        isExpanded={isAiConfig ? expandedAiConfig : expandedSettings}
                        onToggle={() =>
                          isAiConfig
                            ? setExpandedAiConfig(!expandedAiConfig)
                            : setExpandedSettings(!expandedSettings)
                        }
                        pathname={pathname}
                      />
                    </li>
                  )
                }
                
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
