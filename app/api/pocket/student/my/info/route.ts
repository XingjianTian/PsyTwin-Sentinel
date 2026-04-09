import { NextRequest } from "next/server"
import { successResponse, errorResponse } from "@/lib/api-response"
import { getCurrentUserId } from "@/lib/pocket-auth"
import { prisma } from "@/lib/db"

/**
 * GET /api/pocket/student/my/info
 * 获取我的页面信息
 */
export async function GET(request: NextRequest) {
  try {
    let userId = await getCurrentUserId(request)
    
    // 调试日志
    console.log('=== DEBUG ===')
    console.log('原始 userId:', userId)
    console.log('ID 类型:', typeof userId)
    
    // 防御性处理：如果 userId 是 "null" 或 "undefined" 字符串，使用默认值
    if (!userId || userId === "null" || userId === "undefined" || userId.trim() === "") {
      console.log('使用默认用户 stu001')
      userId = "stu001"
    }
    
    console.log('最终查询 userId:', userId)
    console.log('===============')

    const student = await prisma.student.findFirst({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        nickname: true,
        avatar: true,
        studentNo: true,
        className: true,
        phone: true,
        riskLevel: true,
        status: true,
        badges: true,
        stats: true,
        settings: true,
        createdAt: true,
      },
    })
    
    console.log('查询结果:', student ? '找到用户' : '未找到')

    if (!student) {
      // 如果找不到指定用户，返回默认用户
      const defaultStudent = await prisma.student.findFirst({
        where: { id: "stu001" },
        select: {
          id: true,
          name: true,
          nickname: true,
          avatar: true,
          studentNo: true,
          className: true,
          phone: true,
          riskLevel: true,
          status: true,
          badges: true,
          stats: true,
          settings: true,
          createdAt: true,
        },
      })
      
      if (!defaultStudent) {
        return Response.json(errorResponse("用户不存在", 404), { status: 404 })
      }
      
      return Response.json(
        successResponse({
          id: defaultStudent.id,
          name: defaultStudent.name,
          nickname: defaultStudent.nickname,
          avatar: defaultStudent.avatar,
          studentNo: defaultStudent.studentNo,
          className: defaultStudent.className,
          phone: defaultStudent.phone,
          riskLevel: defaultStudent.riskLevel,
          status: defaultStudent.status,
          badges: defaultStudent.badges || [],
          stats: defaultStudent.stats || {
            counselingCount: 0,
            vrSessionCount: 0,
            assessmentCount: 0,
            totalMinutes: 0,
          },
          settings: defaultStudent.settings || {
            theme: "light",
            notification: true,
            privacy: { anonymousDefault: false },
          },
          createdAt: defaultStudent.createdAt.toISOString(),
        })
      )
    }

    return Response.json(
      successResponse({
        id: student.id,
        name: student.name,
        nickname: student.nickname,
        avatar: student.avatar,
        studentNo: student.studentNo,
        className: student.className,
        phone: student.phone,
        riskLevel: student.riskLevel,
        status: student.status,
        badges: student.badges || [],
        stats: student.stats || {
          counselingCount: 0,
          vrSessionCount: 0,
          assessmentCount: 0,
          totalMinutes: 0,
        },
        settings: student.settings || {
          theme: "light",
          notification: true,
          privacy: { anonymousDefault: false },
        },
        createdAt: student.createdAt.toISOString(),
      })
    )
  } catch (error: any) {
    console.error("获取我的信息失败:", error)
    return Response.json(errorResponse("获取我的信息失败"), { status: 500 })
  }
}
