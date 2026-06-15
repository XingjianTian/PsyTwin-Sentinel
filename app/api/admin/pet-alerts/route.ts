import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { AlertSeverity, PetAlertType, AlertStatus, Prisma } from "@prisma/client"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const severity = searchParams.get("severity") as AlertSeverity | null
    const status = searchParams.get("status") as AlertStatus | null
    const type = searchParams.get("type") as PetAlertType | null
    const petId = searchParams.get("petId") || undefined

    // Build where conditions
    const where: Prisma.PetAlertWhereInput = {
      ...(severity && { severity }),
      ...(status && { status }),
      ...(type && { type }),
      ...(petId && { petId }),
    }

    // Query data and total count in parallel
    const [alerts, total] = await Promise.all([
      prisma.petAlert.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
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
        orderBy: { createdAt: "desc" },
      }),
      prisma.petAlert.count({ where }),
    ])

    return NextResponse.json({
      code: 0,
      data: {
        alerts,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
    })
  } catch (error) {
    console.error("[API] Failed to fetch pet alerts:", error)
    return NextResponse.json(
      { code: 1, error: "Failed to fetch pet alerts" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      petId,
      severity,
      type,
      title,
      message,
      metadata,
    } = body

    // Validate required fields
    if (!petId || !severity || !type || !title) {
      return NextResponse.json(
        { code: 1, error: "Missing required fields: petId, severity, type, title" },
        { status: 400 }
      )
    }

    // Validate enum values
    if (!Object.values(AlertSeverity).includes(severity)) {
      return NextResponse.json(
        { code: 1, error: `Invalid severity: ${severity}` },
        { status: 400 }
      )
    }
    if (!Object.values(PetAlertType).includes(type)) {
      return NextResponse.json(
        { code: 1, error: `Invalid type: ${type}` },
        { status: 400 }
      )
    }

    // Create the alert
    const alert = await prisma.petAlert.create({
      data: {
        petId,
        severity: severity as AlertSeverity,
        type: type as PetAlertType,
        title,
        message: message || null,
        metadata: metadata || null,
        status: AlertStatus.PENDING,
      },
    })

    return NextResponse.json({
      code: 0,
      data: {
        alertId: alert.id,
        status: alert.status,
        createdAt: alert.createdAt,
      },
    })
  } catch (error) {
    console.error("[API] Failed to create pet alert:", error)
    return NextResponse.json(
      { code: 1, error: "Failed to create pet alert" },
      { status: 500 }
    )
  }
}