import { redirect } from "next/navigation"

export default function ConsultationRoomPage() {
  redirect("/device-appointments?tab=appointments")
}
