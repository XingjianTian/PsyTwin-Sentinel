import { PrismaClient, Sentiment } from "@prisma/client"

const prisma = new PrismaClient()

const expressions = ["neutral", "happy", "sad", "fear", "surprise", "anger", "disgust"]
const sentiments: Sentiment[] = ["POSITIVE", "NEUTRAL", "NEGATIVE"]
const emotionLabels = ["平静", "轻松", "焦虑", "紧张", "专注", "低落"]

function randomInRange(min: number, max: number): number {
  return Math.random() * (max - min) + min
}

function randomInt(min: number, max: number): number {
  return Math.floor(randomInRange(min, max + 1))
}

async function main() {
  console.log("开始填充多模态数据...")

  const students = await prisma.student.findMany({
    where: { role: "student" },
    select: { id: true, name: true },
  })

  console.log(`找到 ${students.length} 个学生`)

  for (const student of students) {
    const now = Date.now()
    const thirtyMinutesAgo = now - 30 * 60 * 1000

    const vitalSignData = []
    for (let i = 0; i < 30; i++) {
      const timestamp = new Date(thirtyMinutesAgo + i * 60 * 1000)
      const baseHeartRate = randomInt(65, 88)
      const vital = {
        studentId: student.id,
        timestamp,
        heartRate: baseHeartRate + randomInt(-5, 5),
        hrv: parseFloat(randomInRange(30, 65).toFixed(1)),
        bloodOxygen: parseFloat(randomInRange(96, 99).toFixed(1)),
        gsr: parseFloat(randomInRange(1.5, 4.0).toFixed(2)),
        stressIndex: randomInt(25, 65),
      }
      vitalSignData.push(vital)
    }

    await prisma.vitalSign.createMany({ data: vitalSignData })

    const latestVital = vitalSignData[vitalSignData.length - 1]
    const sentiment = sentiments[randomInt(0, 2)]
    const emotionLabel = emotionLabels[randomInt(0, 5)]

    await prisma.voiceAnalysis.create({
      data: {
        studentId: student.id,
        timestamp: latestVital.timestamp,
        sentiment,
        tremorIndex: parseFloat(randomInRange(0.08, 0.32).toFixed(2)),
        emotionLabel,
      },
    })

    const primaryExpression = expressions[randomInt(0, 3)]

    await prisma.expressionData.create({
      data: {
        studentId: student.id,
        timestamp: latestVital.timestamp,
        primaryExpression,
        anxietyLevel: parseFloat(randomInRange(0.05, 0.35).toFixed(2)),
        sadnessLevel: parseFloat(randomInRange(0.02, 0.25).toFixed(2)),
        angerLevel: parseFloat(randomInRange(0.01, 0.15).toFixed(2)),
      },
    })

    await prisma.behaviorData.create({
      data: {
        studentId: student.id,
        timestamp: latestVital.timestamp,
        interactionFreq: parseFloat(randomInRange(0.6, 3.5).toFixed(1)),
        handTremor: parseFloat(randomInRange(0.05, 0.28).toFixed(2)),
        responseDelay: parseFloat(randomInRange(0.9, 2.2).toFixed(1)),
        avoidanceCount: randomInt(0, 5),
      },
    })

    console.log(`  ✓ ${student.name} (${student.id})`)
  }

  console.log(`\n完成！已为 ${students.length} 个学生填充多模态数据`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
