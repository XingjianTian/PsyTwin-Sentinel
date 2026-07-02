import { DeviceAppointmentManagementView } from "@/components/views/device-appointment-management-view"

export default async function DeviceAppointmentsPage({
  searchParams,
}: {
  searchParams?: Promise<{ tab?: string }>
}) {
  const params = await searchParams

  return <DeviceAppointmentManagementView tab={params?.tab} />
}
