import { OpenClawOrchestrationView } from "@/components/ai-config/openclaw-orchestration-view"
import { PsyTwinAiVisionView } from "@/components/ai-config/psytwin-ai-vision-view"
import { RagKnowledgeBaseView } from "@/components/ai-config/rag-knowledge-base-view"
import { StrategyCenterView } from "@/components/ai-config/strategy-center-view"

type AiConfigTab = "openclaw" | "vision" | "rag" | "strategy"

export function AiConfigView({ tab = "openclaw" }: { tab?: string }) {
  const currentTab: AiConfigTab =
    tab === "vision" || tab === "rag" || tab === "strategy" ? tab : "openclaw"

  return (
    <>
      {currentTab === "openclaw" ? <OpenClawOrchestrationView /> : null}
      {currentTab === "vision" ? <PsyTwinAiVisionView /> : null}
      {currentTab === "rag" ? <RagKnowledgeBaseView /> : null}
      {currentTab === "strategy" ? <StrategyCenterView /> : null}
    </>
  )
}
