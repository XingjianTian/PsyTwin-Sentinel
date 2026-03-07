import { NextRequest, NextResponse } from "next/server";
import {
  getAppointmentById,
  updateAppointment,
  cancelAppointment,
  confirmAppointment,
  completeAppointment,
  deleteAppointment,
} from "@/app/actions/appointments";

/**
 * GET /api/appointments/[id]
 * 获取预约详情
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const result = await getAppointmentById(params.id);

    if (!result.success) {
      return NextResponse.json(result, { status: 404 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("[API] Get appointment detail error:", error);
    return NextResponse.json(
      { success: false, message: "获取预约详情失败" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/appointments/[id]
 * 更新预约（通用更新）
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    const result = await updateAppointment(params.id, {
      status: body.status,
      cancelReason: body.cancelReason,
      meetingLink: body.meetingLink,
      feedbackScore: body.feedbackScore,
      feedbackContent: body.feedbackContent,
    });

    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("[API] Update appointment error:", error);
    return NextResponse.json(
      { success: false, message: "更新预约失败" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/appointments/[id]/confirm
 * 确认预约
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");

    if (action === "confirm") {
      const result = await confirmAppointment(params.id);
      return NextResponse.json(result);
    }

    if (action === "cancel") {
      const body = await request.json();
      const result = await cancelAppointment(params.id, body.cancelReason || "");
      return NextResponse.json(result);
    }

    if (action === "complete") {
      const body = await request.json();
      const result = await completeAppointment(
        params.id,
        body.feedbackScore,
        body.feedbackContent
      );
      return NextResponse.json(result);
    }

    return NextResponse.json(
      { success: false, message: "未知操作" },
      { status: 400 }
    );
  } catch (error) {
    console.error("[API] Appointment action error:", error);
    return NextResponse.json(
      { success: false, message: "操作失败" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/appointments/[id]
 * 删除预约
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const result = await deleteAppointment(params.id);

    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("[API] Delete appointment error:", error);
    return NextResponse.json(
      { success: false, message: "删除预约失败" },
      { status: 500 }
    );
  }
}
