/**
 * 文档管理 API
 * 
 * 提供文档的 CRUD 操作和文件上传功能
 * - 文件存储: uploads/ 目录
 * - 大小限制: 10MB
 * - 支持格式: PDF, TXT, MD, DOC, DOCX
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { writeFile, mkdir, unlink } from "fs/promises";
import { existsSync } from "fs";
import { join, extname } from "path";
import { indexDocumentToRAG, deleteDocumentFromRAG } from "@/app/actions/ai-services";

const UPLOAD_DIR = join(process.cwd(), "uploads");
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// 支持的文件扩展名列表
const SUPPORTED_EXTENSIONS = ['.pdf', '.txt', '.md', '.markdown', '.doc', '.docx'];

// 确保上传目录存在
async function ensureUploadDir() {
  if (!existsSync(UPLOAD_DIR)) {
    await mkdir(UPLOAD_DIR, { recursive: true });
  }
}

// 动态导入 pdf-parse（避免服务端组件问题）
async function getPdfParser() {
  const pdfParse = await import("pdf-parse");
  return pdfParse.default;
}

// 动态导入 mammoth（用于解析 Word 文档）
async function getMammoth() {
  const mammoth = await import("mammoth");
  return mammoth;
}

// 提取文件文本内容
async function extractFileContent(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const fileType = file.type;
  const fileName = file.name.toLowerCase();

  // PDF 文件处理
  if (fileType === "application/pdf" || fileName.endsWith(".pdf")) {
    try {
      const pdfParse = await getPdfParser();
      const data = await pdfParse(buffer);
      return data.text || "";
    } catch (error) {
      console.error("[API] PDF parse error:", error);
      throw new Error("无法解析 PDF 文件，请检查文件是否损坏");
    }
  }

  // Word 文档处理 (DOC/DOCX)
  if (
    fileType === "application/msword" ||
    fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    fileName.endsWith(".doc") ||
    fileName.endsWith(".docx")
  ) {
    try {
      const mammoth = await getMammoth();
      const result = await mammoth.extractRawText({ buffer });
      return result.value || "";
    } catch (error) {
      console.error("[API] Word document parse error:", error);
      throw new Error("无法解析 Word 文档，请检查文件是否损坏");
    }
  }

  // 文本文件处理 (TXT, MD)
  if (
    fileType === "text/plain" ||
    fileType === "text/markdown" ||
    fileName.endsWith(".txt") ||
    fileName.endsWith(".md") ||
    fileName.endsWith(".markdown")
  ) {
    return buffer.toString("utf-8");
  }

  throw new Error(`不支持的文件格式: ${fileType}。请上传 PDF、TXT、Markdown 或 Word 文档。`);
}

// 检查文件类型是否允许
function isAllowedFileType(file: File): boolean {
  const allowedMimeTypes = [
    "application/pdf",
    "text/plain",
    "text/markdown",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];
  
  const fileName = file.name.toLowerCase();
  const hasAllowedExt = SUPPORTED_EXTENSIONS.some(ext => fileName.endsWith(ext));
  
  return allowedMimeTypes.includes(file.type) || hasAllowedExt;
}

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
      { error: "获取文档列表失败" },
      { status: 500 }
    );
  }
}

// POST /api/documents - 上传新文档
export async function POST(request: NextRequest) {
  try {
    await ensureUploadDir();

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "请选择要上传的文件" },
        { status: 400 }
      );
    }

    // 检查文件大小
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `文件大小超过限制 (最大 10MB)` },
        { status: 400 }
      );
    }

    // 检查文件类型
    if (!isAllowedFileType(file)) {
      return NextResponse.json(
        { error: "不支持的文件格式。请上传 PDF、TXT、Markdown 或 Word 文档(.doc/.docx)。" },
        { status: 400 }
      );
    }

    // 创建文档记录
    const document = await prisma.aIDocument.create({
      data: {
        name: file.name,
        fileSize: formatFileSize(file.size),
        uploadDate: new Date(),
        status: "PROCESSING",
        vectorStatus: "processing",
      },
    });

    // 提取原始文件扩展名
    const originalExt = extname(file.name).toLowerCase() || '.bin';
    
    // 保存文件到 uploads 目录（保留原始扩展名）
    const filePath = join(UPLOAD_DIR, `${document.id}${originalExt}`);
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, fileBuffer);

    console.log(`[API] File saved: ${filePath} (${file.size} bytes)`);

    // 提取文件内容
    let content: string;
    try {
      content = await extractFileContent(file);
      console.log(`[API] Content extracted: ${content.length} characters`);
    } catch (extractError) {
      // 更新文档状态为失败
      await prisma.aIDocument.update({
        where: { id: document.id },
        data: {
          status: "FAILED",
          vectorStatus: "failed",
        },
      });

      // 删除已保存的文件
      try {
        await unlink(filePath);
      } catch {
        // 忽略删除错误
      }

      return NextResponse.json(
        { error: extractError instanceof Error ? extractError.message : "文件内容提取失败" },
        { status: 400 }
      );
    }

    // 触发 RAG 索引（异步）
    // 注意：这里不等待索引完成，让前端通过轮询检查状态
    indexDocumentToRAG(document.id, content).catch((error) => {
      console.error("[API] RAG indexing failed:", error);
    });

    revalidatePath("/ai-config");

    return NextResponse.json(
      {
        document,
        message: "文件上传成功，正在处理中...",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[API] Failed to upload document:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "上传失败" },
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
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "文档 ID 不能为空" },
        { status: 400 }
      );
    }

    // 1. 先删除 RAG 向量索引
    console.log(`[API] Deleting RAG index for document: ${id}`);
    await deleteDocumentFromRAG(id);

    // 2. 删除上传的文件（尝试所有可能的扩展名）
    let fileDeleted = false;
    for (const ext of SUPPORTED_EXTENSIONS) {
      const filePath = join(UPLOAD_DIR, `${id}${ext}`);
      try {
        if (existsSync(filePath)) {
          await unlink(filePath);
          console.log(`[API] File deleted: ${filePath}`);
          fileDeleted = true;
          break; // 找到并删除一个就退出
        }
      } catch {
        // 忽略错误，继续尝试下一个扩展名
      }
    }
    
    if (!fileDeleted) {
      console.warn(`[API] No file found for document: ${id}`);
    }

    // 3. 删除数据库记录
    await prisma.aIDocument.delete({
      where: { id },
    });

    revalidatePath("/ai-config");

    return NextResponse.json({ success: true, message: "文档已删除" });
  } catch (error) {
    console.error("[API] Failed to delete document:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "删除失败" },
      { status: 500 }
    );
  }
}

// 格式化文件大小
function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}
