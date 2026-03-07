import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyPassword, generateToken } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, type } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "邮箱和密码不能为空" },
        { status: 400 }
      );
    }

    let user = null;

    // 根据登录类型查找用户
    if (type === "teacher" || !type) {
      // 先查找 Teacher
      user = await prisma.teacher.findUnique({
        where: { phone: email }, // 教师使用手机号登录
      });

      if (user) {
        // 验证密码
        const isValid = await verifyPassword(password, user.passwordHash);
        if (!isValid) {
          return NextResponse.json(
            { success: false, message: "密码错误" },
            { status: 401 }
          );
        }

        // 检查状态
        if (user.status !== "ACTIVE") {
          return NextResponse.json(
            { success: false, message: "账号已被禁用" },
            { status: 403 }
          );
        }

        // 更新最后登录时间
        await prisma.teacher.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        });

        // 生成 JWT
        const token = generateToken({
          userId: user.id,
          email: user.phone,
          role: user.role,
          name: user.name,
        });

        return NextResponse.json({
          success: true,
          message: "登录成功",
          data: {
            token,
            user: {
              id: user.id,
              name: user.name,
              email: user.phone,
              role: user.role,
              avatar: user.avatar,
              department: user.department,
              title: user.title,
            },
          },
        });
      }
    }

    // 查找系统用户 (User 表)
    user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "用户不存在" },
        { status: 404 }
      );
    }

    // 验证密码
    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { success: false, message: "密码错误" },
        { status: 401 }
      );
    }

    // 检查状态
    if (user.status !== "ACTIVE") {
      return NextResponse.json(
        { success: false, message: "账号已被禁用" },
        { status: 403 }
      );
    }

    // 更新最后登录时间
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // 生成 JWT
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    return NextResponse.json({
      success: true,
      message: "登录成功",
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
        },
      },
    });
  } catch (error) {
    console.error("登录错误:", error);
    return NextResponse.json(
      { success: false, message: "登录失败，请稍后重试" },
      { status: 500 }
    );
  }
}
