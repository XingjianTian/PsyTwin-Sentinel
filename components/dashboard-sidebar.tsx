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

interface SubMenuItem {
  icon: React.ElementType
  label: string
  href: string
}

interface MenuGroup {
  icon: React.ElementType
  label: string
  href: string
  subItems: SubMenuItem[]
}

const menuGroups: MenuGroup[] = [
  {
    icon: Globe,
    label: "态势分析",
    href: "#",
    subItems: [
      { icon: Globe, label: "全域态势", href: "/dashboard" },
      { icon: ScanSearch, label: "风险溯源", href: "/risk-trace" },
      { icon: Gamepad2, label: "VR感知干预", href: "/vr-dashboard" },
    ],
  },
  {
    icon: Activity,
    label: "资源管理",
    href: "#",
    subItems: [
      { icon: Activity, label: "多模态数据流", href: "/multimodal" },
      { icon: DoorOpen, label: "疗愈空间管理", href: "/consultation-room" },
      { icon: Monitor, label: "硬件设备管理", href: "/device-management" },
    ],
  },
  {
    icon: Users,
    label: "学生管理",
    href: "#",
    subItems: [
      { icon: Users, label: "学生档案", href: "/students" },
      { icon: FileText, label: "干预记录", href: "/interventions" },
    ],
  },
  {
    icon: BrainCircuit,
    label: "AI配置",
    href: "#",
    subItems: [
      { icon: Database, label: "RAG 向量知识库", href: "/ai-config?tab=rag" },
      { icon: BrainCircuit, label: "模型与策略中心", href: "/ai-config?tab=strategy" },
      { icon: Workflow, label: "OpenClaw 编排", href: "/ai-config?tab=openclaw" },
    ],
  },
  {
    icon: Settings,
    label: "系统设置",
    href: "#",
    subItems: [
      { icon: Cpu, label: "基础设置", href: "/system-settings?tab=basic" },
      { icon: Users, label: "用户管理", href: "/system-settings?tab=users" },
      { icon: Cloud, label: "数据同步", href: "/system-settings?tab=sync" },
      { icon: Shield, label: "安全策略", href: "/system-settings?tab=security" },
      { icon: Bell, label: "通知管理", href: "/system-settings?tab=notifications" },
    ],
  },
]

function SubMenuItemLink({ 
  item, 
  isActive 
}: { 
  item: SubMenuItem
  isActive: boolean
}) {
  return (
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
  )
}

function SubMenuItemLinkInner({ item }: { item: SubMenuItem }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const itemPath = item.href.split('?')[0]
  const itemSearch = item.href.includes('?') ? item.href.split('?')[1] : ''
  const currentSearch = searchParams.toString()
  const isActive = pathname === itemPath && currentSearch === itemSearch
  
  return <SubMenuItemLink item={item} isActive={isActive} />
}

function SubMenuItemLinkWithSuspense({ item }: { item: SubMenuItem }) {
  return (
    <Suspense fallback={
      <div className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-sidebar-foreground/70">
        <item.icon className="h-4 w-4 shrink-0" />
        <span>{item.label}</span>
      </div>
    }>
      <SubMenuItemLinkInner item={item} />
    </Suspense>
  )
}

function MenuGroupItem({
  group,
  isExpanded,
  onToggle,
}: {
  group: MenuGroup
  isExpanded: boolean
  onToggle: () => void
}) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const Icon = group.icon
  
  const isActiveParent = group.subItems.some(item => {
    const itemPath = item.href.split('?')[0]
    const itemSearch = item.href.includes('?') ? item.href.split('?')[1] : ''
    const currentSearch = searchParams.toString()
    return pathname === itemPath && currentSearch === itemSearch
  })
  
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
        <span>{group.label}</span>
        {isExpanded ? (
          <ChevronDown className="ml-auto h-3.5 w-3.5" />
        ) : (
          <ChevronRight className="ml-auto h-3.5 w-3.5" />
        )}
      </button>
      
      {isExpanded && (
        <ul className="mt-1 ml-4 flex flex-col gap-1 border-l border-border pl-2">
          {group.subItems.map((item) => (
            <li key={item.href}>
              <SubMenuItemLinkWithSuspense item={item} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function MenuGroupItemWithSuspense(props: {
  group: MenuGroup
  isExpanded: boolean
  onToggle: () => void
}) {
  return (
    <Suspense fallback={
      <button className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-sidebar-foreground/70">
        <props.group.icon className="h-4 w-4 shrink-0" />
        <span>{props.group.label}</span>
        <ChevronRight className="ml-auto h-3.5 w-3.5" />
      </button>
    }>
      <MenuGroupItem {...props} />
    </Suspense>
  )
}

export function DashboardSidebar() {
  const [expandedGroups, setExpandedGroups] = useState<boolean[]>([true, true, true, true, false])
  
  const toggleGroup = (index: number) => {
    setExpandedGroups(prev => prev.map((expanded, i) => i === index ? !expanded : expanded))
  }

  return (
    <aside className="flex h-full w-64 flex-col border-r border-border bg-sidebar">
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="flex flex-col gap-2">
          {menuGroups.map((group, index) => (
            <li key={group.label}>
              <MenuGroupItemWithSuspense
                group={group}
                isExpanded={expandedGroups[index]}
                onToggle={() => toggleGroup(index)}
              />
            </li>
          ))}
        </ul>
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
