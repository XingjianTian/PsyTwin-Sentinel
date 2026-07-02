import { redirect } from "next/navigation"

import { AiConfigView } from "@/components/views/ai-config-view"

export default async function AiConfigPage({
  searchParams,
}: {
  searchParams?: Promise<{ tab?: string }>
}) {
  const params = await searchParams

  if (params?.tab === "vision") {
    redirect("/multimodal")
  }

  return <AiConfigView tab={params?.tab} />
}
