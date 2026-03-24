import { StatCards } from "@/components/stat-cards"
import { HeatmapCard } from "@/components/heatmap-card"
import { AlertRadarCard } from "@/components/alert-radar-card"
import { FunnelCard } from "@/components/funnel-card"

export default function DashboardPage() {
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
      <div className="mt-6">
        <FunnelCard />
      </div>
    </>
  )
}
