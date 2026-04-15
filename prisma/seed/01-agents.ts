import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding OpenClaw agents...\n')

  const agents = {
    main: {
      name: '首席数据官',
      emoji: '🎯',
      color: '#ff006e',
      role: '总览全局',
    },
    Collector: {
      name: '采集员',
      emoji: '📡',
      color: '#374151',
      role: '数据采集',
    },
    Therapist: {
      name: '咨询师',
      emoji: '🧠',
      color: '#9d4edd',
      role: '干预策略',
    },
    Relayer: {
      name: '中继工程师',
      emoji: '🔌',
      color: '#ffbe0b',
      role: '边缘处理',
    },
    DBA: {
      name: 'DBA',
      emoji: '🛡️',
      color: '#1e40af',
      role: '数据管理',
    },
    Analyst: {
      name: '分析师',
      emoji: '📊',
      color: '#15803d',
      role: '特征提取',
    },
  }

  for (const [id, data] of Object.entries(agents)) {
    await prisma.openClawAgent.upsert({
      where: { id },
      update: {
        name: data.name,
        emoji: data.emoji,
        color: data.color,
        role: data.role,
        updatedAt: new Date(),
      },
      create: {
        id,
        name: data.name,
        emoji: data.emoji,
        color: data.color,
        role: data.role,
      },
    })
    console.log(`  ✓ ${id}: ${data.name}`)
  }

  console.log('\n✅ OpenClaw agents seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
