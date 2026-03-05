import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { deleteDocumentIndex } from "@/lib/rag";

// DELETE /api/documents/:id - 删除文档
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Delete from vector index first
    await deleteDocumentIndex(id);

    // Delete from database
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
