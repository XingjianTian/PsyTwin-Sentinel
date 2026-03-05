"use server";

/**
 * AI 服务相关的 Server Actions
 * 
 * 提供风险评估、干预建议、知识库查询等功能
 */

import { generateRiskAssessment, generateInterventionSuggestion, queryKnowledgeBase, isAIEnabled } from "@/lib/ai";
import { searchDocuments, indexDocument, deleteDocumentIndex, getDocumentIndexStatus } from "@/lib/rag";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

/**
 * 生成学生心理健康风险评估报告
 */
export async function generateStudentRiskAssessment(studentId: string) {
  try {
    // 获取学生的多模态数据
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        vitalSigns: {
          orderBy: { timestamp: "desc" },
          take: 10,
        },
        voiceAnalyses: {
          orderBy: { timestamp: "desc" },
          take: 5,
        },
        expressionData: {
          orderBy: { timestamp: "desc" },
          take: 5,
        },
        vrSessions: {
          orderBy: { sessionAt: "desc" },
          take: 3,
        },
      },
    });

    if (!student) {
      return { success: false, error: "学生不存在" };
    }

    // 准备数据
    const heartRateData = student.vitalSigns.map(v => v.heartRate);
    const avgTremorIndex = student.voiceAnalyses.length > 0
      ? student.voiceAnalyses.reduce((sum, v) => sum + v.tremorIndex, 0) / student.voiceAnalyses.length
      : 0;
    
    const latestEmotion = student.voiceAnalyses[0]?.emotionLabel || "未知";
    
    const behaviorData = `VR体验记录：${student.vrSessions.length}次
表情分析：${student.expressionData.map(e => 
  `${e.primaryExpression}(焦虑:${e.anxietyLevel.toFixed(2)})`
).join("，")}`;

    // 调用 AI 生成报告
    const result = await generateRiskAssessment({
      studentName: student.name,
      heartRateData,
      voiceTremorIndex: avgTremorIndex,
      emotionAnalysis: latestEmotion,
      behaviorData,
    });

    if (result.error) {
      return { success: false, error: result.error };
    }

    return {
      success: true,
      report: result.content,
      usage: result.usage,
    };
  } catch (error) {
    console.error("[AI Action] Risk assessment failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "生成报告失败",
    };
  }
}

/**
 * 生成干预建议
 */
export async function generateInterventionAdvice(studentId: string) {
  try {
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        alerts: {
          orderBy: { alertTime: "desc" },
          take: 5,
        },
        interventionRecords: {
          orderBy: { date: "desc" },
          take: 3,
        },
      },
    });

    if (!student) {
      return { success: false, error: "学生不存在" };
    }

    const alertHistory = student.alerts.map(a => 
      `${a.alertTime.toLocaleDateString()}: ${a.description}`
    );

    const previousInterventions = student.interventionRecords.map(i =>
      `${i.date.toLocaleDateString()} ${i.type} - ${i.result}`
    );

    const result = await generateInterventionSuggestion({
      studentName: student.name,
      riskLevel: student.riskLevel,
      alertHistory,
      previousInterventions,
    });

    if (result.error) {
      return { success: false, error: result.error };
    }

    return {
      success: true,
      suggestion: result.content,
      usage: result.usage,
    };
  } catch (error) {
    console.error("[AI Action] Intervention suggestion failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "生成建议失败",
    };
  }
}

/**
 * RAG 知识库查询
 */
export async function queryRAGKnowledgeBase(query: string, topK: number = 5) {
  try {
    // 搜索相关文档
    const ragResult = await searchDocuments(query, topK);
    
    if (ragResult.totalChunks === 0) {
      // 没有知识库文档时，直接调用 AI
      const result = await queryKnowledgeBase(query);
      return {
        success: true,
        answer: result.content,
        sources: [],
        usage: result.usage,
      };
    }

    // 使用检索到的上下文调用 AI
    const result = await queryKnowledgeBase(query, ragResult.context);

    return {
      success: true,
      answer: result.content,
      sources: ragResult.chunks.map(chunk => ({
        id: chunk.id,
        content: chunk.content.slice(0, 200) + "...",
        similarity: chunk.similarity,
      })),
      usage: result.usage,
    };
  } catch (error) {
    console.error("[AI Action] RAG query failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "查询失败",
    };
  }
}

/**
 * 索引文档到 RAG 知识库
 */
export async function indexDocumentToRAG(documentId: string, content: string) {
  try {
    // 更新文档状态为处理中
    await prisma.aIDocument.update({
      where: { id: documentId },
      data: { 
        status: "PROCESSING",
        vectorStatus: "processing"
      },
    });

    // 异步索引文档（实际生产环境应该用队列）
    const result = await indexDocument(documentId, content);

    if (!result.success) {
      return { success: false, error: result.error };
    }

    revalidatePath("/ai-config");
    
    return {
      success: true,
      chunks: result.chunks,
    };
  } catch (error) {
    console.error("[AI Action] Document indexing failed:", error);
    
    await prisma.aIDocument.update({
      where: { id: documentId },
      data: { 
        status: "FAILED",
        vectorStatus: "failed"
      },
    });

    return {
      success: false,
      error: error instanceof Error ? error.message : "索引失败",
    };
  }
}

/**
 * 删除文档索引
 */
export async function deleteDocumentFromRAG(documentId: string) {
  try {
    const success = await deleteDocumentIndex(documentId);
    
    if (success) {
      await prisma.aIDocument.update({
        where: { id: documentId },
        data: { 
          status: "PROCESSING",
          vectorStatus: "processing"
        },
      });
      
      revalidatePath("/ai-config");
    }

    return { success };
  } catch (error) {
    console.error("[AI Action] Delete document failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "删除失败",
    };
  }
}

/**
 * 获取文档索引状态
 */
export async function getDocumentStatus(documentId: string) {
  try {
    const status = await getDocumentIndexStatus(documentId);
    return { success: true, ...status };
  } catch (error) {
    console.error("[AI Action] Get status failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "获取状态失败",
    };
  }
}

/**
 * 检查 AI 服务状态
 */
export async function checkAIStatus() {
  return {
    enabled: isAIEnabled(),
    ragEnabled: true, // 即使没有嵌入模型，也支持文本搜索
  };
}
