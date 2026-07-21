import assert from "node:assert/strict"
import test from "node:test"

import { getStudentPetSnapshots } from "../app/actions/pet-snapshot"
import { prisma } from "./prisma"

test("student pet snapshots use a unique name for every owner", async () => {
  const pets = await prisma.pet.findMany({
    select: { id: true, ownerId: true, name: true },
    orderBy: [{ createdAt: "asc" }, { id: "asc" }],
  })
  assert.ok(pets.length >= 2, "test requires at least two pets")

  const duplicate = pets[1]
  const originalName = duplicate.name

  try {
    await prisma.pet.update({
      where: { id: duplicate.id },
      data: { name: pets[0].name },
    })

    const snapshots = await getStudentPetSnapshots(pets.map((pet) => pet.ownerId))
    const names = Object.values(snapshots).map((snapshot) => snapshot.name)

    assert.equal(new Set(names).size, names.length)
  } finally {
    await prisma.pet.update({
      where: { id: duplicate.id },
      data: { name: originalName },
    })
  }
})
