import { redirect } from "next/navigation"

export default function DeviceManagementPage() {
  redirect("/device-appointments?tab=devices")
}
