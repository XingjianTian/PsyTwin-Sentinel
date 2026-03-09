import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * GET /api/rooms
 * 获取房间列表
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const status = searchParams.get("status");

    const where: any = {};
    if (status) {
      where.status = status.toUpperCase();
    }

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

    const formattedRooms = rooms.map((room) => {
      const vrDevice = room.roomDevices.find((rd) => rd.device.type === "VR")?.device;
      const braceletDevice = room.roomDevices.find((rd) => rd.device.type === "BRACELET")?.device;
      const eegDevice = room.roomDevices.find((rd) => rd.device.type === "EEG")?.device;

      let currentSession = null;
      if (room.status === "IN_USE" && room.currentStudent) {
        const topics = ["社交焦虑脱敏", "情绪管理", "压力缓解", "人际沟通", "睡眠改善"];
        const topic = topics[Math.floor(Math.random() * topics.length)];
        
        currentSession = {
          id: `session-${room.id}`,
          student: {
            id: room.currentStudent.id,
            name: room.currentStudent.name,
            studentNo: room.currentStudent.studentNo || "",
          },
          type: "COUNSELING",
          topic: topic,
          startTime: new Date().toISOString(),
          duration: 25,
        };
      }

      return {
        id: room.id,
        name: room.name,
        location: room.location,
        status: room.status.toLowerCase(),
        capacity: room.capacity,
        currentSession,
        devices: {
          vr: vrDevice || { name: "无", status: "offline" },
          bracelet: braceletDevice || { name: "无", status: "offline" },
          eeg: eegDevice || { name: "无", status: "offline" },
        },
      };
    });

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
