import { NextRequest } from "next/server"
import { prisma } from "@/lib/db"
import { successResponse, errorResponse, validationError } from "@/lib/api-response"
import { generateToken, verifyPassword } from "@/lib/auth"

/**
 * POST /api/pocket/auth/login/password
 * 用户登录（手机号 + 密码）
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { phone, password } = body

    // 验证必填字段
    if (!phone || !password) {
      return Response.json(
        validationError("手机号和密码不能为空"),
        { status: 400 }
      )
    }

    // 查找用户
    const student = await prisma.student.findFirst({
      where: { phone },
      select: {
        id: true,
        name: true,
        studentNo: true,
        phone: true,
        passwordHash: true,
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

    if (!student) {
      return Response.json(
        errorResponse("账号不存在", 1001),
        { status: 401 }
      )
    }

    const isValidPassword = await verifyPassword(password, student.passwordHash || "")

    if (!isValidPassword) {
      return Response.json(
        errorResponse("密码错误", 1002),
        { status: 401 }
      )
    }

    // 更新最后登录时间
    await prisma.student.update({
      where: { id: student.id },
      data: { lastLoginAt: new Date() },
    })

    // 生成 JWT Token
    const token = generateToken({
      userId: student.id,
      email: student.phone || "",
      role: "student",
      name: student.name,
    })

    // 返回用户信息（不包含密码）
    const { passwordHash, ...userInfo } = student

    return Response.json(
      successResponse(
        {
          token,
          user: userInfo,
        },
        "登录成功"
      )
    )
  } catch (error: any) {
    console.error("登录失败:", error)
    return Response.json(errorResponse("登录失败"), { status: 500 })
  }
}
