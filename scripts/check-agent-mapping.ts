const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const events = await prisma.openClawEvent.findMany({
    orderBy: { eventTime: 'desc' },
    take: 10,
    include: { agent: true },
  });
  
  console.log('最近10条事件的 agent 信息：\n');
  events.forEach((e: any, i: number) => {
    console.log(`[${i + 1}] ${e.eventTime.toISOString().split('T')[1]}`);
    console.log(`    Type: ${e.type}`);
    console.log(`    AgentId: ${e.agentId}`);
    console.log(`    AgentName: ${e.agent?.name || 'null'}`);
    console.log(`    Message前30字: ${e.message?.slice(0, 30)}`);
    console.log('');
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
