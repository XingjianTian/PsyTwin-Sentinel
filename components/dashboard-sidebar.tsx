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
  PanelLeftClose,
  PanelLeft,
  MessageCircle,
  ClipboardList,
  BookOpen,
  Camera,
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
    label: "全域态势感知",
    href: "#",
    subItems: [
      { icon: Globe, label: "校园心理健康态势", href: "/dashboard" },
      { icon: Gamepad2, label: "心图·VR体验数据", href: "/vr-dashboard" },
      { icon: MessageCircle, label: "微信小程序看板", href: "/pocket-records" },
      { icon: Activity, label: "实时多模态数据流", href: "/multimodal" },
    ],
  },
  {
    icon: ClipboardList,
    label: "心理工作业务台",
    href: "#",
    subItems: [
      { icon: ScanSearch, label: "预警工单管理", href: "/risk-trace" },
      { icon: DoorOpen, label: "线上预约管理", href: "/consultation-room" },
      { icon: Monitor, label: "线下设备管理", href: "/device-management" },
      { icon: Workflow, label: "心图·AI助手", href: "/ai-config?tab=openclaw" },
      { icon: Camera, label: "心图AI视窗", href: "/ai-config?tab=vision" },
    ],
  },
  {
    icon: BookOpen,
    label: "数字孪生档案",
    href: "#",
    subItems: [
      { icon: Users, label: "学生心理档案", href: "/students" },
      { icon: FileText, label: "评估干预档案", href: "/interventions" },
    ],
  },
  {
    icon: BrainCircuit,
    label: "心图·AI配置",
    href: "#",
    subItems: [
      { icon: Database, label: "心理学知识库", href: "/ai-config?tab=rag" },
      { icon: BrainCircuit, label: "模型与策略中心", href: "/ai-config?tab=strategy" },
    ],
  },
  {
    icon: Settings,
    label: "系统管理",
    href: "#",
    subItems: [
      { icon: Shield, label: "安全策略", href: "/system-settings?tab=security" },
      { icon: Cpu, label: "基础设置", href: "/system-settings?tab=basic" },
      { icon: Users, label: "用户管理", href: "/system-settings?tab=users" },
      { icon: Cloud, label: "数据同步", href: "/system-settings?tab=sync" },
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
      <span className="whitespace-normal break-normal">{item.label}</span>
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
  collapsed,
  onExpand,
}: {
  group: MenuGroup
  isExpanded: boolean
  onToggle: () => void
  collapsed: boolean
  onExpand: () => void
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
  
  const handleClick = () => {
    if (collapsed) {
      onExpand()
    } else {
      onToggle()
    }
  }
  
  return (
    <div className="flex flex-col">
      <button
        onClick={handleClick}
        className={cn(
          "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
          isActiveParent
            ? "bg-primary/10 font-medium text-primary"
            : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground",
          collapsed && "justify-center px-0"
        )}
        title={collapsed ? group.label : undefined}
      >
        <Icon
          className={cn(
            "h-4 w-4 shrink-0",
            isActiveParent ? "text-primary" : "text-muted-foreground"
          )}
        />
        {!collapsed && <span className="font-bold">{group.label}</span>}
        {!collapsed && (isExpanded ? (
          <ChevronDown className="ml-auto h-3.5 w-3.5" />
        ) : (
          <ChevronRight className="ml-auto h-3.5 w-3.5" />
        ))}
      </button>
      
      {isExpanded && !collapsed && (
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
  collapsed: boolean
  onExpand: () => void
}) {
  return (
    <Suspense fallback={
      <button className={cn(
        "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-sidebar-foreground/70",
        props.collapsed && "justify-center px-0"
      )}>
        <props.group.icon className="h-4 w-4 shrink-0" />
        {!props.collapsed && <span className="font-bold">{props.group.label}</span>}
      </button>
    }>
      <MenuGroupItem {...props} />
    </Suspense>
  )
}

export function DashboardSidebar() {
  const [expandedGroups, setExpandedGroups] = useState<boolean[]>([true, true, true, true, false])
  const [collapsed, setCollapsed] = useState(false)
  
  const toggleGroup = (index: number) => {
    setExpandedGroups(prev => prev.map((expanded, i) => i === index ? !expanded : expanded))
  }

  return (
    <aside className={cn(
      "flex h-full flex-col border-r border-border bg-sidebar transition-all duration-300 ease-in-out",
      collapsed ? "w-16" : "w-64"
    )}>
      {/* Logo & Collapse Toggle */}
      <div className="flex items-center border-b border-border px-3 py-3">
        {!collapsed && (
          <span className="text-sm font-bold text-foreground">导航栏</span>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "ml-auto rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground",
            collapsed && "mx-auto"
          )}
          aria-label={collapsed ? "展开侧边栏" : "收起侧边栏"}
        >
          {collapsed ? (
            <PanelLeft className="h-4 w-4" />
          ) : (
            <PanelLeftClose className="h-4 w-4" />
          )}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="flex flex-col gap-2">
          {menuGroups.map((group, index) => (
            <li key={group.label}>
              <MenuGroupItemWithSuspense
                group={group}
                isExpanded={expandedGroups[index]}
                onToggle={() => toggleGroup(index)}
                collapsed={collapsed}
                onExpand={() => setCollapsed(false)}
              />
            </li>
          ))}
        </ul>
      </nav>

      <div className={cn(
        "border-t border-border p-3 transition-all duration-300",
        collapsed ? "px-1" : "px-3"
      )}>
        <div className={cn(
          "flex items-center gap-2 rounded-md bg-secondary/50 px-3 py-2",
          collapsed && "justify-center px-0"
        )}>
          <span className="h-2 w-2 rounded-full bg-success" />
          {!collapsed && (
            <span className="text-xs text-muted-foreground">系统运行正常</span>
          )}
        </div>
      </div>
    </aside>
  )
}
