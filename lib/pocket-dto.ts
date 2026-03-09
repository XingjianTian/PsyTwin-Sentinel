/**
 * PsyTwin Pocket API DTO 转换工具
 * 
 * 处理数据库模型和 API 响应之间的字段转换
 */

import { Appointment, AppointmentStatus, AppointmentType } from "@prisma/client"

/**
 * Appointment DTO
 * API 响应格式，包含 startTime 和 endTime（从 time_slot 解析）
 */
export interface AppointmentDTO {
  id: string
  studentId: string
  teacherId: string | null
  roomId: string | null
  type: AppointmentType
  date: string // YYYY-MM-DD
  startTime: string // HH:mm
  endTime: string // HH:mm
  status: AppointmentStatus
  reason: string | null
  cancelReason: string | null
  meetingLink: string | null
  feedbackScore: number | null
  feedbackContent: string | null
  createdAt: string // ISO 8601
  updatedAt: string // ISO 8601
}

/**
 * 将数据库 Appointment 转换为 API DTO
 */
export function toAppointmentDTO(appointment: Appointment): AppointmentDTO {
  // 解析 time_slot 格式 "09:00-09:50"
  const { startTime, endTime } = parseTimeSlot(appointment.timeSlot)
  
  return {
    id: appointment.id,
    studentId: appointment.studentId,
    teacherId: appointment.teacherId,
    roomId: appointment.roomId,
    type: appointment.type,
    date: appointment.date.toISOString().split('T')[0], // YYYY-MM-DD
    startTime,
    endTime,
    status: appointment.status,
    reason: appointment.reason,
    cancelReason: appointment.cancelReason,
    meetingLink: appointment.meetingLink,
    feedbackScore: appointment.feedbackScore,
    feedbackContent: appointment.feedbackContent,
    createdAt: appointment.createdAt.toISOString(),
    updatedAt: appointment.updatedAt.toISOString(),
  }
}

/**
 * 解析 time_slot 字符串
 * 格式: "09:00-09:50"
 */
export function parseTimeSlot(timeSlot: string): { startTime: string; endTime: string } {
  const parts = timeSlot.split('-')
  if (parts.length !== 2) {
    // 如果格式不正确，返回默认值
    return { startTime: "09:00", endTime: "09:50" }
  }
  return {
    startTime: parts[0].trim(),
    endTime: parts[1].trim(),
  }
}

/**
 * 将 startTime 和 endTime 合并为 time_slot
 */
export function toTimeSlot(startTime: string, endTime: string): string {
  return `${startTime}-${endTime}`
}

/**
 * 创建预约请求参数
 */
export interface CreateAppointmentRequest {
  teacherId?: string
  type: AppointmentType
  date: string // YYYY-MM-DD
  startTime: string // HH:mm
  endTime: string // HH:mm
  reason?: string
  roomId?: string
}

/**
 * 更新预约请求参数
 */
export interface UpdateAppointmentRequest {
  status?: AppointmentStatus
  cancelReason?: string
  meetingLink?: string
  feedbackScore?: number
  feedbackContent?: string
}

/**
 * 预约列表查询参数
 */
export interface AppointmentQueryParams {
  status?: AppointmentStatus
  page?: number
  limit?: number
}
