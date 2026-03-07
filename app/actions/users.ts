"use server";

import { prisma } from "@/lib/db";
import { UserRole, TeacherStatus, UserStatus } from "@prisma/client";
import { hashPassword } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { maskPhone, maskEmail } from "@/lib/sanitization";

export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface CreateTeacherInput {
  teacherId: string;
  name: string;
  phone: string;
  password: string;
  department: string;
  title: string;
  role?: UserRole;
  qualifications?: string[];
}

export interface UpdateUserInput {
  name?: string;
  email?: string;
  role?: UserRole;
  status?: UserStatus;
  avatar?: string;
}

export interface UpdateTeacherInput {
  name?: string;
  phone?: string;
  department?: string;
  title?: string;
  role?: UserRole;
  status?: TeacherStatus;
  qualifications?: string[];
  avatar?: string;
}

export interface UserFilter {
  role?: UserRole;
  status?: UserStatus;
  search?: string;
  page?: number;
  limit?: number;
}

export interface TeacherFilter {
  department?: string;
  role?: UserRole;
  status?: TeacherStatus;
  search?: string;
  page?: number;
  limit?: number;
}

/**
 * 创建系统用户
 */
export async function createUser(input: CreateUserInput) {
  try {
    // 检查邮箱是否已存在
    const existingUser = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (existingUser) {
      return {
        success: false,
        message: "该邮箱已被注册",
      };
    }

    const passwordHash = await hashPassword(input.password);

    const user = await prisma.user.create({
      data: {
        email: input.email,
        name: input.name,
        passwordHash,
        role: input.role,
        status: UserStatus.ACTIVE,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });

    revalidatePath("/system-settings");

    return {
      success: true,
      message: "用户创建成功",
      data: user,
    };
  } catch (error) {
    console.error("[User] Create error:", error);
    return {
      success: false,
      message: "用户创建失败",
    };
  }
}

/**
 * 创建教师用户
 */
export async function createTeacher(input: CreateTeacherInput) {
  try {
    // 检查工号是否已存在
    const existingTeacher = await prisma.teacher.findUnique({
      where: { teacherId: input.teacherId },
    });

    if (existingTeacher) {
      return {
        success: false,
        message: "该工号已被使用",
      };
    }

    // 检查手机号是否已存在
    const existingPhone = await prisma.teacher.findUnique({
      where: { phone: input.phone },
    });

    if (existingPhone) {
      return {
        success: false,
        message: "该手机号已被注册",
      };
    }

    const passwordHash = await hashPassword(input.password);

    const teacher = await prisma.teacher.create({
      data: {
        teacherId: input.teacherId,
        name: input.name,
        phone: input.phone,
        passwordHash,
        department: input.department,
        title: input.title,
        role: input.role || UserRole.TEACHER,
        status: TeacherStatus.ACTIVE,
        qualifications: input.qualifications || [],
      },
      select: {
        id: true,
        teacherId: true,
        name: true,
        phone: true,
        department: true,
        title: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });

    revalidatePath("/system-settings");

    return {
      success: true,
      message: "教师创建成功",
      data: teacher,
    };
  } catch (error) {
    console.error("[Teacher] Create error:", error);
    return {
      success: false,
      message: "教师创建失败",
    };
  }
}

/**
 * 更新系统用户
 */
export async function updateUser(id: string, input: UpdateUserInput) {
  try {
    // 如果更新邮箱，检查是否重复
    if (input.email) {
      const existingUser = await prisma.user.findFirst({
        where: {
          email: input.email,
          NOT: { id },
        },
      });

      if (existingUser) {
        return {
          success: false,
          message: "该邮箱已被其他用户使用",
        };
      }
    }

    const user = await prisma.user.update({
      where: { id },
      data: {
        ...input,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        avatar: true,
        updatedAt: true,
      },
    });

    revalidatePath("/system-settings");

    return {
      success: true,
      message: "用户更新成功",
      data: user,
    };
  } catch (error) {
    console.error("[User] Update error:", error);
    return {
      success: false,
      message: "用户更新失败",
    };
  }
}

/**
 * 更新教师用户
 */
export async function updateTeacher(id: string, input: UpdateTeacherInput) {
  try {
    // 如果更新手机号，检查是否重复
    if (input.phone) {
      const existingTeacher = await prisma.teacher.findFirst({
        where: {
          phone: input.phone,
          NOT: { id },
        },
      });

      if (existingTeacher) {
        return {
          success: false,
          message: "该手机号已被其他教师使用",
        };
      }
    }

    const teacher = await prisma.teacher.update({
      where: { id },
      data: {
        ...input,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        teacherId: true,
        name: true,
        phone: true,
        department: true,
        title: true,
        role: true,
        status: true,
        qualifications: true,
        avatar: true,
        updatedAt: true,
      },
    });

    revalidatePath("/system-settings");

    return {
      success: true,
      message: "教师更新成功",
      data: teacher,
    };
  } catch (error) {
    console.error("[Teacher] Update error:", error);
    return {
      success: false,
      message: "教师更新失败",
    };
  }
}

/**
 * 删除系统用户
 */
export async function deleteUser(id: string) {
  try {
    await prisma.user.delete({
      where: { id },
    });

    revalidatePath("/system-settings");

    return {
      success: true,
      message: "用户已删除",
    };
  } catch (error) {
    console.error("[User] Delete error:", error);
    return {
      success: false,
      message: "删除用户失败",
    };
  }
}

/**
 * 删除教师用户
 */
export async function deleteTeacher(id: string) {
  try {
    // 检查是否有未完成的预约
    const pendingAppointments = await prisma.appointment.count({
      where: {
        teacherId: id,
        status: {
          in: ["PENDING", "CONFIRMED"],
        },
      },
    });

    if (pendingAppointments > 0) {
      return {
        success: false,
        message: `该教师有 ${pendingAppointments} 个未完成预约，请先处理`,
      };
    }

    await prisma.teacher.delete({
      where: { id },
    });

    revalidatePath("/system-settings");

    return {
      success: true,
      message: "教师已删除",
    };
  } catch (error) {
    console.error("[Teacher] Delete error:", error);
    return {
      success: false,
      message: "删除教师失败",
    };
  }
}

/**
 * 获取系统用户列表
 */
export async function getUsers(filter: UserFilter = {}) {
  try {
    const { role, status, search, page = 1, limit = 20 } = filter;

    const where: any = {
      AND: [
        role ? { role } : {},
        status ? { status } : {},
        search
          ? {
              OR: [
                { name: { contains: search, mode: "insensitive" } },
                { email: { contains: search, mode: "insensitive" } },
              ],
            }
          : {},
      ],
    };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          status: true,
          avatar: true,
          lastLoginAt: true,
          createdAt: true,
        },
      }),
      prisma.user.count({ where }),
    ]);

    return {
      success: true,
      data: users,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  } catch (error) {
    console.error("[User] Get list error:", error);
    return {
      success: false,
      message: "获取用户列表失败",
      data: [],
      total: 0,
      page: 1,
      totalPages: 0,
    };
  }
}

/**
 * 获取教师用户列表
 */
export async function getTeachers(filter: TeacherFilter = {}) {
  try {
    const {
      department,
      role,
      status,
      search,
      page = 1,
      limit = 20,
    } = filter;

    const where: any = {
      AND: [
        department ? { department } : {},
        role ? { role } : {},
        status ? { status } : {},
        search
          ? {
              OR: [
                { name: { contains: search, mode: "insensitive" } },
                { teacherId: { contains: search, mode: "insensitive" } },
                { phone: { contains: search } },
              ],
            }
          : {},
      ],
    };

    const [teachers, total] = await Promise.all([
      prisma.teacher.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          teacherId: true,
          name: true,
          phone: true,
          department: true,
          title: true,
          role: true,
          status: true,
          qualifications: true,
          avatar: true,
          lastLoginAt: true,
          createdAt: true,
          _count: {
            select: {
              appointments: true,
              warnings: true,
            },
          },
        },
      }),
      prisma.teacher.count({ where }),
    ]);

    return {
      success: true,
      data: teachers,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  } catch (error) {
    console.error("[Teacher] Get list error:", error);
    return {
      success: false,
      message: "获取教师列表失败",
      data: [],
      total: 0,
      page: 1,
      totalPages: 0,
    };
  }
}

/**
 * 获取系统用户详情
 */
export async function getUserById(id: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        avatar: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return {
        success: false,
        message: "用户不存在",
      };
    }

    return {
      success: true,
      data: user,
    };
  } catch (error) {
    console.error("[User] Get detail error:", error);
    return {
      success: false,
      message: "获取用户详情失败",
    };
  }
}

/**
 * 获取教师用户详情
 */
export async function getTeacherById(id: string) {
  try {
    const teacher = await prisma.teacher.findUnique({
      where: { id },
      select: {
        id: true,
        teacherId: true,
        name: true,
        phone: true,
        department: true,
        title: true,
        role: true,
        status: true,
        qualifications: true,
        avatar: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
        appointments: {
          select: {
            id: true,
            date: true,
            status: true,
            student: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: { date: "desc" },
          take: 10,
        },
        _count: {
          select: {
            appointments: true,
            warnings: true,
          },
        },
      },
    });

    if (!teacher) {
      return {
        success: false,
        message: "教师不存在",
      };
    }

    return {
      success: true,
      data: teacher,
    };
  } catch (error) {
    console.error("[Teacher] Get detail error:", error);
    return {
      success: false,
      message: "获取教师详情失败",
    };
  }
}

/**
 * 重置用户密码
 */
export async function resetUserPassword(id: string, newPassword: string) {
  try {
    const passwordHash = await hashPassword(newPassword);

    await prisma.user.update({
      where: { id },
      data: {
        passwordHash,
        updatedAt: new Date(),
      },
    });

    return {
      success: true,
      message: "密码重置成功",
    };
  } catch (error) {
    console.error("[User] Reset password error:", error);
    return {
      success: false,
      message: "密码重置失败",
    };
  }
}

/**
 * 重置教师密码
 */
export async function resetTeacherPassword(id: string, newPassword: string) {
  try {
    const passwordHash = await hashPassword(newPassword);

    await prisma.teacher.update({
      where: { id },
      data: {
        passwordHash,
        updatedAt: new Date(),
      },
    });

    return {
      success: true,
      message: "密码重置成功",
    };
  } catch (error) {
    console.error("[Teacher] Reset password error:", error);
    return {
      success: false,
      message: "密码重置失败",
    };
  }
}

/**
 * 获取部门和角色统计
 */
export async function getUserStats() {
  try {
    const [
      totalUsers,
      totalTeachers,
      usersByRole,
      teachersByDepartment,
      teachersByRole,
      activeUsers,
      inactiveUsers,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.teacher.count(),
      prisma.user.groupBy({
        by: ["role"],
        _count: { role: true },
      }),
      prisma.teacher.groupBy({
        by: ["department"],
        _count: { department: true },
      }),
      prisma.teacher.groupBy({
        by: ["role"],
        _count: { role: true },
      }),
      prisma.user.count({ where: { status: UserStatus.ACTIVE } }),
      prisma.user.count({ where: { status: UserStatus.INACTIVE } }),
    ]);

    return {
      success: true,
      data: {
        totalUsers,
        totalTeachers,
        usersByRole,
        teachersByDepartment,
        teachersByRole,
        activeUsers,
        inactiveUsers,
      },
    };
  } catch (error) {
    console.error("[User] Get stats error:", error);
    return {
      success: false,
      message: "获取用户统计失败",
    };
  }
}

/**
 * 切换用户状态（启用/禁用）
 */
export async function toggleUserStatus(id: string, currentStatus: UserStatus) {
  try {
    const newStatus =
      currentStatus === UserStatus.ACTIVE
        ? UserStatus.INACTIVE
        : UserStatus.ACTIVE;

    const user = await prisma.user.update({
      where: { id },
      data: {
        status: newStatus,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        name: true,
        status: true,
      },
    });

    revalidatePath("/system-settings");

    return {
      success: true,
      message: newStatus === UserStatus.ACTIVE ? "用户已启用" : "用户已禁用",
      data: user,
    };
  } catch (error) {
    console.error("[User] Toggle status error:", error);
    return {
      success: false,
      message: "切换用户状态失败",
    };
  }
}

/**
 * 切换教师状态（启用/禁用）
 */
export async function toggleTeacherStatus(
  id: string,
  currentStatus: TeacherStatus
) {
  try {
    const newStatus =
      currentStatus === TeacherStatus.ACTIVE
        ? TeacherStatus.INACTIVE
        : TeacherStatus.ACTIVE;

    const teacher = await prisma.teacher.update({
      where: { id },
      data: {
        status: newStatus,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        name: true,
        status: true,
      },
    });

    revalidatePath("/system-settings");

    return {
      success: true,
      message:
        newStatus === TeacherStatus.ACTIVE ? "教师已启用" : "教师已禁用",
      data: teacher,
    };
  } catch (error) {
    console.error("[Teacher] Toggle status error:", error);
    return {
      success: false,
      message: "切换教师状态失败",
    };
  }
}