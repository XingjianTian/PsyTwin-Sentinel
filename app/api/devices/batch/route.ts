import { NextRequest, NextResponse } from "next/server";
import { batchUpdateDeviceStatus } from "@/app/actions/devices";

/**
 * POST /api/devices/batch
 * 批量更新设备状态（用于设备心跳）
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!Array.isArray(body.updates)) {
      return NextResponse.json(
        { success: false, message: "updates 必须是数组" },
        { status: 400 }
      );
    }

    const result = await batchUpdateDeviceStatus(body.updates);

    return NextResponse.json(result);
  } catch (error) {
    console.error("[API] Batch update devices error:", error);
    return NextResponse.json(
      { success: false, message: "批量更新失败" },
      { status: 500 }
    );
  }
}
