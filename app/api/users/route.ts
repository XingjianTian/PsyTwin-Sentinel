import { NextRequest, NextResponse } from "next/server";
import {
  getUsers,
  createUser,
  getUserStats,
} from "@/app/actions/users";
import { UserRole } from "@prisma/client";

/**
 * GET /api/users
 * 获取用户列表
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const role = searchParams.get("role") as UserRole | undefined;
    const status = searchParams.get("status") as any;
    const search = searchParams.get("search") || undefined;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const stats = searchParams.get("stats");

    // 获取统计信息
    if (stats === "true") {
      const result = await getUserStats();
      return NextResponse.json(result);
    }

    const result = await getUsers({
      role,
      status,
      search,
      page,
      limit,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("[API] Get users error:", error);
    return NextResponse.json(
      { success: false, message: "获取用户列表失败" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/users
 * 创建用户
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 验证必填字段
    if (!body.name || !body.email || !body.password || !body.role) {
      return NextResponse.json(
        { success: false, message: "姓名、邮箱、密码和角色不能为空" },
        { status: 400 }
      );
    }

    const result = await createUser({
      name: body.name,
      email: body.email,
      password: body.password,
      role: body.role as UserRole,
    });

    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("[API] Create user error:", error);
    return NextResponse.json(
      { success: false, message: "创建用户失败" },
      { status: 500 }
    );
  }
}