import { NextRequest, NextResponse } from "next/server";
import {
  getDevices,
  createDevice,
  getDeviceStats,
} from "@/app/actions/devices";
import { DeviceType, DeviceStatus } from "@prisma/client";

/**
 * GET /api/devices
 * 获取设备列表
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const type = searchParams.get("type") as DeviceType | undefined;
    const status = searchParams.get("status") as DeviceStatus | undefined;
    const room = searchParams.get("room") || undefined;
    const search = searchParams.get("search") || undefined;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const stats = searchParams.get("stats");

    // 获取统计信息
    if (stats === "true") {
      const result = await getDeviceStats();
      return NextResponse.json(result);
    }

    const result = await getDevices({
      type,
      status,
      room,
      search,
      page,
      limit,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("[API] Get devices error:", error);
    return NextResponse.json(
      { success: false, message: "获取设备列表失败" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/devices
 * 创建设备
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 验证必填字段
    if (!body.name || !body.serialNumber || !body.type) {
      return NextResponse.json(
        { success: false, message: "设备名称、序列号和类型不能为空" },
        { status: 400 }
      );
    }

    const result = await createDevice({
      name: body.name,
      serialNumber: body.serialNumber,
      type: body.type as DeviceType,
      model: body.model,
      status: body.status as DeviceStatus,
      battery: body.battery,
      room: body.room,
      location: body.location,
    });

    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("[API] Create device error:", error);
    return NextResponse.json(
      { success: false, message: "创建设备失败" },
      { status: 500 }
    );
  }
}
