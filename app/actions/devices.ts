"use server";

import { prisma } from "@/lib/db";
import { DeviceStatus, DeviceType, Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";

export interface CreateDeviceInput {
  name: string;
  serialNumber: string;
  type: DeviceType;
  model?: string;
  status?: DeviceStatus;
  battery?: number;
  room?: string;
  location?: string;
}

export interface UpdateDeviceInput {
  name?: string;
  status?: DeviceStatus;
  battery?: number;
  room?: string;
  location?: string;
  lastActive?: string;
  lastSync?: string;
}

export interface DeviceFilter {
  type?: DeviceType;
  status?: DeviceStatus;
  room?: string;
  search?: string;
  page?: number;
  limit?: number;
}

/**
 * 创建设备
 */
export async function createDevice(input: CreateDeviceInput) {
  try {
    // 检查序列号是否已存在
    const existingDevice = await prisma.device.findUnique({
      where: { serialNumber: input.serialNumber },
    });

    if (existingDevice) {
      return {
        success: false,
        message: "设备序列号已存在",
      };
    }

    const device = await prisma.device.create({
      data: {
        name: input.name,
        serialNumber: input.serialNumber,
        type: input.type,
        model: input.model,
        status: input.status || DeviceStatus.OFFLINE,
        battery: input.battery,
        room: input.room,
        location: input.location,
      },
    });

    revalidatePath("/device-appointments");

    return {
      success: true,
      message: "设备创建成功",
      data: device,
    };
  } catch (error) {
    console.error("[Device] Create error:", error);
    return {
      success: false,
      message: "设备创建失败",
    };
  }
}

/**
 * 更新设备
 */
export async function updateDevice(id: string, input: UpdateDeviceInput) {
  try {
    const device = await prisma.device.update({
      where: { id },
      data: {
        ...input,
        updatedAt: new Date(),
      },
    });

    revalidatePath("/device-appointments");

    return {
      success: true,
      message: "设备更新成功",
      data: device,
    };
  } catch (error) {
    console.error("[Device] Update error:", error);
    return {
      success: false,
      message: "设备更新失败",
    };
  }
}

/**
 * 删除设备
 */
export async function deleteDevice(id: string) {
  try {
    // 先删除关联的 RoomDevice 记录
    await prisma.roomDevice.deleteMany({
      where: { deviceId: id },
    });

    await prisma.device.delete({
      where: { id },
    });

    revalidatePath("/device-appointments");

    return {
      success: true,
      message: "设备已删除",
    };
  } catch (error) {
    console.error("[Device] Delete error:", error);
    return {
      success: false,
      message: "删除设备失败",
    };
  }
}

/**
 * 获取设备列表
 */
export async function getDevices(filter: DeviceFilter = {}) {
  try {
    const {
      type,
      status,
      room,
      search,
      page = 1,
      limit = 20,
    } = filter;

    const where: Prisma.DeviceWhereInput = {
      AND: [
        type ? { type } : {},
        status ? { status } : {},
        room ? { room } : {},
        search
          ? {
              OR: [
                { name: { contains: search, mode: "insensitive" } },
                { serialNumber: { contains: search, mode: "insensitive" } },
                { model: { contains: search, mode: "insensitive" } },
              ],
            }
          : {},
      ],
    };

    const [devices, total] = await Promise.all([
      prisma.device.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.device.count({ where }),
    ]);

    return {
      success: true,
      data: devices,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  } catch (error) {
    console.error("[Device] Get list error:", error);
    return {
      success: false,
      message: "获取设备列表失败",
      data: [],
      total: 0,
      page: 1,
      totalPages: 0,
    };
  }
}

/**
 * 获取设备详情
 */
export async function getDeviceById(id: string) {
  try {
    const device = await prisma.device.findUnique({
      where: { id },
      include: {
        roomDevices: {
          include: {
            room: {
              select: {
                id: true,
                name: true,
                location: true,
              },
            },
          },
        },
      },
    });

    if (!device) {
      return {
        success: false,
        message: "设备不存在",
      };
    }

    return {
      success: true,
      data: device,
    };
  } catch (error) {
    console.error("[Device] Get detail error:", error);
    return {
      success: false,
      message: "获取设备详情失败",
    };
  }
}

/**
 * 更新设备状态
 */
export async function updateDeviceStatus(
  id: string,
  status: DeviceStatus,
  battery?: number
) {
  try {
    const updateData: Prisma.DeviceUpdateInput = {
      status,
      updatedAt: new Date(),
    };

    if (battery !== undefined) {
      updateData.battery = battery;
    }

    if (status === DeviceStatus.ONLINE || status === DeviceStatus.IN_USE) {
      updateData.lastActive = new Date().toISOString();
    }

    const device = await prisma.device.update({
      where: { id },
      data: updateData,
    });

    revalidatePath("/device-appointments");

    return {
      success: true,
      message: "设备状态已更新",
      data: device,
    };
  } catch (error) {
    console.error("[Device] Update status error:", error);
    return {
      success: false,
      message: "更新设备状态失败",
    };
  }
}

/**
 * 分配设备到房间
 */
export async function assignDeviceToRoom(deviceId: string, roomId: string) {
  try {
    // 检查是否已分配
    const existing = await prisma.roomDevice.findFirst({
      where: {
        deviceId,
        roomId,
      },
    });

    if (existing) {
      return {
        success: false,
        message: "设备已分配到此房间",
      };
    }

    // 先移除设备在其他房间的分配
    await prisma.roomDevice.deleteMany({
      where: { deviceId },
    });

    // 创建新的分配
    const roomDevice = await prisma.roomDevice.create({
      data: {
        deviceId,
        roomId,
      },
      include: {
        room: {
          select: {
            id: true,
            name: true,
            location: true,
          },
        },
        device: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
      },
    });

    // 更新设备房间信息
    await prisma.device.update({
      where: { id: deviceId },
      data: { room: roomDevice.room.name },
    });

    revalidatePath("/device-appointments");

    return {
      success: true,
      message: "设备分配成功",
      data: roomDevice,
    };
  } catch (error) {
    console.error("[Device] Assign to room error:", error);
    return {
      success: false,
      message: "分配设备失败",
    };
  }
}

/**
 * 从房间移除设备
 */
export async function removeDeviceFromRoom(deviceId: string, roomId: string) {
  try {
    await prisma.roomDevice.deleteMany({
      where: {
        deviceId,
        roomId,
      },
    });

    // 清除设备房间信息
    await prisma.device.update({
      where: { id: deviceId },
      data: { room: null },
    });

    revalidatePath("/device-appointments");

    return {
      success: true,
      message: "设备已从房间移除",
    };
  } catch (error) {
    console.error("[Device] Remove from room error:", error);
    return {
      success: false,
      message: "移除设备失败",
    };
  }
}

/**
 * 获取设备统计
 */
export async function getDeviceStats() {
  try {
    const [
      total,
      online,
      offline,
      inUse,
      maintenance,
      vrCount,
      braceletCount,
      eegCount,
    ] = await Promise.all([
      prisma.device.count(),
      prisma.device.count({ where: { status: DeviceStatus.ONLINE } }),
      prisma.device.count({ where: { status: DeviceStatus.OFFLINE } }),
      prisma.device.count({ where: { status: DeviceStatus.IN_USE } }),
      prisma.device.count({ where: { status: DeviceStatus.MAINTENANCE } }),
      prisma.device.count({ where: { type: DeviceType.VR } }),
      prisma.device.count({ where: { type: DeviceType.BRACELET } }),
      prisma.device.count({ where: { type: DeviceType.EEG } }),
    ]);

    return {
      success: true,
      data: {
        total,
        online,
        offline,
        inUse,
        maintenance,
        byType: {
          vr: vrCount,
          bracelet: braceletCount,
          eeg: eegCount,
        },
      },
    };
  } catch (error) {
    console.error("[Device] Get stats error:", error);
    return {
      success: false,
      message: "获取设备统计失败",
    };
  }
}

/**
 * 批量更新设备状态（心跳）
 */
export async function batchUpdateDeviceStatus(
  updates: Array<{
    id: string;
    status: DeviceStatus;
    battery?: number;
  }>
) {
  try {
    const results = await Promise.all(
      updates.map(async (update) => {
        try {
          await prisma.device.update({
            where: { id: update.id },
            data: {
              status: update.status,
              battery: update.battery,
              lastActive: new Date().toISOString(),
              updatedAt: new Date(),
            },
          });
          return { id: update.id, success: true };
        } catch {
          return { id: update.id, success: false };
        }
      })
    );

    return {
      success: true,
      data: results,
    };
  } catch (error) {
    console.error("[Device] Batch update error:", error);
    return {
      success: false,
      message: "批量更新失败",
    };
  }
}
