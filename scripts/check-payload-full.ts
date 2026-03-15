const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const events = await prisma.openClawEvent.findMany({
    orderBy: { eventTime: 'desc' },
    take: 5,
    include: { agent: true },
  });
  
  console.log('检查 payload 中是否有子 agent 信息：\n');
  events.forEach((e: any, i: number) => {
    console.log(`[${i + 1}] ${e.type}`);
    console.log(`    AgentId: ${e.agentId}`);
    console.log(`    Payload 完整内容:`);
    console.log(JSON.stringify(e.payload, null, 2));
    console.log('');
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
