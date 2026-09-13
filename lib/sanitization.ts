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

/** 纯中文（含少数民族姓名的间隔号），不含字母、数字、标点 */
const CN_NAME_ONLY = /^[\u4e00-\u9fa5]+(?:[·•][\u4e00-\u9fa5]+)*$/;

/** 机构 / 角色 / 占位符，不是人名，不参与脱敏 */
const NON_PERSON_WORDS = new Set([
  "系统管理员",
  "管理员",
  "心理咨询师",
  "心理辅导员",
  "咨询师",
  "辅导员",
  "测试学生",
  "测试用户",
  "未知用户",
  "匿名用户",
  "匿名的你",
  "主智能体",
  "小心宠",
  "小暖",
  "系统",
]);

/**
 * 机构 / 场景 / 称谓类词尾，避免把「医学院」「心理咨询中心」「王老师」误当成人名。
 * 称谓（老师、同学、医生…）本身不是姓名，打码后既不可读也无助于隐私保护。
 */
const NON_PERSON_SUFFIX =
  /(学院|大学|学校|学部|学系|中心|办公室|工作处|部门|管理处|医院|公司|集团|团队|小组|平台|系统|服务|设施|教室|实验室|宿舍|食堂|图书馆|老师|教师|同学|学生|医生|医师|教授|咨询师|管理员|辅导员|主任|院长|经理|主管|师傅|先生|女士|小姐|护士|警官|律师|博士|硕士)$/;

/**
 * 判断一个字符串是否「像中文人名」
 * 仅纯中文（2-4 字，或含间隔号的少数民族姓名），且不在机构/角色排除表内
 */
export function isPersonName(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const text = value.trim();
  if (!text || NON_PERSON_WORDS.has(text)) return false;
  if (!CN_NAME_ONLY.test(text)) return false;
  if (NON_PERSON_SUFFIX.test(text)) return false;
  const length = Array.from(text.replace(/[·•]/g, "")).length;
  return length >= 2 && length <= 4;
}

/**
 * 脱敏姓名
 * 张宇     -> 张*
 * 张明远   -> 张*明
 * 欧阳明月 -> 欧**月
 */
export function maskName(name: string): string {
  if (!name) return "";
  const chars = Array.from(name.trim());
  const length = chars.length;
  if (length <= 1) return name;
  if (length === 2) return chars[0] + "*";
  if (length === 3) return chars[0] + "*" + chars[2];
  return chars[0] + "*".repeat(length - 2) + chars[length - 1];
}

/**
 * 安全脱敏：仅对「像人名」的字符串打码，其它内容原样返回
 * 已脱敏的字符串含 `*`，isPersonName 判定为 false，因此天然幂等
 */
export function maskNameSafe(name: string): string {
  return isPersonName(name) ? maskName(name) : name;
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
