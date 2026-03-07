import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * GET /api/rooms
 * 获取房间列表
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type"); // 'counseling', 'vr', 'relaxation'
    const status = searchParams.get("status");

    // 构建查询条件
    const where: any = {};
    
    if (status) {
      where.status = status.toUpperCase();
    }

    // 获取房间列表，包含关联的设备
    const rooms = await prisma.consultationRoom.findMany({
      where,
      include: {
        currentStudent: {
          select: {
            id: true,
            name: true,
            studentNo: true,
          },
        },
        roomDevices: {
          include: {
            device: {
              select: {
                id: true,
                name: true,
                type: true,
                status: true,
                battery: true,
              },
            },
          },
        },
      },
      orderBy: { name: "asc" },
    });

    // 格式化房间数据
    const formattedRooms = rooms.map((room) => {
      // 按类型分组设备
      const vrDevice = room.roomDevices.find((rd) => rd.device.type === "VR")?.device;
      const braceletDevice = room.roomDevices.find((rd) => rd.device.type === "BRACELET")?.device;
      const eegDevice = room.roomDevices.find((rd) => rd.device.type === "EEG")?.device;

      return {
        id: room.id,
        name: room.name,
        location: room.location,
        status: room.status.toLowerCase(),
        capacity: room.capacity,
        currentStudent: room.currentStudent,
        devices: {
          vr: vrDevice || { name: "无", status: "offline" },
          bracelet: braceletDevice || { name: "无", status: "offline" },
          eeg: eegDevice || { name: "无", status: "offline" },
        },
      };
    });

    // 根据类型筛选
    let filteredRooms = formattedRooms;
    if (type) {
      switch (type) {
        case 'counseling':
          filteredRooms = formattedRooms.filter(r => r.name.includes('心理咨询室'));
          break;
        case 'vr':
          filteredRooms = formattedRooms.filter(r => r.name.includes('VR体验区'));
          break;
        case 'relaxation':
          filteredRooms = formattedRooms.filter(r => r.name.includes('减压舱'));
          break;
      }
    }

    return NextResponse.json({
      success: true,
      data: filteredRooms,
      total: filteredRooms.length,
    });
  } catch (error) {
    console.error("[API] Get rooms error:", error);
    return NextResponse.json(
      { success: false, message: "获取房间列表失败" },
      { status: 500 }
    );
  }
}
