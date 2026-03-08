/**
 * 为干预记录创建示例详情数据
 * 运行: npx tsx scripts/seed-intervention-details.ts
 */

import { prisma } from "../lib/prisma"

async function seedInterventionDetails() {
  console.log("🌱 开始创建干预记录详情数据...")

  // 获取所有干预记录
  const records = await prisma.interventionRecord.findMany({
    select: { id: true, type: true },
  })

  console.log(`找到 ${records.length} 条干预记录`)

  const techniquesMap: Record<string, string[]> = {
    "定期面谈": ["倾听与共情", "开放式提问", "反思性回应"],
    "CBT治疗": ["认知重构", "行为激活", "暴露疗法", "思维记录表"],
    "团体辅导": ["团体动力引导", "角色扮演", "小组讨论", "反馈分享"],
    "危机干预": ["安全评估", "情绪稳定化", "危机处理", "资源链接"],
    "初次评估": ["心理测评", "风险评估", "信息收集", "初步诊断"],
  }

  let createdCount = 0

  for (const record of records) {
    // 检查是否已有详情数据
    const existing = await prisma.interventionDetail.findUnique({
      where: { recordId: record.id },
    })

    if (existing) {
      console.log(`  ⏭️ 记录 ${record.id.slice(-6)} 已存在详情数据，跳过`)
      continue
    }

    // 生成随机但合理的数据
    const preAnxiety = Math.floor(Math.random() * 6) + 3 // 3-8
    const preDepression = Math.floor(Math.random() * 5) + 2 // 2-6
    const preStress = Math.floor(Math.random() * 6) + 4 // 4-9

    const postAnxiety = Math.max(1, preAnxiety - Math.floor(Math.random() * 3) - 1)
    const postDepression = Math.max(1, preDepression - Math.floor(Math.random() * 2))
    const postStress = Math.max(1, preStress - Math.floor(Math.random() * 3) - 1)

    const improvementScore = Math.min(10, Math.floor((preAnxiety - postAnxiety + preDepression - postDepression + preStress - postStress) / 3) + 5)

    await prisma.interventionDetail.create({
      data: {
        recordId: record.id,
        // 干预前评估
        preMood: ["焦虑", "低落", "紧张", "烦躁", "疲惫"][Math.floor(Math.random() * 5)],
        preAnxietyLevel: preAnxiety,
        preDepressionLevel: preDepression,
        preStressLevel: preStress,
        mainIssues: "学业压力较大，对未来职业发展感到迷茫，与室友关系需要改善。近期睡眠质量下降，注意力难以集中。",
        riskLevel: ["低风险", "中低风险", "中等风险"][Math.floor(Math.random() * 3)],
        riskAssessment: "目前无自伤自杀风险，但需关注学业压力和社交适应问题。建议定期跟进，必要时转介精神科。",
        // 干预过程
        sessionContent: "本次会话主要围绕学业压力展开。学生表达了对期末考试的担忧和对未来就业的不确定性。通过认知重构技术，帮助学生识别自动化负性思维，并学习用更平衡的视角看待压力情境。",
        techniquesUsed: techniquesMap[record.type] || ["倾听与共情", "开放式提问"],
        studentEngagement: "学生参与度较高，能够主动分享内心想法。在练习环节积极配合，对CBT技术表现出兴趣。",
        keyPoints: "1. 识别了完美主义思维模式 2. 学习了呼吸放松技巧 3. 制定了逐步面对焦虑的计划",
        emotionalChanges: "会话开始时学生情绪较为紧张，随着会谈进行逐渐放松，结束时表示感到有希望和动力。",
        // 干预效果
        postMood: ["平静", "放松", "积极", "充满希望"][Math.floor(Math.random() * 4)],
        postAnxietyLevel: postAnxiety,
        postDepressionLevel: postDepression,
        postStressLevel: postStress,
        improvementScore: improvementScore,
        breakthroughPoints: "学生首次意识到自己的完美主义倾向，并表示愿意尝试用更灵活的标准要求自己。",
        unfinishedIssues: "仍需继续练习认知重构技术，并在日常生活中应用放松技巧。",
        // 后续建议
        followUpActions: "1. 每日记录情绪日志 2. 坚持练习腹式呼吸 3. 下周继续面谈跟进 4. 如情况恶化及时联系",
        nextAppointment: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        referrals: "目前暂不需要转介。建议继续心理咨询，如症状持续或加重，考虑转介精神科医生。",
        recommendations: "保持规律作息，适当运动，与家人朋友多沟通交流。学习接受不完美，设定现实可行的目标。",
        // 其他
        privateNotes: "学生家庭背景：父母期望较高。需要关注其自我评价过低的问题。建议下次会谈探讨家庭关系对其影响。",
        attachments: [],
      },
    })

    createdCount++
    console.log(`  ✅ 为记录 ${record.id.slice(-6)} 创建了详情数据`)
  }

  console.log(`\n✨ 完成！共创建 ${createdCount} 条详情数据`)
}

seedInterventionDetails()
  .catch((e) => {
    console.error("❌ 错误:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
