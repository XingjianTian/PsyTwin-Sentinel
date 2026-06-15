import { PrismaClient } from "@prisma/client"

import { petDiaryTemplates } from "./pet-diary-templates"

const prisma = new PrismaClient()

async function main() {
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
      create: template,
    })
  }

  console.log(`Seeded ${petDiaryTemplates.length} pet diary templates.`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
