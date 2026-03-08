import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * 清理 TimelineEvent 表中的重复数据
 * 重复判定标准：同一学生（student_id）+ 同一日期（date）+ 相同标题（title）
 * 保留策略：保留最早创建的一条（createdAt 最小），删除其余重复项
 */
async function cleanupTimelineDuplicates() {
  console.log('🔍 开始检查 TimelineEvent 重复数据...\n')

  // 1. 查询所有时间线事件
  const allEvents = await prisma.timelineEvent.findMany({
    orderBy: {
      createdAt: 'asc',
    },
  })

  console.log(`📊 总共找到 ${allEvents.length} 条时间线事件`)

  // 2. 按 studentId + date + title 分组
  const groupedEvents = new Map<string, typeof allEvents>()

  for (const event of allEvents) {
    const key = `${event.studentId}|${event.date}|${event.title}`
    if (!groupedEvents.has(key)) {
      groupedEvents.set(key, [])
    }
    groupedEvents.get(key)!.push(event)
  }

  // 3. 找出重复组
  const duplicateGroups: Array<{
    key: string
    studentId: string
    date: string
    title: string
    events: typeof allEvents
    keepId: string
    deleteIds: string[]
  }> = []

  for (const [key, events] of groupedEvents) {
    if (events.length > 1) {
      const [keep, ...duplicates] = events
      duplicateGroups.push({
        key,
        studentId: keep.studentId,
        date: keep.date,
        title: keep.title,
        events,
        keepId: keep.id,
        deleteIds: duplicates.map(e => e.id),
      })
    }
  }

  console.log(`📌 发现 ${duplicateGroups.length} 组重复事件`)

  if (duplicateGroups.length === 0) {
    console.log('\n✅ 未发现重复数据，无需清理')
    return { cleaned: 0, total: allEvents.length }
  }

  // 4. 显示重复详情
  console.log('\n📋 重复事件详情：')
  console.log('─'.repeat(80))

  let totalToDelete = 0
  for (const group of duplicateGroups) {
    console.log(`\n学生: ${group.studentId}`)
    console.log(`日期: ${group.date}`)
    console.log(`标题: ${group.title}`)
    console.log(`重复数: ${group.events.length} 条`)
    console.log(`保留: ${group.keepId}`)
    console.log(`删除: ${group.deleteIds.join(', ')}`)
    totalToDelete += group.deleteIds.length
  }

  console.log('\n' + '─'.repeat(80))
  console.log(`\n🗑️  将删除 ${totalToDelete} 条重复记录，保留 ${allEvents.length - totalToDelete} 条唯一记录`)

  // 5. 执行删除
  console.log('\n🚀 开始删除重复数据...\n')

  let deletedCount = 0
  for (const group of duplicateGroups) {
    try {
      const result = await prisma.timelineEvent.deleteMany({
        where: {
          id: {
            in: group.deleteIds,
          },
        },
      })
      deletedCount += result.count
      console.log(`✓ 清理: "${group.title}" (${group.date}) - 删除 ${result.count} 条`)
    } catch (error) {
      console.error(`✗ 清理失败: "${group.title}"`, error)
    }
  }

  console.log('\n' + '='.repeat(80))
  console.log('🎉 清理完成！')
  console.log(`   原始记录数: ${allEvents.length}`)
  console.log(`   删除重复数: ${deletedCount}`)
  console.log(`   保留记录数: ${allEvents.length - deletedCount}`)
  console.log('='.repeat(80))

  return {
    cleaned: deletedCount,
    total: allEvents.length - deletedCount,
  }
}

// 执行清理
cleanupTimelineDuplicates()
  .then(async (result) => {
    await prisma.$disconnect()
    console.log('\n✨ 数据库连接已关闭')
    process.exit(0)
  })
  .catch(async (error) => {
    console.error('\n❌ 清理过程出错：', error)
    await prisma.$disconnect()
    process.exit(1)
  })
