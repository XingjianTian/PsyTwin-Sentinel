import { Student, PsychProfile, Faculty } from "@prisma/client";

export interface SanitizedStudent {
  id: string;
  name: string;
  maskedName: string;
  studentNo: string;
  maskedStudentNo: string;
  className: string;
  faculty?: { name: string } | null;
  gender?: string | null;
  riskLevel: string;
  mbti?: string | null;
  hasPsychProfile: boolean;
  overallScore?: number;
  avatar?: string | null;
  createdAt: Date;
}

export interface DetailedStudent extends SanitizedStudent {
  birthDate?: string | null;
  psychProfile?: PsychProfile | null;
  stats?: {
    totalAlerts: number;
    totalInterventions: number;
    totalVRSessions: number;
    lastActiveAt: string | null;
  };
}

/**
 * 脱敏姓名
 * 张小明 -> 张**
 */
export function maskName(name: string): string {
  if (!name || name.length === 0) return "**";
  if (name.length === 1) return name + "*";
  if (name.length === 2) return name[0] + "*";
  return name[0] + "**";
}

/**
 * 脱敏学号
 * 2025030218 -> 2025****18
 */
export function maskStudentNo(studentNo: string): string {
  if (!studentNo || studentNo.length < 4) return "****";
  const prefix = studentNo.slice(0, 4);
  const suffix = studentNo.slice(-2);
  const maskedLength = studentNo.length - 6;
  return prefix + "*".repeat(Math.max(0, maskedLength)) + suffix;
}

/**
 * 脱敏手机号
 * 13800138000 -> 138****8000
 */
export function maskPhone(phone: string): string {
  if (!phone || phone.length < 7) return "****";
  return phone.slice(0, 3) + "****" + phone.slice(-4);
}

/**
 * 基础学生脱敏（列表视图）
 */
export function sanitizeStudentForList(
  student: Student & {
    faculty?: { name: string } | null;
    psychProfile?: { overallScore: number } | null;
  }
): SanitizedStudent {
  return {
    id: student.id,
    name: student.name,
    maskedName: maskName(student.name),
    studentNo: student.studentNo,
    maskedStudentNo: maskStudentNo(student.studentNo),
    className: student.className,
    faculty: student.faculty,
    gender: student.gender,
    riskLevel: student.riskLevel,
    mbti: student.mbti,
    hasPsychProfile: !!student.psychProfile,
    overallScore: student.psychProfile?.overallScore,
    avatar: student.avatar,
    createdAt: student.createdAt,
  };
}

/**
 * 详细学生脱敏（详情视图）
 * 根据用户权限返回不同级别的数据
 */
export function sanitizeStudentForDetail(
  student: Student & {
    faculty?: { name: string } | null;
    psychProfile?: PsychProfile | null;
    _count?: {
      alerts: number;
      interventionRecords: number;
      vrSessions: number;
    };
  },
  userRole: string,
  hasExplicitPermission: boolean = false
): DetailedStudent {
  const isAdmin = userRole === "ADMIN";
  const isCounselor = userRole === "COUNSELOR";
  const canViewFull = isAdmin || isCounselor || hasExplicitPermission;

  return {
    id: student.id,
    name: canViewFull ? student.name : maskName(student.name),
    maskedName: maskName(student.name),
    studentNo: canViewFull ? student.studentNo : maskStudentNo(student.studentNo),
    maskedStudentNo: maskStudentNo(student.studentNo),
    className: student.className,
    faculty: student.faculty,
    gender: student.gender,
    riskLevel: student.riskLevel,
    mbti: student.mbti,
    hasPsychProfile: !!student.psychProfile,
    overallScore: student.psychProfile?.overallScore,
    avatar: student.avatar,
    createdAt: student.createdAt,
    // 敏感字段仅对有权限的用户显示
    birthDate: canViewFull
      ? student.birthDate?.toISOString() || null
      : null,
    psychProfile: canViewFull ? student.psychProfile : null,
    stats: student._count
      ? {
          totalAlerts: student._count.alerts,
          totalInterventions: student._count.interventionRecords,
          totalVRSessions: student._count.vrSessions,
          lastActiveAt: null, // 需要额外查询
        }
      : undefined,
  };
}

/**
 * 脱敏身份证号（如果有）
 */
export function maskIdCard(idCard: string): string {
  if (!idCard || idCard.length !== 18) return "******************";
  return idCard.slice(0, 4) + "**************" + idCard.slice(-2);
}

/**
 * 脱敏邮箱
 * example@gmail.com -> ex***@gmail.com
 */
export function maskEmail(email: string): string {
  if (!email || !email.includes("@")) return "***@***.com";
  const [local, domain] = email.split("@");
  if (local.length <= 2) return "**@" + domain;
  return local.slice(0, 2) + "***@" + domain;
}
