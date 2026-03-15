const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // 查找最近的请求，看是否有 result 字段
  const requests = await prisma.openClawRequest.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5,
    select: {
      id: true,
      runId: true,
      content: true,      // 用户输入
      result: true,       // 最终结果
      state: true,
      createdAt: true,
      completedAt: true,
    }
  });
  
  console.log('最近5个请求：\n');
  requests.forEach((r, i) => {
    console.log(`[${i + 1}] ${r.runId?.slice(0, 20)}...`);
    console.log(`    状态: ${r.state}`);
    console.log(`    用户输入: ${r.content?.slice(0, 60) || '(无)'}`);
    console.log(`    最终结果: ${r.result ? r.result.slice(0, 100) + '...' : '(无)'}`);
    console.log(`    完成时间: ${r.completedAt?.toISOString() || '(未完成)'}`);
    console.log('');
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
