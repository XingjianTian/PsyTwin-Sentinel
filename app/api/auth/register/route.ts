import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      type,
      name,
      email,
      password,
      phone,
      department,
      title,
      role = "TEACHER",
    } = body;

    if (!name || !password) {
      return NextResponse.json(
        { success: false, message: "姓名和密码不能为空" },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(password);

    if (type === "teacher") {
      // 检查手机号是否已存在
      const existingTeacher = await prisma.teacher.findUnique({
        where: { phone },
      });

      if (existingTeacher) {
        return NextResponse.json(
          { success: false, message: "该手机号已被注册" },
          { status: 409 }
        );
      }

      // 生成教师编号
      const teacherCount = await prisma.teacher.count();
      const teacherId = `T${String(teacherCount + 1).padStart(4, "0")}`;

      const teacher = await prisma.teacher.create({
        data: {
          teacherId,
          name,
          phone,
          passwordHash,
          department: department || "心理咨询中心",
          title: title || "咨询师",
          role,
          qualifications: [],
        },
      });

      return NextResponse.json({
        success: true,
        message: "教师账号创建成功",
        data: {
          id: teacher.id,
          teacherId: teacher.teacherId,
          name: teacher.name,
          role: teacher.role,
        },
      });
    } else {
      // 创建系统用户
      if (!email) {
        return NextResponse.json(
          { success: false, message: "邮箱不能为空" },
          { status: 400 }
        );
      }

      // 检查邮箱是否已存在
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return NextResponse.json(
          { success: false, message: "该邮箱已被注册" },
          { status: 409 }
        );
      }

      const user = await prisma.user.create({
        data: {
          email,
          name,
          passwordHash,
          role,
        },
      });

      return NextResponse.json({
        success: true,
        message: "用户创建成功",
        data: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      });
    }
  } catch (error) {
    console.error("注册错误:", error);
    return NextResponse.json(
      { success: false, message: "注册失败，请稍后重试" },
      { status: 500 }
    );
  }
}
