import { NextRequest, NextResponse } from "next/server";
import {
  getUserById,
  updateUser,
  deleteUser,
  resetUserPassword,
  toggleUserStatus,
} from "@/app/actions/users";
import { UserStatus } from "@prisma/client";

/**
 * GET /api/users/[id]
 * 获取用户详情
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const result = await getUserById(params.id);

    if (!result.success) {
      return NextResponse.json(result, { status: 404 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("[API] Get user detail error:", error);
    return NextResponse.json(
      { success: false, message: "获取用户详情失败" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/users/[id]
 * 更新用户
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    const result = await updateUser(params.id, {
      name: body.name,
      email: body.email,
      role: body.role,
      status: body.status,
      avatar: body.avatar,
    });

    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("[API] Update user error:", error);
    return NextResponse.json(
      { success: false, message: "更新用户失败" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/users/[id]
 * 删除用户
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const result = await deleteUser(params.id);

    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("[API] Delete user error:", error);
    return NextResponse.json(
      { success: false, message: "删除用户失败" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/users/[id]/actions
 * 用户操作（重置密码、切换状态）
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
      const result = await resetUserPassword(params.id, body.newPassword);
      return NextResponse.json(result);
    }

    if (action === "toggle-status") {
      const body = await request.json();
      const result = await toggleUserStatus(params.id, body.currentStatus);
      return NextResponse.json(result);
    }

    return NextResponse.json(
      { success: false, message: "未知操作" },
      { status: 400 }
    );
  } catch (error) {
    console.error("[API] User action error:", error);
    return NextResponse.json(
      { success: false, message: "操作失败" },
      { status: 500 }
    );
  }
}