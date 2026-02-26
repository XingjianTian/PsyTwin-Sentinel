"use client"

import { useState } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardSidebar, type PageKey } from "@/components/dashboard-sidebar"
import { StatCards } from "@/components/stat-cards"
import { HeatmapCard } from "@/components/heatmap-card"
import { AlertRadarCard } from "@/components/alert-radar-card"
import { FunnelCard } from "@/components/funnel-card"
import { RiskTraceView } from "@/components/views/risk-trace-view"
import { StudentProfileView } from "@/components/views/student-profile-view"
import { AiConfigView } from "@/components/views/ai-config-view"

function OverviewView() {
  return (
    <>
      <StatCards />
      <div className="mt-4 grid gap-4 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <HeatmapCard />
        </div>
        <div className="lg:col-span-2">
          <AlertRadarCard />
        </div>
      </div>
      <div className="mt-4">
        <FunnelCard />
      </div>
    </>
  )
}

function PlaceholderView({ title }: { title: string }) {
  return (
    <div className="flex h-[60vh] items-center justify-center">
      <div className="text-center">
        <p className="text-lg font-medium text-foreground">{title}</p>
        <p className="mt-1 text-sm text-muted-foreground">该模块正在建设中...</p>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const [activePage, setActivePage] = useState<PageKey>("全域态势")

  const renderContent = () => {
    switch (activePage) {
      case "全域态势":
        return <OverviewView />
      case "风险溯源":
        return <RiskTraceView />
      case "学生档案":
        return <StudentProfileView />
      case "AI配置":
        return <AiConfigView />
      default:
        return <PlaceholderView title={activePage} />
    }
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      <DashboardHeader />
      <div className="flex flex-1 overflow-hidden">
        <DashboardSidebar activePage={activePage} onPageChange={setActivePage} />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  )
}
