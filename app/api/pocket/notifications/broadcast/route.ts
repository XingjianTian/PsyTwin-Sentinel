import { NextRequest } from "next/server"
import { PrismaClient, NotificationType } from "@prisma/client"
import { successResponse, errorResponse } from "@/lib/api-response"
import { getCurrentUserId } from "@/lib/pocket-auth"

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    await getCurrentUserId(request)

    const body = await request.json()
    const { type = "notification", title, content, actionUrl } = body

    if (!title || !content) {
      return Response.json(errorResponse("缺少 title 或 content"), { status: 400 })
    }

    const typeMap: Record<string, NotificationType> = {
      system: "SYSTEM",
      appointment: "APPOINTMENT",
      chat: "CHAT",
      warning: "WARNING",
      post: "POST",
      comment: "COMMENT",
    }

    const mappedType = typeMap[type.toLowerCase()] || "SYSTEM"

    const students = await prisma.student.findMany({
      select: { id: true },
    })

    const notifications = students.map((s) => ({
      studentId: s.id,
      type: mappedType,
      title,
      content,
      actionUrl: actionUrl || "",
      isRead: false,
    }))

    await prisma.studentNotification.createMany({
      data: notifications,
    })

    return Response.json(
      successResponse({
        count: students.length,
      }, `已向 ${students.length} 名学生发送通知`)
    )
  } catch (error: any) {
    console.error("广播通知失败:", error)
    return Response.json(errorResponse("操作失败"), { status: 500 })
  }
}
