import { PrismaClient } from '@prisma/client'
import { maskQueryResult } from './prisma-name-mask'

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
