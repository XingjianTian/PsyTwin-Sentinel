const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const events = await prisma.openClawEvent.findMany({
    orderBy: { eventTime: 'desc' },
    take: 5,
    include: { agent: true },
  });
  
  console.log('最近5条事件的实际消息内容：\n');
  events.forEach((e, i) => {
    console.log(`[${i + 1}] AgentId: ${e.agentId}, AgentName: ${e.agent?.name || 'null'}`);
    console.log(`    Message前80字:`);
    console.log(`    ${JSON.stringify(e.message?.slice(0, 80))}`);
    console.log(`    是否以[开头: ${e.message?.startsWith('[')}`);
    console.log('');
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
