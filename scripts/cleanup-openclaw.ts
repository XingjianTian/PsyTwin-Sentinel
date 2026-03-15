const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('清理 OpenClaw 数据...\n');
  
  // 先删除事件（因为有外键约束）
  const deletedEvents = await prisma.openClawEvent.deleteMany({});
  console.log(`✓ 已删除 ${deletedEvents.count} 条事件记录`);
  
  // 删除任务
  const deletedTasks = await prisma.openClawTask.deleteMany({});
  console.log(`✓ 已删除 ${deletedTasks.count} 条任务记录`);
  
  // 删除请求
  const deletedRequests = await prisma.openClawRequest.deleteMany({});
  console.log(`✓ 已删除 ${deletedRequests.count} 条请求记录`);
  
  console.log('\n清理完成！');
}

main().catch(console.error).finally(() => prisma.$disconnect());
