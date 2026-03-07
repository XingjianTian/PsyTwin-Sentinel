import { NextRequest, NextResponse } from "next/server";
import {
  getAppointments,
  createAppointment,
} from "@/app/actions/appointments";
import { AppointmentType } from "@prisma/client";

/**
 * GET /api/appointments
 * 获取预约列表
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const studentId = searchParams.get("studentId") || undefined;
    const teacherId = searchParams.get("teacherId") || undefined;
    const status = searchParams.get("status") as any;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    // 日期范围
    const startDateStr = searchParams.get("startDate");
    const endDateStr = searchParams.get("endDate");
    const startDate = startDateStr ? new Date(startDateStr) : undefined;
    const endDate = endDateStr ? new Date(endDateStr) : undefined;

    const result = await getAppointments({
      studentId,
      teacherId,
      status,
      startDate,
      endDate,
      page,
      limit,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("[API] Get appointments error:", error);
    return NextResponse.json(
      { success: false, message: "获取预约列表失败" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/appointments
 * 创建预约
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 验证必填字段
    if (!body.studentId || !body.date || !body.timeSlot) {
      return NextResponse.json(
        { success: false, message: "学生ID、日期和时段不能为空" },
        { status: 400 }
      );
    }

    const result = await createAppointment({
      studentId: body.studentId,
      teacherId: body.teacherId,
      roomId: body.roomId,
      type: body.type || AppointmentType.COUNSELING,
      date: new Date(body.date),
      timeSlot: body.timeSlot,
      reason: body.reason,
    });

    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("[API] Create appointment error:", error);
    return NextResponse.json(
      { success: false, message: "创建预约失败" },
      { status: 500 }
    );
  }
}
