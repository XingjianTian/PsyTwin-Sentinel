"use server";

import { prisma } from "@/lib/db";
import { AppointmentStatus, AppointmentType, Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";

export interface CreateAppointmentInput {
  studentId: string;
  teacherId?: string;
  roomId?: string;
  type: AppointmentType;
  date: Date;
  timeSlot: string;
  reason?: string;
}

export interface UpdateAppointmentInput {
  status?: AppointmentStatus;
  cancelReason?: string;
  meetingLink?: string;
  feedbackScore?: number;
  feedbackContent?: string;
}

export interface AppointmentFilter {
  studentId?: string;
  teacherId?: string;
  status?: AppointmentStatus;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
}

/**
 * 创建预约
 */
export async function createAppointment(input: CreateAppointmentInput) {
  try {
    // 检查时间冲突
    const existingAppointment = await prisma.appointment.findFirst({
      where: {
        teacherId: input.teacherId,
        date: input.date,
        timeSlot: input.timeSlot,
        status: {
          in: [AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED],
        },
      },
    });

    if (existingAppointment) {
      return {
        success: false,
        message: "该时段已被预约，请选择其他时间",
      };
    }

    const appointment = await prisma.appointment.create({
      data: {
        studentId: input.studentId,
        teacherId: input.teacherId,
        roomId: input.roomId,
        type: input.type,
        date: input.date,
        timeSlot: input.timeSlot,
        reason: input.reason,
        status: AppointmentStatus.PENDING,
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            studentNo: true,
            className: true,
          },
        },
        teacher: {
          select: {
            id: true,
            name: true,
            title: true,
          },
        },
      },
    });

    revalidatePath("/device-appointments");
    revalidatePath("/interventions");

    return {
      success: true,
      message: "预约创建成功",
      data: appointment,
    };
  } catch (error) {
    console.error("[Appointment] Create error:", error);
    return {
      success: false,
      message: "预约创建失败",
    };
  }
}

/**
 * 更新预约
 */
export async function updateAppointment(
  id: string,
  input: UpdateAppointmentInput
) {
  try {
    const appointment = await prisma.appointment.update({
      where: { id },
      data: {
        ...input,
        updatedAt: new Date(),
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            studentNo: true,
            className: true,
          },
        },
        teacher: {
          select: {
            id: true,
            name: true,
            title: true,
          },
        },
      },
    });

    revalidatePath("/device-appointments");
    revalidatePath("/interventions");

    return {
      success: true,
      message: "预约更新成功",
      data: appointment,
    };
  } catch (error) {
    console.error("[Appointment] Update error:", error);
    return {
      success: false,
      message: "预约更新失败",
    };
  }
}

/**
 * 取消预约
 */
export async function cancelAppointment(id: string, cancelReason: string) {
  try {
    const appointment = await prisma.appointment.update({
      where: { id },
      data: {
        status: AppointmentStatus.CANCELLED,
        cancelReason,
        updatedAt: new Date(),
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
          },
        },
        teacher: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    revalidatePath("/device-appointments");

    return {
      success: true,
      message: "预约已取消",
      data: appointment,
    };
  } catch (error) {
    console.error("[Appointment] Cancel error:", error);
    return {
      success: false,
      message: "取消预约失败",
    };
  }
}

/**
 * 确认预约
 */
export async function confirmAppointment(id: string) {
  try {
    const appointment = await prisma.appointment.update({
      where: { id },
      data: {
        status: AppointmentStatus.CONFIRMED,
        updatedAt: new Date(),
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
          },
        },
        teacher: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    revalidatePath("/device-appointments");

    return {
      success: true,
      message: "预约已确认",
      data: appointment,
    };
  } catch (error) {
    console.error("[Appointment] Confirm error:", error);
    return {
      success: false,
      message: "确认预约失败",
    };
  }
}

/**
 * 完成预约
 */
export async function completeAppointment(
  id: string,
  feedbackScore?: number,
  feedbackContent?: string
) {
  try {
    const appointment = await prisma.appointment.update({
      where: { id },
      data: {
        status: AppointmentStatus.COMPLETED,
        feedbackScore,
        feedbackContent,
        updatedAt: new Date(),
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
          },
        },
        teacher: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    revalidatePath("/device-appointments");
    revalidatePath("/interventions");

    return {
      success: true,
      message: "预约已完成",
      data: appointment,
    };
  } catch (error) {
    console.error("[Appointment] Complete error:", error);
    return {
      success: false,
      message: "完成预约失败",
    };
  }
}

/**
 * 获取预约列表
 */
export async function getAppointments(filter: AppointmentFilter = {}) {
  try {
    const {
      studentId,
      teacherId,
      status,
      startDate,
      endDate,
      page = 1,
      limit = 20,
    } = filter;

    const where: Prisma.AppointmentWhereInput = {
      AND: [
        studentId ? { studentId } : {},
        teacherId ? { teacherId } : {},
        status ? { status } : {},
        startDate || endDate
          ? {
              date: {
                gte: startDate,
                lte: endDate,
              },
            }
          : {},
      ],
    };

    const [appointments, total] = await Promise.all([
      prisma.appointment.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { date: "desc" },
        include: {
          student: {
            select: {
              id: true,
              name: true,
              studentNo: true,
              className: true,
              riskLevel: true,
            },
          },
          teacher: {
            select: {
              id: true,
              name: true,
              title: true,
              department: true,
            },
          },
        },
      }),
      prisma.appointment.count({ where }),
    ]);

    return {
      success: true,
      data: appointments,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  } catch (error) {
    console.error("[Appointment] Get list error:", error);
    return {
      success: false,
      message: "获取预约列表失败",
      data: [],
      total: 0,
      page: 1,
      totalPages: 0,
    };
  }
}

/**
 * 获取预约详情
 */
export async function getAppointmentById(id: string) {
  try {
    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            studentNo: true,
            className: true,
            gender: true,
            phone: true,
            riskLevel: true,
          },
        },
        teacher: {
          select: {
            id: true,
            name: true,
            title: true,
            department: true,
            phone: true,
          },
        },
      },
    });

    if (!appointment) {
      return {
        success: false,
        message: "预约不存在",
      };
    }

    return {
      success: true,
      data: appointment,
    };
  } catch (error) {
    console.error("[Appointment] Get detail error:", error);
    return {
      success: false,
      message: "获取预约详情失败",
    };
  }
}

/**
 * 获取教师的可预约时段
 */
export async function getTeacherAvailableSlots(
  teacherId: string,
  date: Date
) {
  try {
    // 获取教师排班
    const dayOfWeek = date.getDay();
    const schedules = await prisma.schedule.findMany({
      where: {
        teacherId,
        dayOfWeek,
        isAvailable: true,
      },
    });

    // 获取该日期已有预约
    const existingAppointments = await prisma.appointment.findMany({
      where: {
        teacherId,
        date: {
          gte: new Date(date.setHours(0, 0, 0, 0)),
          lt: new Date(date.setHours(23, 59, 59, 999)),
        },
        status: {
          in: [AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED],
        },
      },
      select: {
        timeSlot: true,
      },
    });

    const bookedSlots = existingAppointments.map((a) => a.timeSlot);

    // 生成可用时段
    const availableSlots: string[] = [];
    for (const schedule of schedules) {
      // 简单处理：假设每个时段50分钟
      const slots = generateTimeSlots(schedule.startTime, schedule.endTime, 50);
      availableSlots.push(...slots.filter((slot) => !bookedSlots.includes(slot)));
    }

    return {
      success: true,
      data: availableSlots,
    };
  } catch (error) {
    console.error("[Appointment] Get available slots error:", error);
    return {
      success: false,
      message: "获取可用时段失败",
      data: [],
    };
  }
}

/**
 * 生成时段列表
 */
function generateTimeSlots(
  startTime: string,
  endTime: string,
  durationMinutes: number
): string[] {
  const slots: string[] = [];
  const [startHour, startMin] = startTime.split(":").map(Number);
  const [endHour, endMin] = endTime.split(":").map(Number);

  let currentHour = startHour;
  let currentMin = startMin;

  while (
    currentHour < endHour ||
    (currentHour === endHour && currentMin < endMin)
  ) {
    const slotStart = `${String(currentHour).padStart(2, "0")}:${String(
      currentMin
    ).padStart(2, "0")}`;

    // 计算结束时间
    let endHourCalc = currentHour;
    let endMinCalc = currentMin + durationMinutes;
    if (endMinCalc >= 60) {
      endHourCalc += Math.floor(endMinCalc / 60);
      endMinCalc = endMinCalc % 60;
    }

    const slotEnd = `${String(endHourCalc).padStart(2, "0")}:${String(
      endMinCalc
    ).padStart(2, "0")}`;

    // 检查是否超出结束时间
    if (endHourCalc < endHour || (endHourCalc === endHour && endMinCalc <= endMin)) {
      slots.push(`${slotStart}-${slotEnd}`);
    }

    // 下一个时段（假设间隔10分钟）
    currentMin += durationMinutes + 10;
    if (currentMin >= 60) {
      currentHour += Math.floor(currentMin / 60);
      currentMin = currentMin % 60;
    }
  }

  return slots;
}

/**
 * 删除预约
 */
export async function deleteAppointment(id: string) {
  try {
    await prisma.appointment.delete({
      where: { id },
    });

    revalidatePath("/device-appointments");

    return {
      success: true,
      message: "预约已删除",
    };
  } catch (error) {
    console.error("[Appointment] Delete error:", error);
    return {
      success: false,
      message: "删除预约失败",
    };
  }
}
