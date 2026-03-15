const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // 查找最近的所有事件
  const events = await prisma.openClawEvent.findMany({
    orderBy: { eventTime: 'desc' },
    take: 10,
    select: {
      id: true,
      agentId: true,
      type: true,
      message: true,
      payload: true,
      eventTime: true,
    }
  });
  
  console.log('最近10条事件：\n');
  events.forEach((e, i) => {
    console.log(`[${i + 1}] ${e.type} | ${e.agentId} | ${e.eventTime.toISOString()}`);
    console.log(`    Message: ${e.message.slice(0, 60)}`);
    
    // 详细打印 payload
    if (e.payload) {
      console.log(`    Payload 类型: ${typeof e.payload}`);
      console.log(`    Payload 内容: ${JSON.stringify(e.payload, null, 2).slice(0, 300)}`);
      
      // 检查是否有 text/content 字段
      const p = e.payload as any;
      if (p.text) console.log(`    ✓ payload.text: ${p.text.slice(0, 50)}`);
      if (p.content) console.log(`    ✓ payload.content: ${p.content.slice(0, 50)}`);
      if (p.data?.text) console.log(`    ✓ payload.data.text: ${p.data.text.slice(0, 50)}`);
    } else {
      console.log(`    Payload: null`);
    }
    console.log('');
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
