import { NextRequest } from "next/server"
import { StudentStatus, RiskLevel } from "@prisma/client"
import { successResponse, errorResponse, validationError } from "@/lib/api-response"
import bcrypt from "bcryptjs"
import { generateToken } from "@/lib/auth"
import { prisma } from "@/lib/db"

/**
 * POST /api/pocket/auth/register
 * 用户注册
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, studentNo, phone, password, className, facultyId, gender } = body

    // 验证必填字段
    if (!name || !studentNo || !phone || !password) {
      return Response.json(
        validationError("姓名、学号、手机号和密码不能为空"),
        { status: 400 }
      )
    }

    // 检查手机号是否已注册
    const existingPhone = await prisma.student.findFirst({
      where: { phone },
      select: { id: true },
    })

    if (existingPhone) {
      return Response.json(
        errorResponse("该手机号已被注册", 1002),
        { status: 409 }
      )
    }

    // 检查学号是否已存在
    const existingStudentNo = await prisma.student.findFirst({
      where: { studentNo },
      select: { id: true },
    })

    if (existingStudentNo) {
      return Response.json(
        errorResponse("该学号已被注册", 1003),
        { status: 409 }
      )
    }

    // 加密密码
    const passwordHash = await bcrypt.hash(password, 10)

    // 创建用户
    const student = await prisma.student.create({
      data: {
        name,
        studentNo,
        phone,
        passwordHash,
        className: className || null,
        facultyId: facultyId || null,
        gender: gender || null,
        status: StudentStatus.ACTIVE,
        riskLevel: RiskLevel.LOW,
        role: "student",
        badges: [],
        stats: {
          counselingCount: 0,
          vrSessionCount: 0,
          assessmentCount: 0,
          totalMinutes: 0,
        },
        settings: {
          theme: "light",
          notification: true,
          privacy: { anonymousDefault: false },
        },
      },
      select: {
        id: true,
        name: true,
        studentNo: true,
        phone: true,
        avatar: true,
        nickname: true,
        className: true,
        facultyId: true,
        riskLevel: true,
        status: true,
        badges: true,
        stats: true,
      },
    })

    // 生成 JWT Token
    const token = generateToken({
      userId: student.id,
      email: student.phone || "",
      role: "student",
      name: student.name,
    })

    return Response.json(
      successResponse(
        {
          token,
          user: student,
        },
        "注册成功"
      ),
      { status: 201 }
    )
  } catch (error) {
    console.error("注册失败:", error)
    return Response.json(errorResponse("注册失败"), { status: 500 })
  }
}
