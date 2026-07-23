import { RiskLevel, WorkOrderStatus } from "@prisma/client"

import { cacheDeletePattern } from "@/lib/cache"
import { extractReachyRiskWorkOrderCandidates } from "@/lib/pet-ai/reachy-risk-work-order"
import { prisma } from "@/lib/prisma"

export async function syncReachyRiskWorkOrders({
  studentId,
  transcript,
}: {
  studentId: string
  transcript: unknown
}) {
  const candidates = extractReachyRiskWorkOrderCandidates({ studentId, transcript })
  if (candidates.length === 0) return { created: 0 }

  const student = await prisma.student.findUnique({
    where: { id: studentId },
    select: { name: true, className: true },
  })
  if (!student) return { created: 0 }

  const result = await prisma.workOrder.createMany({
    data: candidates.map((candidate) => {
      const isHigh = candidate.riskLevel === "HIGH"
      const riskLabel = isHigh ? "高风险" : "中风险"
      const score = isHigh ? 90 : 70
      return {
        id: candidate.id,
        studentId,
        className: student.className,
        trigger: `心宠对话检测到${riskLabel}表达`,
        riskLevel: isHigh ? RiskLevel.HIGH : RiskLevel.MEDIUM,
        method: isHigh ? "立即联系并开展危机评估" : "心理咨询与持续关注",
        counselor: "待分配",
        status: WorkOrderStatus.PENDING,
        date: candidate.occurredAt,
        detail: `来源：心宠实时对话\n风险等级：${riskLabel}\n学生原话：${candidate.sourceText}`,
        summary: candidate.sourceText.slice(0, 160),
        aiAssessment: [
          `【心宠实时对话风险预警 - ${student.name}】`,
          "",
          `在心宠实体对话中检测到${riskLabel}表达：`,
          candidate.sourceText,
          "",
          `【风险等级评估】：${isHigh ? "高危" : "中危"}（实时对话风险评分 ${score}/100）`,
          `【建议干预方案】：${isHigh ? "请立即联系学生，完成安全确认和危机风险评估，必要时启动校内危机干预流程。" : "建议辅导员尽快关注，并安排心理咨询或持续跟进。"}`,
        ].join("\n"),
      }
    }),
    skipDuplicates: true,
  })

  if (result.count > 0) await cacheDeletePattern("risk:workorders:*")
  return { created: result.count }
}
