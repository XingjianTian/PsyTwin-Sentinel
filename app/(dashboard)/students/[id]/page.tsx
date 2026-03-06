import { redirect } from "next/navigation"

export default function StudentDetailRedirect({ params }: { params: { id: string } }) {
  redirect(`/students/${params.id}/profile`)
}
