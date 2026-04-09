/**
 * PsyTwin Pocket API 认证工具
 * 
 * 演示模式：Token 仅作为标识，不强制验证
 * - 如果 token 存在，识别用户身份
 * - 如果没有 token，使用默认演示用户（stu001）
 */

import { NextRequest } from "next/server"
import { prisma } from "@/lib/db"
import { verifyToken } from "@/lib/auth"

const DEFAULT_DEMO_USER_ID = "stu001"

async function resolveDemoUserId(): Promise<string> {
  const preferredUser = await prisma.student.findFirst({
    where: {
      id: DEFAULT_DEMO_USER_ID,
    },
    select: { id: true },
  })

  if (preferredUser) {
    return preferredUser.id
  }

  const fallbackUser = await prisma.student.findFirst({
    where: {
      OR: [
        { id: "stu-xiaoming" },
        { phone: "13800138001" },
      ],
    },
    select: { id: true },
    orderBy: { createdAt: "asc" },
  })

  if (fallbackUser) {
    return fallbackUser.id
  }

  const firstStudent = await prisma.student.findFirst({
    orderBy: { createdAt: "asc" },
    select: { id: true },
  })

  return firstStudent?.id || DEFAULT_DEMO_USER_ID
}

export async function getCurrentUserId(request: NextRequest): Promise<string> {
  const authHeader = request.headers.get("authorization")
  
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.substring(7)
    if (token && token.length > 0 && token !== "null" && token !== "undefined") {
      // 验证并解码 Token，提取 userId
      const decoded = verifyToken(token)
      if (decoded && decoded.userId) {
        return decoded.userId
      }
    }
  }
  
  return resolveDemoUserId()
}

export async function getCurrentUser(request: NextRequest) {
  const userId = await getCurrentUserId(request)
  
  const user = await prisma.student.findFirst({
    where: { id: userId },
    select: {
      id: true, name: true, studentNo: true, avatar: true,
      nickname: true, className: true, facultyId: true,
      riskLevel: true, status: true,
    },
  })
  
  if (!user) {
    return prisma.student.findFirst({
      where: { id: DEFAULT_DEMO_USER_ID },
      select: {
        id: true, name: true, studentNo: true, avatar: true,
        nickname: true, className: true, facultyId: true,
        riskLevel: true, status: true,
      },
    })
  }
  
  return user
}

export async function validateUser(userId: string): Promise<boolean> {
  const user = await prisma.student.findFirst({
    where: { id: userId },
    select: { id: true },
  })
  return !!user
}
