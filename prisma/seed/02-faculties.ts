import { PrismaClient, RiskLevel } from '@prisma/client'

const prisma = new PrismaClient()

const faculties = [
  { id: 'fac-info', name: '信息工程学院', riskLevel: RiskLevel.MEDIUM, stressIndex: 53 },
  { id: 'fac-soft', name: '软件学院', riskLevel: RiskLevel.LOW, stressIndex: 41 },
  { id: 'fac-dm', name: '数字媒体学院', riskLevel: RiskLevel.MEDIUM, stressIndex: 49 },
  { id: 'fac-cyber', name: '网络空间安全学院', riskLevel: RiskLevel.HIGH, stressIndex: 62 },
  { id: 'fac-vr', name: '虚拟现实学院', riskLevel: RiskLevel.LOW, stressIndex: 38 },
  { id: 'fac-data', name: '大数据学院', riskLevel: RiskLevel.MEDIUM, stressIndex: 55 },
]

async function main() {
  console.log('🌱 Seeding faculties...\n')

  for (const f of faculties) {
    await prisma.faculty.upsert({
      where: { id: f.id },
      update: {
        name: f.name,
        riskLevel: f.riskLevel,
        stressIndex: f.stressIndex,
      },
      create: {
        id: f.id,
        name: f.name,
        riskLevel: f.riskLevel,
        stressIndex: f.stressIndex,
        campusX: Math.random() * 100,
        campusY: Math.random() * 100,
      },
    })
    console.log(`  ✓ ${f.name}`)
  }

  console.log('\n✅ Faculties seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
