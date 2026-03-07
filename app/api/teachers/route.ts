import { NextRequest, NextResponse } from "next/server";
import {
  getTeachers,
  createTeacher,
} from "@/app/actions/users";
import { UserRole } from "@prisma/client";

/**
 * GET /api/teachers
 * 获取教师列表
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const department = searchParams.get("department") || undefined;
    const role = searchParams.get("role") as UserRole | undefined;
    const status = searchParams.get("status") as any;
    const search = searchParams.get("search") || undefined;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const result = await getTeachers({
      department,
      role,
      status,
      search,
      page,
      limit,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("[API] Get teachers error:", error);
    return NextResponse.json(
      { success: false, message: "获取教师列表失败" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/teachers
 * 创建教师
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 验证必填字段
    if (!body.teacherId || !body.name || !body.phone || !body.password || !body.department || !body.title) {
      return NextResponse.json(
        { success: false, message: "工号、姓名、手机号、密码、部门和职称不能为空" },
        { status: 400 }
      );
    }

    const result = await createTeacher({
      teacherId: body.teacherId,
      name: body.name,
      phone: body.phone,
      password: body.password,
      department: body.department,
      title: body.title,
      role: body.role as UserRole,
      qualifications: body.qualifications,
    });

    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("[API] Create teacher error:", error);
    return NextResponse.json(
      { success: false, message: "创建教师失败" },
      { status: 500 }
    );
  }
}