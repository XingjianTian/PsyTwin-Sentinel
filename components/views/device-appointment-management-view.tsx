import Link from "next/link"
import { CalendarClock, Monitor } from "lucide-react"
import type { ElementType } from "react"

import { ConsultationRoomView } from "@/components/views/consultation-room-view"
import { DeviceManagementView } from "@/components/views/device-management-view"
import { cn } from "@/lib/utils"

type DeviceAppointmentTab = "appointments" | "devices"

const switchItems: Array<{
  value: DeviceAppointmentTab
  label: string
  href: string
  icon: ElementType
}> = [
  {
    value: "appointments",
    label: "线上预约",
    href: "/device-appointments?tab=appointments",
    icon: CalendarClock,
  },
  {
    value: "devices",
    label: "线下设备",
    href: "/device-appointments?tab=devices",
    icon: Monitor,
  },
]

export function DeviceAppointmentManagementView({ tab }: { tab?: string }) {
  const currentTab: DeviceAppointmentTab = tab === "devices" ? "devices" : "appointments"

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-normal">设备与预约管理</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            统一管理线上预约排期与线下心理服务设备状态。
          </p>
        </div>

        <div
          role="tablist"
          aria-label="设备与预约管理页面切换"
          className="grid h-10 w-full grid-cols-2 rounded-lg bg-muted p-1 lg:w-[420px]"
        >
          {switchItems.map((item) => {
            const Icon = item.icon
            const isActive = currentTab === item.value

            return (
              <Link
                key={item.value}
                href={item.href}
                role="tab"
                aria-selected={isActive}
                className={cn(
                  "inline-flex items-center justify-center gap-2 rounded-md px-3 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </div>
      </div>

      {currentTab === "appointments" ? <ConsultationRoomView /> : <DeviceManagementView />}
    </div>
  )
}
