import { NextRequest, NextResponse } from "next/server";
import {
  getTeacherById,
  updateTeacher,
  deleteTeacher,
  resetTeacherPassword,
  toggleTeacherStatus,
} from "@/app/actions/users";
import { TeacherStatus } from "@prisma/client";

/**
 * GET /api/teachers/[id]
 * 获取教师详情
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const result = await getTeacherById(params.id);

    if (!result.success) {
      return NextResponse.json(result, { status: 404 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("[API] Get teacher detail error:", error);
    return NextResponse.json(
      { success: false, message: "获取教师详情失败" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/teachers/[id]
 * 更新教师
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    const result = await updateTeacher(params.id, {
      name: body.name,
      phone: body.phone,
      department: body.department,
      title: body.title,
      role: body.role,
      status: body.status,
      qualifications: body.qualifications,
      avatar: body.avatar,
    });

    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("[API] Update teacher error:", error);
    return NextResponse.json(
      { success: false, message: "更新教师失败" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/teachers/[id]
 * 删除教师
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const result = await deleteTeacher(params.id);

    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("[API] Delete teacher error:", error);
    return NextResponse.json(
      { success: false, message: "删除教师失败" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/teachers/[id]/actions
 * 教师操作（重置密码、切换状态）
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");

    if (action === "reset-password") {
      const body = await request.json();
      if (!body.newPassword) {
        return NextResponse.json(
          { success: false, message: "新密码不能为空" },
          { status: 400 }
        );
      }
      const result = await resetTeacherPassword(params.id, body.newPassword);
      return NextResponse.json(result);
    }

    if (action === "toggle-status") {
      const body = await request.json();
      const result = await toggleTeacherStatus(params.id, body.currentStatus);
      return NextResponse.json(result);
    }

    return NextResponse.json(
      { success: false, message: "未知操作" },
      { status: 400 }
    );
  } catch (error) {
    console.error("[API] Teacher action error:", error);
    return NextResponse.json(
      { success: false, message: "操作失败" },
      { status: 500 }
    );
  }
}