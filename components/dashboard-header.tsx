"use client"

import { Bell, Search } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useState } from "react"

export function DashboardHeader() {
  const [searchFocused, setSearchFocused] = useState(false)

  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-white px-6 shadow-sm">
      {/* Left: Logo & Title */}
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 overflow-hidden">
          <img src="/agents-icons/psytwin.jpg" alt="PsyTwin" className="h-full w-full object-cover" />
        </div>
        <h1 className="text-base font-semibold tracking-wide text-foreground">
          心图<span className="font-mono text-primary">PsyTwin</span>
          <span className="ml-1 hidden text-sm font-bold text-muted-foreground md:inline">
            - 校园心理健康数字孪生管理平台
          </span>
        </h1>
      </div>

      {/* Right: Search, Notifications, Avatar */}
      <div className="flex items-center gap-4">
        <div
          className={`flex items-center gap-2 rounded-md border px-3 py-1.5 transition-all ${
            searchFocused
              ? "border-primary/50 bg-primary/5"
              : "border-border bg-secondary"
          }`}
        >
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="搜索学生、预警、报告..."
            className="w-36 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none lg:w-52"
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
        </div>

        <button
          className="relative rounded-md p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          aria-label="通知"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold leading-none text-destructive-foreground">
            1
          </span>
        </button>

        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8 border border-border">
            <AvatarFallback className="bg-primary/10 text-xs font-medium text-primary">
              心
            </AvatarFallback>
          </Avatar>
          <span className="hidden text-sm text-muted-foreground lg:inline">
            心理咨询师
          </span>
        </div>
      </div>
    </header>
  )
}
