const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const events = await prisma.openClawEvent.findMany({
    orderBy: { eventTime: 'desc' },
    take: 3,
    include: { agent: true }
  });
  
  console.log('最近事件的消息格式：\n');
  events.forEach((e: any, i: any) => {
    console.log(`[${i + 1}] Type: ${e.type}`);
    console.log(`    AgentId: ${e.agentId}`);
    console.log(`    AgentName: ${e.agent?.name || 'null'}`);
    console.log(`    Message: "${e.message}"`);
    console.log(`    Message长度: ${e.message.length}`);
    console.log(`    前20字符: ${JSON.stringify(e.message.slice(0, 20))}`);
    console.log('');
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
