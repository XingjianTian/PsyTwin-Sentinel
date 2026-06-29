import { PrismaClient } from "@prisma/client"

import { petDiaryTemplates } from "../pet-diary-templates"

const openClawAgents = {
  main: {
    name: "小茜",
    emoji: "AI",
    color: "#ff006e",
    role: "总控调度",
  },
  Collector: {
    name: "采集员",
    emoji: "DB",
    color: "#374151",
    role: "数据采集",
  },
  Therapist: {
    name: "咨询师",
    emoji: "CHAT",
    color: "#9d4edd",
    role: "干预策略",
  },
  Relayer: {
    name: "中继工程师",
    emoji: "LINK",
    color: "#ffbe0b",
    role: "边缘处理",
  },
  DBA: {
    name: "DBA",
    emoji: "SQL",
    color: "#1e40af",
    role: "数据管理",
  },
  Analyst: {
    name: "分析师",
    emoji: "CHART",
    color: "#15803d",
    role: "特征提取",
  },
}

async function seedOpenClawAgents(prisma: PrismaClient) {
  for (const [id, data] of Object.entries(openClawAgents)) {
    await prisma.openClawAgent.upsert({
      where: { id },
      update: {
        ...data,
        isOnline: true,
        updatedAt: new Date(),
      },
      create: {
        id,
        ...data,
        isOnline: true,
      },
    })
  }
}

async function seedPetDiaryTemplates(prisma: PrismaClient) {
  for (const template of petDiaryTemplates) {
    await prisma.petDiaryTemplate.upsert({
      where: { slug: template.slug },
      update: {
        title: template.title,
        content: template.content,
        sceneHint: template.sceneHint,
        tone: template.tone,
        active: true,
      },
      create: {
        ...template,
        active: true,
      },
    })
  }
}

async function seedIncrementalCoreData() {
  const isDryRun = process.argv.includes("--dry-run")

  console.log("Incremental core data seed")
  console.log(`- OpenClaw agents: ${Object.keys(openClawAgents).length}`)
  console.log(`- Pet diary templates: ${petDiaryTemplates.length}`)

  if (isDryRun) {
    console.log("Dry run complete. No database writes were performed.")
    return
  }

  const prisma = new PrismaClient()

  try {
    await seedOpenClawAgents(prisma)
    await seedPetDiaryTemplates(prisma)
    console.log("Incremental core data seed completed.")
  } finally {
    await prisma.$disconnect()
  }
}

seedIncrementalCoreData().catch((error) => {
  console.error(error)
  process.exit(1)
})
