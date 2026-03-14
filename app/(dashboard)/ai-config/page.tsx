import { AiConfigView } from "@/components/views/ai-config-view"

export default async function AiConfigPage({
  searchParams,
}: {
  searchParams?: Promise<{ tab?: string }>
}) {
  const params = await searchParams

  return <AiConfigView tab={params?.tab} />
}
