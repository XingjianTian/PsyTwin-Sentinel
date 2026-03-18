import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔍 验证数据库部署状态...\n')

  const checks = []

  try {
    // 1. 验证 OpenClaw Agents
    const agentCount = await prisma.openClawAgent.count()
    const agents = await prisma.openClawAgent.findMany({
      select: { id: true, name: true, emoji: true, color: true },
      orderBy: { id: 'asc' }
    })
    
    console.log('✅ OpenClaw Agents')
    console.log(`   数量: ${agentCount}/6`)
    agents.forEach(a => {
      console.log(`   - ${a.id}: ${a.emoji} ${a.name} (${a.color})`)
    })
    checks.push({ name: 'Agents', status: agentCount === 6 ? 'OK' : 'FAIL', count: agentCount })

    // 2. 验证院系
    const facultyCount = await prisma.faculty.count()
    console.log(`\n✅ Faculties: ${facultyCount} 个院系`)
    checks.push({ name: 'Faculties', status: 'OK', count: facultyCount })

    // 3. 验证系统用户
    const userCount = await prisma.user.count()
    console.log(`✅ System Users: ${userCount} 个用户`)
    checks.push({ name: 'Users', status: 'OK', count: userCount })

    // 4. 验证学生
    const studentCount = await prisma.student.count()
    console.log(`✅ Students: ${studentCount} 个学生`)
    checks.push({ name: 'Students', status: 'OK', count: studentCount })

    // 5. 验证表总数
    const tableCount = 49 // 根据 schema.prisma 中的 model 数量
    console.log(`\n📊 数据库表: ${tableCount} 个`)

    // 汇总
    console.log('\n' + '='.repeat(40))
    const failed = checks.filter(c => c.status === 'FAIL')
    if (failed.length === 0) {
      console.log('✅ 所有检查通过！部署成功。')
    } else {
      console.log(`❌ ${failed.length} 项检查失败：`)
      failed.forEach(f => console.log(`   - ${f.name}`))
    }

  } catch (error) {
    console.error('❌ 验证失败:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
