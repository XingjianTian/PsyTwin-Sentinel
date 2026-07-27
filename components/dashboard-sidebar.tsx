"use client"

import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback, useEffect, useRef, useState, Suspense } from "react"
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
  PawPrint,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  acknowledgeRiskWorkOrderNotifications,
  EMPTY_RISK_WORK_ORDER_NOTIFICATION_STATE,
  reconcileRiskWorkOrderNotifications,
  type RiskWorkOrderNotificationState,
} from "@/lib/risk-work-order-notifications"

const RISK_WORK_ORDER_NOTIFICATION_STORAGE_KEY = "psytwin:risk-work-order-notifications"

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
      { icon: Gamepad2, label: "心图VR实时看板", href: "/vr-dashboard" },
      { icon: MessageCircle, label: "微信小程序看板", href: "/pocket-records" },
      { icon: Activity, label: "无人咨询直播室", href: "/multimodal" },
    ],
  },
  {
    icon: ClipboardList,
    label: "心理工作业务台",
    href: "#",
    subItems: [
      { icon: Workflow, label: "心图·AI助手", href: "/ai-config?tab=openclaw" },
      { icon: ScanSearch, label: "预警工单管理", href: "/risk-trace" },
      { icon: Monitor, label: "设备与预约管理", href: "/device-appointments" },
    ],
  },
  {
    icon: BookOpen,
    label: "数字孪生档案",
    href: "#",
    subItems: [
      { icon: Users, label: "学生心理档案", href: "/students" },
      { icon: FileText, label: "评估干预记录", href: "/interventions" },
    ],
  },
  {
    icon: BrainCircuit,
    label: "心图·AI配置",
    href: "#",
    subItems: [
      { icon: PawPrint, label: "心宠AI管理中心", href: "/pet-ai-management" },
      { icon: Database, label: "心理学知识库", href: "/ai-config?tab=rag" },
      { icon: BrainCircuit, label: "后台智能体配置中心", href: "/ai-config?tab=strategy" },
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
  isActive,
  pendingCount = 0,
  pendingCountJumpKey = 0,
}: { 
  item: SubMenuItem
  isActive: boolean
  pendingCount?: number
  pendingCountJumpKey?: number
}) {
  const router = useRouter()

  return (
    <Link
      href={item.href}
      prefetch
      onMouseEnter={() => router.prefetch(item.href)}
      onFocus={() => router.prefetch(item.href)}
      onClick={item.href === "/risk-trace"
        ? () => window.dispatchEvent(new Event("risk-work-orders:viewed"))
        : undefined}
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
      {pendingCount > 0 && (
        <span
          key={pendingCountJumpKey}
          aria-label={`${pendingCount} 条未查看预警`}
          className={cn(
            "ml-auto inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full border border-red-300/70 bg-red-600 px-1 text-[10px] font-bold leading-none tabular-nums text-white shadow-[0_0_9px_rgba(220,38,38,0.58),inset_0_1px_0_rgba(255,255,255,0.28)]",
            pendingCountJumpKey > 0 && "risk-badge-hop"
          )}
        >
          {pendingCount > 99 ? "99+" : pendingCount}
        </span>
      )}
      {isActive && (
        <span className={cn("h-1.5 w-1.5 rounded-full bg-primary", pendingCount > 0 ? "ml-1" : "ml-auto")} />
      )}
    </Link>
  )
}

function SubMenuItemLinkInner({ item, pendingCount, pendingCountJumpKey }: { item: SubMenuItem; pendingCount?: number; pendingCountJumpKey?: number }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const itemPath = item.href.split('?')[0]
  const itemSearch = item.href.includes('?') ? item.href.split('?')[1] : ''
  const currentSearch = searchParams.toString()
  const isActive = pathname === itemPath && (itemSearch ? currentSearch === itemSearch : true)
  
  return <SubMenuItemLink item={item} isActive={isActive} pendingCount={pendingCount} pendingCountJumpKey={pendingCountJumpKey} />
}

function SubMenuItemLinkWithSuspense({ item, pendingCount, pendingCountJumpKey }: { item: SubMenuItem; pendingCount?: number; pendingCountJumpKey?: number }) {
  return (
    <Suspense fallback={
      <div className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-sidebar-foreground/70">
        <item.icon className="h-4 w-4 shrink-0" />
      <span className="whitespace-normal break-normal">{item.label}</span>
      </div>
    }>
      <SubMenuItemLinkInner item={item} pendingCount={pendingCount} pendingCountJumpKey={pendingCountJumpKey} />
    </Suspense>
  )
}

function MenuGroupItem({
  group,
  isExpanded,
  onToggle,
  collapsed,
  onExpand,
  pendingRiskWorkOrderCount,
  pendingRiskWorkOrderJumpKey,
}: {
  group: MenuGroup
  isExpanded: boolean
  onToggle: () => void
  collapsed: boolean
  onExpand: () => void
  pendingRiskWorkOrderCount: number
  pendingRiskWorkOrderJumpKey: number
}) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const Icon = group.icon
  
  const isActiveParent = group.subItems.some(item => {
    const itemPath = item.href.split('?')[0]
    const itemSearch = item.href.includes('?') ? item.href.split('?')[1] : ''
    const currentSearch = searchParams.toString()
    return pathname === itemPath && (itemSearch ? currentSearch === itemSearch : true)
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
              <SubMenuItemLinkWithSuspense
                item={item}
                pendingCount={item.href === "/risk-trace" ? pendingRiskWorkOrderCount : undefined}
                pendingCountJumpKey={item.href === "/risk-trace" ? pendingRiskWorkOrderJumpKey : undefined}
              />
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
  pendingRiskWorkOrderCount: number
  pendingRiskWorkOrderJumpKey: number
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
  const pathname = usePathname()
  const router = useRouter()
  const [expandedGroups, setExpandedGroups] = useState<boolean[]>([true, true, true, true, false])
  const [collapsed, setCollapsed] = useState(false)
  const [pendingRiskWorkOrderCount, setPendingRiskWorkOrderCount] = useState(0)
  const [pendingRiskWorkOrderJumpKey, setPendingRiskWorkOrderJumpKey] = useState(0)
  const riskNotificationStateRef = useRef<RiskWorkOrderNotificationState>(
    EMPTY_RISK_WORK_ORDER_NOTIFICATION_STATE,
  )
  const riskNotificationInitializedRef = useRef(false)

  const persistRiskNotificationState = useCallback((state: RiskWorkOrderNotificationState) => {
    try {
      window.localStorage.setItem(RISK_WORK_ORDER_NOTIFICATION_STORAGE_KEY, JSON.stringify(state))
    } catch {
      // The in-memory notification state still works when browser storage is unavailable.
    }
  }, [])

  const acknowledgeRiskNotifications = useCallback(() => {
    const nextState = acknowledgeRiskWorkOrderNotifications(riskNotificationStateRef.current)
    riskNotificationStateRef.current = nextState
    setPendingRiskWorkOrderCount(0)
    persistRiskNotificationState(nextState)
  }, [persistRiskNotificationState])

  const refreshPendingRiskWorkOrderCount = useCallback(async () => {
    try {
      const response = await fetch("/api/risk-work-orders/pending-count", { cache: "no-store" })
      const payload = await response.json()
      if (!response.ok) return
      const nextCount = Math.max(0, Number(payload.data?.count) || 0)

      if (!riskNotificationInitializedRef.current) {
        try {
          const storedValue = window.localStorage.getItem(RISK_WORK_ORDER_NOTIFICATION_STORAGE_KEY)
          if (storedValue) {
            const storedState = JSON.parse(storedValue) as Partial<RiskWorkOrderNotificationState>
            riskNotificationStateRef.current = {
              pendingTotal: Math.max(0, Number(storedState.pendingTotal) || 0),
              unseenCount: Math.max(0, Number(storedState.unseenCount) || 0),
            }
          } else {
            riskNotificationStateRef.current = { pendingTotal: nextCount, unseenCount: 0 }
          }
        } catch {
          riskNotificationStateRef.current = { pendingTotal: nextCount, unseenCount: 0 }
        }
        riskNotificationInitializedRef.current = true
      }

      const previousState = riskNotificationStateRef.current
      const nextState = reconcileRiskWorkOrderNotifications(
        previousState,
        nextCount,
        pathname === "/risk-trace",
      )
      if (nextState.unseenCount > previousState.unseenCount) {
        setPendingRiskWorkOrderJumpKey((current) => current + 1)
      }
      riskNotificationStateRef.current = nextState
      setPendingRiskWorkOrderCount(nextState.unseenCount)
      persistRiskNotificationState(nextState)
    } catch {
      // Keep the last known count while the network or database is temporarily unavailable.
    }
  }, [pathname, persistRiskNotificationState])

  useEffect(() => {
    const priorityRoutes = menuGroups
      .flatMap((group) => group.subItems)
      .map((item) => item.href)
    const prefetchTimer = window.setTimeout(() => {
      priorityRoutes.forEach((href) => router.prefetch(href))
    }, 300)

    return () => window.clearTimeout(prefetchTimer)
  }, [router])

  useEffect(() => {
    const initialTimer = window.setTimeout(refreshPendingRiskWorkOrderCount, 0)
    const timer = window.setInterval(refreshPendingRiskWorkOrderCount, 15_000)
    const handleChange = () => void refreshPendingRiskWorkOrderCount()
    const handleViewed = () => acknowledgeRiskNotifications()
    window.addEventListener("risk-work-orders:changed", handleChange)
    window.addEventListener("risk-work-orders:viewed", handleViewed)
    window.addEventListener("focus", handleChange)
    return () => {
      window.clearTimeout(initialTimer)
      window.clearInterval(timer)
      window.removeEventListener("risk-work-orders:changed", handleChange)
      window.removeEventListener("risk-work-orders:viewed", handleViewed)
      window.removeEventListener("focus", handleChange)
    }
  }, [acknowledgeRiskNotifications, refreshPendingRiskWorkOrderCount])

  useEffect(() => {
    if (pathname === "/risk-trace" && riskNotificationInitializedRef.current) {
      acknowledgeRiskNotifications()
    }
  }, [acknowledgeRiskNotifications, pathname])
  
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
                pendingRiskWorkOrderCount={pendingRiskWorkOrderCount}
                pendingRiskWorkOrderJumpKey={pendingRiskWorkOrderJumpKey}
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
