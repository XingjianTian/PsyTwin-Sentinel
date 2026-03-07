import { NextRequest, NextResponse } from "next/server";
import {
  assignDeviceToRoom,
  removeDeviceFromRoom,
} from "@/app/actions/devices";

/**
 * POST /api/devices/[id]/room
 * 分配设备到房间
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    if (!body.roomId) {
      return NextResponse.json(
        { success: false, message: "房间ID不能为空" },
        { status: 400 }
      );
    }

    const result = await assignDeviceToRoom(params.id, body.roomId);

    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("[API] Assign device to room error:", error);
    return NextResponse.json(
      { success: false, message: "分配设备失败" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/devices/[id]/room
 * 从房间移除设备
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const roomId = searchParams.get("roomId");

    if (!roomId) {
      return NextResponse.json(
        { success: false, message: "房间ID不能为空" },
        { status: 400 }
      );
    }

    const result = await removeDeviceFromRoom(params.id, roomId);

    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("[API] Remove device from room error:", error);
    return NextResponse.json(
      { success: false, message: "移除设备失败" },
      { status: 500 }
    );
  }
}
