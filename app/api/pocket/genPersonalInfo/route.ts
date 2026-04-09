import { NextRequest } from "next/server"
import { successResponse, errorResponse } from "@/lib/api-response"
import { getCurrentUserId } from "@/lib/pocket-auth"
import { prisma } from "@/lib/db"

/**
 * GET /api/pocket/genPersonalInfo
 * 获取个人详细信息
 */
export async function GET(request: NextRequest) {
  try {
    let userId = await getCurrentUserId(request)

    if (!userId || userId === "null" || userId === "undefined" || userId.trim() === "") {
      userId = "stu001"
    }

    const student = await prisma.student.findFirst({
      where: { id: userId },
      select: {
        name: true,
        gender: true,
        birthDate: true,
        avatar: true,
        nickname: true,
        phone: true,
        settings: true,
        introduction: true,
        photos: true,
      },
    })

    if (!student) {
      const defaultStudent = await prisma.student.findFirst({
        where: { id: "stu001" },
        select: {
          name: true,
          gender: true,
          birthDate: true,
          avatar: true,
          nickname: true,
          phone: true,
          settings: true,
          introduction: true,
          photos: true,
        },
      })

      if (!defaultStudent) {
        return Response.json(errorResponse("用户不存在", 404), { status: 404 })
      }

      const settings = defaultStudent.settings as { address?: string[] } | null
      const genderMap: Record<string, number> = { "男": 0, "女": 1, "male": 0, "female": 1 }
      const genderValue = defaultStudent.gender ? (genderMap[defaultStudent.gender] ?? 2) : 2

      return Response.json(successResponse({
        name: defaultStudent.nickname || defaultStudent.name || "",
        gender: genderValue,
        birth: defaultStudent.birthDate ? defaultStudent.birthDate.toISOString().split("T")[0] : null,
        address: settings?.address || [],
        introduction: defaultStudent.introduction || "",
        photos: defaultStudent.photos || [],
      }))
    }

    const settings = student.settings as { address?: string[] } | null
    const genderMap: Record<string, number> = { "男": 0, "女": 1, "male": 0, "female": 1 }
    const genderValue = student.gender ? (genderMap[student.gender] ?? 2) : 2

    return Response.json(successResponse({
      name: student.nickname || student.name || "",
      gender: genderValue,
      birth: student.birthDate ? student.birthDate.toISOString().split("T")[0] : null,
      address: settings?.address || [],
      introduction: student.introduction || "",
      photos: student.photos || [],
    }))
  } catch (error: any) {
    console.error("获取个人信息失败:", error)
    return Response.json(errorResponse("获取个人信息失败"), { status: 500 })
  }
}

/**
 * PUT /api/pocket/genPersonalInfo
 * 更新个人详细信息
 */
export async function PUT(request: NextRequest) {
  try {
    let userId = await getCurrentUserId(request)

    if (!userId || userId === "null" || userId === "undefined" || userId.trim() === "") {
      userId = "stu001"
    }

    const body = await request.json()
    const { name, gender, birth, address, introduction, photos } = body

    const updateData: any = {}

    if (name !== undefined) updateData.nickname = name
    if (gender !== undefined) {
      const genderMap: Record<number, string> = { 0: "男", 1: "女", 2: "保密" }
      updateData.gender = genderMap[gender] || "保密"
    }
    if (birth !== undefined) updateData.birthDate = birth ? new Date(birth) : null
    if (introduction !== undefined) updateData.introduction = introduction
    if (photos !== undefined) updateData.photos = photos

    if (address !== undefined) {
      updateData.settings = { address }
    }

    const student = await prisma.student.update({
      where: { id: userId },
      data: updateData,
    })

    if (!student) {
      return Response.json(errorResponse("用户不存在", 404), { status: 404 })
    }

    return Response.json(successResponse(null, "更新成功"))
  } catch (error: any) {
    console.error("更新个人信息失败:", error)
    return Response.json(errorResponse("更新个人信息失败"), { status: 500 })
  }
}
