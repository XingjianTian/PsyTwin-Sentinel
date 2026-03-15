const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // 查找包含文本内容的事件
  const events = await prisma.openClawEvent.findMany({
    where: {
      type: {
        contains: 'stream'
      }
    },
    orderBy: { eventTime: 'desc' },
    take: 5,
    select: {
      id: true,
      agentId: true,
      type: true,
      message: true,
      payload: true,
      eventTime: true,
    }
  });
  
  console.log('包含 stream 类型的事件：');
  events.forEach((e, i) => {
    console.log(`\n[${i + 1}] ${e.type}`);
    console.log(`  Agent: ${e.agentId}`);
    console.log(`  Message: ${e.message.slice(0, 50)}`);
    console.log(`  Payload: ${JSON.stringify(e.payload, null, 2).slice(0, 200)}`);
  });
  
  if (events.length === 0) {
    console.log('没有找到 stream 类型的事件');
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
