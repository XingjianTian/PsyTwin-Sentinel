import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { AlertStatus } from "@prisma/client"

/**
 * GET /api/admin/pet-alerts/[id]
 * 
 * 获取单个预警详情
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const alert = await prisma.petAlert.findUnique({
      where: { id },
      include: {
        pet: {
          select: {
            id: true,
            name: true,
            species: true,
            ownerId: true,
            mood: true,
            energy: true,
            sociability: true,
          },
        },
      },
    })

    if (!alert) {
      return NextResponse.json(
        { code: 1, error: "Alert not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      code: 0,
      data: { alert },
    })
  } catch (error) {
    console.error("[API] Failed to fetch pet alert detail:", error)
    return NextResponse.json(
      { code: 1, error: "Failed to fetch pet alert detail" },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/admin/pet-alerts/[id]
 * 
 * 更新预警状态（处理预警）
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const { status, resolution, notes, handledBy } = body

    // Validate status if provided
    if (status && !["PENDING", "ACKNOWLEDGED", "RESOLVED", "DISMISSED"].includes(status)) {
      return NextResponse.json(
        { code: 1, error: "Invalid status value" },
        { status: 400 }
      )
    }

    // Build update data
    const updateData: {
      status?: AlertStatus
      resolvedAt?: Date | null
      metadata?: Record<string, unknown>
    } = {}

    if (status) {
      updateData.status = status
      // Auto-set resolvedAt when resolving
      if (status === "RESOLVED") {
        updateData.resolvedAt = new Date()
      }
    }

    // Merge resolution and notes into metadata if provided
    if (resolution || notes) {
      const existingAlert = await prisma.petAlert.findUnique({
        where: { id },
        select: { metadata: true },
      })

      const existingMetadata = (existingAlert?.metadata as Record<string, unknown>) || {}
      updateData.metadata = {
        ...existingMetadata,
        ...(resolution && { resolution }),
        ...(notes && { notes }),
        ...(handledBy && { handledBy }),
      }
    }

    const updatedAlert = await prisma.petAlert.update({
      where: { id },
      data: updateData,
      include: {
        pet: {
          select: {
            id: true,
            name: true,
            species: true,
            ownerId: true,
          },
        },
      },
    })

    return NextResponse.json({
      code: 0,
      data: { alert: updatedAlert },
    })
  } catch (error) {
    console.error("[API] Failed to update pet alert:", error)

    if (error instanceof Error && error.message.includes("Record to update not found")) {
      return NextResponse.json(
        { code: 1, error: "Alert not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { code: 1, error: "Failed to update pet alert" },
      { status: 500 }
    )
  }
}