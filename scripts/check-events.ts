const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const events = await prisma.openClawEvent.findMany({
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
  
  console.log('最近5条事件：');
  console.table(events.map(e => ({
    id: e.id.slice(0, 8) + '...',
    agent: e.agentId,
    type: e.type,
    message: e.message.slice(0, 30),
    hasPayload: e.payload ? '✓' : '✗',
    payloadPreview: e.payload ? JSON.stringify(e.payload).slice(0, 40) : '-',
  })));
}

main().catch(console.error).finally(() => prisma.$disconnect());
