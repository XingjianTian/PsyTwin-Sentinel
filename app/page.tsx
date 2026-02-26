import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { StatCards } from "@/components/stat-cards"
import { HeatmapCard } from "@/components/heatmap-card"
import { AlertRadarCard } from "@/components/alert-radar-card"
import { FunnelCard } from "@/components/funnel-card"

export default function DashboardPage() {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      {/* Header */}
      <DashboardHeader />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <DashboardSidebar />

        {/* Main content area */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {/* Top Stat Cards */}
          <StatCards />

          {/* Main grid: Heatmap + Alert Radar */}
          <div className="mt-4 grid gap-4 lg:grid-cols-5">
            {/* Heatmap - wider */}
            <div className="lg:col-span-3">
              <HeatmapCard />
            </div>

            {/* Alert Radar - narrower tall card */}
            <div className="lg:col-span-2">
              <AlertRadarCard />
            </div>
          </div>

          {/* Bottom: Funnel Card */}
          <div className="mt-4">
            <FunnelCard />
          </div>
        </main>
      </div>
    </div>
  )
}
