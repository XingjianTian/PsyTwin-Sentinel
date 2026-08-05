"use client"

import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback, useEffect, useRef, useState, Suspense } from "react"
import {
  Activity,
  Bell,
  BookOpen,
  BrainCircuit,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  Cloud,
  Cpu,
  Database,
  FileText,
  Gamepad2,
  Globe,
  MessageCircle,
  Monitor,
  PanelLeft,
  PanelLeftClose,
  PawPrint,
  ScanSearch,
  Settings,
  Shield,
  Sparkles,
  Users,
  Workflow,
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
  subItems: SubMenuItem[]
}

const groupTones = [
  {
    panel: "border-violet-200 bg-violet-50/70",
    submenu: "bg-violet-100/45",
    hover: "hover:bg-violet-100/75",
    icon: "text-violet-600",
    text: "text-violet-800",
    item: "bg-violet-100/90 text-violet-800",
    dot: "bg-violet-600 shadow-[0_0_0_3px_rgba(124,58,237,0.13)]",
  },
  {
    panel: "border-indigo-200 bg-indigo-50/70",
    submenu: "bg-indigo-100/45",
    hover: "hover:bg-indigo-100/75",
    icon: "text-indigo-600",
    text: "text-indigo-800",
    item: "bg-indigo-100/90 text-indigo-800",
    dot: "bg-indigo-600 shadow-[0_0_0_3px_rgba(79,70,229,0.13)]",
  },
  {
    panel: "border-sky-200 bg-sky-50/70",
    submenu: "bg-sky-100/45",
    hover: "hover:bg-sky-100/75",
    icon: "text-sky-600",
    text: "text-sky-800",
    item: "bg-sky-100/90 text-sky-800",
    dot: "bg-sky-600 shadow-[0_0_0_3px_rgba(2,132,199,0.13)]",
  },
  {
    panel: "border-cyan-200 bg-cyan-50/70",
    submenu: "bg-cyan-100/45",
    hover: "hover:bg-cyan-100/75",
    icon: "text-cyan-600",
    text: "text-cyan-800",
    item: "bg-cyan-100/90 text-cyan-800",
    dot: "bg-cyan-600 shadow-[0_0_0_3px_rgba(8,145,178,0.13)]",
  },
  {
    panel: "border-slate-200 bg-slate-50/75",
    submenu: "bg-slate-100/70",
    hover: "hover:bg-slate-200/75",
    icon: "text-slate-600",
    text: "text-slate-800",
    item: "bg-slate-200/85 text-slate-900",
    dot: "bg-slate-600 shadow-[0_0_0_3px_rgba(71,85,105,0.13)]",
  },
] as const

const menuGroups: MenuGroup[] = [
  {
    icon: Globe,
    label: "全域态势感知",
    subItems: [
      { icon: Globe, label: "校园心理健康态势", href: "/dashboard" },
      { icon: Gamepad2, label: "心图 VR 实时看板", href: "/vr-dashboard" },
      { icon: MessageCircle, label: "微信小程序看板", href: "/pocket-records" },
      { icon: Activity, label: "无人咨询直播室", href: "/multimodal" },
    ],
  },
  {
    icon: ClipboardList,
    label: "心理工作业务台",
    subItems: [
      { icon: Workflow, label: "心图 · AI 助手", href: "/ai-config?tab=openclaw" },
      { icon: ScanSearch, label: "预警工单管理", href: "/risk-trace" },
      { icon: Monitor, label: "设备与预约管理", href: "/device-appointments" },
    ],
  },
  {
    icon: BookOpen,
    label: "数字学生档案",
    subItems: [
      { icon: Users, label: "学生心理档案", href: "/students" },
      { icon: FileText, label: "评估干预记录", href: "/interventions" },
    ],
  },
  {
    icon: BrainCircuit,
    label: "心图 · AI 配置",
    subItems: [
      { icon: Database, label: "心理学知识库", href: "/ai-config?tab=rag" },
      { icon: PawPrint, label: "心宠 AI 管理中心", href: "/pet-ai-management" },
      { icon: BrainCircuit, label: "后台智能体配置中心", href: "/ai-config?tab=strategy" },
    ],
  },
  {
    icon: Settings,
    label: "系统管理",
    subItems: [
      { icon: Shield, label: "安全策略", href: "/system-settings?tab=security" },
      { icon: Cpu, label: "基础设置", href: "/system-settings?tab=basic" },
      { icon: Users, label: "用户管理", href: "/system-settings?tab=users" },
      { icon: Cloud, label: "数据同步", href: "/system-settings?tab=sync" },
      { icon: Bell, label: "通知管理", href: "/system-settings?tab=notifications" },
    ],
  },
]

function isCurrentRoute(pathname: string, currentSearch: string, href: string) {
  const [itemPath, itemSearch = ""] = href.split("?")
  return pathname === itemPath && (!itemSearch || currentSearch === itemSearch)
}

function SubMenuItemLink({ item, isActive, tone, pendingCount = 0, pendingCountJumpKey = 0 }: {
  item: SubMenuItem
  isActive: boolean
  tone: typeof groupTones[number]
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
      onClick={item.href === "/risk-trace" ? () => window.dispatchEvent(new Event("risk-work-orders:viewed")) : undefined}
      className={cn(
        "group flex min-h-10 w-full items-center gap-3 rounded-lg px-3 text-[14px] font-medium tracking-[0.01em] outline-none transition-[background-color,color,transform] duration-150 focus-visible:ring-2 focus-visible:ring-primary/40",
        isActive
          ? tone.item
          : cn("text-slate-600 hover:text-slate-950", tone.hover)
      )}
    >
      <item.icon className={cn("h-[18px] w-[18px] shrink-0 stroke-[1.9]", isActive ? tone.icon : "text-slate-500 group-hover:text-primary")} />
      <span className="min-w-0 flex-1 truncate">{item.label}</span>
      {pendingCount > 0 && (
        <span
          key={pendingCountJumpKey}
          aria-label={`${pendingCount} 条未查看预警`}
          className={cn("inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold tabular-nums text-white", pendingCountJumpKey > 0 && "risk-badge-hop")}
        >
          {pendingCount > 99 ? "99+" : pendingCount}
        </span>
      )}
      {isActive && <span className={cn("h-2 w-2 shrink-0 rounded-full", tone.dot)} />}
    </Link>
  )
}

function SubMenuItemLinkInner({ item, tone, pendingCount, pendingCountJumpKey }: { item: SubMenuItem; tone: typeof groupTones[number]; pendingCount?: number; pendingCountJumpKey?: number }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  return <SubMenuItemLink item={item} isActive={isCurrentRoute(pathname, searchParams.toString(), item.href)} tone={tone} pendingCount={pendingCount} pendingCountJumpKey={pendingCountJumpKey} />
}

function MenuGroupItem({ group, groupIndex, isExpanded, onToggle, collapsed, onExpand, pendingRiskWorkOrderCount, pendingRiskWorkOrderJumpKey }: {
  group: MenuGroup
  groupIndex: number
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
  const tone = groupTones[groupIndex]
  const isActiveParent = group.subItems.some((item) => isCurrentRoute(pathname, searchParams.toString(), item.href))

  return (
    <section className={cn(
      "overflow-hidden rounded-xl border transition-[background-color,border-color] duration-200",
      isActiveParent || isExpanded ? tone.panel : "border-slate-200/90 bg-white/65 hover:border-slate-300",
      collapsed && "border-transparent bg-transparent hover:border-transparent"
    )}>
      <button
        onClick={collapsed ? onExpand : onToggle}
        className={cn(
          "flex min-h-12 w-full items-center gap-3 px-3 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-primary/40",
          isActiveParent || isExpanded ? tone.text : "text-slate-800 hover:bg-slate-50/80",
          collapsed && "justify-center rounded-lg px-0"
        )}
        title={collapsed ? group.label : undefined}
        aria-expanded={!collapsed && isExpanded}
      >
        <Icon className={cn("h-5 w-5 shrink-0 stroke-[2]", isActiveParent || isExpanded ? tone.icon : "text-slate-500")} />
        {!collapsed && <span className="flex-1 text-[15px] font-bold tracking-[0.01em]">{group.label}</span>}
        {!collapsed && (isExpanded ? <ChevronDown className={cn("h-4 w-4", tone.icon)} /> : <ChevronRight className="h-4 w-4 text-slate-500" />)}
      </button>

      {isExpanded && !collapsed && (
        <ul className={cn("mx-2 mb-2 flex flex-col gap-0.5 rounded-lg p-1.5", tone.submenu)}>
          {group.subItems.map((item) => (
            <li key={item.href}>
              <Suspense fallback={<div className="h-10" />}>
                <SubMenuItemLinkInner
                  item={item}
                  tone={tone}
                  pendingCount={item.href === "/risk-trace" ? pendingRiskWorkOrderCount : undefined}
                  pendingCountJumpKey={item.href === "/risk-trace" ? pendingRiskWorkOrderJumpKey : undefined}
                />
              </Suspense>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export function DashboardSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [expandedGroups, setExpandedGroups] = useState([true, true, true, true, false])
  const [collapsed, setCollapsed] = useState(false)
  const [pendingRiskWorkOrderCount, setPendingRiskWorkOrderCount] = useState(0)
  const [pendingRiskWorkOrderJumpKey, setPendingRiskWorkOrderJumpKey] = useState(0)
  const riskNotificationStateRef = useRef<RiskWorkOrderNotificationState>(EMPTY_RISK_WORK_ORDER_NOTIFICATION_STATE)
  const riskNotificationInitializedRef = useRef(false)

  const persistRiskNotificationState = useCallback((state: RiskWorkOrderNotificationState) => {
    try { window.localStorage.setItem(RISK_WORK_ORDER_NOTIFICATION_STORAGE_KEY, JSON.stringify(state)) } catch { /* In-memory state remains available. */ }
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
          riskNotificationStateRef.current = storedValue
            ? { pendingTotal: Math.max(0, Number(JSON.parse(storedValue).pendingTotal) || 0), unseenCount: Math.max(0, Number(JSON.parse(storedValue).unseenCount) || 0) }
            : { pendingTotal: nextCount, unseenCount: 0 }
        } catch { riskNotificationStateRef.current = { pendingTotal: nextCount, unseenCount: 0 } }
        riskNotificationInitializedRef.current = true
      }
      const previousState = riskNotificationStateRef.current
      const nextState = reconcileRiskWorkOrderNotifications(previousState, nextCount, pathname === "/risk-trace")
      if (nextState.unseenCount > previousState.unseenCount) setPendingRiskWorkOrderJumpKey((current) => current + 1)
      riskNotificationStateRef.current = nextState
      setPendingRiskWorkOrderCount(nextState.unseenCount)
      persistRiskNotificationState(nextState)
    } catch { /* Keep the last known count during a transient network failure. */ }
  }, [pathname, persistRiskNotificationState])

  useEffect(() => {
    const timer = window.setTimeout(() => menuGroups.flatMap((group) => group.subItems).forEach((item) => router.prefetch(item.href)), 300)
    return () => window.clearTimeout(timer)
  }, [router])

  useEffect(() => {
    const initialTimer = window.setTimeout(refreshPendingRiskWorkOrderCount, 0)
    const timer = window.setInterval(refreshPendingRiskWorkOrderCount, 15_000)
    const handleChange = () => void refreshPendingRiskWorkOrderCount()
    window.addEventListener("risk-work-orders:changed", handleChange)
    window.addEventListener("risk-work-orders:viewed", acknowledgeRiskNotifications)
    window.addEventListener("focus", handleChange)
    return () => {
      window.clearTimeout(initialTimer)
      window.clearInterval(timer)
      window.removeEventListener("risk-work-orders:changed", handleChange)
      window.removeEventListener("risk-work-orders:viewed", acknowledgeRiskNotifications)
      window.removeEventListener("focus", handleChange)
    }
  }, [acknowledgeRiskNotifications, refreshPendingRiskWorkOrderCount])

  useEffect(() => {
    if (pathname === "/risk-trace" && riskNotificationInitializedRef.current) acknowledgeRiskNotifications()
  }, [acknowledgeRiskNotifications, pathname])

  return (
    <aside className={cn(
      "relative m-3 mr-0 flex h-[calc(100%-1.5rem)] flex-col overflow-hidden rounded-xl border border-slate-200 bg-[linear-gradient(160deg,#ffffff_0%,#fbfaff_58%,#f7f9ff_100%)] shadow-[0_6px_18px_rgba(31,41,55,0.08)] transition-[width] duration-200 ease-out",
      collapsed ? "w-16" : "w-[18.5rem]"
    )}>
      <div className={cn("flex min-h-[76px] items-center border-b border-slate-200/90 px-5", collapsed && "justify-center px-2")}>
        {!collapsed && <div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-violet-100 text-primary"><Sparkles className="h-5 w-5" /></span><span className="text-lg font-bold tracking-tight text-slate-900">导航栏</span></div>}
        <button onClick={() => setCollapsed((value) => !value)} className={cn("ml-auto grid h-9 w-9 place-items-center rounded-lg border border-slate-200 bg-white text-slate-500 outline-none transition-colors hover:border-violet-200 hover:bg-violet-50 hover:text-primary focus-visible:ring-2 focus-visible:ring-primary/40", collapsed && "ml-0")} aria-label={collapsed ? "展开侧边栏" : "收起侧边栏"}>
          {collapsed ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        </button>
      </div>

      <nav className={cn("flex-1 overflow-y-auto py-4", collapsed ? "px-2" : "px-3")} aria-label="主导航">
        <ul className="flex flex-col gap-3">
          {menuGroups.map((group, index) => <li key={group.label}><Suspense fallback={<div className="h-12" />}><MenuGroupItem group={group} groupIndex={index} isExpanded={expandedGroups[index]} onToggle={() => setExpandedGroups((previous) => previous.map((expanded, itemIndex) => itemIndex === index ? !expanded : expanded))} collapsed={collapsed} onExpand={() => setCollapsed(false)} pendingRiskWorkOrderCount={pendingRiskWorkOrderCount} pendingRiskWorkOrderJumpKey={pendingRiskWorkOrderJumpKey} /></Suspense></li>)}
        </ul>
      </nav>

      <div className={cn("border-t border-slate-200/90 p-3", collapsed && "p-2")}>
        <div className={cn("flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2.5 text-emerald-800", collapsed && "justify-center px-0")}>
          <span className="relative flex h-2.5 w-2.5"><span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" /><span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" /></span>
          {!collapsed && <span className="text-xs font-medium">系统运行正常</span>}
        </div>
      </div>
    </aside>
  )
}
