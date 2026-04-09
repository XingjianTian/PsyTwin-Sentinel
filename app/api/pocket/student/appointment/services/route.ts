import { NextRequest } from "next/server"
import { successResponse, errorResponse } from "@/lib/api-response"
import { prisma } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const teachers = await prisma.teacher.findMany({
      select: {
        id: true,
        teacherId: true,
        name: true,
        nickname: true,
        avatar: true,
        department: true,
        title: true,
        qualifications: true,
        workStats: true,
      },
      orderBy: { createdAt: "desc" },
    })

    const rooms = await prisma.consultationRoom.findMany({
      select: {
        id: true,
        name: true,
        location: true,
        capacity: true,
        status: true,
        currentStudentId: true,
      },
      orderBy: { createdAt: "desc" },
    })

    return Response.json(
      successResponse({
        teachers: teachers.map(t => ({
          id: t.id,
          teacherId: t.teacherId,
          name: t.name,
          nickname: t.nickname,
          avatar: t.avatar,
          department: t.department,
          title: t.title,
          qualifications: t.qualifications || [],
          workStats: t.workStats || {},
        })),
        rooms: rooms.map(r => ({
          id: r.id,
          name: r.name,
          location: r.location,
          capacity: r.capacity,
          status: r.status,
          currentStudentId: r.currentStudentId,
        })),
      })
    )
  } catch (error: any) {
    console.error("获取预约服务失败:", error)
    return Response.json(errorResponse(`获取预约服务失败: ${error?.message || '未知错误'}`), { status: 500 })
  }
}
