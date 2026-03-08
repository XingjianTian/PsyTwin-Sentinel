/**
 * RAG (Retrieval-Augmented Generation) 服务
 * 
 * 基于 PostgreSQL 实现文档存储和检索
 * 支持两种模式：
 * 1. 完整模式：pgvector 扩展 + OpenAI/Dashscope 嵌入（推荐）
 * 2. 降级模式：纯文本存储 + 关键词搜索（无需 pgvector）
 * 
 * 环境变量:
 * - OPENAI_API_KEY: 用于生成文本嵌入 (可选)
 * - DASHSCOPE_API_KEY: 阿里 Dashscope API 密钥 (可选)
 * 
 * pgvector 安装（可选）:
 * @see https://github.com/pgvector/pgvector
 */

import { prisma } from './prisma';
import { OpenAI } from 'openai';

// 使用 OpenAI 嵌入模型（也可以使用 Dashscope 的嵌入模型）
const EMBEDDING_MODEL = 'text-embedding-3-small';
const EMBEDDING_DIMENSION = 1536;

// 检查 pgvector 是否可用
let pgvectorAvailable = false;
async function checkPgvector(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1 FROM pg_extension WHERE extname = 'vector'`;
    pgvectorAvailable = true;
    return true;
  } catch {
    pgvectorAvailable = false;
    return false;
  }
}

// 初始化时检查 pgvector
checkPgvector().then(available => {
  if (available) {
    console.log('[RAG] pgvector extension available - full vector search enabled');
  } else {
    console.log('[RAG] pgvector not available - using text search fallback mode');
  }
});

// 初始化 OpenAI 客户端（用于嵌入）
function getEmbeddingClient() {
  const apiKey = process.env.OPENAI_API_KEY || process.env.DASHSCOPE_API_KEY;
  if (!apiKey) {
    console.warn('[RAG] No API key found for embeddings');
    return null;
  }
  
  // 如果使用 Dashscope，需要不同的 baseURL
  const baseURL = process.env.OPENAI_API_KEY 
    ? undefined 
    : 'https://dashscope.aliyuncs.com/compatible-mode/v1';
  
  return new OpenAI({ apiKey, baseURL });
}

const embeddingClient = getEmbeddingClient();

/**
 * 生成文本嵌入向量
 */
async function generateEmbedding(text: string): Promise<number[] | null> {
  if (!embeddingClient) {
    console.warn('[RAG] Embedding client not available');
    return null;
  }

  try {
    const response = await embeddingClient.embeddings.create({
      model: EMBEDDING_MODEL,
      input: text,
    });

    return response.data[0]?.embedding || null;
  } catch (error) {
    console.error('[RAG] Failed to generate embedding:', error);
    return null;
  }
}

/**
 * 将向量转换为 pgvector 字符串格式
 */
function vectorToString(vector: number[]): string {
  return `[${vector.join(',')}]`;
}

/**
 * 文档块接口
 */
export interface DocumentChunk {
  id: string;
  content: string;
  metadata: Record<string, unknown>;
  similarity?: number;
}

/**
 * RAG 检索结果
 */
export interface RAGResult {
  chunks: DocumentChunk[];
  context: string;
  totalChunks: number;
}

/**
 * 将文档分块并存储到数据库
 * 
 * @param documentId 文档ID (对应 ai_documents 表)
 * @param content 文档内容
 * @param chunkSize 分块大小（字符数）
 * @param overlap 重叠大小
 */
export async function indexDocument(
  documentId: string,
  content: string,
  chunkSize: number = 1000,
  overlap: number = 200
): Promise<{ success: boolean; chunks: number; error?: string }> {
  try {
    // 简单的文本分块策略
    const chunks: string[] = [];
    let start = 0;
    
    while (start < content.length) {
      const end = Math.min(start + chunkSize, content.length);
      const chunk = content.slice(start, end);
      chunks.push(chunk);
      start += chunkSize - overlap;
    }

    // 删除旧的 chunks
    await prisma.documentChunk.deleteMany({
      where: { documentId }
    });

    // 为每个 chunk 生成嵌入并存储
    for (let i = 0; i < chunks.length; i++) {
      const chunkContent = chunks[i];
      const embedding = await generateEmbedding(chunkContent);
      
      // 使用 Prisma Client 而不是原始 SQL，避免 pgvector 依赖
      await prisma.documentChunk.create({
        data: {
          documentId,
          content: chunkContent,
          // 如果有嵌入，存储为 JSON 字符串（兼容模式）
          // pgvector 可用时会通过迁移脚本转换
          embedding: embedding ? JSON.stringify(embedding) : null,
          chunkIndex: i,
          metadata: { position: i, total: chunks.length },
        }
      });
    }

    // 更新文档状态
    await prisma.aIDocument.update({
      where: { id: documentId },
      data: { 
        status: 'VECTORIZED',
        vectorStatus: 'ready'
      },
    });

    return { success: true, chunks: chunks.length };
  } catch (error) {
    console.error('[RAG] Failed to index document:', error);
    
    // 更新文档状态为失败
    await prisma.aIDocument.update({
      where: { id: documentId },
      data: { 
        status: 'FAILED',
        vectorStatus: 'failed'
      },
    });

    return { 
      success: false, 
      chunks: 0, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * 语义搜索相关文档块
 * 
 * @param query 查询文本
 * @param topK 返回结果数量
 * @returns 相关文档块列表
 */
export async function searchDocuments(
  query: string,
  topK: number = 5
): Promise<RAGResult> {
  try {
    const queryEmbedding = await generateEmbedding(query);
    
    let chunks: Array<{
      id: string;
      content: string;
      metadata: Record<string, unknown>;
      similarity: number;
    }> = [];

    if (queryEmbedding && pgvectorAvailable) {
      // 使用向量相似度搜索（需要 pgvector）
      try {
        const results = await prisma.$queryRaw<Array<{
          id: string;
          content: string;
          metadata: string;
          similarity: number;
        }>>`
          SELECT 
            id,
            content,
            metadata::text as metadata,
            1 - (embedding::vector <=> ${vectorToString(queryEmbedding)}::vector) as similarity
          FROM document_chunks
          WHERE embedding IS NOT NULL
          ORDER BY embedding::vector <=> ${vectorToString(queryEmbedding)}::vector
          LIMIT ${topK}
        `;

        chunks = results.map(r => ({
          id: r.id,
          content: r.content,
          metadata: JSON.parse(r.metadata) as Record<string, unknown>,
          similarity: Number(r.similarity),
        }));
      } catch (vectorError) {
        console.warn('[RAG] Vector search failed, falling back to text search:', vectorError);
        // 降级到文本搜索
        chunks = await textSearch(query, topK);
      }
    } else {
      // 没有嵌入模型或 pgvector 时，使用简单的文本搜索
      chunks = await textSearch(query, topK);
    }

    // 组合上下文
    const context = chunks
      .map((chunk, idx) => `[${idx + 1}] ${chunk.content}`)
      .join('\n\n');

    return {
      chunks,
      context,
      totalChunks: chunks.length,
    };
  } catch (error) {
    console.error('[RAG] Search failed:', error);
    return {
      chunks: [],
      context: '',
      totalChunks: 0,
    };
  }
}

/**
 * 纯文本搜索（降级模式）
 */
async function textSearch(
  query: string,
  topK: number
): Promise<Array<{ id: string; content: string; metadata: Record<string, unknown>; similarity: number }>> {
  // 使用简单的 ILIKE 搜索
  const results = await prisma.documentChunk.findMany({
    where: {
      content: {
        contains: query,
        mode: 'insensitive',
      },
    },
    take: topK,
    orderBy: { createdAt: 'desc' },
  });

  return results.map(r => ({
    id: r.id,
    content: r.content,
    metadata: (r.metadata as Record<string, unknown>) || {},
    similarity: 0.5, // 默认相似度
  }));
}

/**
 * 删除文档的所有向量块
 */
export async function deleteDocumentIndex(documentId: string): Promise<boolean> {
  try {
    await prisma.documentChunk.deleteMany({
      where: { documentId }
    });
    return true;
  } catch (error) {
    console.error('[RAG] Failed to delete document index:', error);
    return false;
  }
}

/**
 * 获取文档的索引状态
 */
export async function getDocumentIndexStatus(documentId: string): Promise<{
  indexed: boolean;
  chunks: number;
  lastUpdated?: Date;
}> {
  try {
    const result = await prisma.documentChunk.aggregate({
      where: { documentId },
      _count: { id: true },
      _max: { updatedAt: true },
    });

    return {
      indexed: result._count.id > 0,
      chunks: result._count.id,
      lastUpdated: result._max.updatedAt || undefined,
    };
  } catch (error) {
    console.error('[RAG] Failed to get index status:', error);
    return { indexed: false, chunks: 0 };
  }
}

/**
 * 检查 RAG 服务是否可用
 */
export function isRAGEnabled(): boolean {
  return !!embeddingClient;
}

/**
 * 检查 pgvector 扩展是否可用
 */
export function isPgvectorAvailable(): boolean {
  return pgvectorAvailable;
}
