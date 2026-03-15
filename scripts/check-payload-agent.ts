const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const events = await prisma.openClawEvent.findMany({
    where: { type: { contains: 'stream' } },
    orderBy: { eventTime: 'desc' },
    take: 5,
  });
  
  console.log('Stream 事件的 payload 内容：\n');
  events.forEach((e: any, i: number) => {
    console.log(`[${i + 1}] ${e.type}`);
    console.log(`    AgentId: ${e.agentId}`);
    console.log(`    Message: ${e.message?.slice(0, 40)}...`);
    console.log(`    Payload:`, JSON.stringify(e.payload, null, 2)?.slice(0, 300));
    console.log('');
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
