import { RiskLevel, WorkOrderStatus } from "@prisma/client"
import { NextResponse } from "next/server"

import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function GET() {
  const count = await prisma.workOrder.count({
    where: {
      riskLevel: { in: [RiskLevel.MEDIUM, RiskLevel.HIGH] },
      status: WorkOrderStatus.PENDING,
    },
  })
  return NextResponse.json(
    { data: { count } },
    { headers: { "Cache-Control": "no-store" } },
  )
}
