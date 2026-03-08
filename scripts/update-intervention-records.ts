import { InterventionType, PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * 更新干预记录数据
 * - 添加进展中的记录
 * - 更新部分现有记录为进展中状态
 */
async function updateInterventionRecords() {
  console.log('🔄 开始更新干预记录...\n')

  // 1. 更新现有的后10条记录为进展中状态
  const recordsToUpdate = [
    { id: 'ir-11', newDate: '2026-03-05', newResult: '学业规划持续跟进中', newStatus: 'in_progress' },
    { id: 'ir-12', newDate: '2026-03-08', newResult: '初步评估进行中', newStatus: 'in_progress' },
    { id: 'ir-13', newDate: '2026-03-01', newResult: '认知行为治疗进行中', newStatus: 'in_progress' },
    { id: 'ir-14', newDate: '2026-03-06', newResult: '团体辅导持续进行中', newStatus: 'in_progress' },
    { id: 'ir-15', newDate: '2026-03-04', newResult: '思维模式调整中', newStatus: 'in_progress' },
    { id: 'ir-16', newDate: '2026-03-02', newResult: '情绪管理训练中', newStatus: 'in_progress' },
    { id: 'ir-17', newDate: '2026-03-07', newResult: '团队协作能力提升中', newStatus: 'in_progress' },
    { id: 'ir-18', newDate: '2026-03-03', newResult: '睡眠问题评估中', newStatus: 'in_progress' },
    { id: 'ir-19', newDate: '2026-03-05', newResult: '适应性辅导持续中', newStatus: 'in_progress' },
    { id: 'ir-20', newDate: '2026-03-06', newResult: '心理韧性培养进行中', newStatus: 'in_progress' },
  ]

  let updatedCount = 0
  for (const update of recordsToUpdate) {
    try {
      const existing = await prisma.interventionRecord.findUnique({
        where: { id: update.id }
      })

      if (existing) {
        await prisma.interventionRecord.update({
          where: { id: update.id },
          data: {
            date: new Date(`${update.newDate}T00:00:00.000Z`),
            result: update.newResult,
            status: update.newStatus,
          },
        })
        console.log(`✓ 更新记录 ${update.id}: 状态改为 "进展中"`)
        updatedCount++
      } else {
        // 如果记录不存在，创建新记录
        const studentMap: Record<string, { studentId: string; counselor: string; type: InterventionType }> = {
          'ir-11': { studentId: 'stu-liweimin', counselor: '刘芳', type: InterventionType.REGULAR_INTERVIEW },
          'ir-12': { studentId: 'stu-sunxiaoxiao', counselor: '张伟', type: InterventionType.INITIAL_ASSESSMENT },
          'ir-13': { studentId: 'stu-zhoujian', counselor: '王丽', type: InterventionType.CBT_THERAPY },
          'ir-14': { studentId: 'stu-wuting', counselor: '刘芳', type: InterventionType.GROUP_COUNSELING },
          'ir-15': { studentId: 'stu-zhengkai', counselor: '张伟', type: InterventionType.CBT_THERAPY },
          'ir-16': { studentId: 'stu-wangfang', counselor: '王丽', type: InterventionType.REGULAR_INTERVIEW },
          'ir-17': { studentId: 'stu-fengtao', counselor: '刘芳', type: InterventionType.GROUP_COUNSELING },
          'ir-18': { studentId: 'stu-chenjing', counselor: '张伟', type: InterventionType.INITIAL_ASSESSMENT },
          'ir-19': { studentId: 'stu-yangbo', counselor: '王丽', type: InterventionType.REGULAR_INTERVIEW },
          'ir-20': { studentId: 'stu-xiaoli', counselor: '刘芳', type: InterventionType.CBT_THERAPY },
        }

        const config = studentMap[update.id]
        if (config) {
          await prisma.interventionRecord.create({
            data: {
              id: update.id,
              studentId: config.studentId,
              date: new Date(`${update.newDate}T00:00:00.000Z`),
              type: config.type,
              counselor: config.counselor,
              duration: '50分钟',
              result: update.newResult,
              status: update.newStatus,
            },
          })
          console.log(`✓ 创建记录 ${update.id}: 状态 "进展中"`)
          updatedCount++
        }
      }
    } catch (error) {
      console.error(`✗ 处理记录 ${update.id} 失败:`, error)
    }
  }

  console.log('\n' + '='.repeat(60))
  console.log('🎉 更新完成！')
  console.log(`   处理记录数: ${updatedCount}`)
  
  // 统计当前状态分布
  const completedCount = await prisma.interventionRecord.count({ where: { status: 'completed' } })
  const inProgressCount = await prisma.interventionRecord.count({ where: { status: 'in_progress' } })
  console.log(`   已完成: ${completedCount} 条`)
  console.log(`   进展中: ${inProgressCount} 条`)
  console.log('='.repeat(60))
}

updateInterventionRecords()
  .then(async () => {
    await prisma.$disconnect()
    console.log('\n✨ 数据库连接已关闭')
    process.exit(0)
  })
  .catch(async (error) => {
    console.error('\n❌ 更新过程出错：', error)
    await prisma.$disconnect()
    process.exit(1)
  })
