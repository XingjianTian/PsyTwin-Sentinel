import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth";

const PUBLIC_REGISTRATION_ROLE = "ASSISTANT";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, name, email, password, role } = body;

    // 公开注册只创建最低权限助理账号；操作员账号必须由受信任的管理员或数据库流程配置。
    if (type === "teacher" || (role !== undefined && role !== PUBLIC_REGISTRATION_ROLE)) {
      return NextResponse.json(
        { success: false, message: "公开注册不允许创建操作员账号" },
        { status: 403 }
      );
    }

    if (type !== undefined && type !== "assistant") {
      return NextResponse.json(
        { success: false, message: "公开注册仅支持助理账号" },
        { status: 400 }
      );
    }

    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, message: "姓名、邮箱和密码不能为空" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "该邮箱已被注册" },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        email,
        name,
        passwordHash,
        role: PUBLIC_REGISTRATION_ROLE,
      },
    });

    return NextResponse.json({
      success: true,
      message: "助理账号创建成功",
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("注册错误:", error);
    return NextResponse.json(
      { success: false, message: "注册失败，请稍后重试" },
      { status: 500 }
    );
  }
}
