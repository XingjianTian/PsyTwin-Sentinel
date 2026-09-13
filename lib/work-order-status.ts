/**
 * 客户端安全的工单状态常量。
 *
 * 取值必须与 prisma/schema.prisma 中的 `enum WorkOrderStatus` 保持一致。
 * 之所以单独声明，是为了让客户端组件（"use client"）不必从 "@prisma/client" 导入，
 * 避免把 Prisma 运行时打进浏览器包（会触发 "PrismaClient is unable to run in this browser environment"）。
 */
export const WorkOrderStatus = {
  PENDING: "PENDING",
  IN_PROGRESS: "IN_PROGRESS",
  COMPLETED: "COMPLETED",
} as const

export type WorkOrderStatus = (typeof WorkOrderStatus)[keyof typeof WorkOrderStatus]
