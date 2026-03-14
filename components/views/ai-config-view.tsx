import { OpenClawOrchestrationView } from "@/components/ai-config/openclaw-orchestration-view"
import { RagKnowledgeBaseView } from "@/components/ai-config/rag-knowledge-base-view"
import { StrategyCenterView } from "@/components/ai-config/strategy-center-view"

type AiConfigTab = "openclaw" | "rag" | "strategy"

export function AiConfigView({ tab = "openclaw" }: { tab?: string }) {
  const currentTab: AiConfigTab = tab === "rag" || tab === "strategy" ? tab : "openclaw"

  return (
    <>
      {currentTab === "openclaw" ? <OpenClawOrchestrationView /> : null}
      {currentTab === "rag" ? <RagKnowledgeBaseView /> : null}
      {currentTab === "strategy" ? <StrategyCenterView /> : null}
    </>
  )
}
