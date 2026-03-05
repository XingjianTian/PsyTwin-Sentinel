/**
 * 文档管理 API
 * 
 * 提供文档的 CRUD 操作
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// GET /api/documents - 获取所有文档
export async function GET() {
  try {
    const documents = await prisma.aIDocument.findMany({
      orderBy: { uploadDate: "desc" },
    });

    return NextResponse.json({ documents });
  } catch (error) {
    console.error("[API] Failed to fetch documents:", error);
    return NextResponse.json(
      { error: "Failed to fetch documents" },
      { status: 500 }
    );
  }
}

// POST /api/documents - 上传新文档
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    const name = formData.get("name") as string;
    const fileSize = formData.get("size") as string;

    if (!name) {
      return NextResponse.json(
        { error: "Document name is required" },
        { status: 400 }
      );
    }

    // Create document record
    const document = await prisma.aIDocument.create({
      data: {
        name,
        fileSize: fileSize || "Unknown",
        uploadDate: new Date(),
        status: "PROCESSING",
        vectorStatus: "processing",
      },
    });

    revalidatePath("/ai-config");

    return NextResponse.json({ document }, { status: 201 });
  } catch (error) {
    console.error("[API] Failed to create document:", error);
    return NextResponse.json(
      { error: "Failed to create document" },
      { status: 500 }
    );
  }
}

// DELETE /api/documents/:id - 删除文档
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    await prisma.aIDocument.delete({
      where: { id },
    });

    revalidatePath("/ai-config");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[API] Failed to delete document:", error);
    return NextResponse.json(
      { error: "Failed to delete document" },
      { status: 500 }
    );
  }
}
