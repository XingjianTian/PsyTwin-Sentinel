import { NextRequest, NextResponse } from "next/server"
import { RiskLevel } from "@prisma/client"

import { DEMO_PET_NAME, prioritizeDemoStudent } from "@/lib/pet-ai/demo-data"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams
  const page = Math.max(1, Number(params.get("page") || 1))
  const limit = Math.min(50, Math.max(1, Number(params.get("limit") || 20)))
  const search = params.get("search")?.trim()
  const className = params.get("className")?.trim()
  const risk = params.get("riskLevel")
  const riskLevel = risk && Object.values(RiskLevel).includes(risk as RiskLevel) ? (risk as RiskLevel) : undefined

  const where = {
    AND: [
      search ? { OR: [{ name: { contains: search, mode: "insensitive" as const } }, { studentNo: { contains: search, mode: "insensitive" as const } }] } : {},
      className ? { className } : {},
      riskLevel ? { riskLevel } : {},
    ],
  }

  const [students, total, classes] = await Promise.all([
    prisma.student.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: [{ riskLevel: "desc" }, { name: "asc" }],
      select: {
        id: true, name: true, studentNo: true, className: true, riskLevel: true, mbti: true,
        pets: { take: 1, select: { id: true, name: true, isOnline: true, expression: true, mood: true } },
      },
    }),
    prisma.student.count({ where }),
    prisma.student.findMany({ distinct: ["className"], orderBy: { className: "asc" }, select: { className: true } }),
  ])

  const demoStudentId = process.env.PET_AI_DEMO_STUDENT_ID || "stu-test"
  const summaries = students.map(({ pets, ...student }) => ({
    ...student,
    pet: pets[0] ? { ...pets[0], name: student.id === demoStudentId ? DEMO_PET_NAME : pets[0].name } : null,
  }))

  return NextResponse.json({
    data: {
      students: prioritizeDemoStudent(summaries, demoStudentId),
      total,
      page,
      totalPages: Math.ceil(total / limit),
      classes: classes.map((item) => item.className),
      demoStudentId,
    },
  })
}
