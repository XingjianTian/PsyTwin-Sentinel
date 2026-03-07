import { NextRequest, NextResponse } from "next/server";
import { getTeacherAvailableSlots } from "@/app/actions/appointments";

/**
 * GET /api/teachers/[id]/slots?date=2026-03-10
 * 获取教师的可预约时段
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const dateStr = searchParams.get("date");

    if (!dateStr) {
      return NextResponse.json(
        { success: false, message: "日期参数不能为空" },
        { status: 400 }
      );
    }

    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      return NextResponse.json(
        { success: false, message: "日期格式无效" },
        { status: 400 }
      );
    }

    const result = await getTeacherAvailableSlots(params.id, date);

    return NextResponse.json(result);
  } catch (error) {
    console.error("[API] Get teacher slots error:", error);
    return NextResponse.json(
      { success: false, message: "获取可用时段失败" },
      { status: 500 }
    );
  }
}
