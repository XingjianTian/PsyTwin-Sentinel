const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // 查找最近的事件，看是否有重复
  const events = await prisma.openClawEvent.findMany({
    orderBy: { eventTime: 'desc' },
    take: 15,
    select: {
      id: true,
      agentId: true,
      type: true,
      message: true,
      payload: true,
      eventTime: true,
      requestId: true,
    }
  });
  
  console.log('最近15条事件（检查重复）：\n');
  
  // 按 requestId 分组
  const grouped = events.reduce((acc, e) => {
    const key = e.requestId || 'no-request';
    if (!acc[key]) acc[key] = [];
    acc[key].push(e);
    return acc;
  }, {});
  
  Object.entries(grouped).forEach(([requestId, events]) => {
    console.log(`\n=== Request: ${requestId.slice(0, 20)}... (${events.length} 条事件) ===`);
    events.forEach((e, i) => {
      const p = e.payload as any;
      console.log(`[${i + 1}] ${e.type} | ${e.eventTime.toISOString().split('T')[1]}`);
      console.log(`    Message: ${e.message.slice(0, 50)}`);
      if (p?.text || p?.delta || p?.output) {
        console.log(`    Content: ${(p.text || p.delta || p.output).slice(0, 50)}...`);
      }
    });
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
