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
import { VrDashboardView } from "@/components/views/vr-dashboard-view"
import { InterventionRecordsView } from "@/components/views/intervention-records-view"
import { SystemSettingsView } from "@/components/views/system-settings-view"
import { ConsultationRoomView } from "@/components/views/consultation-room-view"
import { DeviceManagementView } from "@/components/views/device-management-view"
import { MultimodalDataFlowView } from "@/components/views/multimodal-dataflow-view"

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

export default function DashboardPage() {
  const [activePage, setActivePage] = useState<PageKey>("全域态势")

  const renderContent = () => {
    switch (activePage) {
      case "全域态势":
        return <OverviewView />
      case "风险溯源":
        return <RiskTraceView />
      case "VR端数据":
        return <VrDashboardView />
      case "学生档案":
        return <StudentProfileView />
      case "干预记录":
        return <InterventionRecordsView />
      case "AI配置":
        return <AiConfigView />
      case "系统设置":
        return <SystemSettingsView />
      case "心理咨询室":
        return <ConsultationRoomView />
      case "设备管理":
        return <DeviceManagementView />
      case "多模态数据流":
        return <MultimodalDataFlowView />
      default:
        return <OverviewView />
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
