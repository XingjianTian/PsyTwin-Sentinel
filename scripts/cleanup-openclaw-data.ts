// 清理 OpenClaw 测试数据脚本
// 用法: npx ts-node scripts/cleanup-openclaw-data.ts

import { prisma } from "@/lib/prisma"

async function cleanupOpenClawData() {
  console.log("🧹 开始清理 OpenClaw 测试数据...\n")

  try {
    // 按依赖关系倒序清理：events -> tasks -> requests
    
    // 1. 清理事件表（依赖 requests 和 tasks）
    console.log("📊 清理 openclaw_events 表...")
    const eventsResult = await prisma.$executeRaw`TRUNCATE TABLE openclaw_events RESTART IDENTITY CASCADE`
    console.log("   ✅ events 表已清空\n")

    // 2. 清理任务表（依赖 requests）
    console.log("📊 清理 openclaw_tasks 表...")
    const tasksResult = await prisma.$executeRaw`TRUNCATE TABLE openclaw_tasks RESTART IDENTITY CASCADE`
    console.log("   ✅ tasks 表已清空\n")

    // 3. 清理请求表
    console.log("📊 清理 openclaw_requests 表...")
    const requestsResult = await prisma.$executeRaw`TRUNCATE TABLE openclaw_requests RESTART IDENTITY CASCADE`
    console.log("   ✅ requests 表已清空\n")

    // 4. 可选：重置智能体状态为离线
    console.log("🔄 重置智能体状态...")
    await prisma.$executeRaw`
      UPDATE openclaw_agents 
      SET is_online = false, 
          updated_at = NOW()
      WHERE is_online = true
    `
    console.log("   ✅ 智能体状态已重置为离线\n")

    // 验证清理结果
    console.log("🔍 验证清理结果...")
    const [eventsCount, tasksCount, requestsCount] = await Promise.all([
      prisma.$queryRaw<{ count: bigint }[]>`SELECT COUNT(*) as count FROM openclaw_events`,
      prisma.$queryRaw<{ count: bigint }[]>`SELECT COUNT(*) as count FROM openclaw_tasks`,
      prisma.$queryRaw<{ count: bigint }[]>`SELECT COUNT(*) as count FROM openclaw_requests`,
    ])

    console.log("📈 清理后数据量：")
    console.log(`   - openclaw_events: ${eventsCount[0].count} 条`)
    console.log(`   - openclaw_tasks: ${tasksCount[0].count} 条`)
    console.log(`   - openclaw_requests: ${requestsCount[0].count} 条`)

    console.log("\n✨ 清理完成！所有测试数据已清空。")

  } catch (error) {
    console.error("\n❌ 清理失败:", error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// 如果是直接运行此脚本
if (require.main === module) {
  cleanupOpenClawData()
}

export { cleanupOpenClawData }
