import { PrismaClient } from '@prisma/client'
import { maskQueryResult } from './prisma-name-mask'

// 防线：本模块只能被服务端代码引用。
// 一旦被客户端组件（"use client"）直接或间接引入并打包进浏览器，就会立刻抛出这个可读的错误，
// 而不是在页面上报出难以定位的 "PrismaClient is unable to run in this browser environment"。
if (typeof window !== 'undefined') {
  throw new Error(
    '服务端模块 lib/prisma.ts 被引入到浏览器环境：请勿在客户端组件中导入 Prisma 相关模块，改为从纯常量模块导入所需数据。'
  )
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient(): PrismaClient {
  const base = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

  // 全局姓名脱敏：学生 / 教师 / 管理员等全部角色，所有服务端数据出口统一生效
  return base.$extends({
    query: {
      $allModels: {
        async $allOperations({ model, args, query }) {
          const result = await query(args)
          return maskQueryResult(result, model)
        },
      },
    },
  }) as unknown as PrismaClient
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
