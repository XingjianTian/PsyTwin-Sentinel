import { NextRequest, NextResponse } from "next/server";
import {
  getDeviceById,
  updateDevice,
  deleteDevice,
  updateDeviceStatus,
} from "@/app/actions/devices";
import { DeviceStatus } from "@prisma/client";

/**
 * GET /api/devices/[id]
 * 获取设备详情
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const result = await getDeviceById(params.id);

    if (!result.success) {
      return NextResponse.json(result, { status: 404 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("[API] Get device detail error:", error);
    return NextResponse.json(
      { success: false, message: "获取设备详情失败" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/devices/[id]
 * 更新设备
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    const result = await updateDevice(params.id, {
      name: body.name,
      status: body.status,
      battery: body.battery,
      room: body.room,
      location: body.location,
      lastActive: body.lastActive,
      lastSync: body.lastSync,
    });

    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("[API] Update device error:", error);
    return NextResponse.json(
      { success: false, message: "更新设备失败" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/devices/[id]
 * 删除设备
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const result = await deleteDevice(params.id);

    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("[API] Delete device error:", error);
    return NextResponse.json(
      { success: false, message: "删除设备失败" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/devices/[id]/status
 * 更新设备状态
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");

    if (action === "status") {
      const body = await request.json();
      const result = await updateDeviceStatus(
        params.id,
        body.status as DeviceStatus,
        body.battery
      );
      return NextResponse.json(result);
    }

    return NextResponse.json(
      { success: false, message: "未知操作" },
      { status: 400 }
    );
  } catch (error) {
    console.error("[API] Device action error:", error);
    return NextResponse.json(
      { success: false, message: "操作失败" },
      { status: 500 }
    );
  }
}
