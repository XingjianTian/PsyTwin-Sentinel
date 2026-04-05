import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function check() {
  const completed = await prisma.interventionRecord.count({ where: { status: 'completed' } });
  const inProgress = await prisma.interventionRecord.count({ where: { status: 'in_progress' } });
  console.log('已完成:', completed, '进展中:', inProgress);
  
  const sample = await prisma.interventionRecord.findFirst({ where: { status: 'in_progress' } });
  console.log('进展中记录示例:', sample?.id || '无');
  
  await prisma.$disconnect();
}

check().catch(console.error);
