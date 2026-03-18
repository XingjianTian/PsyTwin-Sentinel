import { PrismaClient, UserRole } from '@prisma/client'
import { hashPassword } from '../../lib/auth'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding system users...\n')

  const users = [
    {
      email: 'admin@psytwin.edu.cn',
      name: '系统管理员',
      password: 'admin123',
      role: UserRole.ADMIN,
    },
    {
      email: 'counselor@psytwin.edu.cn',
      name: '心理咨询师',
      password: 'counselor123',
      role: UserRole.COUNSELOR,
    },
  ]

  for (const u of users) {
    const hashedPassword = await hashPassword(u.password)
    await prisma.user.upsert({
      where: { email: u.email },
      update: {
        name: u.name,
        role: u.role,
      },
      create: {
        email: u.email,
        name: u.name,
        passwordHash: hashedPassword,
        role: u.role,
      },
    })
    console.log(`  ✓ ${u.name} (${u.email})`)
  }

  console.log('\n✅ System users seeded successfully!')
  console.log('   Default passwords: admin123, counselor123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
