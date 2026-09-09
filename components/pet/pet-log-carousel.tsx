"use client"

import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import {
  Activity,
  BookOpen,
  Gamepad2,
  MapPin,
  Puzzle,
  ShoppingBag,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export interface PetLogCarouselItem {
  id?: string
  time: string
  source: "小程序" | "Unity" | "心宠服务"
  title: string
  detail: string
  tone: "pocket" | "unity" | "diary" | "shop" | "calm" | "server"
  mood?: number
  energy?: number
  sociability?: number
}

function logToneClass(tone: PetLogCarouselItem["tone"]) {
  if (tone === "server") return "border-emerald-200 bg-emerald-50 text-emerald-700"
  if (tone === "unity") return "border-violet-200 bg-violet-50 text-violet-700"
  if (tone === "shop") return "border-amber-200 bg-amber-50 text-amber-700"
  if (tone === "diary") return "border-indigo-200 bg-indigo-50 text-indigo-700"
  if (tone === "pocket") return "border-sky-200 bg-sky-50 text-sky-700"
  return "border-emerald-200 bg-emerald-50 text-emerald-700"
}

function LogIcon({ tone }: { tone: PetLogCarouselItem["tone"] }) {
  if (tone === "server") return <Activity className="h-4 w-4" />
  if (tone === "unity") return <Puzzle className="h-4 w-4" />
  if (tone === "shop") return <ShoppingBag className="h-4 w-4" />
  if (tone === "diary") return <BookOpen className="h-4 w-4" />
  if (tone === "pocket") return <MapPin className="h-4 w-4" />
  return <Gamepad2 className="h-4 w-4" />
}

export function PetLogCarousel({ logs }: { logs: PetLogCarouselItem[] }) {
  const prefersReducedMotion = useReducedMotion()

  return (
    <div>
      <div className="mb-3 flex items-center gap-2 text-xs text-muted-foreground">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-70 motion-safe:animate-ping" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
        </span>
        {prefersReducedMotion
          ? "实时接收中 · 已按系统设置减少动态效果"
          : "实时接收中 · 新动态将从顶部进入"}
      </div>

      <div className="space-y-3" aria-live="polite" aria-relevant="additions">
        <AnimatePresence initial={false} mode="popLayout">
          {logs.map((log, index) => {
            const isActive = index === 0
            return (
              <motion.div
                layout={!prefersReducedMotion}
                key={log.id || `${log.time}-${log.title}`}
                initial={prefersReducedMotion ? false : { opacity: 0, y: -18, scale: 0.985 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={prefersReducedMotion ? undefined : { opacity: 0, y: 10, scale: 0.985 }}
                transition={{ duration: 0.3, ease: [0.25, 1, 0.5, 1] }}
                className={cn(
                  "grid gap-3 rounded-lg border p-3 md:grid-cols-[82px_150px_1fr]",
                  isActive
                    ? "border-emerald-300 bg-emerald-50/45 ring-1 ring-emerald-200/60"
                    : "border-border bg-muted/20",
                )}
              >
                <div className="flex items-center gap-2 font-mono text-xs font-semibold text-muted-foreground">
                  {log.time}
                  {isActive && (
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 font-sans text-[10px] font-medium text-emerald-700 md:hidden">
                      最新动态
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={logToneClass(log.tone)}>
                    <LogIcon tone={log.tone} />
                    {log.source}
                  </Badge>
                  {isActive && (
                    <span className="hidden text-[10px] font-medium text-emerald-700 md:inline">
                      最新动态
                    </span>
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-foreground">{log.title}</p>
                    {(log.mood !== undefined || log.energy !== undefined || log.sociability !== undefined) && (
                      <span className="rounded bg-primary/5 px-2 py-0.5 text-xs text-primary">
                        心情 {log.mood ?? "-"} · 能量 {log.energy ?? "-"} · 社交 {log.sociability ?? "-"}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{log.detail}</p>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </div>
  )
}
